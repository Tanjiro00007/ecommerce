const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Cart = require("../models/Cart");
const { ApiError } = require("../utils/apiResponse");
const inventoryService = require("./inventoryService");

/**
 * Creates a Razorpay order for an existing pending Order document and
 * records a Pending Payment row. Amount is always taken from the
 * server-side Order, never from client input.
 */
const createGatewayOrder = async (order) => {
  // Razorpay amount is in the smallest currency unit (paise for INR)
  const amountInPaise = Math.round(order.amount * 100);

  const gatewayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_order_${order._id}`,
    notes: { orderId: order._id.toString() },
  });

  order.razorpayOrderId = gatewayOrder.id;
  await order.save();

  // Guard against duplicate payment requests for the same order
  let payment = await Payment.findOne({ order: order._id, status: "Pending" });
  if (!payment) {
    payment = await Payment.create({
      user: order.user,
      order: order._id,
      gatewayOrderId: gatewayOrder.id,
      amount: order.amount,
      currency: "INR",
      status: "Pending",
    });
  } else {
    payment.gatewayOrderId = gatewayOrder.id;
    await payment.save();
  }

  return { gatewayOrder, payment };
};

/**
 * Verifies the Razorpay signature server-side (never trust the frontend's
 * reported payment status), then finalizes the order: marks payment/order
 * as successful, reduces inventory, and clears the user's cart.
 * All of this is idempotent - safe to call twice for the same payment
 * (e.g. duplicate webhook) without double-reducing stock.
 */
const verifyAndFinalize = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment verification fields");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    // record failed attempt
    await Payment.findOneAndUpdate(
      { gatewayOrderId: razorpay_order_id },
      { status: "Failed" }
    );
    throw new ApiError(400, "Payment signature verification failed");
  }

  const payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id });
  if (!payment) {
    throw new ApiError(404, "Payment record not found for this order");
  }

  const order = await Order.findById(payment.order);
  if (!order) {
    throw new ApiError(404, "Order not found for this payment");
  }

  // Idempotency: if already marked successful (e.g. duplicate webhook +
  // client verification both firing), just return current state.
  if (payment.status === "Successful" && order.paymentStatus === "Successful") {
    return { order, payment };
  }

  payment.paymentId = razorpay_payment_id;
  payment.signature = razorpay_signature;
  payment.status = "Successful";
  await payment.save();

  // Reduce stock now that payment is confirmed. If this fails (e.g. stock
  // ran out between order creation and payment), we keep payment marked
  // successful but flag the order for manual review rather than losing the
  // customer's money silently.
  try {
    if (!order.inventoryReduced) {
      await inventoryService.reduceStock(
        order.items.map((i) => ({ product: i.product, quantity: i.quantity }))
      );
      order.inventoryReduced = true;
    }
    order.paymentStatus = "Successful";
    order.orderStatus = "Confirmed";
    await order.save();

    // clear the user's cart on successful checkout
    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
  } catch (err) {
    order.orderStatus = "Pending";
    order.paymentStatus = "Successful";
    await order.save();
    throw new ApiError(
      409,
      "Payment succeeded but we could not reserve stock for one or more items. Our team will contact you regarding your order."
    );
  }

  return { order, payment };
};

const markFailed = async (razorpay_order_id) => {
  const payment = await Payment.findOneAndUpdate(
    { gatewayOrderId: razorpay_order_id },
    { status: "Failed" },
    { new: true }
  );
  if (payment) {
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: "Failed",
      orderStatus: "Cancelled",
    });
  }
  return payment;
};

module.exports = { createGatewayOrder, verifyAndFinalize, markFailed };

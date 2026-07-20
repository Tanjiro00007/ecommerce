const Order = require("../models/Order");
const { success, error } = require("../utils/apiResponse");
const paymentService = require("../services/paymentService");

// @route POST /api/payment/create-order
// Body: { orderId }
// Creates a Razorpay order for an existing pending Order (amount always
// comes from the server-side order, never trusted from the client).
const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return error(res, 400, "orderId is required");
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return error(res, 404, "Order not found");
    }
    if (order.paymentStatus === "Successful") {
      return error(res, 409, "This order has already been paid for");
    }

    const { gatewayOrder } = await paymentService.createGatewayOrder(order);

    return success(res, 200, {
      key: process.env.RAZORPAY_KEY_ID,
      gatewayOrderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      orderId: order._id,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/payment/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
const verifyPayment = async (req, res, next) => {
  try {
    const { order, payment } = await paymentService.verifyAndFinalize(req.body);
    return success(
      res,
      200,
      { order, payment },
      "Payment verified and order confirmed"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { createPaymentOrder, verifyPayment };

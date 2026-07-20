const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { ApiError } = require("../utils/apiResponse");
const inventoryService = require("./inventoryService");

/**
 * Build a pending Order document from the user's current cart + shipping
 * address. Does NOT touch stock yet - stock is only reduced after payment
 * is verified successful (see paymentService.verifyAndFinalize).
 */
const createPendingOrderFromCart = async (userId, address) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty, cannot checkout");
  }

  // Re-validate each item still exists / has stock / price hasn't silently
  // gone negative (protects against stale cart data).
  const orderItems = [];
  for (const item of cart.items) {
    if (!item.product) {
      throw new ApiError(409, "One of the products in your cart no longer exists");
    }
    orderItems.push({
      product: item.product._id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.product.price, // always use current live price, not stale snapshot
    });
  }

  await inventoryService.checkAvailability(
    orderItems.map((i) => ({ product: i.product, quantity: i.quantity }))
  );

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const deliveryFee = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const amount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  const order = await Order.create({
    user: userId,
    items: orderItems,
    address,
    subtotal,
    tax,
    deliveryFee,
    amount,
    paymentStatus: "Pending",
    orderStatus: "Pending",
  });

  return order;
};

module.exports = { createPendingOrderFromCart };

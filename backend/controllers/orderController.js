const Order = require("../models/Order");
const { success, error } = require("../utils/apiResponse");
const orderService = require("../services/orderService");

// @route POST /api/orders
// Body: { address: {...} }
// Creates a Pending order snapshot from the user's cart. This order is then
// used to create a Razorpay gateway order via /api/payment/create-order.
const createOrder = async (req, res, next) => {
  try {
    const { address } = req.body;
    if (!address) {
      return error(res, 400, "Shipping address is required");
    }

    const requiredFields = ["fullName", "phone", "line1", "city", "state", "postalCode"];
    for (const field of requiredFields) {
      if (!address[field]) {
        return error(res, 400, `Address field "${field}" is required`);
      }
    }

    const order = await orderService.createPendingOrderFromCart(req.user._id, address);
    return success(res, 201, { order }, "Order created, proceed to payment");
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return success(res, 200, { orders });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return error(res, 404, "Order not found");
    }
    return success(res, 200, { order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };

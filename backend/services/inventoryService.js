const Product = require("../models/Product");
const { ApiError } = require("../utils/apiResponse");

/**
 * Verify that every item in the cart/order still has enough stock.
 * Throws ApiError(409) with a clear message if not, listing the first
 * offending product so the client can react (e.g. update cart).
 */
const checkAvailability = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ApiError(404, `Product not found: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(
        409,
        `Insufficient stock for "${product.title}". Available: ${product.stock}`
      );
    }
  }
};

/**
 * Atomically decrement stock for each item using a conditional update so
 * we never oversell even under concurrent requests. Rolls back any
 * decrements already applied if a later item fails.
 */
const reduceStock = async (items) => {
  const applied = [];
  try {
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        throw new ApiError(
          409,
          `Insufficient stock while finalizing order for product ${item.product}`
        );
      }
      applied.push(item);
    }
  } catch (err) {
    // rollback whatever succeeded
    for (const item of applied) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
    throw err;
  }
};

const restoreStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }
};

module.exports = { checkAvailability, reduceStock, restoreStock };

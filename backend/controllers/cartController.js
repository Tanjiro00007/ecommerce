const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { success, error } = require("../utils/apiResponse");

const serializeCart = (cart) => {
  const totals = cart.calculateTotals();
  return { ...cart.toObject(), ...totals };
};

// @route GET /api/cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    return success(res, 200, { cart: serializeCart(cart) });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/cart  { productId, quantity }
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return error(res, 404, "Product not found");
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    const desiredQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (desiredQuantity > product.stock) {
      return error(
        res,
        409,
        `Only ${product.stock} unit(s) of "${product.title}" available`
      );
    }

    if (existingItem) {
      existingItem.quantity = desiredQuantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({ product: product._id, quantity, price: product.price });
    }

    await cart.save();
    await cart.populate("items.product");

    return success(res, 200, { cart: serializeCart(cart) }, "Item added to cart");
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/cart  { productId, quantity }
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return error(res, 404, "Product not found");
    }
    if (quantity > product.stock) {
      return error(
        res,
        409,
        `Only ${product.stock} unit(s) of "${product.title}" available`
      );
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return error(res, 404, "Cart not found");
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return error(res, 404, "Item not in cart");
    }

    item.quantity = quantity;
    item.price = product.price;
    await cart.save();
    await cart.populate("items.product");

    return success(res, 200, { cart: serializeCart(cart) }, "Cart updated");
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/cart/:id  (id = productId)
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return error(res, 404, "Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.id
    );
    await cart.save();
    await cart.populate("items.product");

    return success(res, 200, { cart: serializeCart(cart) }, "Item removed from cart");
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };

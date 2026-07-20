const Product = require("../models/Product");
const { success, error } = require("../utils/apiResponse");

// @route GET /api/products
// Supports: page, limit, sort (price_asc|price_desc|newest|rating), search, category
const listProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    let sortOption = { createdAt: -1 };
    switch (req.query.sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    return success(res, 200, {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return error(res, 404, "Product not found");
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    return success(res, 200, { product, relatedProducts });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/products
// Simple product creation endpoint (no dedicated admin role per PRD scope -
// protected by auth so it can't be hit anonymously).
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, stock, images } = req.body;
    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      images: images || [],
    });
    return success(res, 201, { product }, "Product created");
  } catch (err) {
    next(err);
  }
};

module.exports = { listProducts, getProductById, createProduct };

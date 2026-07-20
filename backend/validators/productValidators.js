const { body, query } = require("express-validator");

const createProductValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("images").optional().isArray().withMessage("Images must be an array of URLs"),
];

const listProductsValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("sort").optional().isIn(["price_asc", "price_desc", "newest", "rating"]).withMessage("invalid sort option"),
];

module.exports = { createProductValidator, listProductsValidator };

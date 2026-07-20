const { body } = require("express-validator");

const addToCartValidator = [
  body("productId").notEmpty().withMessage("productId is required").isMongoId().withMessage("Invalid productId"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("quantity must be a positive integer"),
];

const updateCartValidator = [
  body("productId").notEmpty().withMessage("productId is required").isMongoId().withMessage("Invalid productId"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("quantity must be a positive integer"),
];

module.exports = { addToCartValidator, updateCartValidator };

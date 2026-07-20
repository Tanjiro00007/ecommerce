const express = require("express");
const router = express.Router();

const { listProducts, getProductById, createProduct } = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createProductValidator,
  listProductsValidator,
} = require("../validators/productValidators");

router.get("/", listProductsValidator, validate, listProducts);
router.get("/:id", getProductById);
router.post("/", protect, createProductValidator, validate, createProduct);

module.exports = router;

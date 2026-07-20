const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  addToCartValidator,
  updateCartValidator,
} = require("../validators/cartValidators");

router.use(protect);

router.get("/", getCart);
router.post("/", addToCartValidator, validate, addToCart);
router.patch("/", updateCartValidator, validate, updateCartItem);
router.delete("/:id", removeFromCart);

module.exports = router;

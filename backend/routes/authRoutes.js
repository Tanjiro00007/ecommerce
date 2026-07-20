const express = require("express");
const router = express.Router();

const { register, login, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerValidator, loginValidator } = require("../validators/authValidators");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.get("/profile", protect, getProfile);

module.exports = router;

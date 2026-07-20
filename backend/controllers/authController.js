const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { success, error } = require("../utils/apiResponse");

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, 409, "An account with this email already exists");
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return success(res, 201, { user: user.toSafeObject(), token }, "Registration successful");
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return error(res, 401, "Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 401, "Invalid email or password");
    }

    const token = generateToken(user._id);
    return success(res, 200, { user: user.toSafeObject(), token }, "Login successful");
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    return success(res, 200, { user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile };

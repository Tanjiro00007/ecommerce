const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return error(res, 401, "Not authorized, no token provided");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return error(res, 401, "Session expired, please login again");
      }
      return error(res, 401, "Invalid token");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 401, "User belonging to this token no longer exists");
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 500, "Authentication error");
  }
};

module.exports = { protect };

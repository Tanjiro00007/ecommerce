const { validationResult } = require("express-validator");

// Runs after an array of express-validator checks; short-circuits with a
// consistent 400 response if any of them failed.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validate;

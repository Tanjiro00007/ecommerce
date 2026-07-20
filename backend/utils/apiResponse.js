// Consistent response helpers used across all controllers

exports.success = (res, statusCode, data = {}, message) => {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
};

exports.error = (res, statusCode, message = "Something went wrong") => {
  return res.status(statusCode).json({ success: false, message });
};

// Custom error class carrying an HTTP status code, used with the
// centralized error handling middleware.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

exports.ApiError = ApiError;

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Server error";

  if (err.code === 11000) {
    status = 409;
    message = "Duplicate value: that email is already registered";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired, please log in again";
  } else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  } else if (err.name === "ValidationError") {
    status = 400; // Mongoose validation
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error" : message,
  });
};

module.exports = { notFound, errorHandler };
export const errorHandler = (err, req, res, next) => {
  console.error("Error: ", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json(ApiResponse.error(messages.join(", "), 400));
  }
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res
      .status(400)
      .json(ApiResponse.error(`${field} already exists`, 400));
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(ApiResponse.error("Invalid token", 401));
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(ApiResponse.error("Token expired", 401));
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json(ApiResponse.error(message, statusCode));
};

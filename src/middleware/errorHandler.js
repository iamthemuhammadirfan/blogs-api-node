const { sendErrorResponse } = require("../utils/responseHelpers");

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (error, req, res, _next) => {
  console.error("Error:", error);

  // Handle null or undefined errors
  if (!error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }

  // Handle duplicate key error (MongoDB)
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  // Handle Mongoose validation error
  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    return res.status(400).json({
      success: false,
      message: validationErrors.join(", "),
    });
  }

  // Handle Mongoose cast error
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Resource not found",
    });
  }

  // Handle errors without message
  if (!error.message && typeof error === "object") {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }

  // Get status code from error or default to 500
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  // Prepare response object
  const response = {
    success: false,
    message,
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

const notFoundHandler = (req, res, _next) => {
  return sendErrorResponse(
    res,
    `Route ${req.originalUrl} not found`,
    "NOT_FOUND",
    404
  );
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
};

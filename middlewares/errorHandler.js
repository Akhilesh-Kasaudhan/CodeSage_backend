import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
  ValidationError,
  RateLimitError,
} from "../utils/error.js";

const errorHandler = (err, req, res, next) => {
  console.error("ERROR STACK:", err.stack || err);

  if (err instanceof AppError) {
    // Known, operational error - send specific response
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: err.timestamp,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    return res.status(400).json({
      status: "fail",
      message: "Invalid input data",
      errors: errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0];
    const duplicateValue = err.keyValue?.[duplicateField];
    const message = `Duplicate value '${duplicateValue}' for field '${duplicateField}'`;
    return res.status(409).json({
      status: "fail",
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token. Please log in again.",
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      message: "Your token has expired. Please log in again.",
      timestamp: new Date().toISOString(),
    });
  }

  // Unknown or programmer error - send a generic internal server error
  console.error("UNHANDLED ERROR:", err); // Log the unhandled error for investigation
  return res.status(500).json({
    status: "error",
    message: "Something went wrong on the server.",
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;

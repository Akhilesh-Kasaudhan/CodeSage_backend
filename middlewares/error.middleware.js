import {
  AppError,
  InternalServerError,
  BadRequestError,
  UnauthorizedError,
} from "../utils/error.js"; // Import your custom error classes

const handleDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
    timestamp: new Date().toISOString(), // Include the stack trace for development
  });
};

const handleProdError = (err, res) => {
  if (err.isOperational) {
    // Known, operational error: Send a clean message to the client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: new Date().toISOString(), // Include the stack trace for production
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
      timestamp: new Date().toISOString(),
    });
  }
};

const handleJWTError = (err) => {
  return new UnauthorizedError("Invalid token. Please log in again.");
};
const handleJWTExpiredError = (err) => {
  return new UnauthorizedError("Your token has expired! Please log in again.");
};
const handleMongoDBError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new BadRequestError(
      `Duplicate field value: ${field}. Please use another value!`
    );
  }
  return new InternalServerError("Database operation failed");
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.timestamp = err.timestamp || new Date().toISOString();

  let error = Object.assign(err);

  // Handle specific error types
  if (error.name === "JsonWebTokenError") {
    error = handleJWTError();
  }
  if (error.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }
  if (error.code === 11000) {
    error = handleMongoDBError(error);
  }

  // Ensure error is an instance of AppError
  if (!(error instanceof AppError)) {
    error = new InternalServerError(error.message);
  }

  if (process.env.NODE_ENV === "development") {
    handleDevError(error, res);
  } else {
    handleProdError(error, res);
  }
};

export default globalErrorHandler;

// filepath: c:\Users\joen_\Dev\portfolio\prf-backend\src\middleware\errorMiddleware.ts
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError"; // Assuming ApiError is in utils

export const errorHandler = (
  err: any, // Can be more specific, e.g., Error | ApiError
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction // next is required for Express to recognize it as error handling middleware
): void => {
  console.error("[ErrorHandler]:", err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Optional: include stack in dev
    });
  } else if (err.name === "ValidationError") {
    // Mongoose validation error
    res.status(400).json({
      message: "Validation Error",
      errors: err.errors, // Or format this as needed
    });
  } else if (err.name === "CastError" && err.path) {
    // Mongoose CastError (e.g. invalid ObjectId)
    res.status(400).json({
      message: `Invalid format for field ${err.path}: ${err.value}`,
    });
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    res.status(409).json({
      message: "Duplicate key error.",
      // Extracting the field might require parsing err.message or using err.keyValue
      fields: err.keyValue,
    });
  } else {
    // Fallback for other errors
    res.status(500).json({
      message: "An unexpected error occurred on the server.",
      ...(process.env.NODE_ENV === "development" && {
        error: err.message,
        stack: err.stack,
      }),
    });
  }
};

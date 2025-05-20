import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db"; // We'll create this next
import ApiError from "./utils/ApiError"; // Import ApiError

dotenv.config(); // Load environment variables

const app: Express = express();
const PORT = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let isOperational = false;

    if (err instanceof ApiError) {
      statusCode = err.statusCode;
      message = err.message;
      isOperational = err.isOperational;
    } else {
      // For non-ApiError types, log more details in development
      if (process.env.NODE_ENV === "development") {
        console.error("UNHANDLED ERROR:", err);
      }
    }

    // Log the error, especially if it's not operational or in development
    if (!isOperational || process.env.NODE_ENV === "development") {
      console.error(
        `[${new Date().toISOString()}] ${statusCode} - ${message} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      );
      if (err.stack && process.env.NODE_ENV === "development") {
        console.error(err.stack);
      }
    }

    // Send response only if headers haven't been sent
    if (!res.headersSent) {
      res.status(statusCode).json({
        status: statusCode >= 500 ? "error" : "fail",
        message,
        ...(process.env.NODE_ENV === "development" &&
          !isOperational && { stack: err.stack }), // Only send stack in dev for non-operational errors
      });
    }
  }
);

// Middleware
app.use(cors()); // Enable CORS for all routes (you can configure it more strictly later)
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded request bodies

// Basic Route
app.get("/", (req: Request, res: Response) => {
  res.send("Portfolio Backend API Running!");
});

// TODO: Add other routes (auth, projects, blog, etc.)

// Global Error Handler (very basic for now)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something broke!", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

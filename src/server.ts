import dotenv from "dotenv";
import connectDB from "./config/db";
import app from "./app"; // Import the configured app from app.ts
// import ApiError from "./utils/ApiError"; // Commented out as error handling will rely on app.ts for now

dotenv.config(); // Load environment variables

// const app: Express = express(); // Removed: We are using the app from app.ts
const PORT = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Global Error Handler from server.ts - Commented out to rely on app.ts error handling first
/*
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
      if (process.env.NODE_ENV === "development") {
        console.error("UNHANDLED ERROR:", err);
      }
    }

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

    if (!res.headersSent) {
      res.status(statusCode).json({
        status: statusCode >= 500 ? "error" : "fail",
        message,
        ...(process.env.NODE_ENV === "development" &&
          !isOperational && { stack: err.stack }),
      });
    }
  }
);
*/

// Middleware from server.ts - Removed as app.ts handles this
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// Basic Route from server.ts - Removed as app.ts handles routing
// app.get("/", (req: Request, res: Response) => {
//   res.send("Portfolio Backend API Running!");
// });

// TODO: Add other routes (auth, projects, blog, etc.) - This comment is now irrelevant here

// Second Global Error Handler from server.ts - Removed
/*
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something broke!", error: err.message });
});
*/

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log("Using app instance from app.ts"); // Added for confirmation
});

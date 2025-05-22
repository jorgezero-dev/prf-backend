import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import config from "./config";
import rateLimit from "express-rate-limit";
import path from "path"; // Added path import

// Import routes (we'll create these later)
import authRoutes from "./routes/authRoutes"; // Corrected import path
import profileRoutes from "./routes/profileRoutes";
import projectRoutes from "./routes/projectRoutes"; // Import project routes
import blogPostRoutes from "./routes/blogPostRoutes"; // Public blog routes
import contactRoutes from "./routes/contactRoutes"; // Public contact routes
// Admin specific routes
import adminProjectRoutes from "./routes/admin/adminProjectRoutes";
import adminBlogPostRoutes from "./routes/admin/adminBlogPostRoutes"; // Corrected import path
import adminContactRoutes from "./routes/admin/adminContactRoutes"; // Admin contact routes
import adminDashboardRoutes from "./routes/admin/adminDashboardRoutes"; // Admin dashboard routes
import resumeRoutes from "./routes/resumeRoutes"; // Import resume routes
import adminProfileRoutes from "./routes/admin/adminProfileRoutes"; // Corrected import path for admin profile routes

import { protect } from "./middleware/authMiddleware";
import { errorHandler } from "./middleware/errorMiddleware";
import { generalRateLimiter } from "./middleware/rateLimitMiddleware"; // Import general rate limiter

const app: Application = express();

// CORS Configuration
const allowedOrigins: string[] = [
  "http://localhost:3000", // For local development (React default)
  "http://localhost:5173", // Common port for Vite dev server
  // Add your Vercel frontend URL from an environment variable
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Specify allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  credentials: true, // If you need to allow cookies or authorization headers
};

// Apply general rate limiter to all requests (or specific base paths)
// It's often good to apply this early, but after static file serving if any.
app.use(generalRateLimiter);

// Middleware

app.use(cors(corsOptions)); // Configure CORS properly for production later
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// General logger for /api/admin/projects requests
app.use(
  "/api/admin/projects",
  (req: Request, res: Response, next: NextFunction) => {
    console.log(
      `--- APP.TS: Request received for path starting with /api/admin/projects ---`
    );
    console.log(`Method: ${req.method}, Original URL: ${req.originalUrl}`);
    // To see if body is parsed by express.json() before it hits the router
    console.log(
      `APP.TS Body Check (after express.json()): ${JSON.stringify(req.body)}`
    );
    next();
  }
);

// Rate Limiting - Apply to all requests for now, can be more specific
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Database Connection
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// Basic Route
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", message: "Backend is healthy" });
});

// API Routes (uncomment and add as you build them)
app.use("/api/auth", authRoutes); // Use the auth routes
app.use("/api/profile", profileRoutes);
app.use("/api/projects", projectRoutes); // Use project routes
app.use("/api/blog", blogPostRoutes); // Public blog routes
app.use("/api/contact", contactRoutes); // Public contact routes
app.use("/api/resume", resumeRoutes); // Use resume routes

// Admin routes
app.use("/api/admin/projects", protect, adminProjectRoutes);
app.use("/api/admin/blog", protect, adminBlogPostRoutes); // Mount admin blog routes
app.use("/api/admin/contact-submissions", protect, adminContactRoutes); // Mount admin contact routes
app.use("/api/admin/dashboard", protect, adminDashboardRoutes); // Mount admin dashboard routes
app.use("/api/admin/profile", protect, adminProfileRoutes); // Corrected usage for admin profile routes

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Global Error Handler (simple example, can be more sophisticated)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Error Handling Middleware
app.use(errorHandler);

export default app;

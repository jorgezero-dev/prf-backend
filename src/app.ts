import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import config from "./config";
import rateLimit from "express-rate-limit";

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

import { errorHandler } from "./middleware/errorMiddleware";

const app: Application = express();

// Middleware
app.use(cors()); // Configure CORS properly for production later
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

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
app.use("/api/admin/projects", adminProjectRoutes);
app.use("/api/admin/blog", adminBlogPostRoutes); // Mount admin blog routes
app.use("/api/admin/contact-submissions", adminContactRoutes); // Mount admin contact routes
app.use("/api/admin/dashboard", adminDashboardRoutes); // Mount admin dashboard routes

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

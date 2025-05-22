// filepath: c:\Users\joen_\Dev\portfolio\prf-backend\src\middleware\rateLimitMiddleware.ts
import rateLimit from "express-rate-limit";

// Basic rate limiter for most API routes (adjust as needed)
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Stricter rate limiter for sensitive actions like login and contact form submission
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 10 login/contact attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts from this IP, please try again after 15 minutes",
});

// You can create more specific limiters if needed, e.g., for password reset, etc.

import { Router } from "express";
import { login } from "../controllers/authController";
import { validate } from "../middleware/validationMiddleware"; // Import the validate middleware
import { loginSchema } from "../middleware/validationSchemas"; // Import the login schema
import { authRateLimiter } from "../middleware/rateLimitMiddleware"; // Import auth specific rate limiter

// @route   POST api/auth/login
// @desc    Authenticate admin and get token
// @access  Public
// Apply the validation middleware before the login controller
console.log("authRoutes.ts: Module loaded"); // <--- AÑADE ESTO

const router = Router();

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  (req, res, next) => {
    console.log("authRoutes.ts: /login route hit"); // <--- AÑADE ESTO
    login(req, res, next); // Llama al controlador original
  }
);

export default router;

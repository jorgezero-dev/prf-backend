import { Router } from "express";
import { submitContactForm } from "../controllers/contactController";
import { validate } from "../middleware/validationMiddleware"; // Import validate middleware
import { contactFormSchema } from "../middleware/validationSchemas"; // Import the schema
import { authRateLimiter } from "../middleware/rateLimitMiddleware"; // Import auth specific rate limiter

const router = Router();

// B-FR6.1: Submit Contact Form (Public)
router.post(
  "/",
  authRateLimiter,
  validate(contactFormSchema),
  submitContactForm
); // Apply stricter rate limiter

export default router;

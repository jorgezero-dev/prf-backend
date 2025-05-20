import { Router } from "express";
import { submitContactForm } from "../controllers/contactController";
import { protect } from "../middleware/authMiddleware"; // Assuming you have this middleware

const router = Router();

// B-FR6.1: Submit Contact Form (Public)
router.post("/", submitContactForm);

export default router;

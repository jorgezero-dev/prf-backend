import { Router } from "express";
import {
  getContactSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
} from "../../controllers/contactController";
import { protect } from "../../middleware/authMiddleware"; // Ensure this path is correct

const router = Router();

// All routes in this file are protected and under /api/admin/contact-submissions
router.use(protect);

// B-FR6.2: Get Contact Submissions (Admin)
router.get("/", getContactSubmissions);

// Optional: Update submission status (e.g., mark as read)
router.patch("/:id/status", updateSubmissionStatus); // Using PATCH for partial update

// Optional: Delete a submission
router.delete("/:id", deleteSubmission);

export default router;

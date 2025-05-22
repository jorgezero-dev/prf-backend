import express from "express";
import { updateResumeUrl, getResumeUrl } from "../controllers/resumeController";
import { protect, admin } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { updateResumeUrlSchema } from "../middleware/validationSchemas";

const router = express.Router();

// @route   POST /api/resume
// @access  Private/Admin
router
  .route("/")
  .post(protect, admin, validate(updateResumeUrlSchema), updateResumeUrl);

// @route   GET /api/resume/url
// @access  Public
router.route("/url").get(getResumeUrl);

export default router;

import express from "express";
import { updateResumeUrl, getResumeUrl } from "../controllers/resumeController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// @route   POST /api/resume
// @access  Private/Admin
router.route("/").post(protect, admin, updateResumeUrl);

// @route   GET /api/resume/url
// @access  Public
router.route("/url").get(getResumeUrl);

export default router;

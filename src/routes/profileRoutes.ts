import { Router } from "express";
import * as profileController from "../controllers/profileController"; // Import all controller functions
import { protect, AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// @route   GET api/profile
// @desc    Get admin profile information
// @access  Private (Admin only)
router.get("/", protect, (req, res, next) =>
  profileController.getProfile(req as AuthenticatedRequest, res, next)
);

// @route   PUT api/profile
// @desc    Update admin profile information
// @access  Private (Admin only)
router.put("/", protect, (req, res, next) =>
  profileController.updateProfile(req as AuthenticatedRequest, res, next)
);

// @route   POST api/profile/resume
// @desc    Update or set the resume URL
// @access  Private (Admin only)
router.post("/resume", protect, (req, res, next) =>
  profileController.updateResumeUrl(req as AuthenticatedRequest, res, next)
);

// @route   GET api/profile/resume/url
// @desc    Get the resume URL
// @access  Public
router.get("/resume/url", profileController.getResumeUrl);

export default router;

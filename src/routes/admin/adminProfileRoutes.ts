import { Router } from "express";
import { protect, admin } from "../../middleware/authMiddleware"; // Corrected to use admin
import {
  uploadResume,
  updateResumeUrlDirectly,
} from "../../controllers/admin/adminProfileController";
import upload from "../../middleware/multerConfig";

const router = Router();

// POST /api/admin/profile/resume/upload - Upload resume. Path corrected to be relative to /api/admin/profile
router.post(
  "/resume/upload",
  protect,
  admin, // Corrected to use admin
  upload.single("resume"),
  uploadResume
);

// PUT /api/admin/profile/resume/url - Update resume URL directly. Path corrected to be relative to /api/admin/profile
router.put(
  "/resume/url",
  protect,
  admin, // Corrected to use admin
  updateResumeUrlDirectly
);

export default router;

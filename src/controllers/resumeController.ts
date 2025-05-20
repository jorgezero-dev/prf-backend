import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import SiteSetting from "../models/SiteSetting";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// @desc    Update or Create Resume URL
// @route   POST /api/resume
// @access  Private/Admin
const updateResumeUrl = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { resumeUrl } = req.body;

    if (typeof resumeUrl !== "string") {
      res.status(400).json({ message: "Invalid resume URL" });
      return;
    }

    // Find the existing site settings document or create a new one if it doesn't exist
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.create({ resumeUrl });
    } else {
      settings.resumeUrl = resumeUrl;
      await settings.save();
    }

    res.status(200).json({
      message: "Resume URL updated successfully",
      resumeUrl: settings.resumeUrl,
    });
  }
);

// @desc    Get Resume URL
// @route   GET /api/resume/url
// @access  Public
const getResumeUrl = asyncHandler(async (req: Request, res: Response) => {
  const settings = await SiteSetting.findOne();

  if (!settings || !settings.resumeUrl) {
    res.status(404).json({ message: "Resume URL not found" });
    return;
  }

  res.status(200).json({ resumeUrl: settings.resumeUrl });
});

export { updateResumeUrl, getResumeUrl };

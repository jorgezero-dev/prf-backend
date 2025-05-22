import { Response, NextFunction } from "express";
import Profile from "../../models/Profile";
import ApiError from "../../utils/ApiError";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import path from "path";
import fs from "fs";

// @desc    Upload or replace admin resume
// @route   POST /api/admin/resume/upload
// @access  Private (Admin)
export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("[UploadResumeController] Entered uploadResume function."); // New Log

  if (!req.file) {
    console.error(
      "[UploadResumeController] No file object found in request. Multer might have failed or not run."
    ); // New Log
    return next(new ApiError(400, "No file uploaded."));
  }

  console.log("[UploadResumeController] File received from Multer:", req.file); // New Log
  const resumeUrl = `/resumes/${req.file.filename}`;
  console.log(`[UploadResumeController] Generated resumeUrl: ${resumeUrl}`); // New Log

  try {
    console.log(
      `[UploadResumeController] Attempting to findOneAndUpdate Profile with resumeUrl: ${resumeUrl}`
    ); // New Log
    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: { resumeUrl: resumeUrl } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!profile) {
      console.error(
        "[UploadResumeController] Profile.findOneAndUpdate returned null (profile not found and upsert might have failed)."
      ); // New Log
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "../../../public/resumes",
          req.file.filename
        );
        console.log(
          `[UploadResumeController] DB operation failed. Attempting to delete orphaned file: ${filePath}`
        ); // New Log
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(
              "[UploadResumeController] Error deleting orphaned file after DB null profile:",
              err
            ); // New Log
          } else {
            console.log(
              `[UploadResumeController] Successfully deleted orphaned file after DB null profile: ${filePath}`
            ); // New Log
          }
        });
      }
      return next(
        new ApiError(500, "Profile not found and could not be created.")
      );
    }

    console.log(
      "[UploadResumeController] Profile updated successfully with new resumeUrl. Sending 200 response."
    ); // New Log
    res.status(200).json({
      message: "Resume uploaded successfully.",
      resumeUrl: resumeUrl,
    });
  } catch (error: any) {
    // Added type for error
    console.error(
      "[UploadResumeController] Error caught in try-catch block:",
      error.message,
      error.stack
    ); // New Log
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "../../../public/resumes",
        req.file.filename
      );
      console.log(
        `[UploadResumeController] Catch block: Attempting to delete orphaned file due to error: ${filePath}`
      ); // New Log
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(
            "[UploadResumeController] Error deleting orphaned file in catch block:",
            err
          ); // New Log
        } else {
          console.log(
            `[UploadResumeController] Successfully deleted orphaned file in catch block: ${filePath}`
          ); // New Log
        }
      });
    }
    next(error);
  }
};

// @desc    Update resume URL directly
// @route   PUT /api/admin/resume/url
// @access  Private (Admin)
export const updateResumeUrlDirectly = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return next(new ApiError(400, "Invalid URL provided."));
  }

  // Basic URL validation (can be more sophisticated)
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return next(new ApiError(400, "URL must start with http:// or https://"));
  }

  try {
    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: { resumeUrl: url } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!profile) {
      return next(
        new ApiError(500, "Profile not found and could not be created.")
      );
    }

    res.status(200).json({
      message: "Resume URL updated successfully.",
      resumeUrl: profile.resumeUrl,
    });
  } catch (error) {
    console.error("Error updating resume URL:", error);
    next(error);
  }
};

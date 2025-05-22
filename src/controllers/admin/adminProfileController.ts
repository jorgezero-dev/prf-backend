import { Response, NextFunction } from "express";
import Profile from "../../models/Profile";
import ApiError from "../../utils/ApiError";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

// @desc    Upload or replace admin resume to S3 and update Profile
// @route   POST /api/admin/profile/resume/upload
// @access  Private (Admin)
export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("[UploadResumeController] Entered uploadResume function.");

  if (!req.file) {
    console.error(
      "[UploadResumeController] No file object found in request. Multer (S3) might have failed or not run."
    );
    return next(new ApiError(400, "No file uploaded. Please select a PDF."));
  }

  console.log(
    "[UploadResumeController] File received by controller (from S3 upload):",
    req.file
  );

  // When using multer-s3, the public URL of the uploaded file
  // is available in req.file.location (Express.MulterS3.File)
  const resumeS3Url = (req.file as any).location; // Cast to any for simplicity, or use Express.MulterS3.File type

  if (!resumeS3Url || typeof resumeS3Url !== "string") {
    console.error(
      "[UploadResumeController] S3 URL (req.file.location) not found or invalid after S3 upload.",
      req.file
    );
    // The file is already in S3. If we can't get the URL, something is wrong with multer-s3 or S3 config.
    // No local file to delete here.
    return next(
      new ApiError(
        500,
        "File uploaded to S3, but could not retrieve its URL. Check server logs, S3 configuration, and bucket permissions."
      )
    );
  }

  console.log(
    `[UploadResumeController] Generated S3 resumeUrl: ${resumeS3Url}`
  );

  try {
    console.log(
      `[UploadResumeController] Attempting to findOneAndUpdate Profile with S3 resumeUrl: ${resumeS3Url}`
    );
    const profile = await Profile.findOneAndUpdate(
      {}, // Assuming a single profile document for the admin
      { $set: { resumeUrl: resumeS3Url } }, // Save the S3 URL
      {
        new: true, // Return the updated document
        upsert: true, // Create the document if it doesn't exist
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!profile) {
      console.error(
        "[UploadResumeController] Profile.findOneAndUpdate returned null (profile not found and upsert might have failed). File remains in S3."
      );
      // File is in S3. Log this for potential manual cleanup if the profile update fails critically.
      return next(
        new ApiError(
          500,
          "Profile not found and could not be created, but file was uploaded to S3."
        )
      );
    }

    console.log(
      "[UploadResumeController] Profile updated successfully with new S3 resumeUrl. Sending 200 response."
    );
    res.status(200).json({
      message: "Resume uploaded to S3 successfully and profile updated.",
      resumeUrl: profile.resumeUrl, // This is now the S3 URL
    });
  } catch (error: any) {
    console.error(
      "[UploadResumeController] Error caught during profile update after S3 upload:",
      error.message,
      error.stack
    );
    // File is already in S3. If the DB operation fails, the S3 object remains.
    // This is a common scenario; consider strategies for orphaned S3 objects if this is frequent.
    next(
      new ApiError(
        500,
        `Failed to update profile with S3 resume URL: ${error.message}. File remains in S3.`
      )
    );
  }
};

// @desc    Update resume URL directly in Profile (e.g., for an externally hosted resume)
// @route   PUT /api/admin/profile/resume/url
// @access  Private (Admin)
export const updateResumeUrlDirectly = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { url } = req.body;
  console.log(`[UpdateResumeUrlDirectly] Received URL: ${url}`);

  if (!url || typeof url !== "string") {
    console.log(
      "[UpdateResumeUrlDirectly] Invalid URL provided in request body."
    );
    return next(new ApiError(400, "Invalid URL provided. Must be a string."));
  }

  // Basic URL validation (can be more sophisticated, e.g., using a library)
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.log(
      "[UpdateResumeUrlDirectly] URL does not start with http:// or https://."
    );
    return next(new ApiError(400, "URL must start with http:// or https://"));
  }

  try {
    console.log(
      `[UpdateResumeUrlDirectly] Attempting to findOneAndUpdate Profile with direct URL: ${url}`
    );
    const profile = await Profile.findOneAndUpdate(
      {}, // Assuming a single profile document
      { $set: { resumeUrl: url } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!profile) {
      console.error(
        "[UpdateResumeUrlDirectly] Profile.findOneAndUpdate returned null."
      );
      return next(
        new ApiError(500, "Profile not found and could not be created.")
      );
    }

    console.log(
      "[UpdateResumeUrlDirectly] Profile resumeUrl updated directly. Sending 200 response."
    );
    res.status(200).json({
      message: "Resume URL updated in profile successfully.",
      resumeUrl: profile.resumeUrl,
    });
  } catch (error: any) {
    console.error(
      "[UpdateResumeUrlDirectly] Error updating resume URL:",
      error.message,
      error.stack
    );
    next(error); // Pass the error to the centralized error handler
  }
};

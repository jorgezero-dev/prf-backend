import { Response, NextFunction } from "express";
import Profile, { IProfile } from "../models/Profile";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// @desc    Get profile information
// @route   GET /api/profile
// @access  Private (Admin)
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // For a single admin setup, we fetch the first (and ideally only) profile document.
    const profile = await Profile.findOne();

    if (!profile) {
      res
        .status(404)
        .json({ message: "Profile not found. Please create one." });
      return; // Explicit return
    }

    res.status(200).json(profile);
    return; // Explicit return
  } catch (error) {
    console.error("Error fetching profile:", error);
    next(error); // Pass error to error handler
  }
};

// @desc    Update profile information
// @route   PUT /api/profile
// @access  Private (Admin)
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    biography,
    skills,
    education,
    workExperience,
    profilePictureUrl,
    socialLinks,
    contactEmail,
  } = req.body;

  // Basic validation
  if (
    biography === undefined &&
    skills === undefined &&
    education === undefined &&
    workExperience === undefined &&
    profilePictureUrl === undefined &&
    socialLinks === undefined &&
    contactEmail === undefined
  ) {
    res.status(400).json({ message: "No update data provided." });
    return; // Explicit return
  }

  try {
    const profileFields: Partial<IProfile> = {};
    if (biography !== undefined) profileFields.biography = biography;
    if (skills !== undefined) profileFields.skills = skills;
    if (education !== undefined) profileFields.education = education;
    if (workExperience !== undefined)
      profileFields.workExperience = workExperience;
    if (profilePictureUrl !== undefined)
      profileFields.profilePictureUrl = profilePictureUrl;
    if (socialLinks !== undefined) profileFields.socialLinks = socialLinks;
    if (contactEmail !== undefined) profileFields.contactEmail = contactEmail;
    // Add resumeUrl to profileFields if provided in the request body
    if (req.body.resumeUrl !== undefined)
      profileFields.resumeUrl = req.body.resumeUrl;

    const updatedProfile = await Profile.findOneAndUpdate(
      {}, // Find the first document
      { $set: profileFields },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedProfile) {
      // This case should ideally not be hit with upsert:true, but as a fallback.
      res
        .status(404)
        .json({ message: "Profile could not be updated or created." });
      return; // Explicit return
    }

    res.status(200).json(updatedProfile);
    return; // Explicit return
  } catch (error: any) {
    console.error("Error updating profile:", error);
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
      return; // Explicit return
    }
    next(error); // Pass other errors to error handler
  }
};

// @desc    Update or set the resume URL
// @route   POST /api/profile/resume
// @access  Private (Admin)
export const updateResumeUrl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { resumeUrl } = req.body;

  if (typeof resumeUrl !== "string") {
    // Basic validation for presence and type
    res.status(400).json({ message: "Resume URL must be a string." });
    return;
  }

  try {
    // Assuming a single profile document for the admin
    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: { resumeUrl: resumeUrl } },
      {
        new: true,
        upsert: true, // Create the profile if it doesn't exist
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!profile) {
      // This case should ideally not be hit with upsert:true
      res
        .status(404)
        .json({ message: "Profile not found and could not be created." });
      return;
    }

    res.status(200).json({
      message: "Resume URL updated successfully",
      resumeUrl: profile.resumeUrl,
    });
  } catch (error: any) {
    console.error("Error updating resume URL:", error);
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
      return;
    }
    next(error);
  }
};

// @desc    Get the resume URL
// @route   GET /api/profile/resume/url
// @access  Public (as per B-FR5.2, though /api/resume/url was specified, nesting under profile seems consistent)
export const getResumeUrl = async (
  req: AuthenticatedRequest, // Using AuthenticatedRequest for consistency, not strictly needed for public
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await Profile.findOne().select("resumeUrl"); // Select only the resumeUrl

    if (!profile || !profile.resumeUrl) {
      res.status(404).json({ message: "Resume URL not found." });
      return;
    }

    res.status(200).json({ resumeUrl: profile.resumeUrl });
  } catch (error) {
    console.error("Error fetching resume URL:", error);
    next(error);
  }
};

import mongoose, { Schema, Document } from "mongoose";

// Interface for Skill sub-document
export interface ISkill {
  category: string;
  items: string[];
}

// Schema for Skill
const SkillSchema: Schema = new Schema({
  category: { type: String, required: true },
  items: [{ type: String, required: true }],
});

// Interface for Education sub-document
export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string; // Or Date type
  endDate?: string; // Or Date type, optional
  description?: string;
}

// Schema for Education
const EducationSchema: Schema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startDate: { type: String, required: true }, // Consider using Date type if precise date operations are needed
  endDate: { type: String },
  description: { type: String },
});

// Interface for WorkExperience sub-document
export interface IWorkExperience {
  company: string;
  position: string;
  startDate: string; // Or Date type
  endDate?: string; // Or Date type, optional
  responsibilities: string[];
}

// Schema for WorkExperience
const WorkExperienceSchema: Schema = new Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: String, required: true }, // Consider using Date type
  endDate: { type: String },
  responsibilities: [{ type: String, required: true }],
});

// Interface for SocialLink sub-document
export interface ISocialLink {
  platform: string;
  url: string;
}

// Schema for SocialLink
const SocialLinkSchema: Schema = new Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true }, // Consider adding URL validation
});

// Interface for the main Profile document
export interface IProfile extends Document {
  // userId: mongoose.Types.ObjectId; // Optional: if linking to a specific user
  biography: string;
  skills: ISkill[];
  education: IEducation[];
  workExperience: IWorkExperience[];
  profilePictureUrl?: string;
  socialLinks: ISocialLink[];
  contactEmail: string;
  resumeUrl?: string; // Added resumeUrl
  // lastUpdatedBy?: mongoose.Types.ObjectId; // Optional: to track who updated it
}

// Main Profile Schema
const ProfileSchema: Schema = new Schema(
  {
    // userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: false }, // If each user has one profile
    biography: {
      type: String,
      required: true,
      trim: true,
    },
    skills: [SkillSchema],
    education: [EducationSchema],
    workExperience: [WorkExperienceSchema],
    profilePictureUrl: {
      type: String,
      trim: true,
      // Add validation for URL format if needed
    },
    socialLinks: [SocialLinkSchema],
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // Add validation for email format
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please fill a valid email address",
      ],
    },
    resumeUrl: {
      // Added resumeUrl schema definition
      type: String,
      trim: true,
      // Consider adding URL validation if needed
    },
    // lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// For a single-admin setup, we might enforce only one profile document.
// One way is to not use a userId and always fetch/update the first document found.
// Or, use a known, fixed ID for the single profile document.

export default mongoose.model<IProfile>("Profile", ProfileSchema);

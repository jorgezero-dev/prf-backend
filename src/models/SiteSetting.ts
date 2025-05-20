import mongoose, { Schema, Document } from "mongoose";

export interface ISiteSetting extends Document {
  resumeUrl: string;
  // We can add other site-wide settings here in the future
}

const SiteSettingSchema: Schema = new Schema(
  {
    resumeUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Ensure only one document can exist for site settings
SiteSettingSchema.index({ _id: 1 }, { unique: true });

export default mongoose.model<ISiteSetting>("SiteSetting", SiteSettingSchema);

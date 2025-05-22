import mongoose, { Schema, Document } from "mongoose";

// Interface for Image sub-document
export interface IImage {
  url: string;
  altText: string;
  isThumbnail?: boolean;
}

// Schema for Image
const ImageSchema: Schema = new Schema({
  url: {
    type: String,
    required:
      true /*, validate: { validator: (v: string) => /^(ftp|http|https):\/\/[^ "]+$/.test(v), message: 'Invalid URL' } */,
  },
  altText: { type: String, required: true },
  isThumbnail: { type: Boolean, default: false },
});

// Interface for the Project document
export interface IProject extends Document {
  title: string;
  slug: string; // Added for SEO friendly URLs and unique identification
  shortSummary: string;
  description: string; // HTML or Markdown
  technologies: string[];
  role: string;
  challenges: string;
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
  images: IImage[];
  status: "published" | "draft";
  order: number;
  featured: boolean;
  // createdBy: mongoose.Types.ObjectId; // Optional: if you want to link to the user who created it
}

// Main Project Schema
const ProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot be more than 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      // Slug will be auto-generated from title if not provided
    },
    shortSummary: {
      type: String,
      required: [true, "Short summary is required"],
      trim: true,
      maxlength: [300, "Short summary cannot be more than 300 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    technologies: [
      {
        type: String,
        required: [true, "At least one technology is required"],
        trim: true,
      },
    ],
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    challenges: {
      type: String,
      required: [true, "Challenges section is required"],
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      // validate: { validator: (v: string) => v === '' || /^(ftp|http|https):\/\/[^ "]+$/.test(v), message: 'Invalid URL' }
    },
    sourceCodeUrl: {
      type: String,
      trim: true,
      // validate: { validator: (v: string) => v === '' || /^(ftp|http|https):\/\/[^ "]+$/.test(v), message: 'Invalid URL' }
    },
    images: [ImageSchema], // Array of images, can be empty
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
      required: true,
    },
    order: {
      type: Number,
      default: 0, // Consider a more sophisticated ordering mechanism if needed
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Example if linking to user
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Pre-save middleware to generate slug from title if slug is not present or title is modified
ProjectSchema.pre<IProject>("save", async function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = await generateUniqueSlug(
      this.title,
      this.constructor as mongoose.Model<IProject>
    );
  }
  next();
});

// Helper function to generate a unique slug
async function generateUniqueSlug(
  title: string,
  model: mongoose.Model<IProject>,
  suffix = 0
): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text

  const slug = suffix > 0 ? `${baseSlug}-${suffix}` : baseSlug;
  const existingProject = await model.findOne({ slug });

  if (existingProject) {
    return generateUniqueSlug(title, model, suffix + 1);
  }
  return slug;
}

// Indexing for frequently queried fields
ProjectSchema.index({ status: 1, order: 1, createdAt: -1 });
ProjectSchema.index({ slug: 1 });
ProjectSchema.index({ featured: 1 });
ProjectSchema.index({ technologies: 1 }); // Added index for technologies

export default mongoose.model<IProject>("Project", ProjectSchema);

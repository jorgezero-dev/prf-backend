import mongoose, { Schema, Document, Types } from "mongoose";

// Interface for SEO metadata
export interface ISEOMetadata {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

// Interface for the BlogPost document
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string; // Markdown or HTML
  author: Types.ObjectId; // Reference to User model
  tags: string[];
  status: "draft" | "published";
  featuredImage?: string; // URL to the image
  seoMetadata: ISEOMetadata;
  publishedAt?: Date; // To be set when status changes to 'published'
  // Timestamps (createdAt, updatedAt) will be added by Mongoose
}

// SEO Metadata Schema
const SEOMetadataSchema: Schema = new Schema(
  {
    seoTitle: { type: String, trim: true, maxlength: 70 },
    seoDescription: { type: String, trim: true, maxlength: 160 },
    seoKeywords: [{ type: String, trim: true }],
  },
  { _id: false }
);

// Main BlogPost Schema
const BlogPostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      // Slug will be auto-generated from title if not provided
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },
    featuredImage: {
      type: String,
      trim: true,
      // Add URL validation if needed
    },
    seoMetadata: SEOMetadataSchema,
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Helper function to generate a unique slug (similar to Project model)
async function generateUniqueSlug(
  title: string,
  model: mongoose.Model<IBlogPost>,
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
  // Check if a document with this slug already exists in this model
  const existingPost = await model.findOne({ slug });

  if (existingPost) {
    return generateUniqueSlug(title, model, suffix + 1);
  }
  return slug;
}

// Pre-save middleware to generate slug and set publishedAt
BlogPostSchema.pre<IBlogPost>("save", async function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = await generateUniqueSlug(
      this.title,
      this.constructor as mongoose.Model<IBlogPost>
    );
  }

  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  } else if (this.isModified("status") && this.status === "draft") {
    // Optionally clear publishedAt if moved back to draft, or leave as is
    // this.publishedAt = undefined;
  }
  next();
});

// Indexing for frequently queried fields
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1, publishedAt: -1 }); // For public listing
BlogPostSchema.index({ author: 1 });
BlogPostSchema.index({ tags: 1 }); // For filtering by tags

const BlogPost = mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;

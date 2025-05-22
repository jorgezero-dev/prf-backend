import { Request, Response, NextFunction } from "express";
import BlogPost, { IBlogPost, ISEOMetadata } from "../models/BlogPost";
import ApiError from "../utils/ApiError";
import { AuthenticatedRequest } from "../middleware/authMiddleware"; // For req.user
import mongoose, { Types } from "mongoose"; // Import Types for ObjectId

// @desc    Create a new blog post
// @route   POST /api/blog
// @access  Private (Admin/Authenticated User)
export const createBlogPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { title, content, tags, status, featuredImage, seoMetadata } = req.body;

  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const newPost: IBlogPost = new BlogPost({
      title,
      content,
      author: req.user.id, // Set author from authenticated user
      tags: tags || [],
      status: status || "draft",
      featuredImage,
      seoMetadata: seoMetadata || {},
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
    return;
  } catch (error) {
    console.error("Error creating blog post:", error);
    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message
      );
      res.status(400).json({ message: "Validation failed", errors: messages });
      return;
    }
    // Handle duplicate key error for slug (though slug is auto-generated, title uniqueness might be desired indirectly)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      res.status(409).json({
        message:
          "Failed to create blog post. A post with a similar title/slug might already exist.",
      });
      return;
    }
    next(error);
  }
};

// @desc    Get all published blog posts (Public)
// @route   GET /api/blog
// @access  Public
export const getAllBlogPostsPublic = async (
  req: AuthenticatedRequest, // Using AuthenticatedRequest for consistency, though req.user won't be used here for public route
  res: Response,
  next: NextFunction
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const tag = req.query.tag as string;
  const search = req.query.search as string;

  const skip = (page - 1) * limit;

  const query: any = { status: "published" };

  if (tag) {
    query.tags = { $in: [tag.toLowerCase()] }; // Filter by tag, case-insensitive for the tag itself
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      // Add more fields to search if necessary, e.g., tags
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  try {
    const posts = await BlogPost.find(query)
      .populate("author", "name email") // Populate author's name and email
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use .lean() for faster queries if not modifying docs

    const totalPosts = await BlogPost.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      data: posts,
      total: totalPosts,
      page,
      limit,
      totalPages,
      currentPage: page,
    });
    return;
  } catch (error) {
    console.error("Error fetching public blog posts:", error);
    next(error);
  }
};

// @desc    Get all blog posts (Admin)
// @route   GET /api/admin/blog
// @access  Private (Admin)
export const getAllBlogPostsAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string; // 'draft', 'published', or undefined for all
  const sortBy = (req.query.sortBy as string) || "createdAt"; // Default sort by createdAt
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // asc or desc (default)
  const search = req.query.search as string;

  const skip = (page - 1) * limit;
  const query: any = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }
  // Add author search if needed, e.g., by populating author and then matching name/email

  try {
    const posts = await BlogPost.find(query)
      .populate("author", "name email")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await BlogPost.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      data: posts,
      total: totalPosts,
      page,
      limit,
      totalPages,
      currentPage: page,
    });
    return;
  } catch (error) {
    console.error("Error fetching admin blog posts:", error);
    next(error);
  }
};

// @desc    Get a single published blog post by slug (Public)
// @route   GET /api/blog/:slug
// @access  Public
export const getBlogPostBySlugPublic = async (
  req: AuthenticatedRequest, // Using AuthenticatedRequest for consistency
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { slug } = req.params;

  try {
    const post = await BlogPost.findOne({ slug, status: "published" })
      .populate("author", "name email")
      .lean();

    if (!post) {
      res.status(404).json({ message: "Blog post not found or not published" });
      return;
    }

    res.status(200).json(post);
    return;
  } catch (error) {
    console.error(`Error fetching public blog post by slug ${slug}:`, error);
    next(error);
  }
};

/**
 * @desc    Get a single blog post by ID (Admin)
 * @route   GET /api/admin/blog/:id
 * @access  Private (Admin)
 */
export const getBlogPostByIdAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blogPostId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogPostId)) {
      return next(new ApiError(400, "Invalid blog post ID format"));
    }
    const blogPost = await BlogPost.findById(blogPostId).populate(
      "author",
      "name email"
    );
    if (!blogPost) {
      return next(new ApiError(404, "Blog post not found"));
    }
    res.status(200).json(blogPost);
  } catch (error: any) {
    if (error.name === "CastError") {
      return next(new ApiError(400, "Invalid blog post ID format"));
    }
    next(error);
  }
};

interface UpdateBlogPostBody {
  title?: string;
  content?: string;
  tags?: string[];
  status?: "draft" | "published";
  featuredImage?: string;
  seoMetadata?: Partial<ISEOMetadata>; // Use Partial as not all SEO fields are required for update
  slug?: string;
  publishedAt?: Date | string | null; // Allow null to clear the date
}

/**
 * @desc    Update a blog post
 * @route   PUT /api/admin/blog/:id
 * @access  Private (Admin)
 */
export const updateBlogPost = async (
  req: Request<{ id: string }, any, UpdateBlogPostBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blogPostId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogPostId)) {
      return next(new ApiError(400, "Invalid blog post ID format"));
    }

    const blogPost: IBlogPost | null = await BlogPost.findById(blogPostId);

    if (!blogPost) {
      return next(new ApiError(404, "Blog post not found"));
    }

    const {
      title,
      content,
      tags,
      status,
      featuredImage,
      seoMetadata,
      slug,
      publishedAt,
    } = req.body;

    // Update fields if provided
    if (title) blogPost.title = title;
    if (content) blogPost.content = content;
    if (tags) blogPost.tags = tags;
    // Allow setting featuredImage to empty string or null by checking undefined
    if (featuredImage !== undefined) blogPost.featuredImage = featuredImage;

    if (seoMetadata) {
      blogPost.seoMetadata = {
        // Ensure correct field names from ISEOMetadata
        seoTitle: seoMetadata.seoTitle || blogPost.seoMetadata?.seoTitle,
        seoDescription:
          seoMetadata.seoDescription || blogPost.seoMetadata?.seoDescription,
        seoKeywords:
          seoMetadata.seoKeywords || blogPost.seoMetadata?.seoKeywords,
      };
    }

    if (slug && slug !== blogPost.slug) {
      const existingPostWithSlug: IBlogPost | null = await BlogPost.findOne({
        slug,
        _id: { $ne: blogPostId }, // Ensure it's not the current post
      });
      if (existingPostWithSlug) {
        // If a different post with the new slug already exists, return an error
        return next(
          new ApiError(409, "A blog post with this slug already exists.")
        );
      }
      blogPost.slug = slug; // Update slug if it's unique or belongs to the current post
    }

    // Handle status and publishedAt
    // If status is changed to 'published' and publishedAt is not set or is in the past, set it to now
    if (status && status !== blogPost.status) {
      blogPost.status = status;
      if (status === "published") {
        if (
          !blogPost.publishedAt ||
          new Date(blogPost.publishedAt) > new Date()
        ) {
          blogPost.publishedAt = new Date();
        }
      }
    }

    // Allow clearing or setting publishedAt directly if provided
    // If publishedAt is explicitly provided, use that value.
    // If publishedAt is provided as null, it means unpublish or clear the date.
    if (publishedAt !== undefined) {
      if (publishedAt === null) {
        blogPost.publishedAt = undefined; // Or null, depending on schema definition for optional Date
      } else {
        const newPublishedDate = new Date(publishedAt);
        if (!isNaN(newPublishedDate.getTime())) {
          blogPost.publishedAt = newPublishedDate;
          // If setting a future date, ensure status is 'draft' or 'scheduled' (if you add 'scheduled')
          // For now, if future date and status is 'published', it might be an issue or intentional.
          // If status is 'published' and publishedAt is in the future, it implies scheduled.
          // However, current model only has 'draft' and 'published'.
          // If you want to support scheduled posts, you might need to adjust status logic.
        } else {
          return next(new ApiError(400, "Invalid publishedAt date format."));
        }
      }
    }

    const updatedBlogPost = await blogPost.save();
    res.status(200).json(updatedBlogPost);
  } catch (error: any) {
    if (error.name === "CastError") {
      return next(new ApiError(400, "Invalid blog post ID format."));
    }
    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message
      );
      return next(
        new ApiError(400, `Validation failed: ${messages.join(", ")}`)
      );
    }
    // Handle duplicate key error for slug (if somehow missed by the check above)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return next(
        new ApiError(409, "A blog post with this slug already exists.")
      );
    }
    next(error);
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/admin/blog/:id
 * @access  Private (Admin)
 */
export const deleteBlogPost = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blogPostId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogPostId)) {
      return next(new ApiError(400, "Invalid blog post ID format"));
    }
    const blogPost = await BlogPost.findById(blogPostId);

    if (!blogPost) {
      return next(new ApiError(404, "Blog post not found"));
    }

    await blogPost.deleteOne();

    res.status(204).send(); // B-FR4.7: Delete Project - Response (Success - 204 No Content)
  } catch (error: any) {
    if (error.name === "CastError") {
      return next(new ApiError(400, "Invalid blog post ID format"));
    }
    next(error);
  }
};

/**
 * @desc    Delete a blog post by ID (Admin)
 * @route   DELETE /api/admin/blog/:id
 * @access  Private (Admin)
 */
export const deleteBlogPostAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blogPostId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogPostId)) {
      return next(new ApiError(400, "Invalid blog post ID format"));
    }

    const blogPost = await BlogPost.findById(blogPostId);

    if (!blogPost) {
      return next(new ApiError(404, "Blog post not found"));
    }

    await BlogPost.findByIdAndDelete(blogPostId); // Corrected method

    res.status(204).send(); // No content to send back
  } catch (error: any) {
    if (error.name === "CastError") {
      return next(new ApiError(400, "Invalid blog post ID format"));
    }
    next(error); // Pass other errors to the global error handler
  }
};

/**
 * @desc    Get all unique blog post tags
 * @route   GET /api/blog/tags
 * @access  Public
 */
export const getUniqueBlogTags = async (
  req: Request, // No params or specific body needed
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // B-FR4.8: Aggregate distinct values from the tags fields of PUBLISHED posts.
    const tagsResult: { name: string }[] = await BlogPost.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" }, // Deconstruct the tags array into separate documents for each tag
      { $group: { _id: "$tags" } }, // Group by the tag value to get unique tags
      { $project: { _id: 0, name: "$_id" } }, // Reshape the output: rename _id to name
      { $sort: { name: 1 } }, // Sort tags alphabetically
    ]).exec(); // Added .exec() to execute the aggregation
    // The result of aggregation is an array of objects like [{name: 'tag1'}, {name: 'tag2'}]
    // B-FR4.8 Response: { data: ["string"] }
    res
      .status(200)
      .json({ data: tagsResult.map((t: { name: string }) => t.name) });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};

/**
 * @desc    Get all unique blog post categories
 * @route   GET /api/blog/categories
 * @access  Public
 */
export const getUniqueBlogCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoriesResult: { name: string }[] = await BlogPost.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$categories" },
      { $group: { _id: "$categories" } },
      { $project: { _id: 0, name: "$_id" } },
      { $sort: { name: 1 } },
    ]).exec(); // Added .exec() to execute the aggregation
    res
      .status(200)
      .json({ data: categoriesResult.map((c: { name: string }) => c.name) });
  } catch (error) {
    next(error);
  }
};

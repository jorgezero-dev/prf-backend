import express from "express";
import * as blogPostController from "../controllers/blogPostController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware"; // Import validate middleware
import { createBlogPostSchema } from "../middleware/validationSchemas"; // Import the schema

const router = express.Router();

// @desc    Create a new blog post
// @route   POST /api/blog
// @access  Private (Admin/Authenticated User)
router.post(
  "/",
  protect,
  validate(createBlogPostSchema), // Apply validation middleware
  blogPostController.createBlogPost
);

// Public Read Routes
// @desc    Get all published blog posts (Public)
// @route   GET /api/blog
// @access  Public
router.get("/", blogPostController.getAllBlogPostsPublic);

// @desc    Get all unique blog post tags (Public)
// @route   GET /api/blog/tags
// @access  Public
router.get("/tags", blogPostController.getUniqueBlogTags); // Specific route before generic

// @desc    Get all unique blog post categories (Public)
// @route   GET /api/blog/categories
// @access  Public
router.get("/categories", blogPostController.getUniqueBlogCategories); // Specific route before generic

// @desc    Get a single published blog post by slug (Public)
// @route   GET /api/blog/:slug
// @access  Public
router.get("/:slug", blogPostController.getBlogPostBySlugPublic); // Generic slug route should be last among these GETs

// @desc    Get all blog posts (Admin) - This route results in /api/blog/admin/blog
// @route   GET /api/blog/admin/blog (effective path)
// @access  Private (Admin)
// Note: Consider if this route is intended here or should be exclusively handled by adminBlogPostRoutes.ts via /api/admin/blog
router.get("/admin/blog", protect, blogPostController.getAllBlogPostsAdmin);

// Add other blog routes here as they are implemented

export default router;

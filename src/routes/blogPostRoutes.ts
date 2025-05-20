import express from "express";
import * as blogPostController from "../controllers/blogPostController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// @desc    Create a new blog post
// @route   POST /api/blog
// @access  Private (Admin/Authenticated User)
router.post("/", protect, blogPostController.createBlogPost);

// @desc    Get all published blog posts (Public)
// @route   GET /api/blog
// @access  Public
router.get("/", blogPostController.getAllBlogPostsPublic);

// @desc    Get all blog posts (Admin)
// @route   GET /api/admin/blog
// @access  Private (Admin)
router.get("/admin/blog", protect, blogPostController.getAllBlogPostsAdmin);

// @desc    Get a single published blog post by slug (Public)
// @route   GET /api/blog/:slug
// @access  Public
router.get("/:slug", blogPostController.getBlogPostBySlugPublic);

// @desc    Get all unique blog post tags (Public)
// @route   GET /api/blog/tags
// @access  Public
router.get("/tags", blogPostController.getUniqueBlogTags);

// @desc    Get all unique blog post categories (Public)
// @route   GET /api/blog/categories
// @access  Public
router.get("/categories", blogPostController.getUniqueBlogCategories);

// Add other blog routes here as they are implemented

export default router;

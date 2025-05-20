import express from "express";
import {
  createBlogPost,
  getAllBlogPostsAdmin,
  getBlogPostByIdAdmin,
  updateBlogPost,
  deleteBlogPost, // Add deleteBlogPost
} from "../../controllers/blogPostController";
import { protect } from "../../middleware/authMiddleware";

const router = express.Router();

// --- Admin Blog Post Routes (all protected) ---

// POST /api/admin/blog - Create a new blog post
router.post("/", protect, createBlogPost); // B-FR4.1

// GET /api/admin/blog/all - Get all blog posts (admin view with filters)
router.get("/all", protect, getAllBlogPostsAdmin); // B-FR4.3

// GET /api/admin/blog/:id - Get a single blog post by ID (admin view)
router.get("/:id", protect, getBlogPostByIdAdmin); // B-FR4.5

// PUT /api/admin/blog/:id - Update a blog post
router.put("/:id", protect, updateBlogPost); // B-FR4.6

// DELETE /api/admin/blog/:id - Delete a blog post
router.delete("/:id", protect, deleteBlogPost); // B-FR4.7

export default router;

import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import Project from "../../models/Project";
import BlogPost from "../../models/BlogPost";
import ContactSubmission from "../../models/ContactSubmission";

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const totalProjects = await Project.countDocuments();
  const totalPublishedPosts = await BlogPost.countDocuments({
    status: "published",
  });
  const totalDraftPosts = await BlogPost.countDocuments({ status: "draft" });
  const totalContactSubmissions = await ContactSubmission.countDocuments();

  res.status(200).json({
    totalProjects,
    totalPublishedPosts,
    totalDraftPosts,
    totalContactSubmissions,
  });
});

export { getDashboardStats };

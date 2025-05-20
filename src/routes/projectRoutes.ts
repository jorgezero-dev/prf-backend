import { Router, Request } from "express"; // Added Request
import {
  createProject,
  getAllProjectsPublic,
  getAllProjectsAdmin,
  getSingleProjectByIdAdmin,
  updateProject,
  deleteProject,
  // ... other controllers will be added here
} from "../controllers/projectController";
import { protect, AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// --- Public Routes ---

// @route   GET api/projects
// @desc    Get all published projects with pagination and filtering
// @access  Public
router.get("/", (req: Request, res, next) =>
  getAllProjectsPublic(req, res, next)
);

// --- Admin (Protected) Routes ---

// @route   GET api/admin/projects  <-- This is a common convention for admin-specific routes
// @desc    Get all projects (admin view) with pagination, filtering, and sorting
// @access  Private (Admin only)
router.get("/admin/projects", protect, (req, res, next) =>
  getAllProjectsAdmin(req as AuthenticatedRequest, res, next)
);

// @route   GET api/admin/projects/:id
// @desc    Get a single project by ID (Admin)
// @access  Private (Admin only)
router.get("/admin/projects/:id", protect, (req, res, next) =>
  getSingleProjectByIdAdmin(req as AuthenticatedRequest, res, next)
);

// @route   PUT /api/admin/projects/:id
// @desc    Update a project by ID (Admin)
// @access  Private (Admin only)
router.put("/admin/projects/:id", protect, (req, res, next) =>
  updateProject(req as AuthenticatedRequest, res, next)
);

// @route   DELETE /api/admin/projects/:id
// @desc    Delete a project by ID (Admin)
// @access  Private (Admin only)
router.delete("/admin/projects/:id", protect, (req, res, next) =>
  deleteProject(req as AuthenticatedRequest, res, next)
);

// @route   POST api/projects
// @desc    Create a new project
// @access  Private (Admin only)
router.post("/", protect, (req, res, next) =>
  createProject(req as AuthenticatedRequest, res, next)
);

export default router;

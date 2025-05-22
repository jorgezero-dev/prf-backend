import { Router, Request } from "express"; // Added Request
import {
  createProject,
  getAllProjectsPublic,
  getProjectByIdOrSlugPublic,
  // Admin controllers are now in adminProjectRoutes.ts
} from "../controllers/projectController";
import { protect, AuthenticatedRequest } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { createProjectSchema } from "../middleware/validationSchemas";

const router = Router();

// --- Public Routes ---

// @route   GET api/projects
// @desc    Get all published projects with pagination and filtering
// @access  Public
router.get("/", (req: Request, res, next) =>
  getAllProjectsPublic(req, res, next)
);

// @route   GET api/projects/:idOrSlug
// @desc    Get a single published project by ID or Slug
// @access  Public
router.get("/:idOrSlug", (req: Request, res, next) =>
  getProjectByIdOrSlugPublic(req, res, next)
);

// --- Admin (Protected) Routes ---

// @route   POST api/projects
// @desc    Create a new project
// @access  Private (Admin only)
// This route is /api/projects, so it stays here.
// Admin routes like GET /api/admin/projects, PUT /api/admin/projects/:id etc. are in adminProjectRoutes.ts
router.post(
  "/",
  protect, // Protect the route
  validate(createProjectSchema), // Validate the request body
  (req, res, next) => createProject(req as AuthenticatedRequest, res, next)
);

export default router;

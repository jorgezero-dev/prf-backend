// filepath: c:\Users\joen_\Dev\portfolio\prf-backend\src\routes\admin\adminProjectRoutes.ts
import express from "express";
import {
  createProject, // Added import for createProject
  getAllProjectsAdmin,
  getSingleProjectByIdAdmin,
  updateProject,
  deleteProject,
} from "../../controllers/projectController";
import {
  protect,
  admin,
  AuthenticatedRequest,
} from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validationMiddleware";
import {
  createProjectSchema, // Added import for createProjectSchema
  updateProjectSchema,
} from "../../middleware/validationSchemas";

const router = express.Router();

// All routes in this file are protected and under /api/admin/projects

// Route to create a new project
router.post(
  "/",
  protect,
  admin,
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Temporary logging middleware
    console.log("--- Logging request for POST /api/admin/projects ---");
    console.log("Request Headers:", req.headers);
    console.log("Request Body before validation:", req.body);
    next();
  },
  validate(createProjectSchema), // Apply validation for creating a project
  (req, res, next) => createProject(req as AuthenticatedRequest, res, next) // Assuming createProject is the controller
);

// B-FR3.3: Get All Projects (Admin)
router.get("/", protect, admin, (req, res, next) =>
  getAllProjectsAdmin(req as AuthenticatedRequest, res, next)
);

// B-FR3.5: Get Single Project by ID (Admin)
router.get("/:id", protect, admin, (req, res, next) =>
  getSingleProjectByIdAdmin(req as AuthenticatedRequest, res, next)
);

// B-FR3.6: Update Project (Admin)
router.put(
  "/:id",
  protect,
  admin,
  validate(updateProjectSchema), // Added validation middleware
  (req, res, next) => updateProject(req as AuthenticatedRequest, res, next)
);

// B-FR3.7: Delete Project (Admin)
router.delete("/:id", protect, admin, (req, res, next) =>
  deleteProject(req as AuthenticatedRequest, res, next)
);

export default router;

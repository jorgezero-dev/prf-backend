import { Request, Response, NextFunction } from "express"; // Added Request
import Project, { IProject } from "../models/Project";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin)
export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    title,
    slug, // Optional, will be auto-generated if not provided
    shortSummary,
    description,
    technologies,
    role,
    challenges,
    liveDemoUrl,
    sourceCodeUrl,
    images,
    status,
    order,
    featured,
  } = req.body;

  try {
    // Basic validation (Mongoose will also validate)
    if (
      !title ||
      !shortSummary ||
      !description ||
      !technologies ||
      !role ||
      !challenges
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const projectFields: Partial<IProject> = {
      title,
      shortSummary,
      description,
      technologies,
      role,
      challenges,
      images: images || [], // Default to empty array if not provided
      status: status || "draft",
      order: order || 0,
      featured: featured || false,
    };
    if (slug) projectFields.slug = slug;
    if (liveDemoUrl) projectFields.liveDemoUrl = liveDemoUrl;
    if (sourceCodeUrl) projectFields.sourceCodeUrl = sourceCodeUrl;
    // if (req.user) { // Optional: Link project to the creator
    //   projectFields.createdBy = req.user.id;
    // }

    const project = new Project(projectFields);
    await project.save();
    res.status(201).json(project);
    return;
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
      return;
    } else if (error.code === 11000) {
      // Handle duplicate slug error
      res
        .status(400)
        .json({ message: "Duplicate value error.", errors: error.keyValue });
      return;
    }
    console.error("Error creating project:", error);
    next(error);
  }
};

// @desc    Get all published projects (Public)
// @route   GET /api/projects
// @access  Public
export const getAllProjectsPublic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { category, page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    const query: any = { status: "published" };
    if (category) {
      // Assuming 'category' refers to a tag or technology for filtering.
      // Adjust if you have a dedicated category field.
      query.technologies = { $in: [new RegExp(category as string, "i")] };
    }

    const projects = await Project.find(query)
      .sort({ order: 1, createdAt: -1 }) // Sort by order, then by creation date
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Project.countDocuments(query);
    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      data: projects,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    });
    return;
  } catch (error) {
    console.error("Error fetching public projects:", error);
    next(error);
  }
};

// @desc    Get all projects (Admin)
// @route   GET /api/admin/projects
// @access  Private (Admin)
export const getAllProjectsAdmin = async (
  req: AuthenticatedRequest, // Use AuthenticatedRequest as it's a protected route
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    status,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    const query: mongoose.FilterQuery<IProject> = {}; // More specific type for query
    if (status) {
      query.status = status as string;
    }

    // Basic validation for sortBy field to prevent injection
    const allowedSortByFields: (keyof IProject | string)[] = [
      "title",
      "slug",
      "shortSummary",
      "status",
      "order",
      "createdAt",
      "updatedAt",
      "featured",
    ];
    const sortField = allowedSortByFields.includes(sortBy as string)
      ? (sortBy as string)
      : "createdAt";
    const orderDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions: { [key: string]: mongoose.SortOrder } = {
      [sortField]: orderDirection,
    };

    const projects = await Project.find(query)
      .sort(sortOptions)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Project.countDocuments(query);
    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      data: projects,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    });
    return;
  } catch (error) {
    console.error("Error fetching admin projects:", error);
    next(error);
  }
};

// @desc    Get a single project by ID (Admin)
// @route   GET /api/admin/projects/:id
// @access  Private (Admin)
export const getSingleProjectByIdAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid project ID format" });
      return;
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.status(200).json(project);
    return;
  } catch (error) {
    console.error(`Error fetching project by ID ${id} for admin:`, error);
    next(error);
  }
};

// @desc    Get a single published project by ID or Slug (Public)
// @route   GET /api/projects/:idOrSlug
// @access  Public
export const getProjectByIdOrSlugPublic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { idOrSlug } = req.params;

  try {
    let project: IProject | null = null;

    // Check if idOrSlug is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      project = await Project.findOne({ _id: idOrSlug, status: "published" });
    }

    // If not found by ID, or if idOrSlug is not an ObjectId, try finding by slug
    if (!project) {
      project = await Project.findOne({ slug: idOrSlug, status: "published" });
    }

    if (!project) {
      res.status(404).json({ message: "Project not found or not published" });
      return;
    }

    res.status(200).json(project);
    return;
  } catch (error) {
    console.error("Error fetching single project:", error);
    next(error);
  }
};

// @desc    Update a project by ID (Admin)
// @route   PUT /api/admin/projects/:id
// @access  Private (Admin)
export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const {
    title,
    shortSummary,
    description,
    technologies,
    role,
    challenges,
    liveDemoUrl,
    sourceCodeUrl,
    images,
    status,
    order,
    featured,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid project ID format" });
      return;
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Update fields
    if (title !== undefined) project.title = title;
    if (shortSummary !== undefined) project.shortSummary = shortSummary;
    if (description !== undefined) project.description = description;
    if (technologies !== undefined) project.technologies = technologies;
    if (role !== undefined) project.role = role;
    if (challenges !== undefined) project.challenges = challenges;
    if (liveDemoUrl !== undefined) project.liveDemoUrl = liveDemoUrl;
    if (sourceCodeUrl !== undefined) project.sourceCodeUrl = sourceCodeUrl;
    if (images !== undefined) project.images = images;
    if (status !== undefined) project.status = status;
    if (order !== undefined) project.order = order;
    if (featured !== undefined) project.featured = featured;

    // If title is changed, the pre-save hook will regenerate the slug
    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
    return;
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    // Handle potential duplicate key error for slug if manual slug update is allowed and not unique
    // Mongoose validation errors will also be caught here
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      res.status(409).json({
        message:
          "Failed to update project. A project with a similar title/slug might already exist.",
      });
      return;
    }
    next(error);
  }
};

// @desc    Delete a project by ID (Admin)
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin)
export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid project ID format" });
      return;
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    await project.deleteOne(); // Changed from project.remove() which is deprecated

    res.status(200).json({ message: "Project deleted successfully" });
    return;
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Profile from "../models/Profile"; // Corrected path
import ApiError from "../utils/ApiError"; // Corrected path
import { AuthenticatedRequest } from "./authMiddleware"; // Corrected path

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "../../public/resumes"); // Corrected path to target project's public folder
console.log(`[Multer Config] Uploads directory target: ${uploadsDir}`); // Log the target path
if (!fs.existsSync(uploadsDir)) {
  console.log(`[Multer Config] Creating directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
} else {
  console.log(`[Multer Config] Directory already exists: ${uploadsDir}`);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`[Multer Storage] Destination: Saving file to ${uploadsDir}`);
    console.log(`[Multer Storage] File details in destination:`, file);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const finalFilename = "admin-resume" + path.extname(file.originalname);
    console.log(`[Multer Storage] Filename: Saving file as ${finalFilename}`);
    console.log(`[Multer Storage] File details in filename:`, file);
    cb(null, finalFilename);
  },
});

// File filter for PDF only
const fileFilter = (
  req: Request, // Added type for req
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Removed erroneous comma
  if (file.mimetype === "application/pdf") {
    console.log("[Multer Filter] File type accepted:", file.originalname);
    cb(null, true);
  } else {
    console.log("[Multer Filter] File type rejected:", file.originalname);
    cb(new ApiError(400, "Invalid file type. Only PDF is allowed."));
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 20, // 5MB limit
  },
});

export default upload;

import { Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import config from "../config";
import ApiError from "../utils/ApiError";

// Initialize S3 client if AWS configuration is present
let s3: S3Client | undefined;
if (config.awsAccessKeyId && config.awsSecretAccessKey && config.awsRegion) {
  s3 = new S3Client({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
    region: config.awsRegion,
  });
} else {
  console.warn(
    "[Multer Config] AWS S3 client not initialized due to missing configuration. File uploads will attempt to use S3 but will likely fail if credentials are not implicitly available (e.g., via IAM role on Render)."
  );
}

// Multer storage engine configuration
let storage: multer.StorageEngine;

if (s3 && config.s3BucketName) {
  console.log(
    `[Multer Config] Configuring S3 storage for bucket: ${config.s3BucketName}`
  );
  storage = multerS3({
    s3: s3,
    bucket: config.s3BucketName,
    acl: "public-read", // Files will be publicly readable
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: any, key?: string) => void
    ) => {
      // Note: The filename "admin-resume" is hardcoded as per the original diskStorage.
      // If this needs to be dynamic (e.g., user-specific), this logic should change.
      const folder = "resumes"; // Store resumes in a 'resumes' folder within the bucket
      const originalNameWithoutExt = path.parse(file.originalname).name;
      // Using a fixed name "admin-resume" but appending a timestamp and random number to avoid overwrites
      // and to somewhat match the original fixed name intention.
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filenameInS3 = `${folder}/admin-resume-${uniqueSuffix}${path.extname(
        file.originalname
      )}`;
      console.log(`[Multer S3] Target S3 key (filename): ${filenameInS3}`);
      cb(null, filenameInS3);
    },
  });
} else {
  console.error(
    "[Multer Config] CRITICAL: S3 storage cannot be configured due to missing S3 client or bucket name. Falling back to memory storage. UPLOADED FILES WILL NOT BE PERSISTED."
  );
  // Fallback to memory storage if S3 is not configured. This is NOT suitable for production.
  storage = multer.memoryStorage();
}

// File filter for PDF only (remains the same as original)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
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
  storage: storage, // Uses S3 storage if configured, otherwise memoryStorage fallback
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20MB limit (same as original)
  },
});

export default upload;

import dotenv from "dotenv";

dotenv.config(); // Load .env file

const config = {
  port: process.env.PORT || 5001,
  mongoURI: process.env.MONGODB_URI || "", // Changed from MONGO_URI to MONGODB_URI
  jwtSecret: process.env.JWT_SECRET || "fallback_secret",

  // Email configuration
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  smtpSecure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  smtpUser: process.env.SMTP_USER, // SMTP login username
  smtpPassword: process.env.SMTP_PASSWORD, // SMTP login password
  emailFromName: process.env.EMAIL_FROM_NAME || "Portfolio Contact",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS, // Default sender address
  adminEmail: process.env.ADMIN_EMAIL, // Admin email to send notifications to

  // AWS S3 Configuration
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  s3BucketName: process.env.S3_BUCKET_NAME,
};

console.log("SMTP Config Loaded:", {
  // Add this console.log for debugging
  host: config.smtpHost,
  port: config.smtpPort,
  user: config.smtpUser,
  secure: config.smtpSecure,
  fromName: config.emailFromName,
  fromAddress: config.emailFromAddress,
  adminEmail: config.adminEmail,
});

if (!config.mongoURI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env file."); // Updated error message for clarity
  process.exit(1);
}
if (
  config.jwtSecret === "fallback_secret" &&
  process.env.NODE_ENV === "production"
) {
  console.warn(
    "WARNING: JWT_SECRET is using fallback. Set a strong secret in .env for production."
  );
}

// Check for AWS S3 configuration in production
if (process.env.NODE_ENV === "production") {
  if (
    !config.awsAccessKeyId ||
    !config.awsSecretAccessKey ||
    !config.awsRegion ||
    !config.s3BucketName
  ) {
    console.warn(
      "WARNING: Production environment detected but AWS S3 configuration is incomplete. File uploads to S3 may fail."
    );
    // Depending on criticality, you might want to process.exit(1) here
  }
}

export default config;

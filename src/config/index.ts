import dotenv from "dotenv";

dotenv.config(); // Load .env file

const config = {
  port: process.env.PORT || 5001,
  mongoURI: process.env.MONGO_URI || "",
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
};

if (!config.mongoURI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
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

export default config;

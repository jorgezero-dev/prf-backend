import mongoose from "mongoose";
import config from "./index"; // Import the centralized config

const connectDB = async () => {
  if (!config.mongoURI) {
    console.error("MONGODB_URI not defined in config file");
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoURI);
    console.log("MongoDB Connected...");
  } catch (err) {
    const error = err as Error;
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;

import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import config from "../config";
import bcrypt from "bcryptjs"; // Only needed if not using the model's comparePassword method directly or for other bcrypt operations

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
    // Send response and return to stop further execution
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    // Send response and return
    res.status(400).json({ message: "Invalid email format." });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Send response and return
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Send response and return
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role, // Uncomment if you add a role to your User model
      },
    };

    jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        // Pass error to Express error handler
        return next(err);
      }
      res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Add role to the response
        },
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    // Pass error to Express error handler
    next(error);
  }
};

// Optional: Add a registration/signup controller if needed for creating the first admin user
// For now, we assume an admin user is created directly in the database or via a script.

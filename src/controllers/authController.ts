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
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email format." });
    return;
  }

  try {
    console.log(`[AUTH_LOGIN] Attempting login for email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`[AUTH_LOGIN] User not found for email: ${email}`);
      res
        .status(401)
        .json({ message: "Invalid credentials. (User not found)" }); // More specific message for debugging
      return;
    }
    console.log(
      `[AUTH_LOGIN] User found: ${user.email}, ID: ${user.id}. Stored password hash: ${user.password}`
    );

    console.log(
      `[AUTH_LOGIN] Comparing provided password: "${password}" with stored hash for user ${user.email}`
    );
    const isMatch = await user.comparePassword(password);
    console.log(
      `[AUTH_LOGIN] Password comparison result for ${user.email}: ${isMatch}`
    );

    if (!isMatch) {
      console.log(`[AUTH_LOGIN] Password mismatch for user: ${user.email}`);
      res
        .status(401)
        .json({ message: "Invalid credentials. (Password mismatch)" }); // More specific message for debugging
      return;
    }

    console.log(
      `[AUTH_LOGIN] Password match for ${user.email}. Generating token.`
    );

    const payload = {
      user: {
        id: user.id,
        role: user.role, // Uncomment if you add a role to your User model
      },
    };

    jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        console.error("[AUTH_LOGIN] Error signing JWT:", err);
        return next(err);
      }
      console.log(
        `[AUTH_LOGIN] Token generated successfully for ${user.email}`
      );
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
    console.error("[AUTH_LOGIN] Error during login process:", error);
    next(error);
  }
};

// Optional: Add a registration/signup controller if needed for creating the first admin user
// For now, we assume an admin user is created directly in the database or via a script.

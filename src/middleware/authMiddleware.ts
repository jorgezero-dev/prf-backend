import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import User, { IUser } from "../models/User";

// Extend Express Request type for use in subsequent handlers
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: Request, // Changed from AuthenticatedRequest to Request
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Explicitly set return type to Promise<void>
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.jwtSecret) as {
        user: { id: string };
      };

      // Cast req to AuthenticatedRequest before assigning the user property
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = await User.findById(decoded.user.id).select(
        "-password"
      );

      if (!authenticatedReq.user) {
        res.status(401).json({ message: "Not authorized, user not found" });
        return; // Terminate execution for this path
      }

      next(); // User is authenticated, proceed to the next handler
      return; // Terminate execution for this path
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
      return; // Terminate execution for this path
    }
  } else {
    // No token provided in headers or not in Bearer format
    res.status(401).json({ message: "Not authorized, no token" });
    return; // Terminate execution for this path
  }
};

export const admin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

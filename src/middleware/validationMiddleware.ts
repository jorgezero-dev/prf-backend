import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import ApiError from "../utils/ApiError";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Pass ZodError to the global error handler
        return next(error);
      }
      // For other types of errors, you might want to handle them differently
      // or pass them to the global error handler as a generic error
      return next(new ApiError(500, "Internal server error during validation"));
    }
  };

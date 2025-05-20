import { Request, Response, NextFunction } from "express";

/**
 * Wraps an asynchronous route handler to catch any errors and pass them to the next error-handling middleware.
 * This avoids the need for repetitive try-catch blocks in every async controller function.
 * @param fn The asynchronous function to execute (typically a controller method).
 * @returns A function that Express can use as a route handler.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

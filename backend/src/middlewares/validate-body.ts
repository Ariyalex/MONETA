import type { RequestHandler } from "express";
import { success, z } from "zod";

export const validateBody = <T extends z.ZodType>(
  schema: T,
): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    // menghentikan request apabila validasi gagal
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
};

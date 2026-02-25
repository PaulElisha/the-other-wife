/** @format */

import z from "zod";
import type { NextFunction, Request, Response } from "express";

export const zodValidation =
  (schema: z.ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = schema.parse(req.body);
      Object.assign(req.body, value);
      next();
    } catch (error) {
      throw error;
    }
  };

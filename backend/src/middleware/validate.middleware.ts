import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { HttpError } from "../utils/httpError.js";

export function validate(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(new HttpError(400, "Validation failed", result.error.flatten()));
    }

    req.validated = result.data as {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };
    return next();
  };
}

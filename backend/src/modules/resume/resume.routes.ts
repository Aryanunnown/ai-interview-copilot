import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { uploadResume } from './resume.controller.js';
import { uploadResumeSchema } from './resume.schema.js';
import { mapMulterError, resumeUpload } from './resume.storage.js';

export const resumeRouter = Router();

function uploadSingleResume(req: Request, res: Response, next: NextFunction) {
  resumeUpload.single('file')(req, res, (error: unknown) => {
    if (error) {
      return next(mapMulterError(error));
    }

    return next();
  });
}

resumeRouter.post(
  '/upload',
  requireAuth,
  uploadSingleResume,
  validate(uploadResumeSchema),
  asyncHandler(uploadResume),
);

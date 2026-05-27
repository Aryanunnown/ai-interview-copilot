import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError.js';
import { uploadResume as uploadResumeService } from './resume.service.js';
import type { ResumeUploadBody } from './resume.types.js';

export async function uploadResume(req: Request, res: Response) {
  if (!req.user?.id) {
    throw new HttpError(401, 'Authentication required');
  }

  if (!req.file) {
    throw new HttpError(400, 'Resume file is required');
  }

  const result = await uploadResumeService({
    userId: req.user.id,
    file: req.file,
    body: req.validated?.body as ResumeUploadBody,
  });

  return res.status(201).json({
    success: true,
    data: result,
  });
}

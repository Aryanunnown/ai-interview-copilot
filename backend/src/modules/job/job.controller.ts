import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError.js';
import { analyzeJob as analyzeJobService } from './job.service.js';

type AnalyzeJobBody = {
  resumeId: string;
  jobDescription: string;
};

export async function analyzeJob(req: Request, res: Response) {
  if (!req.user?.id) {
    throw new HttpError(401, 'Authentication required');
  }

  const body = req.validated?.body as AnalyzeJobBody;
  const result = await analyzeJobService({
    userId: req.user.id,
    resumeId: body.resumeId,
    jobDescription: body.jobDescription,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
}

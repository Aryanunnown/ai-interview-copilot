import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { analyzeJob } from './job.controller.js';
import { analyzeJobSchema } from './job.schema.js';

export const jobRouter = Router();

jobRouter.post('/analyze', requireAuth, validate(analyzeJobSchema), asyncHandler(analyzeJob));

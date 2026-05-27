import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { resumeRouter } from '../modules/resume/resume.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/resume', resumeRouter);

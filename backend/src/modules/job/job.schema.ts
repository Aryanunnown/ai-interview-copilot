import { z } from 'zod';

export const analyzeJobSchema = z.object({
  body: z.object({
    resumeId: z.string().trim().min(1, 'resumeId is required'),
    jobDescription: z.string().trim().min(20, 'jobDescription must be at least 20 characters'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

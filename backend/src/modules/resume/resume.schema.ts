import { z } from 'zod';

export const uploadResumeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(160).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

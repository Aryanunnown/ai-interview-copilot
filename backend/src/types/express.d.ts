import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export {};

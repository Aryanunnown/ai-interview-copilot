import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const bearerPrefix = 'Bearer ';

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith(bearerPrefix)) {
      throw new HttpError(401, 'Missing authorization token');
    }

    const token = authorization.slice(bearerPrefix.length).trim();

    if (!token) {
      throw new HttpError(401, 'Missing authorization token');
    }

    let payload: string | jwt.JwtPayload;

    try {
      payload = jwt.verify(token, env.jwtSecret as string);
    } catch {
      throw new HttpError(401, 'Invalid or expired authorization token');
    }

    const userId =
      typeof payload === 'object' && payload !== null && typeof payload.sub === 'string'
        ? payload.sub
        : null;

    if (!userId) {
      throw new HttpError(401, 'Invalid authorization token');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new HttpError(401, 'User no longer exists');
    }

    req.user = user;
    return next();
  },
);

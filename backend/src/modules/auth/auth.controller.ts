import type { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service.js';

export async function register(req: Request, res: Response) {
  const result = await registerUser(req.validated?.body as any);

  return res.status(201).json({
    success: true,
    data: result,
  });
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(req.validated?.body as any);

  return res.status(200).json({
    success: true,
    data: result,
  });
}

export async function profile(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}

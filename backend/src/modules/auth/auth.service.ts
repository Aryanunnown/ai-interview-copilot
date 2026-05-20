import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/httpError.js';

const passwordSaltRounds = 12;

type RegisterData = {
  name?: string | null;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

function signToken(userId: string) {
  return jwt.sign(
    {},
    env.jwtSecret as string,
    {
      subject: userId,
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions,
  );
}

export async function registerUser({ name, email, password }: RegisterData) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new HttpError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, passwordSaltRounds);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: userSelect,
  });

  return {
    user,
    token: signToken(user.id),
  };
}

export async function loginUser({ email, password }: LoginData) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token: signToken(user.id),
  };
}

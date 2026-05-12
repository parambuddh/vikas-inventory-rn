import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing');
}

const JWT_SECRET: string = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN: jwt.SignOptions['expiresIn'] = '7d';

export interface JwtPayload {
  userId: number;
  role: Role;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

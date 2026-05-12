import { Role } from '@prisma/client';

export interface LoginRequest {
  identifier: string; // Email or Phone
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string;
    role: Role;
    photo_url: string | null;
  };
}

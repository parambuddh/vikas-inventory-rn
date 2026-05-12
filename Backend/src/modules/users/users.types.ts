import { Role } from '@prisma/client';

export interface CreateUserDto {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  password?: string;
  address?: string;
  role?: Role;
  is_active?: boolean;
}

export interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  address?: string;
  photo_url?: string;
}

export interface ResetPasswordDto {
  new_password: string;
}

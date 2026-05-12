import prisma from '../../config/prisma';
import { CreateUserDto, UpdateProfileDto } from './users.types';
import { hashPassword } from '../../utils/hash';
import { Role } from '@prisma/client';

export class UsersService {
  async createUser(data: CreateUserDto, adminId: number) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          ...(data.email ? [{ email: data.email }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this phone or email already exists');
    }

    const password_hash = await hashPassword(data.password!);

    return prisma.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email || null,
        password_hash,
        address: data.address,
        role: data.role || Role.SALESMAN,
        is_active: data.is_active ?? true,
        created_by: adminId,
      },
      select: this.userSelect()
    });
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: this.userSelect(),
      orderBy: { created_at: 'desc' }
    });
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: this.userSelect()
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(id: number, data: UpdateProfileDto) {
    return prisma.user.update({
      where: { id },
      data,
      select: this.userSelect()
    });
  }

  async toggleStatus(id: number, is_active: boolean) {
    return prisma.user.update({
      where: { id },
      data: { is_active },
      select: this.userSelect()
    });
  }

  async resetPassword(id: number, new_password_hash: string) {
    return prisma.user.update({
      where: { id },
      data: { password_hash: new_password_hash },
      select: { id: true, email: true, phone: true }
    });
  }

  private userSelect() {
    return {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      address: true,
      photo_url: true,
      role: true,
      is_active: true,
      created_by: true,
      created_at: true,
      updated_at: true,
    };
  }
}

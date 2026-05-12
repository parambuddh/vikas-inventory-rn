import prisma from '../../config/prisma';
import { LoginRequest, AuthResponse } from './auth.types';
import { comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

export class AuthService {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { identifier, password } = payload;

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
        ],
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
        photo_url: true,
        password_hash: true,
        is_active: true,
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('Account is disabled');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = generateToken({
      userId: user.id,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photo_url: user.photo_url,
      },
    };
  }
}

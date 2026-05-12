import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { createUserSchema, updateProfileSchema, resetPasswordSchema } from './users.validation';
import { processImage } from '../../utils/upload';
import { hashPassword } from '../../utils/hash';
import { Role } from '@prisma/client';

const usersService = new UsersService();

export class UsersController {
  async createUser(req: Request, res: Response) {
    try {
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const result = await usersService.createUser(validation.data, req.user!.userId);
      res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const users = await usersService.getAllUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const targetId = parseInt(req.params.id);
      
      if (req.user!.role !== Role.ADMIN && req.user!.userId !== targetId) {
        return res.status(403).json({ status: 'error', message: 'Forbidden: Can only view own profile' });
      }

      const user = await usersService.getUserById(targetId);
      res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      if (error.message === 'User not found') return res.status(404).json({ status: 'error', message: error.message });
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await usersService.getUserById(req.user!.userId);
      res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const validation = updateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      let photo_url = undefined;
      if (req.file) {
        photo_url = await processImage(req.file, `user-${req.user!.userId}`);
      }

      const updateData = { ...validation.data, ...(photo_url && { photo_url }) };
      const user = await usersService.updateProfile(req.user!.userId, updateData);
      
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { is_active } = req.body;
      if (typeof is_active !== 'boolean') {
        return res.status(400).json({ status: 'error', message: 'is_active must be a boolean' });
      }

      const user = await usersService.toggleStatus(parseInt(req.params.id), is_active);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const targetId = parseInt(req.body.userId);
      if (!targetId) return res.status(400).json({ status: 'error', message: 'userId is required' });

      const new_password_hash = await hashPassword(validation.data.new_password);
      await usersService.resetPassword(targetId, new_password_hash);
      
      res.status(200).json({ status: 'success', message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}

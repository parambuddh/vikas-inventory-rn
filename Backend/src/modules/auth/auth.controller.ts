import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { validateLoginPayload } from './auth.validation';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const validation = validateLoginPayload(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ status: 'error', message: validation.error });
      }

      const result = await authService.login(validation.data);

      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials' || error.message === 'Account is disabled') {
        return res.status(401).json({ status: 'error', message: error.message });
      }
      console.error('Login error:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}

import { Request, Response } from 'express';
import { config } from '../config/env';

/**
 * POST /api/auth/admin/login
 * Host / Admin Login
 */
export async function adminLoginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
      return;
    }

    const trimmedUsername = String(username).trim();
    const trimmedPassword = String(password).trim();

    if (
      trimmedUsername === config.adminUsername &&
      trimmedPassword === config.adminPassword
    ) {
      const token = `adm_${Buffer.from(`${config.adminUsername}:${Date.now()}:${config.adminSecret}`).toString('base64')}`;
      
      res.status(200).json({
        success: true,
        message: 'Admin authenticated successfully',
        token,
        admin: {
          username: config.adminUsername,
          role: 'HOST_ADMIN',
          loginTime: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid admin credentials. Access denied.',
    });
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: error.message,
    });
  }
}

/**
 * GET /api/auth/admin/verify
 * Verify active admin token
 */
export async function adminVerifyHandler(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer adm_')) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or missing admin token',
      });
      return;
    }

    res.status(200).json({
      success: true,
      valid: true,
      username: config.adminUsername,
      role: 'HOST_ADMIN',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
    });
  }
}
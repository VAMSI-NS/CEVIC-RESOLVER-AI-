import { Router } from 'express';
import { adminLoginHandler, adminVerifyHandler } from '../controllers/authController';

const router = Router();

// Host/Admin login
router.post('/admin/login', adminLoginHandler);

// Verify admin session
router.get('/admin/verify', adminVerifyHandler);

export default router;
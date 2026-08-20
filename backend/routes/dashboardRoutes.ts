import { Router } from 'express';
import { getDashboardStatsHandler } from '../controllers/dashboardController';

const router = Router();

// Get dashboard statistics
router.get('/stats', getDashboardStatsHandler);

export default router;
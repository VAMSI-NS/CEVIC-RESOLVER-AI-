import { Request, Response } from 'express';
import { getDashboardStats } from '../models/complaintModel';

/**
 * GET /api/dashboard/stats
 * Return aggregated complaint statistics for the dashboard
 */
export async function getDashboardStatsHandler(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await getDashboardStats();

    // Returns formatted statistics object supporting both direct fields and nested data
    res.status(200).json({
      success: true,
      total: stats.total,
      registered: stats.registered,
      under_review: stats.under_review,
      assigned: stats.assigned,
      in_progress: stats.in_progress,
      resolved: stats.resolved,
      rejected: stats.rejected,
      critical: stats.critical,
      high: stats.high,
      data: stats,
    });
  } catch (error: any) {
    console.error('[Controller] Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message,
    });
  }
}
import { Router } from 'express';
import {
  createComplaintHandler,
  getAllComplaintsHandler,
  getComplaintByTicketIdHandler,
  updateComplaintStatusHandler,
  deleteComplaintHandler,
} from '../controllers/complaintController';

const router = Router();

// POST /api/complaints - Register a new complaint
router.post('/', createComplaintHandler);

// GET /api/complaints - Get all complaints
router.get('/', getAllComplaintsHandler);

// GET /api/complaints/:ticket_id - Get single complaint by ticket ID
router.get('/:ticket_id', getComplaintByTicketIdHandler);

// PUT & PATCH /api/complaints/:ticket_id/status - Update status in PostgreSQL
router.put('/:ticket_id/status', updateComplaintStatusHandler);
router.patch('/:ticket_id/status', updateComplaintStatusHandler);

// DELETE /api/complaints/:ticket_id - Delete complaint
router.delete('/:ticket_id', deleteComplaintHandler);

export default router;
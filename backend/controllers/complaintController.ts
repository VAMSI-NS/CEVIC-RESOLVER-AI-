import { Request, Response } from 'express';
import {
  createComplaint,
  getAllComplaints,
  getComplaintByTicketId,
  updateComplaintStatus,
  deleteComplaintByTicketId,
  CreateComplaintInput,
} from '../models/complaintModel';

/**
 * POST /api/complaints
 * Register a new civic complaint into PostgreSQL
 */
export async function createComplaintHandler(req: Request, res: Response): Promise<void> {
  try {
    const {
      citizen_name,
      phone,
      email,
      complaint_title,
      complaint_description,
      category,
      priority,
      status,
      location,
      latitude,
      longitude,
      authority,
      image_url,
    } = req.body;

    // --- Validation ---
    if (!complaint_title || typeof complaint_title !== 'string' || !complaint_title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Complaint title is required',
      });
      return;
    }

    if (!complaint_description || typeof complaint_description !== 'string' || !complaint_description.trim()) {
      res.status(400).json({
        success: false,
        message: 'Complaint description is required',
      });
      return;
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      res.status(400).json({
        success: false,
        message: 'Complaint category is required',
      });
      return;
    }

    if (!location || typeof location !== 'string' || !location.trim()) {
      res.status(400).json({
        success: false,
        message: 'Location is required',
      });
      return;
    }

    // Optional email validation
    if (email && typeof email === 'string' && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.status(400).json({
          success: false,
          message: 'Invalid email address format',
        });
        return;
      }
    }

    // Optional phone validation
    if (phone && typeof phone === 'string' && phone.trim()) {
      const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        res.status(400).json({
          success: false,
          message: 'Phone number should be between 7 and 15 digits',
        });
        return;
      }
    }

    const payload: CreateComplaintInput = {
      citizen_name: citizen_name ? citizen_name.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      email: email ? email.trim() : undefined,
      complaint_title: complaint_title.trim(),
      complaint_description: complaint_description.trim(),
      category: category.trim(),
      priority: priority ? priority.toUpperCase() : 'MEDIUM',
      status: status || 'REGISTERED',
      location: location.trim(),
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      authority: authority ? authority.trim() : undefined,
      image_url: image_url || undefined,
    };

    const saved = await createComplaint(payload);

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully in PostgreSQL',
      ticket_id: saved.ticket_id,
      data: saved,
    });
  } catch (error: any) {
    console.error('[Controller] Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while registering complaint',
      error: error.message,
    });
  }
}

/**
 * GET /api/complaints
 * Retrieve all complaints from PostgreSQL (supports optional filter queries)
 */
export async function getAllComplaintsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { category, priority, status, search } = req.query;

    const complaints = await getAllComplaints({
      category: typeof category === 'string' ? category : undefined,
      priority: typeof priority === 'string' ? priority : undefined,
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined,
    });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error: any) {
    console.error('[Controller] Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaints from PostgreSQL',
      error: error.message,
    });
  }
}

/**
 * GET /api/complaints/:ticket_id or /api/complaints/:ticketId
 * Retrieve a single complaint by Ticket ID from PostgreSQL
 */
export async function getComplaintByTicketIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const ticketId = (req.params.ticket_id || req.params.ticketId || '').trim();

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required',
      });
      return;
    }

    const complaint = await getComplaintByTicketId(ticketId);

    if (!complaint) {
      res.status(404).json({
        success: false,
        message: `Complaint not found with ticket ID: ${ticketId}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error: any) {
    console.error('[Controller] Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint details from PostgreSQL',
      error: error.message,
    });
  }
}

/**
 * PUT / PATCH /api/complaints/:ticket_id/status
 * Update complaint status in PostgreSQL
 */
export async function updateComplaintStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const ticketId = (req.params.ticket_id || req.params.ticketId || '').trim();
    const { status } = req.body;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required',
      });
      return;
    }

    if (!status || typeof status !== 'string' || !status.trim()) {
      res.status(400).json({
        success: false,
        message: 'New status is required',
      });
      return;
    }

    const validStatuses = [
      'REGISTERED',
      'UNDER_REVIEW',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
      'Submitted',
      'Routed',
      'In Progress',
      'Inspection',
      'Resolved',
      'Closed',
      'Escalated',
    ];

    const normalizedStatus = status.trim();
    const isValid = validStatuses.some((s) => s.toUpperCase() === normalizedStatus.toUpperCase());

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: REGISTERED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED`,
      });
      return;
    }

    const updated = await updateComplaintStatus(ticketId, normalizedStatus);

    if (!updated) {
      res.status(404).json({
        success: false,
        message: `Complaint with ticket ID '${ticketId}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully in PostgreSQL',
      data: updated,
    });
  } catch (error: any) {
    console.error('[Controller] Error updating complaint status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status in PostgreSQL',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/complaints/:ticket_id
 * Admin utility to delete complaint
 */
export async function deleteComplaintHandler(req: Request, res: Response): Promise<void> {
  try {
    const ticketId = (req.params.ticket_id || req.params.ticketId || '').trim();

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required',
      });
      return;
    }

    const deleted = await deleteComplaintByTicketId(ticketId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: `Complaint with ticket ID '${ticketId}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Complaint ${ticketId} deleted successfully from PostgreSQL`,
    });
  } catch (error: any) {
    console.error('[Controller] Error deleting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
      error: error.message,
    });
  }
}
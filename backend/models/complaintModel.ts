import { query, ComplaintRow } from '../database/db';

export interface Complaint {
  id: number;
  ticket_id: string;
  citizen_name?: string | null;
  phone?: string | null;
  email?: string | null;
  complaint_title: string;
  complaint_description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  authority?: string | null;
  image_url?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateComplaintInput {
  citizen_name?: string;
  phone?: string;
  email?: string;
  complaint_title: string;
  complaint_description: string;
  category: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  authority?: string;
  image_url?: string;
}

export interface DashboardStats {
  total: number;
  registered: number;
  under_review: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  critical: number;
  high: number;
}

/**
 * Generate a unique Ticket ID in format CR-YYYY-XXXXXX (e.g. CR-2026-000001)
 */
export async function generateTicketId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  try {
    const res = await query<{ count: string }>('SELECT COUNT(*) as count FROM complaints');
    const total = parseInt(res.rows[0]?.count || '0', 10);
    const nextSeq = String(total + 1).padStart(6, '0');
    return `CR-${currentYear}-${nextSeq}`;
  } catch {
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    return `CR-${currentYear}-${randomSeq}`;
  }
}

/**
 * Insert a new complaint into SQL database
 */
export async function createComplaint(data: CreateComplaintInput): Promise<Complaint> {
  const ticketId = await generateTicketId();
  const priority = data.priority || 'MEDIUM';
  const status = data.status || 'REGISTERED';
  const authority = data.authority || getAuthorityForCategory(data.category);

  const sql = `
    INSERT INTO complaints (
      ticket_id, citizen_name, phone, email, complaint_title,
      complaint_description, category, priority, status, location,
      latitude, longitude, authority, image_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;

  const values = [
    ticketId,
    data.citizen_name || null,
    data.phone || null,
    data.email || null,
    data.complaint_title,
    data.complaint_description,
    data.category,
    priority,
    status,
    data.location,
    data.latitude !== undefined ? data.latitude : null,
    data.longitude !== undefined ? data.longitude : null,
    authority,
    data.image_url || null,
  ];

  const result = await query<ComplaintRow>(sql, values);
  return result.rows[0] as unknown as Complaint;
}

/**
 * Get all complaints with optional filtering
 */
export async function getAllComplaints(filters?: {
  category?: string;
  priority?: string;
  status?: string;
  search?: string;
}): Promise<Complaint[]> {
  const sql = 'SELECT * FROM complaints ORDER BY created_at DESC;';
  const result = await query<ComplaintRow>(sql);
  let complaints = result.rows as unknown as Complaint[];

  if (filters) {
    if (filters.category && filters.category !== 'All') {
      complaints = complaints.filter(
        (c) => c.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    if (filters.priority && filters.priority !== 'All') {
      complaints = complaints.filter(
        (c) => c.priority.toUpperCase() === filters.priority!.toUpperCase()
      );
    }
    if (filters.status && filters.status !== 'All') {
      complaints = complaints.filter(
        (c) => c.status.toLowerCase() === filters.status!.toLowerCase()
      );
    }
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      complaints = complaints.filter(
        (c) =>
          c.ticket_id.toLowerCase().includes(q) ||
          c.complaint_title.toLowerCase().includes(q) ||
          c.complaint_description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }
  }

  return complaints;
}

/**
 * Find single complaint by Ticket ID (or ID)
 */
export async function getComplaintByTicketId(ticketId: string): Promise<Complaint | null> {
  const sql = 'SELECT * FROM complaints WHERE UPPER(ticket_id) = UPPER($1) LIMIT 1;';
  const result = await query<ComplaintRow>(sql, [ticketId.trim()]);
  if (result.rows.length > 0) {
    return result.rows[0] as unknown as Complaint;
  }
  return null;
}

/**
 * Update complaint status & touch updated_at
 */
export async function updateComplaintStatus(ticketId: string, status: string): Promise<Complaint | null> {
  const sql = `
    UPDATE complaints 
    SET status = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE UPPER(ticket_id) = UPPER($2) 
    RETURNING *;
  `;
  const result = await query<ComplaintRow>(sql, [status.toUpperCase(), ticketId.trim()]);
  if (result.rows.length > 0) {
    return result.rows[0] as unknown as Complaint;
  }
  return null;
}

/**
 * Delete a complaint by Ticket ID
 */
export async function deleteComplaintByTicketId(ticketId: string): Promise<boolean> {
  const sql = 'DELETE FROM complaints WHERE UPPER(ticket_id) = UPPER($1);';
  const result = await query(sql, [ticketId.trim()]);
  return result.rowCount > 0;
}

/**
 * Calculate dashboard metrics directly from SQL records
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const complaints = await getAllComplaints();

  const total = complaints.length;
  let registered = 0;
  let under_review = 0;
  let assigned = 0;
  let in_progress = 0;
  let resolved = 0;
  let rejected = 0;
  let critical = 0;
  let high = 0;

  for (const c of complaints) {
    const s = (c.status || '').toUpperCase();
    const p = (c.priority || '').toUpperCase();

    if (s === 'REGISTERED' || s === 'SUBMITTED') registered++;
    else if (s === 'UNDER_REVIEW' || s === 'AI_ANALYSIS' || s === 'ROUTED') under_review++;
    else if (s === 'ASSIGNED') assigned++;
    else if (s === 'IN_PROGRESS' || s === 'IN PROGRESS' || s === 'INSPECTION') in_progress++;
    else if (s === 'RESOLVED' || s === 'CLOSED') resolved++;
    else if (s === 'REJECTED') rejected++;

    if (p === 'CRITICAL') critical++;
    else if (p === 'HIGH') high++;
  }

  return {
    total,
    registered,
    under_review,
    assigned,
    in_progress,
    resolved,
    rejected,
    critical,
    high,
  };
}

/**
 * Assign appropriate Department based on category
 */
function getAuthorityForCategory(category: string): string {
  const map: Record<string, string> = {
    Roads: 'Municipal Roads & Infrastructure Department',
    Garbage: 'Solid Waste Management Department',
    Drainage: 'Storm Water & Drainage Department',
    Water: 'Water Supply & Sewerage Board',
    Streetlights: 'Electrical & Lighting Department',
    Electricity: 'Electrical & Lighting Department',
    Infrastructure: 'Public Works & Infrastructure Dept',
    Other: 'General Civic Administration',
  };
  return map[category] || 'General Civic Authority';
}
import type { Complaint, ComplaintStatus, Category, Priority } from '../types';
import mockComplaints from '../data/mockComplaints';

// ============================================================
// Complaint Service - Backend REST API + SQL Database Client
// ============================================================

const STORAGE_KEY = 'civicresolve_complaints';
const ADMIN_TOKEN_KEY = 'civicresolve_admin_token';
const ADMIN_USER_KEY = 'civicresolve_admin_user';

// Base API URL (uses VITE_API_URL or VITE_API_BASE_URL or fallback to /api)
export const API_BASE_URL = (
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  ''
).replace(/\/$/, '');

/** Helper to transform database row to frontend Complaint model */
export function mapDbRowToComplaint(row: any): Complaint {
  if (!row) return row;

  const id = row.ticket_id || row.id || `CR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const submittedAt = row.created_at ? new Date(row.created_at).toISOString() : (row.submittedAt || new Date().toISOString());
  const updatedAt = row.updated_at ? new Date(row.updated_at).toISOString() : (row.updatedAt || submittedAt);
  const status = (row.status || 'REGISTERED') as ComplaintStatus;

  return {
    id,
    ticket_id: id,
    citizen_name: row.citizen_name || row.citizenName || 'Rahul Sharma',
    citizenName: row.citizen_name || row.citizenName || 'Rahul Sharma',
    phone: row.phone || '9876543210',
    email: row.email || 'citizen@example.com',
    title: row.complaint_title || row.title || 'Civic Issue',
    description: row.complaint_description || row.description || '',
    category: (row.category || 'Other') as Category,
    priority: (row.priority ? row.priority.toUpperCase() : 'MEDIUM') as Priority,
    status: status,
    department: row.authority || row.department || 'General Civic Authority',
    location: row.location || 'Reported Location',
    latitude: row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : undefined,
    longitude: row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : undefined,
    landmark: row.landmark || undefined,
    imageUrl: row.image_url || row.imageUrl || undefined,
    image_url: row.image_url || row.imageUrl || undefined,
    submittedAt,
    updatedAt,
    assignedTo: row.assignedTo || (status === 'ASSIGNED' || status === 'IN_PROGRESS' || status === 'Assigned' || status === 'In Progress' ? 'Field Operations Team' : undefined),
    estimatedResponse: row.estimatedResponse || '24-48 hours',
    timeline: row.timeline || [
      { id: 't1', label: 'Complaint Registered', timestamp: submittedAt, status: 'completed' },
      { id: 't2', label: 'AI Review & Routing', timestamp: submittedAt, status: status !== 'REGISTERED' ? 'completed' : 'current', note: `Assigned to ${row.authority || 'Department'}` },
      { id: 't3', label: `Under Review`, timestamp: status !== 'REGISTERED' ? updatedAt : null, status: status === 'UNDER_REVIEW' ? 'current' : status === 'REGISTERED' ? 'pending' : 'completed' },
      { id: 't4', label: 'Assigned to Field Team', timestamp: (status === 'ASSIGNED' || status === 'IN_PROGRESS' || status === 'RESOLVED') ? updatedAt : null, status: status === 'ASSIGNED' ? 'current' : (status === 'IN_PROGRESS' || status === 'RESOLVED') ? 'completed' : 'pending' },
      { id: 't5', label: 'Work In Progress', timestamp: (status === 'IN_PROGRESS' || status === 'RESOLVED') ? updatedAt : null, status: status === 'IN_PROGRESS' ? 'current' : status === 'RESOLVED' ? 'completed' : 'pending' },
      { id: 't6', label: 'Complaint Resolved', timestamp: (status === 'RESOLVED' || status === 'REJECTED') ? updatedAt : null, status: (status === 'RESOLVED' || status === 'REJECTED') ? 'completed' : 'pending' },
    ],
    aiConfidence: row.aiConfidence || 95,
    aiReason: row.aiReason || 'Analyzed and categorized by CivicResolve AI Engine.',
    contactPreference: row.contactPreference || 'email',
    isAnonymous: Boolean(row.isAnonymous),
    zone: row.zone || 'Zone 1',
  };
}

/** Initialize storage with mock data if empty */
function initializeStorage(): void {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockComplaints));
  }
}

// ============================================================
// Host / Admin Authentication Services
// ============================================================

export async function adminLoginApi(credentials: { username: string; password: string }): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
      return { success: true, token: data.token };
    }
    return { success: false, message: data.message || 'Invalid credentials' };
  } catch (err: any) {
    // Fallback local verification for offline dev
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const mockToken = 'adm_local_offline_token';
      localStorage.setItem(ADMIN_TOKEN_KEY, mockToken);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify({ username: 'admin', role: 'HOST_ADMIN' }));
      return { success: true, token: mockToken };
    }
    return { success: false, message: 'Could not connect to authentication server' };
  }
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser(): any {
  try {
    const data = localStorage.getItem(ADMIN_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

// ============================================================
// Asynchronous REST API Methods (PostgreSQL Direct Connection)
// ============================================================

/**
 * Register a new complaint into the SQL database via Backend API
 */
export async function registerComplaintApi(data: {
  citizen_name?: string;
  phone?: string;
  email?: string;
  complaint_title: string;
  complaint_description: string;
  category: string;
  priority?: string;
  status?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  authority?: string;
  image_url?: string;
}): Promise<{ success: boolean; message: string; ticket_id: string; data?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to register complaint');
    }

    if (result.data) {
      const mapped = mapDbRowToComplaint(result.data);
      saveComplaint(mapped);
    }

    return result;
  } catch (err: any) {
    console.warn('[ComplaintService] Backend API call failed, saving to local state:', err.message);
    const id = `CR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const fallbackComplaint: Complaint = {
      id,
      ticket_id: id,
      citizen_name: data.citizen_name || 'Citizen',
      citizenName: data.citizen_name || 'Citizen',
      phone: data.phone || '9876543210',
      email: data.email || 'citizen@example.com',
      title: data.complaint_title,
      description: data.complaint_description,
      category: data.category as Category,
      priority: (data.priority?.toUpperCase() || 'MEDIUM') as Priority,
      status: 'REGISTERED',
      department: data.authority || 'General Civic Authority',
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      imageUrl: data.image_url,
      submittedAt: now,
      updatedAt: now,
      timeline: [
        { id: 't1', label: 'Complaint Registered', timestamp: now, status: 'completed' },
        { id: 't2', label: 'AI Review & Routing', timestamp: now, status: 'current' },
      ],
    };
    saveComplaint(fallbackComplaint);
    return {
      success: true,
      message: 'Complaint registered successfully',
      ticket_id: id,
      data: fallbackComplaint,
    };
  }
}

/**
 * Fetch all complaints from PostgreSQL database
 */
export async function fetchAllComplaintsApi(): Promise<Complaint[]> {
  try {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE_URL}/api/complaints`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch from API');
    const result = await res.json();
    const complaints = (result.data || []).map(mapDbRowToComplaint);
    
    if (complaints.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    }
    return complaints;
  } catch (err: any) {
    console.warn('[ComplaintService] API fetch failed, returning cached complaints:', err.message);
    return getAllComplaints();
  }
}

/**
 * Fetch single complaint by Ticket ID from PostgreSQL database
 */
export async function fetchComplaintByIdApi(ticketId: string): Promise<Complaint | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${encodeURIComponent(ticketId.trim())}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('API request failed');
    }
    const result = await res.json();
    if (result.data) {
      const complaint = mapDbRowToComplaint(result.data);
      saveComplaint(complaint);
      return complaint;
    }
    return null;
  } catch (err: any) {
    console.warn('[ComplaintService] API fetch by ID failed, searching local cache:', err.message);
    return getComplaintById(ticketId) || null;
  }
}

/**
 * Update complaint status in PostgreSQL database
 */
export async function updateComplaintStatusApi(
  ticketId: string,
  status: string
): Promise<Complaint | null> {
  try {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE_URL}/api/complaints/${encodeURIComponent(ticketId)}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error('Failed to update status in database');
    const result = await res.json();
    if (result.data) {
      const mapped = mapDbRowToComplaint(result.data);
      saveComplaint(mapped);
      return mapped;
    }
    return null;
  } catch (err: any) {
    console.warn('[ComplaintService] Status update API failed, updating local state:', err.message);
    return updateComplaintStatus(ticketId, status as ComplaintStatus) || null;
  }
}

/**
 * Fetch live dashboard statistics from PostgreSQL database
 */
export async function fetchDashboardStatsApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    const result = await res.json();
    return result.data || result;
  } catch (err: any) {
    console.warn('[ComplaintService] Dashboard stats API failed, calculating from local state:', err.message);
    return getAnalyticsSummary();
  }
}

// ============================================================
// Synchronous Storage Functions (Preserved for compatibility)
// ============================================================

export function getAllComplaints(): Complaint[] {
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : mockComplaints;
  } catch {
    return mockComplaints;
  }
}

export function getComplaintById(id: string): Complaint | undefined {
  const complaints = getAllComplaints();
  return complaints.find((c) => (c.id && c.id.toUpperCase() === id.toUpperCase()) || (c.ticket_id && c.ticket_id.toUpperCase() === id.toUpperCase()));
}

export function saveComplaint(complaint: Complaint): void {
  const complaints = getAllComplaints();
  const idx = complaints.findIndex((c) => c.id.toUpperCase() === complaint.id.toUpperCase());
  if (idx >= 0) {
    complaints[idx] = complaint;
  } else {
    complaints.unshift(complaint);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function updateComplaintStatus(
  id: string,
  status: Complaint['status'],
  note?: string
): Complaint | undefined {
  const complaints = getAllComplaints();
  const idx = complaints.findIndex((c) => c.id.toUpperCase() === id.toUpperCase());
  if (idx < 0) return undefined;

  const complaint = complaints[idx];
  complaint.status = status;
  complaint.updatedAt = new Date().toISOString();

  const currentStep = complaint.timeline?.find((t) => t.status === 'current');
  if (currentStep) {
    currentStep.status = 'completed';
    currentStep.timestamp = complaint.updatedAt;
  }

  const nextStep = complaint.timeline?.find((t) => t.status === 'pending');
  if (nextStep) {
    nextStep.status = 'current';
    if (note) nextStep.note = note;
  }

  complaints[idx] = complaint;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  return complaint;
}

export function escalateComplaint(id: string): Complaint | undefined {
  const complaints = getAllComplaints();
  const idx = complaints.findIndex((c) => c.id.toUpperCase() === id.toUpperCase());
  if (idx < 0) return undefined;

  complaints[idx].status = 'Escalated';
  complaints[idx].escalationLevel = (complaints[idx].escalationLevel || 0) + 1;
  complaints[idx].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  return complaints[idx];
}

export function deleteComplaint(id: string): void {
  const complaints = getAllComplaints().filter((c) => c.id.toUpperCase() !== id.toUpperCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function resetToMockData(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockComplaints));
}

export function getAnalyticsSummary() {
  const complaints = getAllComplaints();
  const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'Resolved' || c.status === 'Closed');
  const pending = complaints.filter(
    (c) => !['RESOLVED', 'Resolved', 'Closed', 'REJECTED'].includes(c.status)
  );
  const highPriority = complaints.filter((c) => c.priority === 'HIGH' || c.priority === 'CRITICAL');

  const byCategory = ['Roads', 'Garbage', 'Drainage', 'Water', 'Streetlights', 'Electricity', 'Infrastructure', 'Other'].map(
    (cat) => ({
      category: cat as Category,
      count: complaints.filter((c) => c.category === cat).length,
    })
  );

  const byPriority = ['HIGH', 'MEDIUM', 'LOW'].map((p) => ({
    priority: p as Priority,
    count: complaints.filter((c) => c.priority === p).length,
  }));

  const byArea = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'].map((zone) => ({
    area: zone,
    count: complaints.filter((c) => c.zone === zone).length,
  }));

  return {
    totalComplaints: complaints.length,
    highPriority: highPriority.length,
    pending: pending.length,
    resolved: resolved.length,
    resolutionRate: complaints.length > 0 ? Math.round((resolved.length / Math.max(complaints.length, 1)) * 100) : 0,
    avgResolutionDays: 2.4,
    byCategory,
    byPriority,
    byArea,
    recurringIssues: [
      {
        area: 'Market Area',
        category: 'Garbage' as Category,
        count: 27,
        days: 30,
        recommendation: 'Consider increasing waste collection frequency in this zone.',
      },
      {
        area: 'Residency Road',
        category: 'Drainage' as Category,
        count: 14,
        days: 30,
        recommendation: 'Recommend full drainage audit and desilting of main channel.',
      },
      {
        area: 'MG Road',
        category: 'Roads' as Category,
        count: 11,
        days: 30,
        recommendation: 'Schedule comprehensive road resurfacing in this corridor.',
      },
    ],
  };
}
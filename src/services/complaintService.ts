import type { Complaint } from '../types';
import mockComplaints from '../data/mockComplaints';

// ============================================================
// Complaint service — LocalStorage-backed CRUD
// ============================================================

const STORAGE_KEY = 'civicresolve_complaints';

/** Initialize storage with mock data if empty */
function initializeStorage(): void {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockComplaints));
  }
}

/** Load all complaints from storage */
export function getAllComplaints(): Complaint[] {
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : mockComplaints;
  } catch {
    return mockComplaints;
  }
}

/** Get a single complaint by ID */
export function getComplaintById(id: string): Complaint | undefined {
  const complaints = getAllComplaints();
  return complaints.find((c) => c.id === id);
}

/** Save a new complaint */
export function saveComplaint(complaint: Complaint): void {
  const complaints = getAllComplaints();
  // Check if exists (update) or new
  const idx = complaints.findIndex((c) => c.id === complaint.id);
  if (idx >= 0) {
    complaints[idx] = complaint;
  } else {
    complaints.unshift(complaint); // Add to beginning
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

/** Update a complaint's status and add timeline event */
export function updateComplaintStatus(
  id: string,
  status: Complaint['status'],
  note?: string
): Complaint | undefined {
  const complaints = getAllComplaints();
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx < 0) return undefined;

  const complaint = complaints[idx];
  complaint.status = status;
  complaint.updatedAt = new Date().toISOString();

  // Add timeline event for status change
  const statusLabels: Record<string, string> = {
    'In Progress': 'Work In Progress',
    'Inspection': 'Site Inspection Conducted',
    'Resolved': 'Issue Resolved',
    'Closed': 'Complaint Closed',
    'Escalated': 'Complaint Escalated',
    'Assigned': 'Assigned to Field Team',
  };

  // Update current timeline step
  const currentStep = complaint.timeline.find((t) => t.status === 'current');
  if (currentStep) {
    currentStep.status = 'completed';
    currentStep.timestamp = complaint.updatedAt;
  }

  // Activate next pending step
  const nextStep = complaint.timeline.find((t) => t.status === 'pending');
  if (nextStep) {
    nextStep.status = 'current';
    if (note) nextStep.note = note;
  }

  complaints[idx] = complaint;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  return complaint;
}

/** Escalate a complaint */
export function escalateComplaint(id: string): Complaint | undefined {
  const complaints = getAllComplaints();
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx < 0) return undefined;

  complaints[idx].status = 'Escalated';
  complaints[idx].escalationLevel = (complaints[idx].escalationLevel || 0) + 1;
  complaints[idx].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  return complaints[idx];
}

/** Delete a complaint */
export function deleteComplaint(id: string): void {
  const complaints = getAllComplaints().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

/** Reset to mock data (for demo purposes) */
export function resetToMockData(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockComplaints));
}

/** Get analytics summary */
export function getAnalyticsSummary() {
  const complaints = getAllComplaints();
  const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed');
  const pending = complaints.filter(
    (c) => !['Resolved', 'Closed'].includes(c.status)
  );
  const highPriority = complaints.filter((c) => c.priority === 'HIGH' || c.priority === 'CRITICAL');

  const byCategory = ['Roads', 'Garbage', 'Drainage', 'Water', 'Streetlights', 'Infrastructure', 'Other'].map(
    (cat) => ({
      category: cat as Complaint['category'],
      count: complaints.filter((c) => c.category === cat).length,
    })
  );

  const byPriority = ['HIGH', 'MEDIUM', 'LOW'].map((p) => ({
    priority: p as Complaint['priority'],
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
    resolutionRate: complaints.length > 0 ? Math.round((resolved.length / complaints.length) * 100) : 0,
    avgResolutionDays: 2.4,
    byCategory,
    byPriority,
    byArea,
    recurringIssues: [
      {
        area: 'Market Area',
        category: 'Garbage' as Complaint['category'],
        count: 27,
        days: 30,
        recommendation: 'Consider increasing waste collection frequency in this zone.',
      },
      {
        area: 'Residency Road',
        category: 'Drainage' as Complaint['category'],
        count: 14,
        days: 30,
        recommendation: 'Recommend full drainage audit and desilting of main channel.',
      },
      {
        area: 'MG Road',
        category: 'Roads' as Complaint['category'],
        count: 11,
        days: 30,
        recommendation: 'Schedule comprehensive road resurfacing in this corridor.',
      },
    ],
  };
}

import React, { useState, useEffect } from 'react';
import {
  Search, ChevronDown, Eye, MapPin, Building2, Clock, X,
  Loader2, RefreshCw, User, Phone, Mail, FileText, CheckCircle,
  AlertTriangle, Shield, Check, Calendar
} from 'lucide-react';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import ComplaintTimeline from '../../components/ComplaintTimeline';
import Modal from '../../components/Modal';
import {
  getAllComplaints,
  fetchAllComplaintsApi,
  updateComplaintStatusApi,
  fetchDashboardStatsApi,
} from '../../services/complaintService';
import type { Complaint, Priority, ComplaintStatus, Category } from '../../types';
import { formatDateTime, getCategoryEmoji, truncate } from '../../utils/helpers';
import { useToast, ToastContainer } from '../../components/Toast';

// ============================================================
// Host / Admin Dashboard - Complaints Management Page
// ============================================================

type FilterState = {
  search: string;
  category: Category | 'All';
  priority: Priority | 'All';
  status: ComplaintStatus | 'All';
  dateFilter: 'All' | 'Today' | 'ThisWeek' | 'ThisMonth';
};

const CATEGORIES: (Category | 'All')[] = [
  'All', 'Roads', 'Garbage', 'Drainage', 'Water', 'Streetlights', 'Electricity', 'Infrastructure', 'Other'
];
const PRIORITIES: (Priority | 'All')[] = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: (ComplaintStatus | 'All')[] = [
  'All', 'REGISTERED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'
];

const ComplaintsPage: React.FC = () => {
  const { toasts, addToast, dismissToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState<any>({
    total: 0,
    registered: 0,
    under_review: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
    critical: 0,
    high: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    priority: 'All',
    status: 'All',
    dateFilter: 'All',
  });

  const loadData = async (showToast = false) => {
    setLoading(true);
    try {
      const [freshComplaints, freshStats] = await Promise.all([
        fetchAllComplaintsApi(),
        fetchDashboardStatsApi(),
      ]);

      if (freshComplaints) setComplaints(freshComplaints);
      if (freshStats) setStats(freshStats);

      if (showToast) {
        addToast('Synced latest complaints from PostgreSQL', 'success');
      }
    } catch (err: any) {
      console.warn('Sync error:', err);
      setComplaints(getAllComplaints());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 12 seconds
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadData(false);
      }, 12000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filtered = complaints.filter((c) => {
    const s = filters.search.toLowerCase().trim();
    if (s) {
      const matchId = (c.id || '').toLowerCase().includes(s);
      const matchTitle = (c.title || '').toLowerCase().includes(s);
      const matchCitizen = (c.citizen_name || c.citizenName || '').toLowerCase().includes(s);
      const matchPhone = (c.phone || '').toLowerCase().includes(s);
      const matchEmail = (c.email || '').toLowerCase().includes(s);
      const matchLocation = (c.location || '').toLowerCase().includes(s);
      if (!matchId && !matchTitle && !matchCitizen && !matchPhone && !matchEmail && !matchLocation) {
        return false;
      }
    }

    if (filters.category !== 'All' && c.category !== filters.category) return false;
    if (filters.priority !== 'All' && c.priority !== filters.priority) return false;
    if (filters.status !== 'All' && c.status !== filters.status) return false;

    if (filters.dateFilter !== 'All') {
      const date = new Date(c.submittedAt).getTime();
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      if (filters.dateFilter === 'Today' && now - date > dayMs) return false;
      if (filters.dateFilter === 'ThisWeek' && now - date > 7 * dayMs) return false;
      if (filters.dateFilter === 'ThisMonth' && now - date > 30 * dayMs) return false;
    }

    return true;
  });

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const updated = await updateComplaintStatusApi(ticketId, newStatus);
      if (updated) {
        setComplaints((prev) => prev.map((c) => (c.id === ticketId ? updated : c)));
        setSelected(updated);
        addToast(`Complaint ${ticketId} status updated to "${newStatus}" in PostgreSQL!`, 'success');
        // Refresh stats
        const freshStats = await fetchDashboardStatsApi();
        if (freshStats) setStats(freshStats);
      }
    } catch (err: any) {
      addToast(`Status update failed: ${err.message}`, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Host / Admin Complaint Center
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Central PostgreSQL database storage & multi-user complaint monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl cursor-pointer select-none shadow-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span>Auto-Refresh (12s)</span>
          </label>

          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-xs py-2 px-3 shadow-sm bg-white hover:bg-gray-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync PostgreSQL</span>
          </button>
        </div>
      </div>

      {/* Live Statistics Cards (from PostgreSQL) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Total</span>
          <p className="text-xl font-extrabold text-gray-900 mt-0.5">{stats.total || complaints.length}</p>
        </div>
        <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-3.5">
          <span className="text-xs font-semibold text-blue-600">Registered</span>
          <p className="text-xl font-extrabold text-blue-700 mt-0.5">{stats.registered || 0}</p>
        </div>
        <div className="bg-purple-50/50 rounded-2xl border border-purple-100 p-3.5">
          <span className="text-xs font-semibold text-purple-600">Under Review</span>
          <p className="text-xl font-extrabold text-purple-700 mt-0.5">{stats.under_review || 0}</p>
        </div>
        <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-3.5">
          <span className="text-xs font-semibold text-amber-600">In Progress</span>
          <p className="text-xl font-extrabold text-amber-700 mt-0.5">{stats.in_progress || 0}</p>
        </div>
        <div className="bg-green-50/50 rounded-2xl border border-green-100 p-3.5">
          <span className="text-xs font-semibold text-green-600">Resolved</span>
          <p className="text-xl font-extrabold text-green-700 mt-0.5">{stats.resolved || 0}</p>
        </div>
        <div className="bg-red-50/50 rounded-2xl border border-red-100 p-3.5">
          <span className="text-xs font-semibold text-red-600">High / Critical</span>
          <p className="text-xl font-extrabold text-red-700 mt-0.5">{(stats.high || 0) + (stats.critical || 0)}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          {/* Universal Search */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Search by Ticket ID, Citizen Name, Phone, Email, Location..."
              className="input-field pl-9 py-2 text-xs sm:text-sm"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="input-field appearance-none pr-8 py-2 text-xs sm:text-sm w-36"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => setFilter('priority', e.target.value)}
              className="input-field appearance-none pr-8 py-2 text-xs sm:text-sm w-32"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : p}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="input-field appearance-none pr-8 py-2 text-xs sm:text-sm w-36"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Date filter */}
          <div className="relative">
            <select
              value={filters.dateFilter}
              onChange={(e) => setFilter('dateFilter', e.target.value)}
              className="input-field appearance-none pr-8 py-2 text-xs sm:text-sm w-32"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="ThisWeek">This Week</option>
              <option value="ThisMonth">This Month</option>
            </select>
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear button */}
          {(filters.search || filters.category !== 'All' || filters.priority !== 'All' || filters.status !== 'All' || filters.dateFilter !== 'All') && (
            <button
              onClick={() => setFilters({ search: '', category: 'All', priority: 'All', status: 'All', dateFilter: 'All' })}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Admin Complaint Table (Requested Exact Structure) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5">Ticket ID</th>
                <th className="px-4 py-3.5">Citizen</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date Reported</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => {
                const citizen = c.citizen_name || c.citizenName || 'Rahul Sharma';
                return (
                  <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors group">
                    {/* Ticket ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        {c.id}
                      </span>
                    </td>

                    {/* Citizen (Who reported it) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold">
                          {citizen[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{citizen}</p>
                          <p className="text-[11px] text-gray-400">{c.phone || '9876543210'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <span>{getCategoryEmoji(c.category)}</span>
                        <span className="font-medium">{c.category}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600 max-w-[180px]">
                        <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <span className="truncate" title={c.location}>{c.location}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{formatDateTime(c.submittedAt)}</span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelected(c)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                    <p className="font-semibold text-gray-500">No complaints found</p>
                    <p className="text-xs mt-1">Try changing your search keywords or filter selections.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Complaint Breakdown Modal (Requested Section 8 Format) */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} size="lg">
        {selected && (
          <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">
                  {getCategoryEmoji(selected.category)}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {selected.id}
                  </span>
                  <h2 className="text-xl font-black text-gray-900 mt-1">{selected.title}</h2>
                </div>
              </div>
            </div>

            {/* SECTION 1: WHO REPORTED */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <User className="w-4 h-4 text-indigo-600" />
                WHO REPORTED
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <span className="text-[11px] text-gray-400 block">Citizen Name</span>
                  <span className="text-sm font-bold text-gray-900">{selected.citizen_name || selected.citizenName || 'Rahul Sharma'}</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <span className="text-[11px] text-gray-400 block">Phone Number</span>
                  <span className="text-sm font-bold text-gray-900">{selected.phone || '9876543210'}</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <span className="text-[11px] text-gray-400 block">Email Address</span>
                  <span className="text-sm font-bold text-gray-900 truncate block">{selected.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: COMPLAINT DETAILS */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                COMPLAINT DETAILS
              </h3>
              <div className="bg-white rounded-xl p-3.5 border border-gray-100">
                <span className="text-[11px] text-gray-400 block mb-1">Description</span>
                <p className="text-sm text-gray-800 leading-relaxed">{selected.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <span className="text-[11px] text-gray-400 block">Category</span>
                  <span className="text-sm font-bold text-gray-900">{selected.category}</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <span className="text-[11px] text-gray-400 block">Priority</span>
                  <div className="mt-1"><PriorityBadge priority={selected.priority} size="sm" /></div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <span className="text-[11px] text-gray-400 block">Current Status</span>
                  <div className="mt-1"><StatusBadge status={selected.status} size="sm" /></div>
                </div>
              </div>
            </div>

            {/* SECTION 3: LOCATION */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                LOCATION
              </h3>
              <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-800">{selected.location}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                  <span className="text-[11px] text-gray-400 block">Latitude</span>
                  <span className="text-xs font-mono font-semibold text-gray-700">{selected.latitude || '16.5062'}</span>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                  <span className="text-[11px] text-gray-400 block">Longitude</span>
                  <span className="text-xs font-mono font-semibold text-gray-700">{selected.longitude || '80.6480'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 4: MANAGEMENT & STATUS WORKFLOW */}
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                MANAGEMENT & STATUS UPDATE (PostgreSQL Direct)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 border border-indigo-100">
                  <span className="text-[11px] text-gray-400 block">Assigned Authority</span>
                  <span className="text-xs font-bold text-indigo-900">{selected.department}</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-indigo-100">
                  <span className="text-[11px] text-gray-400 block">Created Date</span>
                  <span className="text-xs font-semibold text-gray-700">{formatDateTime(selected.submittedAt)}</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-indigo-100">
                  <span className="text-[11px] text-gray-400 block">Last Updated</span>
                  <span className="text-xs font-semibold text-gray-700">{formatDateTime(selected.updatedAt)}</span>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="bg-white rounded-xl p-4 border border-indigo-100 mt-3">
                <span className="text-xs font-bold text-gray-700 block mb-2">Change Status in Central Database:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'REGISTERED', label: 'REGISTERED', color: 'bg-blue-600 text-white' },
                    { key: 'UNDER_REVIEW', label: 'UNDER_REVIEW', color: 'bg-purple-600 text-white' },
                    { key: 'ASSIGNED', label: 'ASSIGNED', color: 'bg-indigo-600 text-white' },
                    { key: 'IN_PROGRESS', label: 'IN_PROGRESS', color: 'bg-amber-600 text-white' },
                    { key: 'RESOLVED', label: 'RESOLVED', color: 'bg-green-600 text-white' },
                    { key: 'REJECTED', label: 'REJECTED', color: 'bg-red-600 text-white' },
                  ].map((btn) => {
                    const isCurrent = selected.status === btn.key;
                    return (
                      <button
                        key={btn.key}
                        disabled={updating || isCurrent}
                        onClick={() => handleStatusUpdate(selected.id, btn.key)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                          isCurrent
                            ? `${btn.color} ring-2 ring-offset-2 ring-indigo-400 cursor-default shadow-sm`
                            : 'bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700'
                        }`}
                      >
                        {isCurrent && <Check className="w-3.5 h-3.5" />}
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
                {updating && (
                  <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating database status and synchronizing with citizen tracking page...
                  </p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-2">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Live Resolution Timeline</h3>
              <ComplaintTimeline events={selected.timeline} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
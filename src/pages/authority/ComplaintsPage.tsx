import React, { useState, useEffect } from 'react';
import {
  Search, Filter, ChevronDown, Eye, CheckCircle,
  MapPin, Building2, Clock, X, Edit2, Loader2
} from 'lucide-react';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import ComplaintTimeline from '../../components/ComplaintTimeline';
import Modal from '../../components/Modal';
import { getAllComplaints, updateComplaintStatus } from '../../services/complaintService';
import type { Complaint, Priority, ComplaintStatus, Category } from '../../types';
import { formatDateTime, getCategoryEmoji, truncate } from '../../utils/helpers';
import { useToast, ToastContainer } from '../../components/Toast';

// ============================================================
// Authority Dashboard — Complaints Management Page
// ============================================================

type FilterState = {
  search: string;
  category: Category | 'All';
  priority: Priority | 'All';
  status: ComplaintStatus | 'All';
  department: string;
};

const CATEGORIES: (Category | 'All')[] = ['All', 'Roads', 'Garbage', 'Drainage', 'Water', 'Streetlights', 'Infrastructure'];
const PRIORITIES: (Priority | 'All')[] = ['All', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: (ComplaintStatus | 'All')[] = ['All', 'Submitted', 'Routed', 'Assigned', 'In Progress', 'Inspection', 'Resolved', 'Escalated'];

const ComplaintsPage: React.FC = () => {
  const { toasts, addToast, dismissToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [updating, setUpdating] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    priority: 'All',
    status: 'All',
    department: '',
  });

  useEffect(() => {
    setComplaints(getAllComplaints());
  }, []);

  const filtered = complaints.filter((c) => {
    const s = filters.search.toLowerCase();
    if (s && !c.id.toLowerCase().includes(s) && !c.title.toLowerCase().includes(s) && !c.location.toLowerCase().includes(s)) return false;
    if (filters.category !== 'All' && c.category !== filters.category) return false;
    if (filters.priority !== 'All' && c.priority !== filters.priority) return false;
    if (filters.status !== 'All' && c.status !== filters.status) return false;
    return true;
  });

  const handleStatusUpdate = async (id: string, newStatus: ComplaintStatus) => {
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 800));
    updateComplaintStatus(id, newStatus);
    const updated = getAllComplaints();
    setComplaints(updated);
    const updatedComplaint = updated.find((c) => c.id === id);
    if (updatedComplaint) setSelected(updatedComplaint);
    setUpdating(false);
    addToast(`Status updated to "${newStatus}"`, 'success');
  };

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Complaint Management</h1>
        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} of {complaints.length} complaints shown</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Search by ID, issue, or location..."
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="input-field appearance-none pr-8 py-2 text-sm w-36"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'Category' : c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => setFilter('priority', e.target.value)}
              className="input-field appearance-none pr-8 py-2 text-sm w-32"
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p === 'All' ? 'Priority' : p}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="input-field appearance-none pr-8 py-2 text-sm w-36"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'Status' : s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear filters */}
          {(filters.search || filters.category !== 'All' || filters.priority !== 'All' || filters.status !== 'All') && (
            <button
              onClick={() => setFilters({ search: '', category: 'All', priority: 'All', status: 'All', department: '' })}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Issue</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Location</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Priority</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden xl:table-cell">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-indigo-600 font-semibold">{c.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base flex-shrink-0">{getCategoryEmoji(c.category)}</span>
                      <span className="text-sm font-medium text-gray-800">{truncate(c.title, 40)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{c.category}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{truncate(c.location, 25)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={c.priority} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-gray-400">{formatDateTime(c.submittedAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(c)}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No complaints match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} size="lg">
        {selected && (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4 pt-2">
              <span className="text-4xl">{getCategoryEmoji(selected.category)}</span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-mono mb-1">{selected.id}</p>
                <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <PriorityBadge priority={selected.priority} />
                  <StatusBadge status={selected.status} />
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-semibold text-gray-800">{selected.department}</p>
                {selected.assignedTo && (
                  <p className="text-xs text-indigo-500">→ {selected.assignedTo}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-semibold text-gray-800">{selected.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="text-sm font-semibold text-gray-800">{formatDateTime(selected.submittedAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">AI Confidence</p>
                <p className="text-sm font-semibold text-gray-800">{selected.aiConfidence || '—'}%</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700">{selected.description}</p>
            </div>

            {/* AI reason */}
            {selected.aiReason && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs text-indigo-600 font-semibold mb-1">🤖 AI Routing Reason</p>
                <p className="text-sm text-indigo-800">"{selected.aiReason}"</p>
              </div>
            )}

            {/* Update status */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {(['Assigned', 'In Progress', 'Inspection', 'Resolved'] as ComplaintStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(selected.id, s)}
                    disabled={updating || selected.status === s}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                      selected.status === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Edit2 className="w-3 h-3" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-4">Resolution Timeline</p>
              <ComplaintTimeline events={selected.timeline} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintsPage;

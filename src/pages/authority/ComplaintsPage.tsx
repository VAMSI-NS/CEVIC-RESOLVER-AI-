import React, { useState, useEffect } from 'react';
import {
  Search, Filter, RefreshCw, Eye, CheckCircle2, Clock,
  MapPin, AlertCircle, X, Check, ArrowRight, ShieldCheck,
  User, Phone, Mail, Calendar, Building2, Tag, Zap, Loader2
} from 'lucide-react';
import {
  fetchAllComplaintsApi,
  updateComplaintStatusApi,
} from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { ToastContainer, useToast } from '../../components/Toast';
import type { Complaint, ComplaintStatus } from '../../types';

const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { toasts, addToast, dismissToast } = useToast();

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await fetchAllComplaintsApi();
      if (Array.isArray(data)) {
        setComplaints(data);
      }
    } catch {
      addToast('Failed to load complaints from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(loadComplaints, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (complaintId: string | number, newStatus: ComplaintStatus) => {
    setUpdatingId(String(complaintId));
    try {
      const success = await updateComplaintStatusApi(String(complaintId), newStatus);
      if (success) {
        setComplaints((prev) =>
          prev.map((c) => (String(c.id) === String(complaintId) || c.ticket_id === String(complaintId) ? { ...c, status: newStatus } : c))
        );
        if (selectedComplaint && (String(selectedComplaint.id) === String(complaintId) || selectedComplaint.ticket_id === String(complaintId))) {
          setSelectedComplaint((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        addToast(`Ticket status updated to ${newStatus} in PostgreSQL!`, 'success');
      } else {
        addToast('Failed to update status in database', 'error');
      }
    } catch {
      addToast('Database update error', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(term) ||
      (c.ticket_id && c.ticket_id.toLowerCase().includes(term)) ||
      (c.citizenName && c.citizenName.toLowerCase().includes(term)) ||
      c.location.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' ||
      c.status.toUpperCase().replace(/[\s-]/g, '_') === statusFilter.toUpperCase();

    const matchesCategory =
      categoryFilter === 'ALL' ||
      c.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-display">
            Complaints Management
          </h2>
          <p className="text-xs text-slate-500">
            Real-time grievance stream synced directly with Neon PostgreSQL database
          </p>
        </div>

        <button
          onClick={loadComplaints}
          disabled={loading}
          className="btn-secondary text-xs py-2 px-3.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket ID, citizen name, issue or location..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none w-full md:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="REGISTERED">Registered</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none w-full md:w-auto"
          >
            <option value="ALL">All Categories</option>
            <option value="Roads">Roads & Potholes</option>
            <option value="Streetlights">Street Lights</option>
            <option value="Garbage">Waste Management</option>
            <option value="Water">Water Supply</option>
            <option value="Drainage">Drainage & Sewage</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Ticket ID</th>
                <th className="py-3.5 px-4 font-bold">Citizen</th>
                <th className="py-3.5 px-4 font-bold">Issue Title</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Priority</th>
                <th className="py-3.5 px-4 font-bold">Location</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Loading database records...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No matching complaints found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {c.ticket_id || c.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                      {c.citizenName || 'Citizen'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs font-semibold text-slate-900 truncate">
                      {c.title}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {c.category}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-[180px] text-slate-500 truncate">
                      {c.location}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4-Section Complaint View/Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Complaint Details</span>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  {selectedComplaint.ticket_id || selectedComplaint.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Section 1: WHO REPORTED */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <p className="font-mono font-bold text-slate-900 uppercase text-[11px]">1. Citizen Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Name</span>
                    <span className="font-bold text-slate-900">{selectedComplaint.citizenName || 'Citizen'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <span className="font-mono">{selectedComplaint.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-mono truncate block">{selectedComplaint.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: COMPLAINT DETAILS */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <p className="font-mono font-bold text-slate-900 uppercase text-[11px]">2. Complaint Summary</p>
                <p className="font-bold text-sm text-slate-900">{selectedComplaint.title}</p>
                <p className="leading-relaxed text-slate-600">{selectedComplaint.description}</p>
                
                <div className="flex items-center gap-3 pt-2">
                  <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-semibold">
                    🏷️ {selectedComplaint.category}
                  </span>
                  <PriorityBadge priority={selectedComplaint.priority} size="sm" />
                </div>
              </div>

              {/* Section 3: LOCATION */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <p className="font-mono font-bold text-slate-900 uppercase text-[11px]">3. Location & Authority</p>
                <p className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{selectedComplaint.location}</span>
                </p>
                {selectedComplaint.department && (
                  <p className="text-blue-700 font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Assigned: {selectedComplaint.department}</span>
                  </p>
                )}
              </div>

              {/* Section 4: STATUS UPDATER */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono font-bold text-blue-900 uppercase text-[11px]">4. Change Status in Neon PostgreSQL</p>
                  <StatusBadge status={selectedComplaint.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => handleStatusChange(selectedComplaint.id, 'UNDER_REVIEW')}
                    disabled={updatingId !== null}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                  >
                    Set Under Review
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedComplaint.id, 'ASSIGNED')}
                    disabled={updatingId !== null}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition-colors"
                  >
                    Set Assigned
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedComplaint.id, 'IN_PROGRESS')}
                    disabled={updatingId !== null}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                  >
                    Set In Progress
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedComplaint.id, 'RESOLVED')}
                    disabled={updatingId !== null}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                  >
                    Set Resolved ✓
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintsPage;
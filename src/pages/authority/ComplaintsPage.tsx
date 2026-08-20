import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Eye, RefreshCw, CheckCircle2, Clock,
  MapPin, User, Phone, Mail, Building2, Tag, Zap, AlertCircle,
  X, ArrowRight, Shield, Sparkles, Check, ChevronDown, Compass
} from 'lucide-react';
import { fetchAllComplaintsApi, updateComplaintStatusApi } from '../../services/complaintService';
import type { Complaint, Category, Priority, ComplaintStatus } from '../../types';

const allStatuses: ComplaintStatus[] = [
  'REGISTERED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
];

const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadComplaints = async () => {
    try {
      const data = await fetchAllComplaintsApi();
      setComplaints(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // Auto-refresh interval (12 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadComplaints();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    const targetId = selectedComplaint.ticket_id || selectedComplaint.id;

    try {
      const updated = await updateComplaintStatusApi(targetId, newStatus);
      if (updated) {
        setSelectedComplaint(updated);
        setComplaints((prev) =>
          prev.map((c) => ((c.ticket_id || c.id) === targetId ? updated : c))
        );
        setActionSuccess(`Status updated to ${newStatus} in PostgreSQL!`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch {
      alert('Failed to update status in database. Please retry.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      c.title.toLowerCase().includes(term) ||
      (c.ticket_id || c.id).toLowerCase().includes(term) ||
      (c.citizen_name || c.citizenName || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term);

    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      c.status.toUpperCase().replace(/[\s-]/g, '_') === statusFilter.toUpperCase().replace(/[\s-]/g, '_');

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || 'REGISTERED').toUpperCase().replace(/[\s-]/g, '_');
    if (s.includes('RESOLV')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (s.includes('PROGRESS')) return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    if (s.includes('ASSIGN')) return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    if (s.includes('REVIEW')) return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    if (s.includes('REJECT')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            PostgreSQL Central Database Table
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight mt-0.5">
            Complaints Management Table
          </h1>
          <p className="text-xs text-slate-400">
            Inspect, search, and update resolution lifecycle of all registered citizen grievances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3 py-2 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-[#07111F] text-cyan-500"
            />
            <span>Auto-Refresh (12s)</span>
          </label>

          <button
            onClick={loadComplaints}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-cyan transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync PostgreSQL</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 space-y-4 border-white/[0.08]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Universal Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Ticket, Citizen, Phone, Location..."
              className="glass-input pl-10 text-xs py-2.5"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="glass-input text-xs py-2.5"
            >
              <option value="ALL" className="bg-[#07111F]">All Categories</option>
              <option value="Roads" className="bg-[#07111F]">Roads & Potholes</option>
              <option value="Streetlights" className="bg-[#07111F]">Streetlights & Power</option>
              <option value="Garbage" className="bg-[#07111F]">Garbage & Waste</option>
              <option value="Water" className="bg-[#07111F]">Water Supply</option>
              <option value="Drainage" className="bg-[#07111F]">Drainage & Sewage</option>
              <option value="Infrastructure" className="bg-[#07111F]">Infrastructure</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="glass-input text-xs py-2.5"
            >
              <option value="ALL" className="bg-[#07111F]">All Priorities</option>
              <option value="CRITICAL" className="bg-[#07111F]">CRITICAL</option>
              <option value="HIGH" className="bg-[#07111F]">HIGH</option>
              <option value="MEDIUM" className="bg-[#07111F]">MEDIUM</option>
              <option value="LOW" className="bg-[#07111F]">LOW</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input text-xs py-2.5"
            >
              <option value="ALL" className="bg-[#07111F]">All Statuses</option>
              <option value="REGISTERED" className="bg-[#07111F]">REGISTERED</option>
              <option value="UNDER_REVIEW" className="bg-[#07111F]">UNDER REVIEW</option>
              <option value="ASSIGNED" className="bg-[#07111F]">ASSIGNED</option>
              <option value="IN_PROGRESS" className="bg-[#07111F]">IN PROGRESS</option>
              <option value="RESOLVED" className="bg-[#07111F]">RESOLVED</option>
              <option value="REJECTED" className="bg-[#07111F]">REJECTED</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/[0.04]">
          <span>Showing <strong className="text-white">{filtered.length}</strong> of {complaints.length} complaints</span>
          {(searchTerm || categoryFilter !== 'ALL' || priorityFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
                setPriorityFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Complaints Table */}
      <div className="glass-panel overflow-hidden border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            
            {/* Table Header */}
            <thead className="bg-[#07111F] text-slate-400 font-mono uppercase tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Ticket ID</th>
                <th className="py-3.5 px-4 font-bold">Citizen</th>
                <th className="py-3.5 px-4 font-bold">Issue / Title</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Priority</th>
                <th className="py-3.5 px-4 font-bold">Location</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Date</th>
                <th className="py-3.5 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filtered.map((c) => {
                const ticketId = c.ticket_id || c.id;
                const citizenName = c.citizen_name || c.citizenName || 'Citizen';
                const dateFormatted = c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : 'Recent';

                return (
                  <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                    
                    {/* Ticket ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {ticketId}
                    </td>

                    {/* Citizen */}
                    <td className="py-3.5 px-4 font-medium text-white whitespace-nowrap">
                      <div>{citizenName}</div>
                      {c.phone && <div className="text-[10px] text-slate-500 font-mono">{c.phone}</div>}
                    </td>

                    {/* Issue Title */}
                    <td className="py-3.5 px-4 max-w-[200px] truncate font-medium">
                      {c.title}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/[0.04] border border-white/[0.08] text-slate-300">
                        {c.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 max-w-[160px] truncate text-slate-400">
                      {c.location}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {dateFormatted}
                    </td>

                    {/* Action: View Modal */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* ============================================================
          VIEW BREAKDOWN MODAL (4 Explicit Sections)
         ============================================================ */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#07111F] border border-white/[0.12] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 animate-in zoom-in-95 duration-200 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-glow-cyan">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Grievance Detail Blueprint
                  </span>
                  <h2 className="text-lg font-bold text-white font-display">
                    Ticket: {selectedComplaint.ticket_id || selectedComplaint.id}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.10] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Success Alert */}
            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Section 1: WHO REPORTED */}
            <div className="bg-[#0B1625]/70 border border-white/[0.06] rounded-2xl p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 1. Who Reported
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500">Citizen Name:</span>
                  <p className="font-bold text-white mt-0.5">{selectedComplaint.citizen_name || selectedComplaint.citizenName || 'Citizen'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Phone Number:</span>
                  <p className="font-mono text-slate-300 mt-0.5">{selectedComplaint.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Email Address:</span>
                  <p className="text-slate-300 truncate mt-0.5">{selectedComplaint.email || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Section 2: COMPLAINT DETAILS */}
            <div className="bg-[#0B1625]/70 border border-white/[0.06] rounded-2xl p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> 2. Complaint Details
              </span>
              <div className="space-y-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500">Title:</span>
                  <p className="font-bold text-white mt-0.5">{selectedComplaint.title}</p>
                </div>
                <div>
                  <span className="text-slate-500">Description:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed bg-[#07111F] p-3 rounded-xl border border-white/[0.04]">
                    {selectedComplaint.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500">Category:</span>
                    <p className="font-bold text-white mt-0.5">{selectedComplaint.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Priority:</span>
                    <p className="font-mono font-bold text-amber-400 mt-0.5">{selectedComplaint.priority}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: LOCATION */}
            <div className="bg-[#0B1625]/70 border border-white/[0.06] rounded-2xl p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 3. Location & GPS
              </span>
              <div className="text-xs pt-1 space-y-1.5">
                <p className="text-white font-medium">{selectedComplaint.location}</p>
                {(selectedComplaint.latitude || selectedComplaint.longitude) && (
                  <p className="font-mono text-cyan-300 text-[11px] flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>Coordinates: {selectedComplaint.latitude}, {selectedComplaint.longitude}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Section 4: MANAGEMENT & STATUS UPDATE */}
            <div className="bg-[#0B1625]/90 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> 4. Management & Status Updater
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStatusBadge(selectedComplaint.status)}`}>
                  Current: {selectedComplaint.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-400">
                  <span className="text-slate-500">Assigned Authority: </span>
                  <strong className="text-white">{selectedComplaint.department || 'Municipal Authority'}</strong>
                </p>

                <p className="text-slate-400 text-[11px]">
                  Click any status button below to update PostgreSQL in real time:
                </p>

                {/* Instant Status Changer Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {allStatuses.map((st) => {
                    const isCurrent = (selectedComplaint.status || '').toUpperCase() === st.toUpperCase();
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        disabled={updatingStatus || isCurrent}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isCurrent
                            ? 'bg-cyan-500 text-[#050B14] shadow-glow-cyan'
                            : 'bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] text-slate-300 hover:text-white'
                        }`}
                      >
                        {isCurrent && <Check className="w-3.5 h-3.5" />}
                        <span>{st.replace('_', ' ')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Modal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintsPage;
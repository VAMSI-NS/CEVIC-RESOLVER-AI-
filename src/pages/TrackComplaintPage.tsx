import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, AlertCircle, CheckCircle2, Clock, MapPin, Building2,
  Tag, Zap, ArrowRight, ShieldCheck, RefreshCw, Loader2, Sparkles,
  User, Phone, Mail, Calendar, Compass
} from 'lucide-react';
import { fetchComplaintByIdApi, getAllComplaints } from '../services/complaintService';
import type { Complaint, ComplaintStatus } from '../types';

const statusSteps: Array<{ key: string; label: string; desc: string }> = [
  { key: 'REGISTERED', label: 'REGISTERED', desc: 'Saved permanently in PostgreSQL' },
  { key: 'UNDER_REVIEW', label: 'UNDER REVIEW', desc: 'Assigned zone authority reviewing site' },
  { key: 'ASSIGNED', label: 'ASSIGNED', desc: 'Field inspection crew allocated' },
  { key: 'IN_PROGRESS', label: 'IN PROGRESS', desc: 'Active municipal maintenance underway' },
  { key: 'RESOLVED', label: 'RESOLVED', desc: 'Verified and completed successfully' },
];

const TrackComplaintPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ticketInput, setTicketInput] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialId = searchParams.get('id');

  useEffect(() => {
    if (initialId) {
      performSearch(initialId);
    }
  }, [initialId]);

  const performSearch = async (idToSearch: string) => {
    const trimmed = idToSearch.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    setError(null);

    try {
      const found = await fetchComplaintByIdApi(trimmed);
      if (found) {
        setComplaint(found);
      } else {
        setComplaint(null);
        setError(`No grievance record found with Ticket ID "${trimmed}" in PostgreSQL.`);
      }
    } catch {
      setError('Could not connect to database. Please retry.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    setSearchParams({ id: ticketInput.trim() });
    performSearch(ticketInput.trim());
  };

  /** Determine active step index */
  const getActiveStepIndex = (status: ComplaintStatus | string): number => {
    const norm = (status || 'REGISTERED').toUpperCase().replace(/[\s-]/g, '_');
    if (norm.includes('RESOLV') || norm.includes('CLOSE')) return 4;
    if (norm.includes('PROGRESS') || norm.includes('INSPECT')) return 3;
    if (norm.includes('ASSIGN')) return 2;
    if (norm.includes('REVIEW') || norm.includes('ROUT')) return 1;
    return 0;
  };

  const currentStep = complaint ? getActiveStepIndex(complaint.status) : 0;

  return (
    <div className="min-h-screen bg-[#050B14] text-[#F8FAFC] pt-32 pb-24 smart-city-grid relative">
      
      {/* Ambient Glows */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold font-mono">
            <Search className="w-3.5 h-3.5" />
            <span>REAL-TIME CITIZEN TRACKING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight">
            Track Your <span className="gradient-text-cyan-violet">Complaint</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Enter your unique Ticket ID to see real-time updates and authority progress.
          </p>
        </div>

        {/* Large Glowing Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center bg-[#07111F]/90 border border-white/[0.15] focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-400/30 rounded-3xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-xl transition-all">
              <div className="pl-4 pr-2 text-slate-500">
                <Search className="w-5 h-5 text-cyan-400" />
              </div>
              
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Enter your complaint ID (e.g. CR-2026-000001)..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono py-2"
              />

              <button
                type="submit"
                disabled={loading || !ticketInput.trim()}
                className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 disabled:opacity-40 shadow-glow-cyan transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Track Status</span>}
              </button>
            </div>
          </form>

          {/* Quick suggestions */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-3">
            <span>Recent examples:</span>
            <button
              onClick={() => {
                setTicketInput('CR-2026-000001');
                performSearch('CR-2026-000001');
              }}
              className="text-cyan-400/80 hover:text-cyan-300 font-mono underline cursor-pointer"
            >
              CR-2026-000001
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setTicketInput('CR-2026-004821');
                performSearch('CR-2026-004821');
              }}
              className="text-cyan-400/80 hover:text-cyan-300 font-mono underline cursor-pointer"
            >
              CR-2026-004821
            </button>
          </div>
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className="glass-panel p-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-mono text-cyan-300">Fetching live record from PostgreSQL database...</p>
          </div>
        )}

        {/* 2. Error / Not Found */}
        {!loading && searched && error && (
          <div className="glass-panel p-8 text-center space-y-3 border-rose-500/20 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Grievance Not Found</h3>
            <p className="text-xs text-rose-300">{error}</p>
            <div className="pt-2">
              <Link to="/report" className="btn-primary text-xs inline-flex">
                Report This Issue Now
              </Link>
            </div>
          </div>
        )}

        {/* 3. Live Complaint Result Card */}
        {!loading && complaint && (
          <div className="glass-panel p-6 sm:p-10 space-y-8 border-cyan-400/30 shadow-glow-cyan animate-in fade-in duration-300">
            
            {/* Top Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">TICKET ID:</span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-cyan-300">
                    {complaint.ticket_id || complaint.id}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                  {complaint.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider shadow-glow-cyan">
                  {complaint.status}
                </div>
                <button
                  onClick={() => performSearch(complaint.ticket_id || complaint.id)}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                  title="Refresh status from PostgreSQL"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5-Step Glowing Progress Timeline */}
            <div className="space-y-4">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Resolution Timeline Progress
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                {statusSteps.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;
                  const isPending = idx > currentStep;

                  return (
                    <div
                      key={idx}
                      className={`relative rounded-2xl p-4 border transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-glow-cyan'
                          : isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-white/[0.02] border-white/[0.06] text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-glow-cyan" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>

                      <p className={`text-xs font-bold font-display ${isCurrent ? 'text-cyan-300' : isDone ? 'text-white' : 'text-slate-500'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complaint Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
              
              <div className="bg-[#0B1625]/80 border border-white/[0.06] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" /> Category
                </span>
                <p className="text-sm font-bold text-white font-display">{complaint.category}</p>
              </div>

              <div className="bg-[#0B1625]/80 border border-white/[0.06] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Urgency
                </span>
                <p className="text-sm font-bold text-amber-400 font-display">{complaint.priority}</p>
              </div>

              <div className="bg-[#0B1625]/80 border border-white/[0.06] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-violet-400" /> Assigned Authority
                </span>
                <p className="text-sm font-bold text-cyan-300 truncate font-display">{complaint.department || 'Municipal Authority'}</p>
              </div>

            </div>

            {/* Description & Location */}
            <div className="space-y-3 bg-[#07111F]/60 border border-white/[0.06] rounded-2xl p-5 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Location: </span>
                  <span>{complaint.location}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/[0.06]">
                <span className="font-bold text-white">Description: </span>
                <span>{complaint.description}</span>
              </div>
              {complaint.citizenName && (
                <div className="pt-2 border-t border-white/[0.06] text-slate-400">
                  <span className="text-slate-300 font-medium">Reported by: </span>
                  <span>{complaint.citizenName}</span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TrackComplaintPage;
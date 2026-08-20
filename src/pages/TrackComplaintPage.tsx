import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, AlertCircle, CheckCircle2, Clock, MapPin, Building2,
  Tag, Zap, ArrowRight, ShieldCheck, RefreshCw, Loader2, Sparkles,
  User, Phone, Mail, Calendar, Compass
} from 'lucide-react';
import { fetchComplaintByIdApi } from '../services/complaintService';
import type { Complaint, ComplaintStatus } from '../types';

const statusSteps: Array<{ key: string; label: string; desc: string }> = [
  { key: 'REGISTERED', label: 'REGISTERED', desc: 'Saved permanently in database' },
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
        setError(`No grievance record found with Ticket ID "${trimmed}" in database.`);
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pt-32 pb-24 smart-city-light-grid relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold font-mono">
            <Search className="w-3.5 h-3.5" />
            <span>REAL-TIME CITIZEN TRACKING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-display tracking-tight">
            Track Your <span className="gradient-text-blue-cyan">Complaint</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
            Enter your unique Ticket ID to see real-time updates and authority progress.
          </p>
        </div>

        {/* Large Glowing Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center bg-white border border-slate-200/90 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-3xl p-2 sm:p-2.5 shadow-premium backdrop-blur-xl transition-all">
              <div className="pl-4 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Enter complaint ID (e.g. CR-2026-000001)..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none font-mono py-2"
              />

              <button
                type="submit"
                disabled={loading || !ticketInput.trim()}
                className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-40 shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
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
              className="text-blue-600 hover:text-blue-700 font-mono underline cursor-pointer"
            >
              CR-2026-000001
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setTicketInput('CR-2026-004821');
                performSearch('CR-2026-004821');
              }}
              className="text-blue-600 hover:text-blue-700 font-mono underline cursor-pointer"
            >
              CR-2026-004821
            </button>
          </div>
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className="glass-panel p-12 text-center space-y-4 bg-white">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-mono text-blue-600">Fetching live record from PostgreSQL database...</p>
          </div>
        )}

        {/* 2. Error / Not Found */}
        {!loading && searched && error && (
          <div className="glass-panel p-8 text-center space-y-3 bg-white border-rose-200 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Grievance Not Found</h3>
            <p className="text-xs text-rose-600">{error}</p>
            <div className="pt-2">
              <Link to="/report" className="btn-primary text-xs inline-flex">
                Report This Issue Now
              </Link>
            </div>
          </div>
        )}

        {/* 3. Live Complaint Result Card */}
        {!loading && complaint && (
          <div className="glass-panel p-6 sm:p-10 space-y-8 bg-white border-slate-200/90 shadow-premium animate-in fade-in duration-300">
            
            {/* Top Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">TICKET ID:</span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-blue-600">
                    {complaint.ticket_id || complaint.id}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                  {complaint.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                  {complaint.status}
                </div>
                <button
                  onClick={() => performSearch(complaint.ticket_id || complaint.id)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                  title="Refresh status from PostgreSQL"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5-Step Animated Status Timeline */}
            <div className="space-y-4">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Resolution Timeline Progress
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                {statusSteps.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={idx}
                      className={`relative rounded-2xl p-4 border transition-all ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-md ring-2 ring-blue-500/20'
                          : isDone
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-sm" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>

                      <p className={`text-xs font-bold font-display ${isCurrent ? 'text-blue-700' : isDone ? 'text-emerald-900' : 'text-slate-500'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight line-clamp-2">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complaint Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" /> Category
                </span>
                <p className="text-sm font-bold text-slate-900 font-display">{complaint.category}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" /> Urgency
                </span>
                <p className="text-sm font-bold text-amber-700 font-display">{complaint.priority}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-violet-600" /> Assigned Authority
                </span>
                <p className="text-sm font-bold text-blue-700 truncate font-display">{complaint.department || 'Municipal Authority'}</p>
              </div>

            </div>

            {/* Description & Location */}
            <div className="space-y-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Location: </span>
                  <span>{complaint.location}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="font-bold text-slate-900">Description: </span>
                <span>{complaint.description}</span>
              </div>
              {complaint.citizenName && (
                <div className="pt-2 border-t border-slate-200/60 text-slate-500">
                  <span className="text-slate-700 font-medium">Reported by: </span>
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
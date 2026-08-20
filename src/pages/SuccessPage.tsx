import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, Copy, Check, Search, ArrowRight, Share2,
  Calendar, MapPin, Building2, Tag, Zap, Shield, Sparkles,
  QrCode, ExternalLink, PlusCircle
} from 'lucide-react';
import type { AIAnalysis } from '../types';

const SuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    complaintId: string;
    ticket_id?: string;
    analysis?: AIAnalysis;
    description?: string;
    location?: string;
    submittedAt?: string;
    citizen_name?: string;
  } | null;

  const [copied, setCopied] = useState(false);
  const ticketId = id || state?.ticket_id || state?.complaintId || 'CR-2026-000001';

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-[#F8FAFC] pt-28 pb-20 smart-city-grid relative flex items-center justify-center">
      
      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 relative z-10">

        <div className="glass-panel p-8 sm:p-12 text-center space-y-8 border-emerald-500/20 shadow-2xl relative overflow-hidden">
          
          {/* Top subtle glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500" />

          {/* Success Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full ring-4 ring-[#07111F] flex items-center justify-center animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-slate-900" />
            </span>
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Complaint Registered in PostgreSQL
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Grievance Successfully Filed!
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
              Your civic report has been classified by AI, recorded permanently, and dispatched to the zone authority.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="bg-[#0B1625]/90 border border-cyan-400/30 rounded-2xl p-5 sm:p-6 shadow-glow-cyan space-y-3">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Your Unique Ticket Tracking ID
            </p>

            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-cyan-300 tracking-wider">
                {ticketId}
              </span>
              <button
                onClick={handleCopy}
                className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.10] hover:border-cyan-400/40 transition-all cursor-pointer"
                title="Copy Ticket ID"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {copied && (
              <p className="text-xs text-emerald-400 font-medium animate-in fade-in duration-200">
                ✓ Copied to clipboard!
              </p>
            )}
          </div>

          {/* Details Summary Card */}
          {state?.analysis && (
            <div className="bg-[#07111F]/70 border border-white/[0.08] rounded-2xl p-4 sm:p-5 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-white">{state.analysis.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-slate-400">Authority:</span>
                <span className="font-bold text-cyan-300">{state.analysis.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Response:</span>
                <span className="font-bold text-amber-400">{state.analysis.estimatedResponse}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={`/track?id=${encodeURIComponent(ticketId)}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-glow-cyan transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Track Live Status Now</span>
            </Link>

            <Link
              to="/report"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Another Issue</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SuccessPage;
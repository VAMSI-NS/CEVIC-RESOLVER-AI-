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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pt-28 pb-20 smart-city-light-grid relative flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 relative z-10">

        <div className="glass-panel p-8 sm:p-12 text-center space-y-8 bg-white border-slate-200 shadow-premium relative overflow-hidden">
          
          {/* Top subtle gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

          {/* Success Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full ring-4 ring-white flex items-center justify-center animate-pulse text-white">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600">
              Grievance Registered in PostgreSQL
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Grievance Successfully Filed!
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
              Your civic report has been classified by AI, recorded permanently, and dispatched to the zone authority.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Your Unique Ticket Tracking ID
            </p>

            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-blue-600 tracking-wider">
                {ticketId}
              </span>
              <button
                onClick={handleCopy}
                className="p-2.5 rounded-xl bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-sm"
                title="Copy Ticket ID"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {copied && (
              <p className="text-xs text-emerald-600 font-medium animate-in fade-in duration-200">
                ✓ Copied to clipboard!
              </p>
            )}
          </div>

          {/* Details Summary Card */}
          {state?.analysis && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-900">{state.analysis.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Authority:</span>
                <span className="font-bold text-blue-700">{state.analysis.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimated Response:</span>
                <span className="font-bold text-amber-600">{state.analysis.estimatedResponse}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={`/track?id=${encodeURIComponent(ticketId)}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Track Live Status Now</span>
            </Link>

            <Link
              to="/report"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
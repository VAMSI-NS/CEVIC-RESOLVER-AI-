import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Brain, Shield, Clock, MapPin, CheckCircle, ArrowRight,
  RotateCcw, Sparkles, AlertCircle, Building2, Tag, Loader2,
  Cpu, Activity, Zap, CheckCircle2, User
} from 'lucide-react';
import { analyzeComplaint } from '../services/aiService';
import { registerComplaintApi } from '../services/complaintService';
import type { AIAnalysis, Priority } from '../types';

const AIAnalysisPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    citizen_name?: string;
    phone?: string;
    email?: string;
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    landmark?: string;
    contactPreference?: string;
    isAnonymous?: boolean;
    imageUrl?: string | null;
  } | null;

  const [analyzing, setAnalyzing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Analysis steps simulation
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    'Parsing natural language issue text...',
    'Matching civic domain ontology & severity...',
    'Assigning responsible municipal zone team...',
    'Generating resolution ticket blueprint...',
  ];

  useEffect(() => {
    if (!state?.description) {
      navigate('/report');
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 700);

    analyzeComplaint(state.description, state.location, state.imageUrl || undefined)
      .then((res) => {
        setAnalysis(res);
        setAnalyzing(false);
        clearInterval(interval);
      })
      .catch(() => {
        setError('Failed to analyze complaint. Please retry.');
        setAnalyzing(false);
        clearInterval(interval);
      });

    return () => clearInterval(interval);
  }, []);

  const handleConfirm = async () => {
    if (!analysis || !state) return;
    setSubmitting(true);

    try {
      const response = await registerComplaintApi({
        citizen_name: state.isAnonymous ? undefined : state.citizen_name,
        phone: state.phone,
        email: state.email,
        complaint_title: analysis.title,
        complaint_description: state.description,
        category: analysis.category,
        priority: analysis.priority,
        status: 'REGISTERED',
        location: state.location,
        latitude: state.latitude,
        longitude: state.longitude,
        authority: analysis.department,
        image_url: state.imageUrl || undefined,
      });

      const ticketId = response.ticket_id || response.data?.ticket_id || response.data?.id;

      navigate(`/success/${ticketId}`, {
        state: {
          complaintId: ticketId,
          ticket_id: ticketId,
          analysis,
          description: state.description,
          location: state.location,
          submittedAt: new Date().toISOString(),
          citizen_name: state.citizen_name,
          phone: state.phone,
          email: state.email,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint to database.');
      setSubmitting(false);
    }
  };

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-[#F8FAFC] pt-28 pb-20 smart-city-grid relative">
      
      {/* Glows */}
      <div className="absolute top-24 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI NEURAL CLASSIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Complaint <span className="gradient-text-cyan-violet">AI Analysis</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Review the automated department assignment and priority calculation before saving to PostgreSQL.
          </p>
        </div>

        {/* 1. Loading AI State */}
        {analyzing && (
          <div className="glass-panel p-10 sm:p-14 text-center space-y-6 border-white/[0.10]">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-glow-cyan animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center animate-ping" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white font-display">Analyzing Your Report...</h2>
              <p className="text-sm font-mono text-cyan-300 min-h-[20px]">
                {steps[stepIndex]}
              </p>
            </div>

            <div className="max-w-xs mx-auto w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 2. Error State */}
        {!analyzing && error && (
          <div className="glass-panel p-8 text-center space-y-4 border-rose-500/30">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Analysis Encountered an Error</h2>
            <p className="text-sm text-rose-300">{error}</p>
            <button
              onClick={() => navigate('/report')}
              className="btn-secondary text-xs"
            >
              Back to Report Form
            </button>
          </div>
        )}

        {/* 3. Success Analysis Breakdown Card */}
        {!analyzing && analysis && (
          <div className="glass-panel p-6 sm:p-10 space-y-6 border-white/[0.10] animate-in fade-in zoom-in-95 duration-300">
            
            {/* Title & Confidence Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  AI-Generated Issue Title
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white font-display mt-0.5">
                  {analysis.title}
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{analysis.confidence}% AI Confidence</span>
              </div>
            </div>

            {/* Core Classification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category */}
              <div className="bg-[#0B1625]/80 border border-white/[0.08] rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Category Detected</span>
                </div>
                <p className="text-base font-bold text-white font-display">
                  {analysis.category}
                </p>
              </div>

              {/* Priority */}
              <div className="bg-[#0B1625]/80 border border-white/[0.08] rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Urgency Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${getPriorityBadgeClass(analysis.priority)}`}>
                    {analysis.priority}
                  </span>
                  <span className="text-xs text-slate-400">({analysis.estimatedResponse})</span>
                </div>
              </div>

              {/* Responsible Department */}
              <div className="bg-[#0B1625]/80 border border-white/[0.08] rounded-2xl p-4 space-y-1 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Routed Department & Authority</span>
                </div>
                <p className="text-base font-bold text-cyan-300 font-display">
                  {analysis.department}
                </p>
              </div>

            </div>

            {/* AI Reasoning Text */}
            <div className="bg-[#07111F]/80 border border-cyan-500/20 rounded-2xl p-4.5 space-y-1.5 text-xs leading-relaxed">
              <p className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                <span>AI Reasoning Breakdown</span>
              </p>
              <p className="text-slate-300">
                {analysis.reason}
              </p>
            </div>

            {/* Citizen Details Summary */}
            <div className="border-t border-white/[0.08] pt-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300 font-medium">Location:</span>
                <span className="text-white truncate">{state?.location}</span>
              </div>
              {state?.citizen_name && !state.isAnonymous && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 font-medium">Citizen:</span>
                  <span className="text-white">{state.citizen_name}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/report')}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Edit Information</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-glow-cyan transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to PostgreSQL...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Submit Complaint</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AIAnalysisPage;
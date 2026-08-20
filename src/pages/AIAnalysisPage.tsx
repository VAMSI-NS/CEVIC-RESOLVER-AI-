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
      case 'CRITICAL': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pt-28 pb-20 smart-city-light-grid relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI NEURAL CLASSIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Complaint <span className="gradient-text-blue-cyan">AI Analysis</span>
          </h1>
          <p className="text-slate-600 text-sm">
            Review the automated department assignment and priority calculation before saving to database.
          </p>
        </div>

        {/* 1. Loading AI State */}
        {analyzing && (
          <div className="glass-panel p-10 sm:p-14 text-center space-y-6 bg-white border-slate-200 shadow-premium">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 animate-pulse">
                <Brain className="w-10 h-10" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-ping" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-display">AI is Analyzing Your Report...</h2>
              <p className="text-sm font-mono text-blue-600 min-h-[20px]">
                {steps[stepIndex]}
              </p>
            </div>

            <div className="max-w-xs mx-auto w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 2. Error State */}
        {!analyzing && error && (
          <div className="glass-panel p-8 text-center space-y-4 bg-white border-rose-200">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Analysis Encountered an Error</h2>
            <p className="text-sm text-rose-600">{error}</p>
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
          <div className="glass-panel p-6 sm:p-10 space-y-6 bg-white border-slate-200 shadow-premium animate-in fade-in zoom-in-95 duration-300">
            
            {/* Title & Confidence Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  AI-Generated Issue Title
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-0.5">
                  {analysis.title}
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-semibold self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{analysis.confidence}% AI Confidence</span>
              </div>
            </div>

            {/* Core Classification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Category Detected</span>
                </div>
                <p className="text-base font-bold text-slate-900 font-display">
                  {analysis.category}
                </p>
              </div>

              {/* Priority */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Urgency Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${getPriorityBadgeClass(analysis.priority)}`}>
                    {analysis.priority}
                  </span>
                  <span className="text-xs text-slate-500">({analysis.estimatedResponse})</span>
                </div>
              </div>

              {/* Responsible Department */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-violet-600" />
                  <span>Routed Department & Authority</span>
                </div>
                <p className="text-base font-bold text-blue-700 font-display">
                  {analysis.department}
                </p>
              </div>

            </div>

            {/* AI Reasoning Text */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4.5 space-y-1.5 text-xs leading-relaxed">
              <p className="font-mono font-bold text-blue-900 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Reasoning Breakdown</span>
              </p>
              <p className="text-slate-700">
                {analysis.reason}
              </p>
            </div>

            {/* Citizen Details Summary */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="text-slate-900 font-semibold truncate">{state?.location}</span>
              </div>
              {state?.citizen_name && !state.isAnonymous && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Citizen:</span>
                  <span className="text-slate-900 font-semibold">{state.citizen_name}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/report')}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Edit Information</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
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
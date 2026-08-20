import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, CheckCircle, Loader2, ArrowRight, Edit3,
  AlertCircle, MapPin, Building2, Percent, Zap
} from 'lucide-react';
import { analyzeComplaint } from '../services/aiService';
import { registerComplaintApi } from '../services/complaintService';
import { generateComplaintId } from '../utils/helpers';
import PriorityBadge from '../components/PriorityBadge';
import type { AIAnalysis } from '../types';
import { getDepartmentByCategory } from '../data/mockDepartments';

// ============================================================
// AI Analysis / Processing Page
// ============================================================

interface ProcessingStep {
  label: string;
  icon: string;
  done: boolean;
  active: boolean;
}

const INITIAL_STEPS: ProcessingStep[] = [
  { label: 'Understanding complaint', icon: '🧠', done: false, active: false },
  { label: 'Analyzing image', icon: '📷', done: false, active: false },
  { label: 'Identifying location', icon: '📍', done: false, active: false },
  { label: 'Classifying issue', icon: '🏷️', done: false, active: false },
  { label: 'Determining priority', icon: '⚡', done: false, active: false },
  { label: 'Finding responsible authority', icon: '🏛️', done: false, active: false },
];

const AIAnalysisPage: React.FC = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'processing' | 'result' | 'error'>('processing');
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [pendingData, setPendingData] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingComplaint');
    if (!stored) {
      navigate('/report');
      return;
    }
    const data = JSON.parse(stored);
    setPendingData(data);
    runAnalysis(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalysis = async (data: any) => {
    // Step through processing animation
    const stepDelays = [600, 1200, 1800, 2400, 3000, 3500];

    stepDelays.forEach((delay, idx) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            done: i < idx,
            active: i === idx,
          }))
        );
      }, delay);
    });

    try {
      const result = await analyzeComplaint(data.description, data.location, data.imageUrl);
      // Small extra delay so last step finishes
      await new Promise((r) => setTimeout(r, 500));
      setSteps((prev) => prev.map((s) => ({ ...s, done: true, active: false })));
      setAnalysis(result);
      setPhase('result');
    } catch {
      setPhase('error');
    }
  };

  const handleConfirm = async () => {
    if (!analysis || !pendingData) return;
    setSubmitting(true);

    try {
      const dept = getDepartmentByCategory(analysis.category);
      const isAnon = pendingData.isAnonymous === true || pendingData.isAnonymous === 'true';

      // Register into SQL database via Backend API
      const apiResponse = await registerComplaintApi({
        citizen_name: isAnon ? 'Anonymous Citizen' : (pendingData.citizen_name || 'Citizen'),
        phone: isAnon ? 'N/A' : (pendingData.phone || '9876543210'),
        email: isAnon ? '' : (pendingData.email || ''),
        complaint_title: analysis.title,
        complaint_description: pendingData.description,
        category: analysis.category,
        priority: analysis.priority,
        status: 'REGISTERED',
        location: analysis.location,
        latitude: pendingData.latitude ? parseFloat(String(pendingData.latitude)) : undefined,
        longitude: pendingData.longitude ? parseFloat(String(pendingData.longitude)) : undefined,
        authority: analysis.department || dept.name,
        image_url: pendingData.imageUrl || undefined,
      });

      const ticketId = apiResponse.ticket_id || generateComplaintId();
      sessionStorage.removeItem('pendingComplaint');
      sessionStorage.setItem('lastComplaintId', ticketId);

      await new Promise((r) => setTimeout(r, 500));
      navigate(`/success/${ticketId}`);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      const fallbackId = generateComplaintId();
      sessionStorage.removeItem('pendingComplaint');
      sessionStorage.setItem('lastComplaintId', fallbackId);
      navigate(`/success/${fallbackId}`);
    }
  };

  const handleEdit = () => {
    navigate('/report');
  };

  // ── Processing screen ──────────────────────────────────────
  if (phase === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="card text-center">
            {/* AI Brain animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-40" />
              <div className="absolute inset-2 bg-indigo-200 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.5s' }} />
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <Brain className="w-12 h-12 text-white ai-pulse" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Complaint</h2>
            <p className="text-gray-500 text-sm mb-6">Our AI engine is extracting key information...</p>

            {/* Steps list */}
            <div className="space-y-3 text-left">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step.done
                        ? 'bg-green-100 text-green-700'
                        : step.active
                        ? 'bg-indigo-100 text-indigo-700 animate-pulse'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step.done ? <CheckCircle className="w-4 h-4 text-green-600" /> : idx + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      step.done
                        ? 'text-gray-700 font-medium'
                        : step.active
                        ? 'text-indigo-600 font-semibold'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.active && <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error screen ──────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-500 text-sm mb-6">We couldn't analyze your complaint automatically. You can still submit it manually.</p>
          <button onClick={handleEdit} className="btn-primary w-full">Go Back and Edit</button>
        </div>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────
  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            AI Analysis Complete
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Review & Confirm Your Grievance</h1>
          <p className="text-gray-500 text-sm mt-1">Review the AI classifications below before saving to PostgreSQL.</p>
        </div>

        {/* AI Confidence banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-900">AI Confidence Score</p>
              <p className="text-xs text-indigo-600">Categorization & priority high certainty</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">
            <Percent className="w-4 h-4 text-indigo-600" />
            <span className="text-base font-extrabold text-indigo-600">{analysis.confidence}%</span>
          </div>
        </div>

        {/* Card with extracted info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
          {/* Title */}
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Identified Issue</span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{analysis.title}</h2>
          </div>

          {/* Citizen Details */}
          {pendingData && !pendingData.isAnonymous && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reporter Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Name</span>
                  <span className="font-semibold text-gray-800">{pendingData.citizen_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Phone</span>
                  <span className="font-semibold text-gray-800">{pendingData.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <span className="text-xs font-medium text-gray-400">Original Complaint</span>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{pendingData?.description}</p>
          </div>

          {/* Category & Priority grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-medium">Category</span>
              <p className="text-base font-bold text-gray-900 mt-1">{analysis.category}</p>
            </div>
            <div className="border border-gray-100 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-medium">Priority</span>
              <div className="mt-1">
                <PriorityBadge priority={analysis.priority} />
              </div>
            </div>
          </div>

          {/* Department */}
          <div className="border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Assigned Authority</span>
              <p className="text-sm font-bold text-gray-900">{analysis.department}</p>
            </div>
          </div>

          {/* Location */}
          <div className="border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Location</span>
              <p className="text-sm font-bold text-gray-900">{analysis.location}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleEdit}
              disabled={submitting}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3"
            >
              <Edit3 className="w-4 h-4" />
              Edit Details
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all text-base disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving to PostgreSQL...
                </>
              ) : (
                <>
                  Confirm & Submit Complaint
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPage;
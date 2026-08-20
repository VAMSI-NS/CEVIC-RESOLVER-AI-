import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, CheckCircle, Loader2, ArrowRight, Edit3,
  AlertCircle, MapPin, Building2, Percent, Zap
} from 'lucide-react';
import { analyzeComplaint } from '../services/aiService';
import { saveComplaint } from '../services/complaintService';
import { generateComplaintId } from '../utils/helpers';
import PriorityBadge from '../components/PriorityBadge';
import type { AIAnalysis, Complaint } from '../types';
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
  { label: 'Understanding complaint', icon: '📖', done: false, active: false },
  { label: 'Analyzing image', icon: '🔍', done: false, active: false },
  { label: 'Identifying location', icon: '📍', done: false, active: false },
  { label: 'Classifying issue', icon: '🏷️', done: false, active: false },
  { label: 'Determining priority', icon: '⚡', done: false, active: false },
  { label: 'Finding responsible authority', icon: '🏢', done: false, active: false },
];

const AIAnalysisPage: React.FC = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'processing' | 'result' | 'error'>('processing');
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [pendingData, setPendingData] = useState<Record<string, string> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingComplaint');
    if (!stored) {
      navigate('/report');
      return;
    }
    const data = JSON.parse(stored) as Record<string, string>;
    setPendingData(data);
    runAnalysis(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalysis = async (data: Record<string, string>) => {
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

    const id = generateComplaintId();
    const now = new Date().toISOString();
    const dept = getDepartmentByCategory(analysis.category);

    const complaint: Complaint = {
      id,
      title: analysis.title,
      description: pendingData.description,
      category: analysis.category,
      priority: analysis.priority,
      status: 'Submitted',
      department: analysis.department,
      location: analysis.location,
      latitude: pendingData.latitude ? parseFloat(pendingData.latitude) : undefined,
      longitude: pendingData.longitude ? parseFloat(pendingData.longitude) : undefined,
      landmark: pendingData.landmark || undefined,
      imageUrl: pendingData.imageUrl || undefined,
      submittedAt: now,
      updatedAt: now,
      estimatedResponse: analysis.estimatedResponse,
      aiConfidence: analysis.confidence,
      aiReason: analysis.reason,
      contactPreference: pendingData.contactPreference || 'email',
      isAnonymous: pendingData.isAnonymous === 'true',
      zone: dept.zones[0],
      timeline: [
        { id: 't1', label: 'Complaint Submitted', timestamp: now, status: 'completed' },
        { id: 't2', label: 'AI Analysis Completed', timestamp: now, status: 'completed', note: `Category: ${analysis.category} | Priority: ${analysis.priority} | Confidence: ${analysis.confidence}%` },
        { id: 't3', label: `Routed to ${dept.shortName}`, timestamp: null, status: 'current' },
        { id: 't4', label: 'Assigned to Field Officer', timestamp: null, status: 'pending' },
        { id: 't5', label: 'Site Inspection', timestamp: null, status: 'pending' },
        { id: 't6', label: 'Resolution in Progress', timestamp: null, status: 'pending' },
        { id: 't7', label: 'Complaint Closed', timestamp: null, status: 'pending' },
      ],
    };

    saveComplaint(complaint);
    sessionStorage.removeItem('pendingComplaint');
    sessionStorage.setItem('lastComplaintId', id);

    await new Promise((r) => setTimeout(r, 800));
    navigate(`/success/${id}`);
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

            <h2 className="text-2xl font-bold text-gray-900 mb-2">CivicResolve AI</h2>
            <p className="text-gray-500 mb-8">Analyzing your complaint intelligently...</p>

            {/* Steps */}
            <div className="space-y-3 text-left">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    step.done
                      ? 'bg-green-50 border border-green-100'
                      : step.active
                      ? 'bg-indigo-50 border border-indigo-100'
                      : 'bg-gray-50 border border-gray-100 opacity-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center">
                    {step.done ? (
                      <CheckCircle className="w-5 h-5 text-green-500 step-complete" />
                    ) : step.active ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : (
                      <span className="text-lg">{step.icon}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${step.done ? 'text-green-700' : step.active ? 'text-indigo-700' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  {step.active && (
                    <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full animate-pulse">
                      Processing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error screen ───────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="card">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
            <p className="text-gray-500 mb-6">There was an error analyzing your complaint. Please try again.</p>
            <button onClick={() => navigate('/report')} className="btn-primary justify-center">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Analysis Result ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <CheckCircle className="w-4 h-4" />
            AI Analysis Complete
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">AI Analysis Result</h1>
          <p className="text-gray-500 mt-2">Review the AI's findings and confirm to submit</p>
        </div>

        {analysis && (
          <div className="space-y-5">
            {/* AI Understanding Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">AI Understanding</p>
                  <p className="text-indigo-200 text-xs">Powered by CivicResolve AI Engine</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
                  <Percent className="w-3 h-3" />
                  <span className="text-sm font-bold">{analysis.confidence}% confidence</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-1">{analysis.title}</h3>
              <p className="text-indigo-200 text-sm italic">"{analysis.reason}"</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card">
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="font-bold text-gray-900 text-lg">🏷️ {analysis.category}</p>
              </div>
              <div className="card">
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <PriorityBadge priority={analysis.priority} size="lg" />
              </div>
              <div className="card col-span-2">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Responsible Department</p>
                    <p className="font-bold text-gray-900">{analysis.department}</p>
                    {analysis.assignedTeam && (
                      <p className="text-xs text-indigo-600 mt-0.5">→ {analysis.assignedTeam}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="font-semibold text-gray-800 text-sm">{analysis.location}</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Expected Response</p>
                    <p className="font-semibold text-gray-800 text-sm">{analysis.estimatedResponse}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleEdit} className="btn-secondary justify-center py-4">
                <Edit3 className="w-5 h-5" />
                Edit Details
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="btn-primary justify-center py-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm & Submit
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              By confirming, your complaint will be submitted and routed to the appropriate department.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPage;

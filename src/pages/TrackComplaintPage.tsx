import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Building2, Clock, Bell, Plus, RefreshCw, AlertCircle
} from 'lucide-react';
import { getComplaintById } from '../services/complaintService';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import ComplaintTimeline from '../components/ComplaintTimeline';
import type { Complaint } from '../types';
import { formatDate, getCategoryEmoji } from '../utils/helpers';
import { useToast, ToastContainer } from '../components/Toast';

// ============================================================
// Track Complaint Page
// ============================================================

const TrackComplaintPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toasts, addToast, dismissToast } = useToast();
  const [inputId, setInputId] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  // Auto-search if ID in URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setInputId(idFromUrl);
      doSearch(idFromUrl);
    }
  }, [searchParams]);

  const doSearch = (id: string) => {
    const result = getComplaintById(id.trim().toUpperCase());
    if (result) {
      setComplaint(result);
      setNotFound(false);
    } else {
      setComplaint(null);
      setNotFound(true);
    }
  };

  const handleSearch = () => {
    if (!inputId.trim()) return;
    doSearch(inputId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleReminder = () => {
    setReminderSent(true);
    addToast('Reminder sent to the department! They will respond within 24 hours.', 'success');
    setTimeout(() => setReminderSent(false), 5000);
  };

  const handleRefresh = () => {
    if (complaint) {
      doSearch(complaint.id);
      addToast('Status refreshed!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Search className="w-4 h-4" />
            Complaint Tracking
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Track Your Complaint
          </h1>
          <p className="text-gray-500 mt-3">
            Enter your complaint ID to see the current status and timeline.
          </p>
        </div>

        {/* Search box */}
        <div className="card mb-6">
          <label className="label">Enter Complaint ID</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="e.g. CR-2026-004821"
              className="input-field flex-1 font-mono"
              maxLength={16}
            />
            <button onClick={handleSearch} className="btn-primary px-6 py-3 flex-shrink-0">
              <Search className="w-4 h-4" />
              Track
            </button>
          </div>

          {/* Quick demo IDs */}
          <div className="mt-3 flex flex-wrap gap-2">
            <p className="text-xs text-gray-400 w-full">Try these demo IDs:</p>
            {['CR-2026-004821', 'CR-2026-004712', 'CR-2026-004715', 'CR-2026-004820'].map((demoId) => (
              <button
                key={demoId}
                onClick={() => { setInputId(demoId); doSearch(demoId); }}
                className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors font-mono"
              >
                {demoId}
              </button>
            ))}
          </div>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="card text-center py-10">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Complaint not found</p>
            <p className="text-gray-400 text-sm mt-1">
              Check the ID and try again. Format: CR-YYYY-XXXXXX
            </p>
          </div>
        )}

        {/* Complaint result */}
        {complaint && (
          <div className="space-y-5 animate-fade-in">
            {/* Complaint header card */}
            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{getCategoryEmoji(complaint.category)}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-mono mb-0.5">{complaint.id}</p>
                    <h2 className="font-bold text-gray-900 text-lg leading-snug">{complaint.title}</h2>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all flex-shrink-0"
                  title="Refresh status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Priority</p>
                  <PriorityBadge priority={complaint.priority} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <StatusBadge status={complaint.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Submitted</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(complaint.submittedAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{complaint.department}</span>
                    {complaint.assignedTo && (
                      <span className="text-xs text-indigo-500 ml-1">→ {complaint.assignedTo}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{complaint.location}</span>
                </div>
                {complaint.estimatedResponse && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Estimated response: <strong>{complaint.estimatedResponse}</strong></span>
                  </div>
                )}
              </div>

              {/* AI reason */}
              {complaint.aiReason && (
                <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                  <p className="text-xs text-indigo-600 font-semibold mb-1">🤖 AI Analysis</p>
                  <p className="text-xs text-indigo-800">"{complaint.aiReason}"</p>
                  {complaint.aiConfidence && (
                    <p className="text-xs text-indigo-500 mt-1">Confidence: {complaint.aiConfidence}%</p>
                  )}
                </div>
              )}

              {/* Escalation badge */}
              {complaint.status === 'Escalated' && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-700">Complaint Escalated</p>
                    <p className="text-xs text-red-600">Level {complaint.escalationLevel} — Department head has been notified.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-5">Resolution Timeline</h3>
              <ComplaintTimeline events={complaint.timeline} />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleReminder}
                disabled={reminderSent}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                  reminderSent
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                }`}
              >
                <Bell className="w-4 h-4" />
                {reminderSent ? 'Reminder Sent!' : 'Send Reminder'}
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem('reportPrefill', complaint.description);
                  addToast('Additional information form pre-filled.', 'info');
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Information
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!complaint && !notFound && (
          <div className="card text-center py-16">
            <Search className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Enter a Complaint ID to track its status</p>
            <p className="text-gray-300 text-sm mt-1">Format: CR-YYYY-XXXXXX</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaintPage;

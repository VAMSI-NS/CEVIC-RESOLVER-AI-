import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { getAllComplaints, escalateComplaint } from '../../services/complaintService';
import type { Complaint } from '../../types';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getCategoryEmoji } from '../../utils/helpers';
import { useToast, ToastContainer } from '../../components/Toast';

// ============================================================
// Authority Dashboard — Escalations Page
// ============================================================

/** Calculate days since submission */
function daysSince(dateStr: string): number {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/** Determine if a complaint should be escalated */
function isOverdue(complaint: Complaint): boolean {
  const days = daysSince(complaint.submittedAt);
  if (complaint.priority === 'HIGH' && days >= 2) return true;
  if (complaint.priority === 'MEDIUM' && days >= 4) return true;
  if (complaint.priority === 'LOW' && days >= 7) return true;
  return false;
}

const EscalationsPage: React.FC = () => {
  const { toasts, addToast, dismissToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [escalating, setEscalating] = useState<string | null>(null);
  const [escalated, setEscalated] = useState<Set<string>>(new Set());

  useEffect(() => {
    const all = getAllComplaints();
    const overdue = all.filter(
      (c) => !['Resolved', 'Closed'].includes(c.status) && isOverdue(c)
    );
    setComplaints(overdue);
  }, []);

  const handleEscalate = async (id: string) => {
    setEscalating(id);
    await new Promise((r) => setTimeout(r, 1200));
    escalateComplaint(id);
    setEscalated((prev) => new Set([...prev, id]));
    setEscalating(null);
    addToast(`Complaint ${id} escalated to Level 1. Department head notified.`, 'warning');
  };

  const getDelay = (c: Complaint) => {
    const days = daysSince(c.submittedAt);
    const expected = c.priority === 'HIGH' ? 2 : c.priority === 'MEDIUM' ? 4 : 7;
    return days - expected;
  };

  return (
    <div className="p-6 space-y-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Escalations</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Complaints that have exceeded their expected resolution time
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-red-600">{complaints.length}</p>
          <p className="text-sm text-red-700">Overdue Complaints</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-orange-600">
            {complaints.filter((c) => c.priority === 'HIGH').length}
          </p>
          <p className="text-sm text-orange-700">High Priority Overdue</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-yellow-600">
            {complaints.filter((c) => c.escalationLevel && c.escalationLevel > 0).length}
          </p>
          <p className="text-sm text-yellow-700">Already Escalated</p>
        </div>
      </div>

      {/* Escalation list */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <CheckCircle className="w-14 h-14 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No overdue complaints!</p>
            <p className="text-gray-400 text-sm mt-1">All complaints are within their expected resolution time.</p>
          </div>
        ) : (
          complaints.map((c) => {
            const delay = getDelay(c);
            const isEscalatedNow = escalated.has(c.id) || c.status === 'Escalated';
            const level = c.escalationLevel || 0;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${
                  isEscalatedNow ? 'border-orange-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getCategoryEmoji(c.category)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-indigo-600 font-semibold">{c.id}</span>
                        <PriorityBadge priority={c.priority} size="sm" />
                        <StatusBadge status={c.status} size="sm" />
                        {(isEscalatedNow || level > 0) && (
                          <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                            Level {isEscalatedNow ? Math.max(1, level + 1) : level} Escalated
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{c.title}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>📍 {c.location}</span>
                        <span>🏢 {c.department}</span>
                        <span>📅 Submitted {formatDate(c.submittedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delay badge */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-100">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{delay} day{delay !== 1 ? 's' : ''} overdue</span>
                    </div>
                  </div>
                </div>

                {/* Department assignment */}
                {c.assignedTo && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                    <span>Current assignment:</span>
                    <span className="font-semibold text-gray-700">{c.assignedTo}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-red-600">No update for {daysSince(c.updatedAt)} day(s)</span>
                  </div>
                )}

                {/* Escalate button */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleEscalate(c.id)}
                    disabled={!!escalating || isEscalatedNow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isEscalatedNow
                        ? 'bg-orange-100 text-orange-700 border border-orange-200 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                    }`}
                  >
                    {escalating === c.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isEscalatedNow ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {isEscalatedNow
                      ? 'Escalated — Department Head Notified'
                      : escalating === c.id
                      ? 'Escalating...'
                      : 'Escalate Complaint'}
                  </button>

                  <button className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    Send Reminder
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EscalationsPage;

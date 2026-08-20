import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Copy, Search, ArrowRight, Clock, Building2, MapPin } from 'lucide-react';
import { getComplaintById } from '../services/complaintService';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import type { Complaint } from '../types';
import { useToast, ToastContainer } from '../components/Toast';

// ============================================================
// Success Page — Complaint registered confirmation
// ============================================================

const SuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, dismissToast } = useToast();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getComplaintById(id);
    if (found) setComplaint(found);
  }, [id]);

  const handleCopy = () => {
    if (!id) return;
    navigator.clipboard.writeText(id).catch(() => {});
    setCopied(true);
    addToast('Complaint ID copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 flex items-center">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-lg w-full mx-auto px-4">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping opacity-30" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-2">
            🎉 Complaint Successfully Registered
          </h1>
          <p className="text-gray-500">
            Your complaint has been analyzed and routed to the appropriate authority.
          </p>
        </div>

        {/* Complaint ID card */}
        <div className="card mb-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Your Complaint ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-extrabold text-indigo-700 tracking-wider">
                {id}
              </span>
              <button
                onClick={handleCopy}
                className={`p-2 rounded-xl transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                title="Copy ID"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-indigo-600 mt-2 font-medium">
              Save this ID to track your complaint
            </p>
          </div>
        </div>

        {/* Complaint details */}
        {complaint && (
          <div className="card mb-5">
            <h2 className="font-bold text-gray-900 mb-4">Complaint Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Title</span>
                <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{complaint.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Category</span>
                <span className="text-sm font-semibold text-gray-800">{complaint.category}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Priority</span>
                <PriorityBadge priority={complaint.priority} />
              </div>
              <div className="flex justify-between items-start py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Department
                </span>
                <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{complaint.department}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Status</span>
                <StatusBadge status={complaint.status} />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </span>
                <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{complaint.location}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Est. Response
                </span>
                <span className="text-sm font-semibold text-indigo-600">{complaint.estimatedResponse}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            to={`/track?id=${id}`}
            className="btn-primary w-full justify-center py-4 text-base"
          >
            <Search className="w-5 h-5" />
            Track Complaint
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/report" className="btn-secondary justify-center py-3">
              Report Another
            </Link>
            <button onClick={handleCopy} className="btn-secondary justify-center py-3">
              <Copy className="w-4 h-4" />
              Copy ID
            </button>
          </div>
        </div>

        {/* What's next */}
        <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <h3 className="font-semibold text-indigo-900 text-sm mb-2">What happens next?</h3>
          <ul className="space-y-1.5">
            {[
              'Department team reviews your complaint',
              'Field officer assigned within 2-4 hours',
              'Site inspection scheduled',
              'You\'ll be notified at each step',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-indigo-700">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;

import React from 'react';
import { CheckCircle2, Clock, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import type { ComplaintStatus } from '../types';

interface ComplaintTimelineProps {
  currentStatus: ComplaintStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

const steps = [
  { key: 'REGISTERED', label: 'Registered', desc: 'Complaint received & cataloged' },
  { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Jurisdiction & priority verification' },
  { key: 'ASSIGNED', label: 'Assigned', desc: 'Field crew team allocated' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Active maintenance and repairs' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Verified and completed successfully' },
];

const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({
  currentStatus,
  createdAt,
  updatedAt,
}) => {
  const norm = (currentStatus || 'REGISTERED').toUpperCase().replace(/[\s-]/g, '_');

  const getActiveIndex = (): number => {
    if (norm.includes('RESOLV') || norm.includes('CLOSE')) return 4;
    if (norm.includes('PROGRESS') || norm.includes('INSPECT')) return 3;
    if (norm.includes('ASSIGN')) return 2;
    if (norm.includes('REVIEW') || norm.includes('ROUT')) return 1;
    return 0;
  };

  const activeIdx = getActiveIndex();

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={idx} className="relative group">
              {/* Node indicator */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-blue-600 border-white ring-4 ring-blue-100 text-white'
                    : isDone
                    ? 'bg-emerald-600 border-white text-white'
                    : 'bg-white border-slate-300 text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                ) : null}
              </div>

              {/* Step info */}
              <div>
                <p
                  className={`text-xs font-bold font-display ${
                    isCurrent ? 'text-blue-600' : isDone ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-500">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplaintTimeline;
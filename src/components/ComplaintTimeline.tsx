import React from 'react';
import { CheckCircle2, Clock, Circle, Sparkles } from 'lucide-react';
import type { TimelineEvent } from '../types';
import { formatDateTime } from '../utils/helpers';

interface ComplaintTimelineProps {
  events: TimelineEvent[];
}

const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ events }) => {
  return (
    <div className="relative">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[18px] top-10 w-0.5 h-full -translate-x-1/2 bg-white/[0.08]" />
            )}

            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {event.status === 'completed' ? (
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : event.status === 'current' ? (
                <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-400 flex items-center justify-center shadow-glow-cyan">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-600">
                  <Circle className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={`font-bold text-xs sm:text-sm font-display ${
                      event.status === 'completed'
                        ? 'text-emerald-300'
                        : event.status === 'current'
                        ? 'text-cyan-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {event.label}
                    {event.status === 'current' && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        <Clock className="w-2.5 h-2.5" />
                        Active
                      </span>
                    )}
                  </p>
                  {event.note && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{event.note}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  {event.timestamp ? (
                    <p className="text-[11px] font-mono text-slate-500">{formatDateTime(event.timestamp)}</p>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-600">Pending</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;
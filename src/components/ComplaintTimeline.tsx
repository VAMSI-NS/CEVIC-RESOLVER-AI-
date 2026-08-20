import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import type { TimelineEvent } from '../types';
import { formatDateTime } from '../utils/helpers';

interface ComplaintTimelineProps {
  events: TimelineEvent[];
}

/** Beautiful vertical timeline component for complaint tracking */
const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ events }) => {
  return (
    <div className="relative">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[18px] top-10 w-0.5 h-full -translate-x-1/2 bg-gray-200" />
            )}

            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {event.status === 'completed' ? (
                <div className="w-9 h-9 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center step-complete">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              ) : event.status === 'current' ? (
                <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      event.status === 'completed'
                        ? 'text-green-700'
                        : event.status === 'current'
                        ? 'text-indigo-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {event.label}
                    {event.status === 'current' && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </p>
                  {event.note && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.note}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  {event.timestamp ? (
                    <p className="text-xs text-gray-500">{formatDateTime(event.timestamp)}</p>
                  ) : (
                    <p className="text-xs text-gray-300">Pending</p>
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

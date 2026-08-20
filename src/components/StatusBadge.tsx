import React from 'react';
import { getStatusColor } from '../utils/helpers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusIcons: Record<string, string> = {
  Submitted: '📤',
  AI_Analysis: '🤖',
  Routed: '📍',
  Assigned: '👷',
  'In Progress': '🔧',
  Inspection: '🔍',
  Resolved: '✅',
  Closed: '🔒',
  Escalated: '⚠️',
};

/** Color-coded status badge component */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const colors = getStatusColor(status);
  const displayStatus = status === 'AI_Analysis' ? 'AI Analysis' : status;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${colors.bg} ${colors.text} ${sizeClasses[size]}`}
    >
      <span>{statusIcons[status] || '📋'}</span>
      {displayStatus}
    </span>
  );
};

export default StatusBadge;

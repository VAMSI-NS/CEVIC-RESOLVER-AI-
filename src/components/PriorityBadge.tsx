import React from 'react';
import { getPriorityColor } from '../utils/helpers';

interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
}

/** Color-coded priority badge component */
const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const colors = getPriorityColor(priority);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const icons = {
    HIGH: '🔴',
    CRITICAL: '🚨',
    MEDIUM: '🟠',
    LOW: '🟢',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      <span className="text-xs">{icons[priority as keyof typeof icons] || '⚪'}</span>
      {priority}
    </span>
  );
};

export default PriorityBadge;

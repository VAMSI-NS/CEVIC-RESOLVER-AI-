import React from 'react';
import { Zap, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import type { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const norm = (priority || 'MEDIUM').toUpperCase();

  let label = norm;
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = ArrowDown;

  if (norm === 'CRITICAL') {
    label = 'CRITICAL';
    bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = Zap;
  } else if (norm === 'HIGH') {
    label = 'HIGH';
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
  } else if (norm === 'MEDIUM') {
    label = 'MEDIUM';
    bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
    Icon = ArrowUp;
  } else {
    label = 'LOW';
    bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
    Icon = ArrowDown;
  }

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3 py-1.5 text-xs font-bold'
      : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold border ${bgClass} ${sizeClass}`}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{label}</span>
    </span>
  );
};

export default PriorityBadge;
import React from 'react';
import {
  Clock, AlertCircle, CheckCircle2, RefreshCw, XCircle, ArrowRight
} from 'lucide-react';
import type { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const norm = (status || 'REGISTERED').toUpperCase().replace(/[\s-]/g, '_');

  let label = status;
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  if (norm.includes('RESOLV') || norm.includes('CLOSE')) {
    label = 'RESOLVED';
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = CheckCircle2;
  } else if (norm.includes('PROGRESS') || norm.includes('INSPECT')) {
    label = 'IN PROGRESS';
    bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
    Icon = RefreshCw;
  } else if (norm.includes('ASSIGN')) {
    label = 'ASSIGNED';
    bgClass = 'bg-cyan-50 text-cyan-700 border-cyan-200';
    Icon = ArrowRight;
  } else if (norm.includes('REVIEW') || norm.includes('ROUT')) {
    label = 'UNDER REVIEW';
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = Clock;
  } else if (norm.includes('REJECT')) {
    label = 'REJECTED';
    bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = XCircle;
  } else {
    label = 'REGISTERED';
    bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
    Icon = AlertCircle;
  }

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs font-bold'
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

export default StatusBadge;
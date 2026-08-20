import React from 'react';
import { CheckCircle2, Clock, Activity, Building2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || 'REGISTERED').toUpperCase().replace(/[\s-]/g, '_');

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  let style = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
  let Icon = Clock;

  if (norm.includes('RESOLV') || norm.includes('CLOSE')) {
    style = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    Icon = CheckCircle2;
  } else if (norm.includes('PROGRESS') || norm.includes('INSPECT')) {
    style = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    Icon = Activity;
  } else if (norm.includes('ASSIGN')) {
    style = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    Icon = Building2;
  } else if (norm.includes('REVIEW') || norm.includes('ROUT')) {
    style = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    Icon = Clock;
  } else if (norm.includes('REJECT')) {
    style = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    Icon = XCircle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-bold border ${style} ${sizeClasses[size]}`}
    >
      <Icon className="w-3 h-3" />
      <span>{status.replace('_', ' ')}</span>
    </span>
  );
};

export default StatusBadge;
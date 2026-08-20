import React from 'react';
import { Zap, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const norm = (priority || 'MEDIUM').toUpperCase();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  let style = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
  let Icon = Info;

  if (norm === 'CRITICAL') {
    style = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    Icon = AlertTriangle;
  } else if (norm === 'HIGH') {
    style = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    Icon = Zap;
  } else if (norm === 'LOW') {
    style = 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    Icon = Info;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold border ${style} ${sizeClasses[size]}`}
    >
      <Icon className="w-3 h-3" />
      <span>{norm}</span>
    </span>
  );
};

export default PriorityBadge;
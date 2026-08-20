import React, { useState } from 'react';
import { Sparkles, Shield, X, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside aria-label="Cloud sync indicator banner" className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border-b border-blue-100 text-slate-700 text-xs py-2 px-4 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="font-semibold text-slate-900">CivicResolve AI</span>
          <span className="hidden sm:inline text-slate-500">• Live PostgreSQL Cloud Sync Active</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/admin"
            className="font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <span>Authority Portal</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DemoBanner;
import React, { useState } from 'react';
import { X, Sparkles, Database } from 'lucide-react';

const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      id="demo-banner"
      role="status"
      className="fixed top-0 left-0 right-0 z-[60] bg-[#07111F]/90 border-b border-cyan-500/20 backdrop-blur-md py-1.5 px-4 flex items-center justify-center gap-2 text-xs text-slate-300"
    >
      <Database className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" aria-hidden="true" />
      <span className="text-center font-mono">
        <strong className="text-cyan-300">Live Smart City Network</strong> — Real-time AI routing & PostgreSQL cloud synchronization active.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default DemoBanner;
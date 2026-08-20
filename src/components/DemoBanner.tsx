import React, { useState } from 'react';
import { X, FlaskConical } from 'lucide-react';

// ============================================================
// Demo Mode Banner — fixed at top, above the navbar
// ============================================================

const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      id="demo-banner"
      role="status"
      className="fixed top-0 left-0 right-0 z-[60] bg-amber-50 border-b border-amber-200 py-2 px-4 flex items-center justify-center gap-2 text-sm text-amber-800"
    >
      <FlaskConical className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
      <span className="text-center text-xs sm:text-sm">
        <strong>Demo Mode</strong> — Simulated AI &amp; mock data. No real government systems are contacted.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 p-1 rounded hover:bg-amber-200 transition-colors flex-shrink-0"
        aria-label="Dismiss demo notice"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default DemoBanner;

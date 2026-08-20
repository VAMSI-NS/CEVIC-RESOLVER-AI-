import React from 'react';
import { Settings, Info } from 'lucide-react';

// ============================================================
// Authority Dashboard — Settings Page (placeholder)
// ============================================================

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">System configuration and preferences</p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex gap-3">
        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-700">
          This is a <strong>demo MVP</strong> for hackathon purposes. Settings configuration, user management, API keys,
          and notification preferences would be configured here in production.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'AI Model', value: 'CivicResolve AI Engine (Mock)', icon: '🤖' },
          { label: 'Escalation Threshold', value: 'HIGH: 48h | MEDIUM: 96h | LOW: 168h', icon: '⏱️' },
          { label: 'Notification Channel', value: 'Email + SMS (Demo)', icon: '🔔' },
          { label: 'Department Zones', value: '4 Zones Active', icon: '🗺️' },
          { label: 'Data Storage', value: 'LocalStorage (Demo)', icon: '💾' },
          { label: 'API Status', value: 'Mock Mode — All Systems Operational', icon: '✅' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;

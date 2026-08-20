import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Check, Save } from 'lucide-react';
import { ToastContainer, useToast } from '../../components/Toast';

const SettingsPage: React.FC = () => {
  const { toasts, addToast, dismissToast } = useToast();
  const [zone, setZone] = useState('Central Vijayawada Municipal Zone');
  const [slaHours, setSlaHours] = useState('48');
  const [autoDispatch, setAutoDispatch] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Zone configuration saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div>
        <h2 className="text-2xl font-black text-slate-900 font-display">Zone Settings</h2>
        <p className="text-xs text-slate-500">Configure municipal SLA parameters and dispatch automation</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-premium space-y-6">
        
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Municipal Zone Jurisdiction</label>
          <input
            type="text"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Standard Resolution SLA (Hours)</label>
          <input
            type="number"
            value={slaHours}
            onChange={(e) => setSlaHours(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">Automated AI Zonal Dispatch</p>
            <p className="text-[11px] text-slate-500">Automatically assign complaints based on GPS and category</p>
          </div>
          <input
            type="checkbox"
            checked={autoDispatch}
            onChange={(e) => setAutoDispatch(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button type="submit" className="btn-primary text-xs py-2.5 px-5">
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
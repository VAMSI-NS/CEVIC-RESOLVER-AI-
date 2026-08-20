import React from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { mockNotifications } from '../data/mockNotifications';
import { getRelativeTime } from '../utils/helpers';

interface NotificationPanelProps {
  onClose: () => void;
}

const typeIcons = {
  success: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  info: <Info className="w-3.5 h-3.5 text-cyan-400" />,
  error: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#07111F]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.12] z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#050B14]/80">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white text-xs font-display">Civic Alerts</span>
          {unread > 0 && (
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              {unread} live
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
        {mockNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-xs ${
              !notif.read ? 'bg-cyan-500/5' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {typeIcons[notif.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`leading-relaxed ${!notif.read ? 'text-white font-medium' : 'text-slate-400'}`}>
                {notif.message}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">{getRelativeTime(notif.timestamp)}</p>
            </div>
            {!notif.read && (
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#050B14]/80 text-center">
        <button
          onClick={onClose}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          Dismiss All
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;
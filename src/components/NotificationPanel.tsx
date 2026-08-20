import React from 'react';
import { X, Bell, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const dummyNotifs = [
    {
      id: '1',
      title: 'Ticket #CR-2026-004821 Status Updated',
      desc: 'Assigned to Municipal Roads & Infrastructure Department.',
      time: '12m ago',
      type: 'assigned',
      link: '/track?id=CR-2026-004821',
    },
    {
      id: '2',
      title: 'Pothole Issue CR-2026-004650 Resolved',
      desc: 'Field crew has verified surface asphalt repair.',
      time: '1h ago',
      type: 'resolved',
      link: '/track?id=CR-2026-004650',
    },
  ];

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white/95 border border-slate-200 backdrop-blur-2xl rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 font-display">Live Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto">
        {dummyNotifs.map((n) => (
          <Link
            key={n.id}
            to={n.link}
            onClick={onClose}
            className="block p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all text-xs space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {n.title}
              </span>
              <span className="text-[10px] text-slate-400">{n.time}</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">{n.desc}</p>
          </Link>
        ))}
      </div>

      <div className="pt-3 mt-2 border-t border-slate-100 text-center">
        <Link
          to="/track"
          onClick={onClose}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
        >
          <span>Track all complaints</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default NotificationPanel;
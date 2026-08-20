import React from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { mockNotifications } from '../data/mockNotifications';
import { getRelativeTime } from '../utils/helpers';

interface NotificationPanelProps {
  onClose: () => void;
}

const typeIcons = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
};

/** Dropdown notification panel */
const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-gray-900 text-sm">Notifications</span>
          {unread > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {unread} new
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {mockNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
              !notif.read ? 'bg-indigo-50/40' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {typeIcons[notif.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${!notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {notif.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">{getRelativeTime(notif.timestamp)}</p>
            </div>
            {!notif.read && (
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium w-full text-center">
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Map, Building2,
  AlertTriangle, BarChart3, Settings, MapPin, X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: 'Overview', path: '/authority', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
  { label: 'Complaints', path: '/authority/complaints', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Map View', path: '/authority/map', icon: <Map className="w-5 h-5" /> },
  { label: 'Departments', path: '/authority/departments', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Escalations', path: '/authority/escalations', icon: <AlertTriangle className="w-5 h-5" /> },
  { label: 'Analytics', path: '/authority/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Settings', path: '/authority/settings', icon: <Settings className="w-5 h-5" /> },
];

/** Authority dashboard sidebar navigation */
const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-lg z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:relative lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-gray-900 text-sm">CivicResolve</span>
              <span className="font-bold text-indigo-600 text-sm"> AI</span>
            </div>
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Authority badge */}
        <div className="mx-4 mt-4 mb-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
          <p className="text-xs font-bold text-indigo-700">🏛️ Civic Operations Center</p>
          <p className="text-xs text-indigo-500 mt-0.5">Administrator Access</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`sidebar-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
              {item.label === 'Escalations' && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to Citizen Portal
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

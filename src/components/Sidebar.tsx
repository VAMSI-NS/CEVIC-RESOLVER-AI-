import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Map, Building2,
  AlertTriangle, BarChart3, Settings, Sparkles, X, ArrowLeft
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: 'Overview', path: '/authority', icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
  { label: 'All Complaints', path: '/authority/complaints', icon: <ClipboardList className="w-4 h-4" /> },
  { label: 'Map View', path: '/authority/map', icon: <Map className="w-4 h-4" /> },
  { label: 'Departments', path: '/authority/departments', icon: <Building2 className="w-4 h-4" /> },
  { label: 'Escalations', path: '/authority/escalations', icon: <AlertTriangle className="w-4 h-4" /> },
  { label: 'Analytics', path: '/authority/analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Settings', path: '/authority/settings', icon: <Settings className="w-4 h-4" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path || location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#07111F] border-r border-white/[0.08] shadow-2xl z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:relative lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-cyan">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-white text-sm tracking-tight font-display">CivicResolve</span>
              <span className="font-extrabold text-cyan-400 text-sm tracking-tight font-display"> AI</span>
            </div>
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Authority badge */}
        <div className="mx-4 mt-4 mb-2 bg-[#0B1625] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 space-y-0.5">
          <p className="text-xs font-bold text-cyan-300 font-display flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Civic Operations Center</span>
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Host Administrator Access</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.label === 'Escalations' && (
                  <span className="ml-auto bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08]">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Citizen Portal</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
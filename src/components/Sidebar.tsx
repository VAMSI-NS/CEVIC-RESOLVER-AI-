import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BarChart3, Settings,
  LogOut, Shield, ChevronLeft, ChevronRight, Activity, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/complaints', icon: FileText, label: 'Complaints Management' },
    { to: '/admin/analytics', icon: BarChart3, label: 'City Analytics' },
    { to: '/admin/settings', icon: Settings, label: 'Zone Settings' },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 min-h-screen ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-slate-900 text-sm font-display">CivicOps Center</span>
                <p className="text-[10px] text-violet-600 font-semibold font-mono">Operations</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white mx-auto">
              <Shield className="w-4 h-4" />
            </div>
          )}

          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Nav Links */}
        <div className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Officer Profile & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs">
              {user.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="text-xs leading-tight truncate">
              <p className="font-bold text-slate-900 truncate">{user.name || 'Officer'}</p>
              <p className="text-[10px] text-slate-500 font-mono capitalize">{user.role || 'Admin'}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Sign out of Operations Center"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
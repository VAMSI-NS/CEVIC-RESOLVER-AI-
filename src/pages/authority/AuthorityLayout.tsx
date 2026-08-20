import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Menu, Bell, Shield, LogOut, Database, User } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import OverviewPage from './OverviewPage';
import ComplaintsPage from './ComplaintsPage';
import MapPage from './MapPage';
import DepartmentsPage from './DepartmentsPage';
import EscalationsPage from './EscalationsPage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import AdminLoginPage from './AdminLoginPage';
import NotificationPanel from '../../components/NotificationPanel';
import { mockNotifications } from '../../data/mockNotifications';
import { isAdminLoggedIn, adminLogout, getAdminUser } from '../../services/complaintService';

const AuthorityLayout: React.FC = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean>(isAdminLoggedIn());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(getAdminUser());

  useEffect(() => {
    setAuthenticated(isAdminLoggedIn());
    setAdminUser(getAdminUser());
  }, []);

  const handleLogout = () => {
    adminLogout();
    setAuthenticated(false);
    navigate('/');
  };

  if (!authenticated) {
    return <AdminLoginPage onSuccess={() => setAuthenticated(true)} />;
  }

  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-[#050B14] text-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top bar */}
        <header className="flex-shrink-0 bg-[#07111F] border-b border-white/[0.08] h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-emerald-300 font-semibold hidden sm:inline-block">
                PostgreSQL Cloud Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Officer Badge */}
            <div className="flex items-center gap-2 bg-[#0B1625] border border-white/[0.08] rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono font-bold text-white hidden sm:inline-block">
                {adminUser?.username || 'admin'}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline-block">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="flex-1 overflow-y-auto bg-[#050B14] p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/escalations" element={<EscalationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

      </div>
    </div>
  );
};

export default AuthorityLayout;
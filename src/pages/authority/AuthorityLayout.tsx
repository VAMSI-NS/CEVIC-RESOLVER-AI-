import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu, Bell, Shield, LogOut } from 'lucide-react';
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

// ============================================================
// Authority / Admin Dashboard Layout - Protected Host Portal
// ============================================================

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
    return <AdminLoginPage onLoginSuccess={() => setAuthenticated(true)} />;
  }

  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-gray-800 text-sm hidden sm:block">
                Host / Administrator Management Console
              </span>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                PostgreSQL Connected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2.5 py-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {adminUser?.username ? adminUser.username[0].toUpperCase() : 'A'}
              </div>
              <span className="text-xs font-semibold text-gray-700 hidden sm:block">
                {adminUser?.username || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                title="Logout from Host/Admin"
                className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white transition-all ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<OverviewPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="escalations" element={<EscalationsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/authority/complaints" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AuthorityLayout;
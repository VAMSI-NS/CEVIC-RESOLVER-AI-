import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles, Bell, Menu, X, Shield, PlusCircle, ArrowRight
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';

interface NavbarProps {
  notifications?: number;
}

const Navbar: React.FC<NavbarProps> = ({ notifications = 0 }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Report Issue', path: '/report' },
    { label: 'Track Complaint', path: '/track' },
    { label: 'How It Works', path: '/how-it-works' },
  ];

  const handleNotifClose = useCallback(() => setNotifOpen(false), []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 pb-2 transition-all duration-300 pointer-events-none">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 pointer-events-auto ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-md px-4 sm:px-6'
            : 'bg-white/75 backdrop-blur-md border border-slate-200/70 shadow-sm px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-slate-900 text-base tracking-tight font-display">CivicResolve</span>
                <span className="font-extrabold text-blue-600 text-base tracking-tight font-display">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">AI-powered civic platform</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 border border-slate-200/60 rounded-xl p-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/60 transition-all cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={handleNotifClose} />}
            </div>

            {/* Authority Console Shortcut */}
            <button
              onClick={() => navigate('/admin')}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/60 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-violet-600" />
              <span>Authority Portal</span>
            </button>

            {/* Main Action: Report Button */}
            <Link
              to="/report"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <span>Report an Issue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 transition-all"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 p-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto">
          <div className="space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </Link>
            ))}

            <div className="pt-2 mt-2 border-t border-slate-100 space-y-2">
              <Link
                to="/report"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-blue-500/20"
              >
                <span>Report an Issue →</span>
              </Link>

              <button
                onClick={() => {
                  navigate('/admin');
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-xl"
              >
                <Shield className="w-4 h-4 text-violet-600" />
                <span>Authority Console</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
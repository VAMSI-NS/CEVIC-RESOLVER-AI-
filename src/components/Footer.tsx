import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, MapPin, Activity, ArrowUpRight, Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-white border-t border-slate-200/80 pt-16 pb-12 overflow-hidden text-slate-600 text-sm">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-blue-50/50 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group inline-block">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight font-display">CivicResolve</span>
                <span className="text-lg font-extrabold text-blue-600 tracking-tight font-display"> AI</span>
              </div>
            </Link>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Building smarter, safer, and more responsive communities through next-generation AI issue routing and real-time civic transparency.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud PostgreSQL Connected</span>
              </div>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div className="space-y-3">
            <p className="text-slate-900 font-bold text-xs tracking-wider uppercase font-mono">Citizen Services</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/report" className="hover:text-blue-600 transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-blue-600 transition-colors">
                  Track Complaint
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-blue-600 transition-colors">
                  How AI Routing Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <p className="text-slate-900 font-bold text-xs tracking-wider uppercase font-mono">Civic Categories</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><span className="hover:text-slate-900 transition-colors">🛣️ Roads & Potholes</span></li>
              <li><span className="hover:text-slate-900 transition-colors">💡 Street Lighting</span></li>
              <li><span className="hover:text-slate-900 transition-colors">🗑️ Solid Waste Management</span></li>
              <li><span className="hover:text-slate-900 transition-colors">💧 Water Supply & Drainage</span></li>
            </ul>
          </div>

          {/* Col 4: Authority Portal */}
          <div className="space-y-3">
            <p className="text-slate-900 font-bold text-xs tracking-wider uppercase font-mono">Administration</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/admin" className="hover:text-violet-700 transition-colors flex items-center gap-1.5 font-medium text-slate-700">
                  <Shield className="w-4 h-4 text-violet-600" />
                  <span>Authority Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/VAMSI-NS/CEVIC-RESOLVER-AI-"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-900 transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CivicResolve AI. All rights reserved. Smart City Civic Intelligence.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, MapPin, Activity, ArrowUpRight, Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#040810] border-t border-white/[0.08] pt-16 pb-12 overflow-hidden text-slate-400 text-sm">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group inline-block">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-cyan">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="text-lg font-extrabold text-white tracking-tight">CivicResolve</span>
                <span className="text-lg font-extrabold text-cyan-400 tracking-tight"> AI</span>
              </div>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Building smarter, safer, and more responsive communities through next-generation AI issue routing and real-time civic transparency.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud PostgreSQL Online</span>
              </div>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div className="space-y-3">
            <p className="text-white font-semibold text-xs tracking-wider uppercase">Citizen Services</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/report" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <span>Report an Issue</span>
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <span>Track Complaint</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-cyan-400 transition-colors">
                  How AI Routing Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <p className="text-white font-semibold text-xs tracking-wider uppercase">Civic Categories</p>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-slate-200 transition-colors">🛣️ Roads & Potholes</span></li>
              <li><span className="hover:text-slate-200 transition-colors">💡 Street Lighting</span></li>
              <li><span className="hover:text-slate-200 transition-colors">🗑️ Solid Waste Management</span></li>
              <li><span className="hover:text-slate-200 transition-colors">💧 Water Supply & Drainage</span></li>
            </ul>
          </div>

          {/* Col 4: Authority Portal */}
          <div className="space-y-3">
            <p className="text-white font-semibold text-xs tracking-wider uppercase">Administration</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/admin" className="hover:text-violet-400 transition-colors flex items-center gap-1.5 font-medium text-slate-300">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span>Authority Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/VAMSI-NS/CEVIC-RESOLVER-AI-"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CivicResolve AI. All rights reserved. Smart City Civic Intelligence.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
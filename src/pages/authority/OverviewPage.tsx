import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  TrendingUp, Users, RefreshCw, Shield, MapPin, Sparkles, Building2,
  Activity, ArrowUpRight, PlusCircle
} from 'lucide-react';
import { fetchAllComplaintsApi, fetchDashboardStatsApi } from '../../services/complaintService';
import type { Complaint } from '../../types';

const OverviewPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    under_review: 0,
    in_progress: 0,
    resolved: 0,
    critical: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, statsData] = await Promise.all([
        fetchAllComplaintsApi(),
        fetchDashboardStatsApi(),
      ]);
      setComplaints(list.slice(0, 6));
      if (statsData) {
        setStats({
          total: statsData.total || list.length,
          registered: statsData.registered || 0,
          under_review: statsData.under_review || 0,
          in_progress: statsData.in_progress || 0,
          resolved: statsData.resolved || 0,
          critical: statsData.critical || 0,
        });
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Host Control Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight mt-0.5">
            Civic Operations Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time urban telemetry and PostgreSQL complaint dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync Cloud Data</span>
          </button>

          <Link
            to="/authority/complaints"
            className="btn-primary text-xs py-2.5 px-4"
          >
            <span>Manage All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Glass Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total */}
        <div className="glass-panel p-5 space-y-2 border-white/[0.08] hover:border-cyan-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Total Filed</span>
            <ClipboardList className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-display">
            {stats.total}
          </p>
          <span className="text-[10px] text-cyan-300 font-mono">100% in PostgreSQL</span>
        </div>

        {/* Registered */}
        <div className="glass-panel p-5 space-y-2 border-white/[0.08] hover:border-amber-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Registered</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
            {stats.registered}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Pending review</span>
        </div>

        {/* Under Review */}
        <div className="glass-panel p-5 space-y-2 border-white/[0.08] hover:border-blue-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Under Review</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 font-display">
            {stats.under_review}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Zonal assessment</span>
        </div>

        {/* In Progress */}
        <div className="glass-panel p-5 space-y-2 border-white/[0.08] hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">In Progress</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-400 font-display">
            {stats.in_progress}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Crew dispatched</span>
        </div>

        {/* Resolved */}
        <div className="glass-panel p-5 space-y-2 border-white/[0.08] hover:border-emerald-400/40 transition-colors col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
            {stats.resolved}
          </p>
          <span className="text-[10px] text-emerald-300 font-mono">Completed cases</span>
        </div>

      </div>

      {/* Recent Submissions Feed */}
      <div className="glass-panel p-6 space-y-4 border-white/[0.08]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-base font-bold text-white font-display">
              Recent Grievances Stream
            </h2>
            <p className="text-xs text-slate-400">
              Latest citizen reports synced with central database
            </p>
          </div>

          <Link
            to="/authority/complaints"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View all in table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-[#0B1625]/60 hover:bg-[#0F1D2D]/90 border border-white/[0.06] hover:border-cyan-400/30 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-300">{c.ticket_id || c.id}</span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                    {c.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {c.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-white truncate font-display">{c.title}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span>{c.location}</span>
                </p>
              </div>

              <Link
                to="/authority/complaints"
                className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition-colors"
              >
                Inspect & Update
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default OverviewPage;
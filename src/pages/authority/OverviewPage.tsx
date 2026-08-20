import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  TrendingUp, Users, MapPin, RefreshCw, Zap, Shield, Sparkles
} from 'lucide-react';
import { fetchDashboardStatsApi, fetchAllComplaintsApi } from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import type { Complaint } from '../../types';

const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    under_review: 0,
    in_progress: 0,
    resolved: 0,
    critical: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, complaintsData] = await Promise.all([
        fetchDashboardStatsApi(),
        fetchAllComplaintsApi(),
      ]);

      if (statsData) {
        setStats({
          total: statsData.total || 0,
          registered: statsData.registered || 0,
          under_review: statsData.under_review || 0,
          in_progress: statsData.in_progress || 0,
          resolved: statsData.resolved || 0,
          critical: statsData.critical || 0,
        });
      }

      if (Array.isArray(complaintsData)) {
        setRecentComplaints(complaintsData.slice(0, 5));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    { label: 'Total Grievances', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Under Review', value: stats.under_review + stats.registered, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'In Progress', value: stats.in_progress, icon: RefreshCw, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header with quick refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-display">Console Overview</h2>
          <p className="text-xs text-slate-500">Live operational intelligence & resolution status</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="btn-secondary text-xs py-2 px-3.5"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          
          <Link
            to="/admin/complaints"
            className="btn-primary text-xs py-2 px-4"
          >
            <span>Manage All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-white border ${kpi.border} rounded-2xl p-5 shadow-sm space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Complaints Stream */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-premium space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Recent Grievances</h3>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all in table</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading complaints...</div>
        ) : recentComplaints.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No complaints registered yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentComplaints.map((c) => (
              <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{c.ticket_id || c.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {c.location}
                    </span>
                    <span>Category: {c.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PriorityBadge priority={c.priority} size="sm" />
                  <StatusBadge status={c.status} size="sm" />
                  <Link
                    to="/admin/complaints"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default OverviewPage;
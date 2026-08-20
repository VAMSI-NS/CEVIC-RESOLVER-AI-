import React, { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, PieChart, Activity, MapPin, Calendar,
  Shield, CheckCircle2, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { fetchDashboardStatsApi } from '../../services/complaintService';

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState({
    total: 1248,
    resolved: 846,
    under_review: 312,
    in_progress: 90,
  });

  useEffect(() => {
    fetchDashboardStatsApi().then((data) => {
      if (data && data.total > 0) {
        setStats({
          total: data.total,
          resolved: data.resolved || 0,
          under_review: (data.under_review || 0) + (data.registered || 0),
          in_progress: data.in_progress || 0,
        });
      }
    }).catch(() => {});
  }, []);

  const categoryBreakdown = [
    { name: 'Roads & Potholes', count: 42, pct: '38%', color: 'bg-blue-600' },
    { name: 'Street Lighting', count: 28, pct: '25%', color: 'bg-cyan-500' },
    { name: 'Waste Management', count: 18, pct: '16%', color: 'bg-emerald-500' },
    { name: 'Water & Drainage', count: 14, pct: '13%', color: 'bg-indigo-500' },
    { name: 'Other Civic Hazards', count: 9, pct: '8%', color: 'bg-violet-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      <div>
        <h2 className="text-2xl font-black text-slate-900 font-display">City Civic Analytics</h2>
        <p className="text-xs text-slate-500">Aggregated urban health patterns and department resolution velocity</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Avg Resolution Velocity</span>
          <p className="text-2xl font-black text-slate-900 font-display">3.4 Days</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 18% faster than last month
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">SLA Compliance Rate</span>
          <p className="text-2xl font-black text-blue-600 font-display">94.2%</p>
          <span className="text-[11px] text-slate-500">Target: ≥ 90.0%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Citizen Satisfaction</span>
          <p className="text-2xl font-black text-emerald-600 font-display">4.8 / 5.0</p>
          <span className="text-[11px] text-slate-500">Based on 640+ ratings</span>
        </div>
      </div>

      {/* Category Breakdown Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-premium space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Grievances by Category</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Active Distribution</span>
        </div>

        <div className="space-y-4">
          {categoryBreakdown.map((cat, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>{cat.name}</span>
                <span className="font-mono text-slate-500">{cat.count} issues ({cat.pct})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`${cat.color} h-full rounded-full`}
                  style={{ width: cat.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
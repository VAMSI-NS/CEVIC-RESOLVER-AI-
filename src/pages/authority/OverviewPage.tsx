import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, AlertTriangle, CheckCircle, Clock,
  TrendingUp, ArrowRight, Brain, RefreshCw
} from 'lucide-react';
import DashboardCard from '../../components/DashboardCard';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import { getAllComplaints, getAnalyticsSummary } from '../../services/complaintService';
import type { Complaint } from '../../types';
import { formatDateTime, getCategoryEmoji, truncate } from '../../utils/helpers';

// ============================================================
// Authority Dashboard — Overview Page
// ============================================================

const OverviewPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [summary, setSummary] = useState(getAnalyticsSummary());

  useEffect(() => {
    const all = getAllComplaints();
    setComplaints(all.slice(0, 6)); // Recent 6
    setSummary(getAnalyticsSummary());
  }, []);

  const handleRefresh = () => {
    const all = getAllComplaints();
    setComplaints(all.slice(0, 6));
    setSummary(getAnalyticsSummary());
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Civic Operations Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time complaint management dashboard</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:shadow-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Complaints"
          value={summary.totalComplaints.toLocaleString()}
          subtitle="All time"
          icon={<ClipboardList className="w-6 h-6" />}
          color="indigo"
          trend={{ value: 12, label: 'this month' }}
        />
        <DashboardCard
          title="High Priority"
          value={summary.highPriority}
          subtitle="Needs urgent attention"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          trend={{ value: -5, label: 'vs last week' }}
        />
        <DashboardCard
          title="Pending"
          value={summary.pending}
          subtitle="Awaiting resolution"
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />
        <DashboardCard
          title="Resolved"
          value={summary.resolved}
          subtitle={`${summary.resolutionRate}% resolution rate`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          trend={{ value: 8, label: 'this week' }}
        />
      </div>

      {/* AI Routing Decision Panel */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AI Routing Decision</h2>
            <p className="text-indigo-200 text-sm">Latest AI-analyzed complaint</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <p className="text-indigo-200 text-xs mb-2">Input Complaint</p>
          <p className="text-white font-medium">
            "Garbage has been accumulating for three days near the market area. Flies and rodents are visible."
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Category', value: 'Garbage' },
            { label: 'Priority', value: 'MEDIUM' },
            { label: 'Department', value: 'Sanitation' },
            { label: 'Assigned Team', value: 'Zone 3 Team' },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-indigo-300 text-xs">{item.label}</p>
              <p className="text-white font-semibold text-sm mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-white/10 rounded-xl p-3">
          <p className="text-indigo-200 text-xs mb-1">AI Reasoning</p>
          <p className="text-white text-sm italic">
            "Accumulated waste in a high-footfall public area requires sanitation intervention. 3-day delay increases health risk."
          </p>
        </div>
      </div>

      {/* Recent complaints */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Complaints</h2>
          <Link
            to="/authority/complaints"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {complaints.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <span className="text-xl flex-shrink-0">{getCategoryEmoji(c.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{truncate(c.title, 50)}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{c.id} · {c.location.split(',')[0]}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={c.priority} size="sm" />
                <StatusBadge status={c.status} size="sm" />
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0 hidden lg:block">
                {formatDateTime(c.submittedAt)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution rate bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Resolution Rate by Category</h2>
          <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            {summary.resolutionRate}% overall
          </div>
        </div>
        <div className="space-y-3">
          {[
            { cat: 'Roads', rate: 68, color: 'bg-red-400' },
            { cat: 'Garbage', rate: 82, color: 'bg-orange-400' },
            { cat: 'Drainage', rate: 57, color: 'bg-blue-400' },
            { cat: 'Water', rate: 74, color: 'bg-cyan-400' },
            { cat: 'Streetlights', rate: 91, color: 'bg-yellow-400' },
            { cat: 'Infrastructure', rate: 63, color: 'bg-purple-400' },
          ].map((item) => (
            <div key={item.cat} className="flex items-center gap-4">
              <p className="text-sm text-gray-600 w-24 flex-shrink-0">{item.cat}</p>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                  style={{ width: `${item.rate}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-gray-700 w-10 text-right">{item.rate}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

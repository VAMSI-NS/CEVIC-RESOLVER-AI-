import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, BarChart2 } from 'lucide-react';
import { getAnalyticsSummary } from '../../services/complaintService';

// ============================================================
// Authority Dashboard — Analytics Page
// ============================================================

type Summary = ReturnType<typeof getAnalyticsSummary>;

const categoryColors: Record<string, string> = {
  Roads: 'bg-red-400',
  Garbage: 'bg-orange-400',
  Drainage: 'bg-blue-400',
  Water: 'bg-cyan-400',
  Streetlights: 'bg-yellow-400',
  Infrastructure: 'bg-purple-400',
  Other: 'bg-gray-400',
};

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-orange-400',
  LOW: 'bg-green-400',
};

/** Simple horizontal bar chart */
const BarChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  maxValue?: number;
}> = ({ data, maxValue }) => {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <p className="text-sm text-gray-600 w-28 flex-shrink-0 truncate">{item.label}</p>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${item.color} transition-all duration-700`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-gray-700 w-8 text-right">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<Summary>(getAnalyticsSummary());

  useEffect(() => {
    setSummary(getAnalyticsSummary());
  }, []);

  const categoryData = summary.byCategory.map((item) => ({
    label: item.category,
    value: item.count,
    color: categoryColors[item.category] || 'bg-gray-400',
  }));

  const priorityData = summary.byPriority.map((item) => ({
    label: item.priority,
    value: item.count,
    color: priorityColors[item.priority] || 'bg-gray-400',
  }));

  const areaData = summary.byArea.map((item) => ({
    label: item.area,
    value: item.count,
    color: 'bg-indigo-400',
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Civic Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">AI-powered insights from complaint data</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Complaints', value: summary.totalComplaints, color: 'text-indigo-600' },
          { label: 'Resolved', value: summary.resolved, color: 'text-green-600' },
          { label: 'Resolution Rate', value: `${summary.resolutionRate}%`, color: 'text-blue-600' },
          { label: 'Avg. Resolution', value: `${summary.avgResolutionDays}d`, color: 'text-purple-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* By Category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-gray-900">Complaints by Category</h2>
          </div>
          <BarChart data={categoryData} />
        </div>

        {/* By Priority */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-gray-900">Complaints by Priority</h2>
          </div>
          <BarChart data={priorityData} />
          
          {/* Donut-style visual */}
          <div className="mt-6 flex items-center justify-center gap-6">
            {priorityData.map((p) => {
              const pct = summary.totalComplaints > 0
                ? Math.round((p.value / summary.totalComplaints) * 100)
                : 0;
              return (
                <div key={p.label} className="text-center">
                  <div className={`w-12 h-12 rounded-full ${p.color} mx-auto flex items-center justify-center text-white font-bold text-sm shadow`}>
                    {pct}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{p.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-900">Complaints by Zone</h2>
          </div>
          <BarChart data={areaData} />
        </div>

        {/* Resolution rate by category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="font-bold text-gray-900">Resolution Rate</h2>
          </div>
          <BarChart
            data={[
              { label: 'Streetlights', value: 91, color: 'bg-green-400' },
              { label: 'Garbage', value: 82, color: 'bg-green-400' },
              { label: 'Water', value: 74, color: 'bg-yellow-400' },
              { label: 'Roads', value: 68, color: 'bg-yellow-400' },
              { label: 'Infrastructure', value: 63, color: 'bg-orange-400' },
              { label: 'Drainage', value: 57, color: 'bg-orange-400' },
            ]}
            maxValue={100}
          />
        </div>
      </div>

      {/* AI Recurring Problem Detection */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">AI Recurring Problem Detection</h2>
              <p className="text-indigo-200 text-sm">Pattern analysis from complaint history</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-white text-sm font-semibold">{summary.recurringIssues.length} patterns detected</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {summary.recurringIssues.map((issue, i) => (
            <div key={i} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
                      {issue.count} complaints
                    </span>
                    <span className="text-xs text-gray-400">in last {issue.days} days</span>
                  </div>
                  <p className="font-bold text-gray-900 mb-1">
                    {issue.area} · {issue.category}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    AI detected a <strong>recurring {issue.category.toLowerCase()} problem</strong> in {issue.area}.
                  </p>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
                    <Brain className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-indigo-600 font-semibold mb-0.5">AI Recommendation</p>
                      <p className="text-sm text-indigo-800">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avg resolution time trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-5">Average Resolution Time Trend (Days)</h2>
        <div className="flex items-end gap-4 h-32">
          {[
            { month: 'Mar', days: 4.2 },
            { month: 'Apr', days: 3.8 },
            { month: 'May', days: 3.5 },
            { month: 'Jun', days: 3.1 },
            { month: 'Jul', days: 2.8 },
            { month: 'Aug', days: 2.4 },
          ].map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600">{item.days}d</span>
              <div
                className="w-full bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600"
                style={{ height: `${(item.days / 4.5) * 100}%` }}
              />
              <span className="text-xs text-gray-400">{item.month}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-green-600 font-medium mt-3 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          42% improvement in resolution time over 6 months
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;

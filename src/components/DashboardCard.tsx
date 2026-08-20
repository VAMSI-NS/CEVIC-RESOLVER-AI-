import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'orange' | 'green' | 'purple' | 'indigo';
  trend?: { value: number; label: string };
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100', iconText: 'text-blue-600', value: 'text-blue-700', border: 'border-blue-100' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100', iconText: 'text-red-600', value: 'text-red-700', border: 'border-red-100' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100', iconText: 'text-orange-600', value: 'text-orange-700', border: 'border-orange-100' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100', iconText: 'text-green-600', value: 'text-green-700', border: 'border-green-100' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', iconText: 'text-purple-600', value: 'text-purple-700', border: 'border-purple-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100', iconText: 'text-indigo-600', value: 'text-indigo-700', border: 'border-indigo-100' },
};

/** Dashboard stat card with icon, trend indicator */
const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, subtitle, icon, color, trend }) => {
  const colors = colorMap[color];

  return (
    <div className={`bg-white rounded-2xl border ${colors.border} shadow-sm p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${colors.icon} ${colors.iconText} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend.value > 0 ? 'bg-green-50 text-green-700' : trend.value < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
            {trend.value > 0 ? <TrendingUp className="w-3 h-3" /> : trend.value < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className={`text-3xl font-bold ${colors.value}`}>{value}</p>
        <p className="text-sm font-semibold text-gray-700 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export default DashboardCard;

import React, { useState } from 'react';
import type { MapMarker, Complaint } from '../types';
import { getPriorityColor, getCategoryEmoji } from '../utils/helpers';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { X, MapPin } from 'lucide-react';

interface MapViewProps {
  markers: MapMarker[];
  complaints: Complaint[];
}

/** Simulated SVG/CSS map with complaint markers and popup */
const MapView: React.FC<MapViewProps> = ({ markers, complaints }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');

  const selectedComplaint = selected
    ? complaints.find((c) => c.id === selected)
    : null;

  const filteredMarkers = markers.filter(
    (m) => filter === 'all' || m.priority === filter
  );

  const priorityDotColor = (priority: string) => {
    if (priority === 'HIGH') return '#ef4444';
    if (priority === 'MEDIUM') return '#f97316';
    return '#22c55e';
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-100 rounded-2xl overflow-hidden border border-gray-200">
      {/* Map grid background */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Simulated map roads / zones */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        {/* Horizontal roads */}
        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#94a3b8" strokeWidth="3" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#94a3b8" strokeWidth="5" />
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#94a3b8" strokeWidth="2" />
        {/* Vertical roads */}
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
        <line x1="45%" y1="0" x2="45%" y2="100%" stroke="#94a3b8" strokeWidth="5" />
        <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#94a3b8" strokeWidth="3" />
        <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
        {/* Zones */}
        <rect x="0" y="0" width="45%" height="50%" fill="#6366f1" fillOpacity="0.04" stroke="#6366f1" strokeOpacity="0.1" strokeWidth="1" />
        <rect x="45%" y="0" width="55%" height="50%" fill="#10b981" fillOpacity="0.04" stroke="#10b981" strokeOpacity="0.1" strokeWidth="1" />
        <rect x="0" y="50%" width="45%" height="50%" fill="#f59e0b" fillOpacity="0.04" stroke="#f59e0b" strokeOpacity="0.1" strokeWidth="1" />
        <rect x="45%" y="50%" width="55%" height="50%" fill="#8b5cf6" fillOpacity="0.04" stroke="#8b5cf6" strokeOpacity="0.1" strokeWidth="1" />
        {/* Zone labels */}
        <text x="22%" y="10%" textAnchor="middle" fill="#6366f1" fillOpacity="0.5" fontSize="12" fontWeight="bold">Zone 1</text>
        <text x="72%" y="10%" textAnchor="middle" fill="#10b981" fillOpacity="0.5" fontSize="12" fontWeight="bold">Zone 2</text>
        <text x="22%" y="78%" textAnchor="middle" fill="#f59e0b" fillOpacity="0.5" fontSize="12" fontWeight="bold">Zone 3</text>
        <text x="72%" y="78%" textAnchor="middle" fill="#8b5cf6" fillOpacity="0.5" fontSize="12" fontWeight="bold">Zone 4</text>
      </svg>

      {/* Filter controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {(['all', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-xl shadow-md border border-gray-100 p-3 z-10">
        <p className="text-xs font-bold text-gray-700 mb-2">Legend</p>
        {[['HIGH', '#ef4444'], ['MEDIUM', '#f97316'], ['LOW / Resolved', '#22c55e']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Complaint markers */}
      {filteredMarkers.map((marker) => {
        const dotColor = marker.status === 'Resolved' || marker.status === 'Closed'
          ? '#22c55e'
          : priorityDotColor(marker.priority);

        return (
          <button
            key={marker.id}
            onClick={() => setSelected(selected === marker.complaintId ? null : marker.complaintId)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            title={marker.title}
          >
            {/* Pulse ring */}
            {(marker.priority === 'HIGH' && marker.status !== 'Resolved') && (
              <div
                className="absolute inset-0 rounded-full map-pulse"
                style={{ backgroundColor: dotColor }}
              />
            )}
            {/* Main dot */}
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform"
              style={{ backgroundColor: dotColor }}
            />
            {/* Emoji label */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-white rounded-lg px-2 py-1 shadow-lg border border-gray-100 whitespace-nowrap text-xs font-medium text-gray-700 gap-1">
              <span>{getCategoryEmoji(marker.category)}</span>
              {marker.location.split(',')[0]}
            </div>
          </button>
        );
      })}

      {/* Selected complaint popup */}
      {selectedComplaint && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-30 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getCategoryEmoji(selectedComplaint.category)}</span>
              <div>
                <p className="text-xs text-gray-400 font-mono">{selectedComplaint.id}</p>
                <p className="font-bold text-gray-900 text-sm leading-tight">{selectedComplaint.title}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <PriorityBadge priority={selectedComplaint.priority} size="sm" />
            <StatusBadge status={selectedComplaint.status} size="sm" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <MapPin className="w-3 h-3" />
            {selectedComplaint.location}
          </div>
          <p className="text-xs text-gray-400">{selectedComplaint.department}</p>
        </div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-4 right-4 bg-white/80 text-xs text-gray-400 px-2 py-1 rounded-lg">
        Simulated Map — Demo Mode
      </div>
    </div>
  );
};

export default MapView;

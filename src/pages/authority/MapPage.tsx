import React, { useEffect, useState } from 'react';
import MapView from '../../components/MapView';
import { getAllComplaints } from '../../services/complaintService';
import type { Complaint, MapMarker } from '../../types';
import { Info } from 'lucide-react';

// ============================================================
// Authority Dashboard — Map Page
// ============================================================

/** Build map markers from complaints with deterministic positions */
function buildMarkers(complaints: Complaint[]): MapMarker[] {
  // Assign pseudo-positions based on zone
  const zonePositions: Record<string, { x: number; y: number }[]> = {
    'Zone 1': [{ x: 15, y: 20 }, { x: 25, y: 35 }, { x: 35, y: 15 }, { x: 20, y: 45 }],
    'Zone 2': [{ x: 55, y: 20 }, { x: 65, y: 35 }, { x: 75, y: 15 }, { x: 60, y: 45 }],
    'Zone 3': [{ x: 20, y: 65 }, { x: 35, y: 75 }, { x: 15, y: 85 }, { x: 30, y: 60 }],
    'Zone 4': [{ x: 60, y: 65 }, { x: 70, y: 75 }, { x: 80, y: 85 }, { x: 65, y: 55 }],
    default: [{ x: 45, y: 50 }, { x: 50, y: 30 }, { x: 40, y: 70 }],
  };

  return complaints.map((c, i) => {
    const zone = c.zone || 'default';
    const positions = zonePositions[zone] || zonePositions.default;
    const pos = positions[i % positions.length];
    // Add small jitter for variety
    const jitter = ((i * 7) % 10) - 5;
    return {
      id: `marker-${c.id}`,
      complaintId: c.id,
      x: Math.max(5, Math.min(95, pos.x + jitter)),
      y: Math.max(10, Math.min(90, pos.y + (jitter * 0.5))),
      priority: c.priority,
      status: c.status,
      title: c.title,
      category: c.category,
      department: c.department,
      location: c.location,
    };
  });
}

const MapPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    const all = getAllComplaints();
    setComplaints(all);
    setMarkers(buildMarkers(all));
  }, []);

  const highCount = complaints.filter((c) => c.priority === 'HIGH').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const activeCount = complaints.filter((c) => !['Resolved', 'Closed'].includes(c.status)).length;

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Civic Issue Map</h1>
        <p className="text-gray-500 text-sm mt-0.5">Geographic view of all reported complaints</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-sm font-semibold text-red-700">{highCount} High Priority</span>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full" />
          <span className="text-sm font-semibold text-orange-700">{activeCount} Active</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm font-semibold text-green-700">{resolvedCount} Resolved</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[500px]">
        <MapView markers={markers} complaints={complaints} />
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <p className="text-sm text-indigo-700">
          This is a <strong>simulated map</strong> for demo purposes. 
          In production, integrate with Google Maps, Mapbox, or OpenStreetMap APIs for real GIS mapping.
        </p>
      </div>
    </div>
  );
};

export default MapPage;

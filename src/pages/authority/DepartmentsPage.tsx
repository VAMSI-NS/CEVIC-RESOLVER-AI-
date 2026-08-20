import React from 'react';
import { Building2, Phone, Users, MapPin } from 'lucide-react';
import { departments } from '../../data/mockDepartments';

// ============================================================
// Authority Dashboard — Departments Page
// ============================================================

const DepartmentsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Departments</h1>
        <p className="text-gray-500 text-sm mt-0.5">All municipal departments and their zones</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: dept.color + '20' }}
              >
                <Building2 className="w-5 h-5" style={{ color: dept.color }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">{dept.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{dept.shortName}</p>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {dept.categories.map((cat) => (
                <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                  {cat}
                </span>
              ))}
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span><strong className="text-gray-800">{dept.head}</strong> · Department Head</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{dept.contact}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>{dept.zones.join(', ')}</span>
              </div>
            </div>

            {/* Teams */}
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-2">Field Teams</p>
              <div className="flex flex-wrap gap-1.5">
                {dept.teams.map((team) => (
                  <span
                    key={team}
                    className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: dept.color }}
                  >
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentsPage;

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface Props {
  logs: AuditLogEntry[];
}

export const AuditActivityChart: React.FC<Props> = ({ logs }) => {
  if (!logs || logs.length === 0) return null;

  // Aggregate by action
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    const act = log.action || 'OTHER';
    counts[act] = (counts[act] || 0) + 1;
  });

  const data = [
    { name: 'Narratives', count: counts['NARRATIVE_GENERATED'] || 0, color: '#8b5cf6' },
    { name: 'UR Decisions', count: counts['UR_DECISION_EVALUATED'] || 0, color: '#0d9488' },
    { name: 'FHIR Fetches', count: (counts['FHIR_PATIENT_FETCHED'] || 0) + (counts['FHIR_PATIENT_ACCESSED'] || 0), color: '#3b82f6' },
    { name: 'Raw Bundles', count: counts['FHIR_RAW_BUNDLE_INSPECTED'] || 0, color: '#f59e0b' },
  ];

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4 text-teal-600" />
          <span>Case Governance Activity Breakdown</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">{logs.length} Recorded Events</span>
      </div>

      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip
              formatter={(value: unknown) => [`${Number(value || 0)} events`, 'Logged']}
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

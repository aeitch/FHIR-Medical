import React from 'react';
import { Shield, Clock, Hash, User } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface Props {
  logs: AuditLogEntry[];
  loading: boolean;
}

export const AuditLogViewer: React.FC<Props> = ({ logs, loading }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">CLAIR Append-Only Audit Trail</h3>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Immutable (INSERT-Only Policy)
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Every FHIR pull, UR decision, and LLM narrative is recorded with correlation IDs for HIPAA audit controls (45 CFR § 164.312(b)).
      </p>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse">Loading audit trail...</div>
      ) : logs.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">No actions recorded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Patient ID</th>
                <th className="py-2.5 px-3">Correlation ID</th>
                <th className="py-2.5 px-3">Model / Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{log.actor}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{log.patient_id}</td>
                  <td className="py-2.5 px-3 text-teal-700 whitespace-nowrap flex items-center gap-1">
                    <Hash className="w-3 h-3 text-teal-500" />
                    <span className="truncate max-w-[120px]">{log.correlation_id}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {log.model ? (
                      <span className="text-emerald-700 font-medium">
                        {log.model} (${log.cost_usd ? log.cost_usd.toFixed(5) : '0.00'})
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

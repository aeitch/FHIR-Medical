import React, { useState } from 'react';
import { User, FileText, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { PatientSummary } from '../types';

interface Props {
  patients: PatientSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  onFetchCustomPatient: (patientId: string) => Promise<void>;
  loading: boolean;
}

export const PatientSelector: React.FC<Props> = ({
  patients,
  selectedId,
  onSelect,
  onFetchCustomPatient,
  loading,
}) => {
  const [customId, setCustomId] = useState('');
  const [fetchingCustom, setFetchingCustom] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleCustomFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customId.trim()) return;

    setFetchingCustom(true);
    setFetchError(null);
    try {
      await onFetchCustomPatient(customId.trim());
      setCustomId('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Patient ID not found in Epic sandbox';
      setFetchError(msg);
    } finally {
      setFetchingCustom(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white p-5 rounded-xl border border-slate-200">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-24 bg-slate-100 rounded-lg"></div>
          <div className="h-24 bg-slate-100 rounded-lg"></div>
          <div className="h-24 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Select Active Patient for Utilization Review
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
          Epic on FHIR Sandbox · Live R4 Feed
        </span>
      </div>

      {/* Live Custom Patient ID Search Bar (Auditor-Grade Feature P3) */}
      <form onSubmit={handleCustomFetch} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Enter arbitrary Epic Sandbox Patient ID (e.g. erXuFYUfucBZaryVpgxafgw3)..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={fetchingCustom || !customId.trim()}
            className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm shrink-0"
          >
            {fetchingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{fetchingCustom ? 'Querying Epic...' : 'Fetch from Epic Sandbox'}</span>
          </button>
        </div>
        {fetchError && <p className="text-[11px] font-semibold text-rose-600">{fetchError}</p>}
      </form>

      {/* Preset Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {patients.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`text-left p-3.5 rounded-lg border transition-all relative ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/50 shadow-sm ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-teal-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              <div className="font-bold text-slate-900 text-sm">{p.name}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                <span>{p.mrn}</span>
                <span>•</span>
                <span>{p.gender.toUpperCase()}</span>
                <span>•</span>
                <span>{p.age} yrs</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 flex items-start gap-1.5 line-clamp-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{p.scenario}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

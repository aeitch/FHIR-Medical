import React, { useState } from 'react';
import { User, FileText, CheckCircle2, Search, Loader2, Server, ChevronLeft, ChevronRight } from 'lucide-react';
import { PatientSummary } from '../types';

interface Props {
  patients: PatientSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  onFetchCustomPatient: (patientId: string, server: string) => Promise<void>;
  loading: boolean;
  selectedServer: string;
  onServerChange: (server: string) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export const PatientSelector: React.FC<Props> = ({
  patients,
  selectedId,
  onSelect,
  onFetchCustomPatient,
  loading,
  selectedServer,
  onServerChange,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const [customId, setCustomId] = useState('');
  const [fetchingCustom, setFetchingCustom] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const sampleIdsByServer: Record<string, Array<{ id: string; label: string }>> = {
    epic: [
      { id: 'erXuFYUfucBZaryVpgxafgw3', label: 'Camila Lopez (Cardiac)' },
      { id: 'eq081-VQEgP8FsSTUDALVUQ3', label: 'Derrick Lin (Syncope)' },
      { id: 'egqBHVfQCU3FAoDRSmkeKzg3', label: 'Jason Miller (COPD)' },
      { id: 'e1-2G0l2g-V7S.3fT.ZqBqg3', label: 'Desiree (Sepsis)' },
      { id: 'e63wRT.t-agODK-iGNc.h-A3', label: 'Bradley (Chest Pain)' },
    ],
    smart: [
      { id: 'd4fb3bba-73a9-4b82-a0bc-678d47f386b4', label: 'Babara Rice (SMART Live)' },
      { id: 'd48ac962-78c6-46cf-ba33-a24771bfa0e4', label: 'Gerlach (SMART Live)' },
    ],
    hapi: [
      { id: 'sindhu-syn-000004', label: 'Synthetic Patient (HAPI Live)' },
    ],
    local: [
      { id: 'synthetic-pt-001', label: 'Camila Lopez (Seed)' },
      { id: 'synthetic-pt-002', label: 'Derrick Lin (Seed)' },
      { id: 'synthetic-pt-003', label: 'Jason Miller (Seed)' },
    ],
  };

  const currentSamples = sampleIdsByServer[selectedServer] || sampleIdsByServer.epic;

  const handleCustomFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customId.trim()) return;

    setFetchingCustom(true);
    setFetchError(null);
    try {
      await onFetchCustomPatient(customId.trim(), selectedServer);
      setCustomId('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Patient not found in ${selectedServer}`;
      setFetchError(msg);
    } finally {
      setFetchingCustom(false);
    }
  };

  const handleSampleClick = async (sampleId: string) => {
    setCustomId(sampleId);
    setFetchingCustom(true);
    setFetchError(null);
    try {
      await onFetchCustomPatient(sampleId, selectedServer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Patient not found in ${selectedServer}`;
      setFetchError(msg);
    } finally {
      setFetchingCustom(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Top Header & FHIR Server Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active FHIR Patient Directory & Search
          </h2>
        </div>

        {/* Server Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-teal-600" />
            <span>Server:</span>
          </span>
          <select
            value={selectedServer}
            onChange={(e) => onServerChange(e.target.value)}
            className="text-xs font-bold border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="epic">Epic on FHIR Sandbox (OAuth)</option>
            <option value="smart">SMART Health IT Public R4 (Open)</option>
            <option value="hapi">HAPI FHIR Public R4 (Open)</option>
            <option value="local">Offline Synthetic Store</option>
          </select>
        </div>
      </div>

      {/* Live Custom Patient ID Search Bar */}
      <form onSubmit={handleCustomFetch} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder={`Enter arbitrary ${selectedServer.toUpperCase()} Patient ID (e.g. ${currentSamples[0]?.id || 'ID'})...`}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={fetchingCustom || !customId.trim()}
            className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm shrink-0"
          >
            {fetchingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{fetchingCustom ? 'Querying...' : `Fetch from ${selectedServer.toUpperCase()}`}</span>
          </button>
        </div>

        {/* Quick Sample IDs Helper Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Quick Samples:</span>
          {currentSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSampleClick(sample.id)}
              className="text-[10px] bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 px-2 py-0.5 rounded font-mono transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {fetchError && <p className="text-[11px] font-semibold text-rose-600 pt-1">{fetchError}</p>}
      </form>

      {/* Patient Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-pulse py-2">
          <div className="h-24 bg-slate-100 rounded-lg"></div>
          <div className="h-24 bg-slate-100 rounded-lg"></div>
          <div className="h-24 bg-slate-100 rounded-lg"></div>
        </div>
      ) : patients.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          No patient records returned from {selectedServer.toUpperCase()}. Try searching by ID above.
        </div>
      ) : (
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
                <div className="font-bold text-slate-900 text-sm truncate pr-6">{p.name}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                  <span className="truncate">{p.mrn}</span>
                  <span>•</span>
                  <span>{p.gender.toUpperCase()}</span>
                  <span>•</span>
                  <span>{p.age} yrs</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex items-start gap-1.5 line-clamp-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="truncate">{p.scenario}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination Controls (Requirement 2) */}
      <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-800">{patients.length}</strong> of{' '}
            <strong className="text-slate-800">{total}</strong> records
          </span>
          <span>(Page {page} of {totalPages})</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Rows per page */}
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-slate-200 rounded px-2 py-1 text-xs bg-slate-50 font-semibold"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Prev / Next Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold px-2 text-slate-800">{page}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

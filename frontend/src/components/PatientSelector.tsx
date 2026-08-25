import React from 'react';
import { User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { PatientSummary } from '../types';

interface Props {
  patients: PatientSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading: boolean;
}

export const PatientSelector: React.FC<Props> = ({ patients, selectedId, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-white p-4 rounded-xl border border-slate-200">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-24 bg-slate-100 rounded-lg"></div>
          <div className="h-24 bg-slate-100 rounded-lg"></div>
          <div className="h-24 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Select Synthetic FHIR Patient</h2>
        </div>
        <span className="text-xs text-slate-500">Synthea R4 Standard Fixtures</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
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

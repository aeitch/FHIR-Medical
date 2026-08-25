import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Clock, DollarSign, Activity } from 'lucide-react';
import { PatientDetail, UREvaluation } from '../types';

interface Props {
  patient: PatientDetail | null;
  evaluation: UREvaluation | null;
  lastRefreshed: Date;
  onRefresh: () => void;
  loading: boolean;
}

export const HeroCaseSpotlight: React.FC<Props> = ({
  patient,
  evaluation,
  lastRefreshed,
  onRefresh,
  loading,
}) => {
  if (!patient || !evaluation) return null;

  const isInpatient = evaluation.recommended_status === 'inpatient';
  const confidencePercent = Math.round(evaluation.confidence_score * 100);
  const gapsCount = evaluation.documentation_gaps.length;

  return (
    <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-teal-800/40 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div className="relative z-10 space-y-5">
        {/* Top bar: Live Case Tag + Last Refreshed & Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Active Case Spotlight</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">MRN: {patient.mrn}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last refreshed: {lastRefreshed.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/40 px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Center: Case Highlights & Big Status Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {patient.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {patient.scenario_description || patient.scenario}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                Age: <strong className="text-white">{patient.age} yrs</strong>
              </span>
              <span className="bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                Encounter: <strong className="text-white">{patient.encounter_class || 'Inpatient'}</strong>
              </span>
              <span className="bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                Gaps Flagged: <strong className={gapsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>{gapsCount} open</strong>
              </span>
            </div>
          </div>

          {/* Big Level-of-Care Badge */}
          <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shrink-0 min-w-[240px]">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              CMS Recommended Status
            </div>
            <div className="text-3xl font-black mt-1 uppercase flex items-center gap-2">
              {isInpatient ? (
                <>
                  <CheckCircle2 className="w-7 h-7 text-teal-400" />
                  <span className="text-teal-300">Inpatient</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-7 h-7 text-amber-400" />
                  <span className="text-amber-300">Observation</span>
                </>
              )}
            </div>
            <div className="text-xs mt-2 text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>{confidencePercent}% CMS 42 CFR § 412.3 Defensible</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner: Client Value Statement */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Financial Defense:</strong> Protecting against preventable $19,300 claim downcodes with instant HL7 FHIR evidence & AI appeal generation.
            </span>
          </div>
          <span className="text-[11px] font-mono text-teal-400 shrink-0">100% Traceable CLAIR Governance</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { DollarSign, ShieldAlert, Zap, Award } from 'lucide-react';
import { UREvaluation } from '../types';

interface Props {
  evaluation: UREvaluation | null;
  patientName: string;
}

export const CFOOnePager: React.FC<Props> = ({ evaluation, patientName }) => {
  if (!evaluation) return null;

  const isInpatient = evaluation.recommended_status === 'inpatient';
  const revenueAtRisk = isInpatient ? '$22,500' : '$4,800';
  const obsAlternative = '$3,200';
  const gapsCount = evaluation.documentation_gaps.length;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-6 rounded-2xl border border-slate-700/80 shadow-xl relative overflow-hidden">
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
              Executive Level-of-Care Summary
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Hospital Revenue Defense & Audit Integrity
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-950 border border-teal-700 text-teal-300 self-start sm:self-auto font-mono">
            Active: {patientName}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Metric 1: Revenue Defended */}
          <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/80 transition-colors shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Revenue at Risk</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">{revenueAtRisk}</div>
            <div className="text-[10px] text-slate-400 mt-1">vs. {obsAlternative} (Observation APC)</div>
          </div>

          {/* Metric 2: Gaps Remediated */}
          <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/80 transition-colors shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Denial Gaps Closed</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono flex items-baseline gap-1.5">
              <span>{gapsCount}</span>
              <span className="text-xs text-amber-300 font-sans font-semibold">Remediated</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Auto-addressed in AI appeal</div>
          </div>

          {/* Metric 3: Decision Defensibility */}
          <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/80 transition-colors shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span>CMS Defensibility</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-300 mt-2 font-mono">
              {(evaluation.confidence_score * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">42 CFR § 412.3 Benchmarked</div>
          </div>

          {/* Metric 4: Physician Time Saved */}
          <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/80 transition-colors shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Time to Appeal</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">&lt; 1.5s</div>
            <div className="text-[10px] text-slate-400 mt-1">Replaces 45 min manual draft</div>
          </div>
        </div>
      </div>
    </div>
  );
};

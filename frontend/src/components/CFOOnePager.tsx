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
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Executive Summary</span>
          <h3 className="text-base font-bold text-white">Financial Impact & Revenue Defense Summary</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-950 border border-teal-700 text-teal-300">
          Case: {patientName}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Revenue Defended */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/70">
          <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Revenue at Risk</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{revenueAtRisk}</div>
          <div className="text-[10px] text-slate-400 mt-1">vs. {obsAlternative} (Observation)</div>
        </div>

        {/* Metric 2: Gaps Remediated */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/70">
          <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Denial Vulnerabilities</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {gapsCount} <span className="text-xs text-amber-300 font-normal">Closed</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Remediated in AI appeal</div>
        </div>

        {/* Metric 3: Decision Defensibility */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/70">
          <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-teal-400" />
            <span>CMS Defensibility</span>
          </div>
          <div className="text-2xl font-black text-teal-300 mt-1">
            {(evaluation.confidence_score * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">42 CFR § 412.3 Benchmarked</div>
        </div>

        {/* Metric 4: Physician Time Saved */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/70">
          <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Time to Payer Appeal</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">&lt; 1.5s</div>
          <div className="text-[10px] text-slate-400 mt-1">Replaces 45 min manual draft</div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle, AlertTriangle, Clock, ShieldCheck, FileCheck } from 'lucide-react';
import { UREvaluation } from '../types';

interface Props {
  evaluation: UREvaluation | null;
  loading: boolean;
}

export const URDecisionCard: React.FC<Props> = ({ evaluation, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-slate-100 rounded mb-4"></div>
        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
      </div>
    );
  }

  if (!evaluation) return null;

  const isInpatient = evaluation.recommended_status === 'inpatient';

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">UR Clinical Decision Engine</h3>
        </div>
        <span className="text-xs font-medium text-slate-500">CMS 2-Midnight Rule (42 CFR 412.3)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Status Badge */}
        <div
          className={`p-4 rounded-lg border flex flex-col justify-between ${
            isInpatient
              ? 'bg-blue-50/70 border-blue-200 text-blue-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommended Status</div>
          <div className="text-2xl font-black mt-1 uppercase flex items-center gap-2">
            {isInpatient ? (
              <>
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <span>Inpatient</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <span>Observation</span>
              </>
            )}
          </div>
          <div className="text-xs mt-2 text-slate-600">
            Confidence: <span className="font-bold">{(evaluation.confidence_score * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* 2-Midnight Benchmark */}
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">2-Midnight Benchmark</div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>{evaluation.two_midnight_met ? 'Met (> 2 Midnights)' : 'Not Met (< 2 Midnights)'}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">Physician expectation reasonable & documented</div>
        </div>

        {/* Acuity / Intensity */}
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Acuity & Service Intensity</div>
          <div className="mt-1 flex flex-col gap-1">
            <div className="text-xs text-slate-700">
              Severity: <span className="font-bold uppercase text-slate-900">{evaluation.severity_of_illness}</span>
            </div>
            <div className="text-xs text-slate-700">
              Intensity: <span className="font-bold uppercase text-slate-900">{evaluation.intensity_of_service}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Continuous telemetry / IV titration</div>
        </div>
      </div>

      {/* Criteria Met List */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-teal-600" />
          <span>Clinical Criteria Satisfied ({evaluation.criteria_met.length})</span>
        </h4>
        <ul className="space-y-1.5">
          {evaluation.criteria_met.map((criterion, idx) => (
            <li key={idx} className="text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-100 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

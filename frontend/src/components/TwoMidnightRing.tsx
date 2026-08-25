import React from 'react';
import { Clock, CheckSquare } from 'lucide-react';
import { UREvaluation } from '../types';

interface Props {
  evaluation: UREvaluation | null;
}

export const TwoMidnightRing: React.FC<Props> = ({ evaluation }) => {
  if (!evaluation) return null;

  const score = Math.round(evaluation.confidence_score * 100);
  const isMet = evaluation.two_midnight_met;
  const criteriaCount = evaluation.criteria_met.length;
  const maxCriteria = Math.max(criteriaCount, 4);
  const criteriaRatio = Math.min(100, Math.round((criteriaCount / maxCriteria) * 100));

  // Circular stroke-dasharray calculations for SVG ring (Radius = 46, Circumference = 289)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              CMS 2-Midnight Benchmark
            </h4>
            <span className="text-[10px] text-slate-400">42 CFR § 412.3 Threshold</span>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            isMet
              ? 'bg-teal-50 text-teal-800 border-teal-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {isMet ? 'Met (> 48h Inpatient)' : 'Short-Stay (< 48h)'}
        </span>
      </div>

      {/* SVG Dual-Layer Medical Donut Ring */}
      <div className="py-2 flex flex-col items-center justify-center">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="11"
              fill="none"
            />

            {/* Animated Active Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#ringGrad)"
              strokeWidth="11"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Digital Metric with Pulse */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{score}</span>
              <span className="text-xs font-bold text-teal-600">%</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 -mt-0.5">
              Defensibility
            </span>
          </div>
        </div>
      </div>

      {/* Criteria Progress Bar Footer */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinical Criteria Satisfied:</span>
          </span>
          <span className="font-bold text-teal-700 font-mono">
            {criteriaCount} of {maxCriteria} Met ({criteriaRatio}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-teal-600 to-teal-400 h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${criteriaRatio}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

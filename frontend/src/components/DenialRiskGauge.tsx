import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UREvaluation } from '../types';

interface Props {
  evaluation: UREvaluation | null;
}

export const DenialRiskGauge: React.FC<Props> = ({ evaluation }) => {
  if (!evaluation) return null;

  const gapsCount = evaluation.documentation_gaps.length;
  let riskScore = 15; // default low

  if (evaluation.recommended_status === 'inpatient') {
    if (gapsCount >= 2) {
      riskScore = 78; // High denial risk due to multiple documentation gaps
    } else if (gapsCount === 1) {
      riskScore = 42; // Moderate risk
    } else {
      riskScore = 12; // Very low risk
    }
  } else {
    // Observation status
    riskScore = gapsCount > 0 ? 35 : 18;
  }

  // Determine color and status
  let riskLevel = 'Low Denial Risk';
  let riskColor = '#10b981'; // green
  let riskBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let needleRotation = -60; // -90 to +90 degrees

  if (riskScore > 65) {
    riskLevel = 'High Denial Risk (Audit Target)';
    riskColor = '#f43f5e'; // rose/red
    riskBg = 'bg-rose-50 text-rose-800 border-rose-200';
    needleRotation = 60;
  } else if (riskScore > 30) {
    riskLevel = 'Moderate Denial Risk (Requires Review)';
    riskColor = '#f59e0b'; // amber
    riskBg = 'bg-amber-50 text-amber-800 border-amber-200';
    needleRotation = 0;
  }

  // Calculate needle angle based on risk score (0 to 100 -> -80 to +80 deg)
  const angle = ((riskScore - 50) / 50) * 80;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-teal-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payer Denial Risk Dial</h4>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${riskBg}`}>
          {riskLevel}
        </span>
      </div>

      {/* SVG Semi-Circle Dial Gauge */}
      <div className="py-2 flex flex-col items-center justify-center">
        <div className="relative w-48 h-28 flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            {/* Arc Background */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Low Risk Segment (Green) */}
            <path
              d="M 20 100 A 80 80 0 0 1 65 37"
              fill="none"
              stroke="#10b981"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Moderate Risk Segment (Amber) */}
            <path
              d="M 67 35 A 80 80 0 0 1 133 35"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="16"
            />
            {/* High Risk Segment (Red) */}
            <path
              d="M 135 37 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Pivot Center */}
            <circle cx="100" cy="100" r="7" fill="#1e293b" />
            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
              transform={`rotate(${angle} 100 100)`}
              className="transition-transform duration-700 ease-out"
            />
          </svg>
          <div className="absolute bottom-0 text-center">
            <span className="text-2xl font-black text-slate-900 font-mono">{riskScore}%</span>
            <div className="text-[10px] uppercase font-bold text-slate-400">Payer Exposure</div>
          </div>
        </div>
      </div>

      {/* Risk Drivers summary */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
        <div className="text-[11px] font-bold text-slate-600 uppercase">Primary Risk Drivers:</div>
        {gapsCount > 0 ? (
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/70 px-2 py-1 rounded">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{gapsCount} documentation gap(s) open</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/70 px-2 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Complete clinical documentation</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UREvaluation } from '../types';

interface Props {
  evaluation: UREvaluation | null;
}

export const DenialRiskGauge: React.FC<Props> = ({ evaluation }) => {
  if (!evaluation) return null;

  const gapsCount = evaluation.documentation_gaps.length;
  let riskScore = 15;

  if (evaluation.recommended_status === 'inpatient') {
    if (gapsCount >= 2) {
      riskScore = 78; // High denial risk
    } else if (gapsCount === 1) {
      riskScore = 42; // Moderate risk
    } else {
      riskScore = 12; // Very low risk
    }
  } else {
    riskScore = gapsCount > 0 ? 35 : 18;
  }

  let riskLevel = 'Low Denial Risk';
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let accentColor = '#10b981';

  if (riskScore > 65) {
    riskLevel = 'High Denial Vulnerability';
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    accentColor = '#f43f5e';
  } else if (riskScore > 30) {
    riskLevel = 'Moderate Risk (Review Required)';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    accentColor = '#f59e0b';
  }

  // Calculate needle rotation angle (-90 deg to +90 deg)
  const needleAngle = -90 + (riskScore / 100) * 180;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Payer Denial Risk Dial
            </h4>
            <span className="text-[10px] text-slate-400">Post-Payment Audit Exposure</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
          {riskLevel}
        </span>
      </div>

      {/* SVG Speedometer Gauge */}
      <div className="py-2 flex flex-col items-center justify-center">
        <div className="relative w-56 h-32 flex items-center justify-center">
          <svg viewBox="0 0 240 140" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="35%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="75%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background Track */}
            <path
              d="M 30 115 A 90 90 0 0 1 210 115"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="20"
              strokeLinecap="round"
            />

            {/* Colored Gradient Track */}
            <path
              d="M 30 115 A 90 90 0 0 1 210 115"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="18"
              strokeLinecap="round"
            />

            {/* Scale Tick Markers */}
            <text x="24" y="132" fontSize="9" fontWeight="700" fill="#94a3b8">0%</text>
            <text x="113" y="20" fontSize="9" fontWeight="700" fill="#94a3b8">50%</text>
            <text x="202" y="132" fontSize="9" fontWeight="700" fill="#94a3b8">100%</text>

            {/* Tapered Sleek Needle with Smooth Transition */}
            <g transform={`rotate(${needleAngle} 120 115)`} filter="url(#needleShadow)" className="transition-transform duration-700 ease-out">
              <polygon
                points="116,115 124,115 121,38 119,38"
                fill="#0f172a"
              />
              <circle cx="120" cy="115" r="8" fill="#0f172a" />
              <circle cx="120" cy="115" r="4" fill={accentColor} />
            </g>
          </svg>

          {/* Clean Non-Overlapping Digital Score Below */}
          <div className="absolute -bottom-1 flex flex-col items-center">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{riskScore}</span>
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 -mt-0.5">
              Denial Probability
            </span>
          </div>
        </div>
      </div>

      {/* Risk Drivers Summary Footer */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase">
          <span>Primary Risk Drivers</span>
          <span className="text-[10px] text-slate-400 font-normal">Audit Risk</span>
        </div>
        {gapsCount > 0 ? (
          <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/80">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{gapsCount} open documentation gap(s) require remediation</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">All CMS inpatient clinical criteria satisfied</span>
          </div>
        )}
      </div>
    </div>
  );
};

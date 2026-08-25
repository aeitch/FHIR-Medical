import React from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { ClinicalObservation } from '../types';

interface Props {
  observations: ClinicalObservation[];
}

export const LOINCReferenceBars: React.FC<Props> = ({ observations }) => {
  if (!observations || observations.length === 0) {
    return (
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-500 italic">
        No LOINC observations available for this patient.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {observations.map((obs, idx) => {
        const coding = obs.code?.coding?.[0] || {};
        const code = coding.code || '';
        const name = coding.display || obs.code?.text || 'Laboratory Biomarker';
        const val = obs.valueQuantity?.value;
        const unit = obs.valueQuantity?.unit || obs.valueQuantity?.code || '';

        // Dynamic thresholds and status calculation
        let isCritical = false;
        let isAbnormal = false;
        let normalText = 'Reference: Standard';
        let barPercentage = 50;
        let barColor = 'bg-teal-500';

        if (code === '33762-6' || name.toLowerCase().includes('bnp')) {
          // NT-proBNP (< 450 is normal, > 1000 is severe)
          normalText = 'Normal: < 450 pg/mL';
          if (val !== undefined && val > 1000) {
            isCritical = true;
            barPercentage = Math.min(100, Math.round((val / 8000) * 100));
            barColor = 'bg-rose-500';
          } else if (val !== undefined && val > 450) {
            isAbnormal = true;
            barPercentage = 60;
            barColor = 'bg-amber-500';
          }
        } else if (code === '2708-6' || name.toLowerCase().includes('oxygen')) {
          // SpO2 (95-100% normal, < 90% severe hypoxia)
          normalText = 'Normal: 95 - 100%';
          if (val !== undefined && val < 90) {
            isCritical = true;
            barPercentage = val;
            barColor = 'bg-rose-500';
          } else if (val !== undefined && val < 95) {
            isAbnormal = true;
            barPercentage = val;
            barColor = 'bg-amber-500';
          } else {
            barPercentage = val || 98;
            barColor = 'bg-teal-500';
          }
        } else if (code === '2019-8' || name.toLowerCase().includes('carbon dioxide')) {
          // PaCO2 (35-45 normal, > 50 hypercapnic respiratory failure)
          normalText = 'Normal: 35 - 45 mmHg';
          if (val !== undefined && val > 50) {
            isCritical = true;
            barPercentage = 90;
            barColor = 'bg-rose-500';
          }
        } else if (code === '49563-0' || name.toLowerCase().includes('troponin')) {
          // Troponin (< 0.04 normal)
          normalText = 'Normal: < 0.04 ng/mL';
          if (val !== undefined && val > 0.04) {
            isCritical = true;
            barPercentage = 85;
            barColor = 'bg-rose-500';
          } else {
            barPercentage = 15;
            barColor = 'bg-teal-500';
          }
        }

        return (
          <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>{name}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">LOINC: {code || 'N/A'}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-slate-900 font-mono">
                  {val !== undefined ? `${val} ${unit}` : 'Recorded'}
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800'
                      : isAbnormal
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isCritical ? 'Critical / Inpatient Criterion' : isAbnormal ? 'Borderline' : 'Normal Reference'}
                </span>
              </div>
            </div>

            {/* Visual Value Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${barPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0</span>
                <span className="font-semibold text-slate-600">{normalText}</span>
                <span>Max Alert</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

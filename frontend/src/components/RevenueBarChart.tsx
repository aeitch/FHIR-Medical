import React from 'react';
import { DollarSign, ShieldCheck } from 'lucide-react';
import { UREvaluation } from '../types';

interface Props {
  evaluation: UREvaluation | null;
}

export const RevenueBarChart: React.FC<Props> = ({ evaluation }) => {
  if (!evaluation) return null;

  const isInpatient = evaluation.recommended_status === 'inpatient';
  const inpatientVal = isInpatient ? 22500 : 18000;
  const observationVal = 3200;
  const spreadVal = inpatientVal - observationVal;

  const maxVal = Math.max(inpatientVal, 25000);

  const items = [
    {
      label: 'Inpatient (MS-DRG)',
      amount: inpatientVal,
      formatted: `$${inpatientVal.toLocaleString()}`,
      color: 'from-teal-600 to-teal-400',
      bgColor: 'bg-teal-500',
      percent: Math.round((inpatientVal / maxVal) * 100),
      desc: 'Full Acute Inpatient Payment',
    },
    {
      label: 'Observation (APC)',
      amount: observationVal,
      formatted: `$${observationVal.toLocaleString()}`,
      color: 'from-amber-500 to-amber-400',
      bgColor: 'bg-amber-500',
      percent: Math.round((observationVal / maxVal) * 100),
      desc: 'Outpatient Holding Reimbursement',
    },
    {
      label: 'Revenue Defended',
      amount: spreadVal,
      formatted: `+$${spreadVal.toLocaleString()}`,
      color: 'from-indigo-600 to-indigo-400',
      bgColor: 'bg-indigo-500',
      percent: Math.round((spreadVal / maxVal) * 100),
      desc: 'Downcode Exposure Protected',
    },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Reimbursement & Revenue Spread
            </h4>
            <span className="text-[10px] text-slate-400">CMS IPPS vs OPPS Benchmarks</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          +${spreadVal.toLocaleString()} Defended
        </span>
      </div>

      {/* Visual Comparative Horizontal Bars with Direct Value Badges */}
      <div className="py-2 space-y-3.5">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">{item.label}</span>
              <span className="font-black font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {item.formatted}
              </span>
            </div>

            {/* Visual Bar Track */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-700 shadow-sm`}
                style={{ width: `${Math.max(item.percent, 8)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{item.desc}</span>
              <span className="font-mono">{item.percent}% scale</span>
            </div>
          </div>
        ))}
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Downcode Protection:</span>
        </span>
        <span className="font-bold text-slate-800">100% Audit Defensible</span>
      </div>
    </div>
  );
};

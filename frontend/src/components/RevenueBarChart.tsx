import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { DollarSign } from 'lucide-react';
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

  const data = [
    { name: 'Inpatient (DRG)', amount: inpatientVal, color: '#0d9488' }, // teal
    { name: 'Observation (APC)', amount: observationVal, color: '#f59e0b' }, // amber
    { name: 'Revenue at Risk', amount: spreadVal, color: '#3b82f6' }, // blue
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Reimbursement & Revenue Spread (USD)
          </h4>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          +${spreadVal.toLocaleString()} Defended
        </span>
      </div>

      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} width={110} />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Reimbursement']}
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between items-center">
        <span>CMS IPPS National Average Baseline</span>
        <span className="font-semibold text-slate-700">Downcode Protection: 100%</span>
      </div>
    </div>
  );
};

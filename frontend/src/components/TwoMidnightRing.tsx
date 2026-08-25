import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckSquare } from 'lucide-react';
import { UREvaluation } from '../types';

interface Props {
  evaluation: UREvaluation | null;
}

export const TwoMidnightRing: React.FC<Props> = ({ evaluation }) => {
  if (!evaluation) return null;

  const score = Math.round(evaluation.confidence_score * 100);
  const data = [
    { name: 'Confidence', value: score, color: '#0d9488' }, // teal
    { name: 'Residual', value: 100 - score, color: '#e2e8f0' }, // slate
  ];

  const criteriaCount = evaluation.criteria_met.length;
  const maxCriteria = Math.max(criteriaCount, 4);
  const criteriaRatio = Math.min(100, Math.round((criteriaCount / maxCriteria) * 100));

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">CMS 2-Midnight Benchmark</h4>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
          {evaluation.two_midnight_met ? 'Met (> 48 Hours)' : 'Short-Stay (< 48h)'}
        </span>
      </div>

      {/* Donut Chart with Center Label */}
      <div className="relative h-32 flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={50}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-slate-900 font-mono">{score}%</span>
          <span className="text-[9px] font-bold uppercase text-slate-400">Confidence</span>
        </div>
      </div>

      {/* Criteria-Met Progress Bar */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>Criteria Satisfied:</span>
          </span>
          <span className="font-bold text-teal-700">{criteriaCount} of {maxCriteria} Met</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${criteriaRatio}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

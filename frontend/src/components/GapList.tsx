import React from 'react';
import { AlertCircle, FileQuestion, ArrowRight } from 'lucide-react';

interface Props {
  gaps: string[];
}

export const GapList: React.FC<Props> = ({ gaps }) => {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
          <FileQuestion className="w-4 h-4" />
          <span>Documentation Integrity: Complete</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">No documentation gaps flagged for this encounter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Flagged Documentation Gaps ({gaps.length})
          </h3>
        </div>
        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Payer Denial Prevention
        </span>
      </div>

      <div className="space-y-2.5">
        {gaps.map((gap, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                Gap {idx + 1}
              </span>
              <p className="text-xs font-medium text-slate-800">{gap}</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 shrink-0">
              <span>Auto-Remediated in Narrative</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

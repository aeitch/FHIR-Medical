import React from 'react';
import { DollarSign, Cpu, Zap, BarChart2 } from 'lucide-react';
import { FinOpsSummary } from '../types';

interface Props {
  metrics: FinOpsSummary;
}

export const FinOpsWidget: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">FinOps Demo Token & Cost Tracker</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
          Target Run Cost: ~$0.00
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Cost */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Cumulative Cost</div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            ${metrics.total_cost_usd.toFixed(5)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Vertex AI Flash Tier</div>
        </div>

        {/* Requests */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">LLM Invocations</div>
          <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{metrics.total_requests}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">100% Traceable</div>
        </div>

        {/* Total Tokens */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Tokens</div>
          <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>{(metrics.total_prompt_tokens + metrics.total_completion_tokens).toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {metrics.total_prompt_tokens} in / {metrics.total_completion_tokens} out
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Avg Response Time</div>
          <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>{metrics.average_latency_ms.toFixed(0)} ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">P95 Sub-second</div>
        </div>
      </div>
    </div>
  );
};

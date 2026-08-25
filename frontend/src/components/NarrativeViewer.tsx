import React, { useState } from 'react';
import { Sparkles, Copy, Check, ShieldAlert, Cpu, RefreshCw, BookOpen } from 'lucide-react';
import { NarrativeResult } from '../types';

interface Props {
  narrative: NarrativeResult | null;
  loading: boolean;
  onGenerate: (targetPayer: string, provider: string) => void;
}

export const NarrativeViewer: React.FC<Props> = ({ narrative, loading, onGenerate }) => {
  const [copied, setCopied] = useState(false);
  const [targetPayer, setTargetPayer] = useState('Medicare Advantage / Commercial');
  const [provider, setProvider] = useState('gemini-2.5-flash');

  const handleCopy = () => {
    if (!narrative) return;
    navigator.clipboard.writeText(narrative.narrative_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">LLM Payer-Style Medical Necessity Narrative</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={targetPayer}
            onChange={(e) => setTargetPayer(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="Medicare Advantage / Commercial">Medicare Advantage</option>
            <option value="Traditional Medicare FFS">Medicare FFS (CMS 2-Midnight)</option>
            <option value="Commercial Managed Care">Commercial PPO/HMO</option>
          </select>

          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="gemini-2.5-flash">Vertex AI: gemini-2.5-flash</option>
            <option value="ollama-gemma">Local Ollama: gemma ($0)</option>
            <option value="mock-llm">Clinical Template (LLM-Ready Fallback)</option>
          </select>

          <button
            onClick={() => onGenerate(targetPayer, provider)}
            disabled={loading}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating...' : 'Regenerate Narrative'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-800">Synthesizing Clinical Evidence...</p>
          <p className="text-xs text-slate-500 mt-1">Applying prompt template & citing chart facts via Vertex AI</p>
        </div>
      ) : narrative ? (
        <div className="space-y-4">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>Model: {narrative.model_used}</span>
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
              Tokens: {narrative.prompt_tokens + narrative.completion_tokens} ({narrative.prompt_tokens} in / {narrative.completion_tokens} out)
            </span>
            <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-bold border border-emerald-200">
              Est. Cost: ${narrative.estimated_cost_usd.toFixed(6)}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
              Latency: {narrative.latency_ms} ms
            </span>
          </div>

          {/* Narrative Text Container */}
          <div className="relative">
            <pre className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {narrative.narrative_text}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 bg-white border border-slate-200 text-slate-700 hover:text-teal-700 px-2.5 py-1 rounded text-xs font-semibold shadow-sm flex items-center gap-1 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Criteria Cited */}
          {narrative.criteria_cited.length > 0 && (
            <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Evidence & Regulatory Citations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {narrative.criteria_cited.map((crit, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                    {crit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Human Review Disclaimer (Non-negotiable healthcare requirement) */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2.5 rounded-lg text-xs flex items-start gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>{narrative.disclaimer}</span>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500">
          No narrative generated yet. Click "Generate Narrative" above to invoke Vertex AI.
        </div>
      )}
    </div>
  );
};

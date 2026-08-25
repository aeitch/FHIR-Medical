import React from 'react';
import { ShieldAlert, Activity, Sparkles, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
      {/* Loud Synthetic Data Guardrail Banner (Non-Negotiable Rule R3/R6) */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-inner">
        <ShieldAlert className="w-4 h-4 text-slate-950" />
        <span>SYNTHETIC DEMO DATA — NO REAL PHI — HIPAA & SOC 2 READINESS DEMONSTRATION</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-lg shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">ClinEfficiency Pro</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">UR Console v2.0</span>
            </div>
            <p className="text-xs text-slate-500">Utilization Review Decision Engine & SMART on FHIR Appeal Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Vertex AI: gemini-2.5-flash</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700">
            <Cpu className="w-3.5 h-3.5 text-slate-600" />
            <span>GCP Healthcare FHIR R4</span>
          </div>
        </div>
      </div>
    </header>
  );
};

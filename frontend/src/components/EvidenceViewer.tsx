import React, { useState } from 'react';
import { Database, Activity, FileCode, CheckCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { PatientDetail } from '../types';

interface Props {
  patient: PatientDetail | null;
  loading: boolean;
  onViewRawJSON?: () => Promise<Record<string, unknown>>;
}

export const EvidenceViewer: React.FC<Props> = ({ patient, loading, onViewRawJSON }) => {
  const [showRawJSON, setShowRawJSON] = useState(false);
  const [rawJSON, setRawJSON] = useState<string | null>(null);
  const [loadingJSON, setLoadingJSON] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleRawJSON = async () => {
    if (!showRawJSON && !rawJSON && onViewRawJSON) {
      setLoadingJSON(true);
      try {
        const data = await onViewRawJSON();
        setRawJSON(JSON.stringify(data, null, 2));
      } catch (err) {
        console.error('Failed to load raw FHIR bundle', err);
      } finally {
        setLoadingJSON(false);
      }
    }
    setShowRawJSON(!showRawJSON);
  };

  const handleCopyJSON = () => {
    if (rawJSON) {
      navigator.clipboard.writeText(rawJSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-24 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">Clinical Evidence & Coded Ontologies</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200">
          Source: {patient.provenance || 'Epic on FHIR Sandbox · HL7 R4'}
        </span>
      </div>

      {/* Grid of Coded Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Diagnoses & Problems (ICD-10-CM / SNOMED) */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Diagnoses & Problems (ICD-10-CM / SNOMED)</span>
          </div>
          <div className="space-y-2 pt-1">
            {patient.conditions && patient.conditions.length > 0 ? (
              patient.conditions.map((cond, idx) => {
                const coding = cond.code?.coding?.[0] || {};
                const text = cond.code?.text || coding.display || 'Active Clinical Condition';
                return (
                  <div key={idx} className="bg-white p-2.5 rounded-md border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-900">{text}</div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                      {coding.code && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-teal-700">
                          ICD-10: {coding.code}
                        </span>
                      )}
                      {coding.display && <span className="truncate">{coding.display}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-500 italic">No structured diagnosis codes attached.</div>
            )}
          </div>
        </div>

        {/* 2. Measured Vitals & Laboratory Findings (LOINC) */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <span>Laboratory Biomarkers & Vitals (LOINC)</span>
          </div>
          <div className="space-y-2 pt-1">
            {patient.observations && patient.observations.length > 0 ? (
              patient.observations.map((obs, idx) => {
                const coding = obs.code?.coding?.[0] || {};
                const name = coding.display || obs.code?.text || 'Observation';
                const val = obs.valueQuantity?.value;
                const unit = obs.valueQuantity?.unit || obs.valueQuantity?.code || '';
                return (
                  <div key={idx} className="bg-white p-2.5 rounded-md border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-teal-700">
                          LOINC: {coding.code || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-slate-900">
                        {val !== undefined ? `${val} ${unit}` : 'Recorded'}
                      </div>
                      {obs.referenceRange?.[0]?.high && (
                        <div className="text-[10px] text-slate-400">
                          Ref: &lt; {obs.referenceRange[0].high.value} {obs.referenceRange[0].high.unit}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-500 italic">No LOINC observations recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Encounter Classification (HL7 ActCode) */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">Encounter Classification (HL7 ActCode):</span>
        <span className="font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-teal-800">
          {patient.encounter_class || 'IMP (Inpatient Encounter)'}
        </span>
      </div>

      {/* 4. Collapsible Raw FHIR JSON Bundle for Auditors */}
      <div className="border-t border-slate-100 pt-3">
        <button
          onClick={handleToggleRawJSON}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-teal-700 py-1 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-teal-600" />
            <span>Auditor Verification: View Raw HL7 FHIR R4 JSON Bundle</span>
          </div>
          {showRawJSON ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRawJSON && (
          <div className="mt-3 relative">
            {loadingJSON ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse bg-slate-900 rounded-lg text-slate-200">
                Fetching raw FHIR R4 resource bundle from endpoint...
              </div>
            ) : (
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono max-h-72 overflow-y-auto leading-relaxed">
                  {rawJSON || 'No raw FHIR bundle loaded.'}
                </pre>
                <button
                  onClick={handleCopyJSON}
                  className="absolute top-2.5 right-2.5 bg-slate-800 border border-slate-700 text-slate-200 hover:text-teal-400 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

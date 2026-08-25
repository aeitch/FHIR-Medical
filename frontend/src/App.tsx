import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PatientSelector } from './components/PatientSelector';
import { URDecisionCard } from './components/URDecisionCard';
import { GapList } from './components/GapList';
import { NarrativeViewer } from './components/NarrativeViewer';
import { FinOpsWidget } from './components/FinOpsWidget';
import { AuditLogViewer } from './components/AuditLogViewer';
import { PatientSummary, UREvaluation, NarrativeResult, AuditLogEntry, FinOpsSummary } from './types';
import { getPatients, evaluateUR, generateNarrative, getAuditLogs, getFinOpsMetrics } from './services/api';

export const App: React.FC = () => {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [evaluation, setEvaluation] = useState<UREvaluation | null>(null);
  const [narrative, setNarrative] = useState<NarrativeResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [finops, setFinOps] = useState<FinOpsSummary>({
    total_requests: 0,
    total_prompt_tokens: 0,
    total_completion_tokens: 0,
    total_cost_usd: 0,
    average_latency_ms: 0,
  });

  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);
  const [loadingUR, setLoadingUR] = useState<boolean>(false);
  const [loadingNarrative, setLoadingNarrative] = useState<boolean>(false);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load patients on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoadingPatients(true);
        const pts = await getPatients();
        setPatients(pts);
        if (pts.length > 0) {
          setSelectedPatientId(pts[0].id);
        }
      } catch (err: unknown) {
        console.error('Failed to load initial patients', err);
        setError('Failed to connect to backend FHIR service. Ensure API server is running.');
      } finally {
        setLoadingPatients(false);
      }
    }
    loadInitial();
    refreshAuditAndFinOps();
  }, []);

  // When patient selection changes, run UR evaluation and generate narrative
  useEffect(() => {
    if (!selectedPatientId) return;

    async function evaluatePatient() {
      try {
        setLoadingUR(true);
        setError(null);
        const evalRes = await evaluateUR(selectedPatientId);
        setEvaluation(evalRes);

        // Automatically trigger narrative generation for selected patient
        setLoadingNarrative(true);
        const narrRes = await generateNarrative(selectedPatientId);
        setNarrative(narrRes);
        await refreshAuditAndFinOps();
      } catch (err: unknown) {
        console.error('Evaluation error', err);
        setError('Error during clinical evaluation or narrative synthesis.');
      } finally {
        setLoadingUR(false);
        setLoadingNarrative(false);
      }
    }

    evaluatePatient();
  }, [selectedPatientId]);

  const refreshAuditAndFinOps = async () => {
    try {
      setLoadingAudit(true);
      const [logs, metrics] = await Promise.all([getAuditLogs(10), getFinOpsMetrics()]);
      setAuditLogs(logs);
      setFinOps(metrics);
    } catch (err) {
      console.error('Error fetching audit logs', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleManualGenerate = async (targetPayer: string, provider: string) => {
    if (!selectedPatientId) return;
    try {
      setLoadingNarrative(true);
      setError(null);
      const narrRes = await generateNarrative(selectedPatientId, targetPayer, provider);
      setNarrative(narrRes);
      await refreshAuditAndFinOps();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate narrative';
      setError(msg);
    } finally {
      setLoadingNarrative(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Patient Selector */}
        <PatientSelector
          patients={patients}
          selectedId={selectedPatientId}
          onSelect={setSelectedPatientId}
          loading={loadingPatients}
        />

        {/* 2. UR Clinical Evaluation & Documentation Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <URDecisionCard evaluation={evaluation} loading={loadingUR} />
          </div>
          <div>
            <GapList gaps={evaluation?.documentation_gaps || []} />
          </div>
        </div>

        {/* 3. LLM Payer Narrative Generator */}
        <NarrativeViewer
          narrative={narrative}
          loading={loadingNarrative}
          onGenerate={handleManualGenerate}
        />

        {/* 4. FinOps Widget */}
        <FinOpsWidget metrics={finops} />

        {/* 5. Append-Only Audit Trail */}
        <AuditLogViewer logs={auditLogs} loading={loadingAudit} />
      </main>
    </div>
  );
};

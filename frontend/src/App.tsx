import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PatientSelector } from './components/PatientSelector';
import { URDecisionCard } from './components/URDecisionCard';
import { GapList } from './components/GapList';
import { NarrativeViewer } from './components/NarrativeViewer';
import { FinOpsWidget } from './components/FinOpsWidget';
import { AuditLogViewer } from './components/AuditLogViewer';
import { TermsPage } from './components/TermsPage';
import { PatientSummary, UREvaluation, NarrativeResult, AuditLogEntry, FinOpsSummary } from './types';
import { getPatients, evaluateUR, generateNarrative, getAuditLogs, getFinOpsMetrics } from './services/api';
import { RefreshCw, FileText } from 'lucide-react';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
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

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

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

  if (currentPath === '/terms') {
    return <TermsPage onBack={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 flex flex-col justify-between">
      <div>
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

          {/* 4. FinOps Widget & Refresh Controls */}
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={refreshAuditAndFinOps}
                disabled={loadingAudit}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
                <span>Refresh Audit & FinOps</span>
              </button>
            </div>
            <FinOpsWidget metrics={finops} />
          </div>

          {/* 5. Append-Only Audit Trail */}
          <AuditLogViewer logs={auditLogs} loading={loadingAudit} />
        </main>
      </div>

      {/* Global Clean Product Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">ClinEfficiency Pro UR Console</span>
            <span>•</span>
            <span>HL7 FHIR R4 Standard</span>
            <span>•</span>
            <span>HIPAA & SOC 2 Readiness</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('/terms')}
              className="font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Use & Privacy</span>
            </button>
            <span>•</span>
            <span>© 2026 ClinEfficiency Pro LLC</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

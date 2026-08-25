import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PatientSelector } from './components/PatientSelector';
import { URDecisionCard } from './components/URDecisionCard';
import { GapList } from './components/GapList';
import { NarrativeViewer } from './components/NarrativeViewer';
import { FinOpsWidget } from './components/FinOpsWidget';
import { AuditLogViewer } from './components/AuditLogViewer';
import { EvidenceViewer } from './components/EvidenceViewer';
import { CFOOnePager } from './components/CFOOnePager';
import { DenialRiskGauge } from './components/DenialRiskGauge';
import { RevenueBarChart } from './components/RevenueBarChart';
import { TwoMidnightRing } from './components/TwoMidnightRing';
import { AuditActivityChart } from './components/AuditActivityChart';
import { HeroCaseSpotlight } from './components/HeroCaseSpotlight';
import { TermsPage } from './components/TermsPage';
import {
  PatientSummary,
  PatientDetail,
  UREvaluation,
  NarrativeResult,
  AuditLogEntry,
  FinOpsSummary,
} from './types';
import {
  getPatients,
  getPatientDetail,
  fetchPatientById,
  getRawFHIRBundle,
  evaluateUR,
  generateNarrative,
  getAuditLogs,
  getFinOpsMetrics,
} from './services/api';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Database,
  Eye,
  Info,
} from 'lucide-react';

type DossierTab = 'decision' | 'evidence' | 'gaps' | 'narrative' | 'audit';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [evaluation, setEvaluation] = useState<UREvaluation | null>(null);
  const [narrative, setNarrative] = useState<NarrativeResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<DossierTab>('decision');
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Multi-Server & Pagination State (Requirement 1 & 2)
  const [selectedServer, setSelectedServer] = useState<string>('epic');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalPatients, setTotalPatients] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [finops, setFinOps] = useState<FinOpsSummary>({
    total_requests: 0,
    total_prompt_tokens: 0,
    total_completion_tokens: 0,
    total_cost_usd: 0,
    average_latency_ms: 0,
  });

  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
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

  const refreshAuditAndFinOps = async () => {
    try {
      setLoadingAudit(true);
      const [logs, metrics] = await Promise.all([getAuditLogs(15), getFinOpsMetrics()]);
      setAuditLogs(logs);
      setFinOps(metrics);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching audit logs', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const loadDirectory = useCallback(async (page: number, size: number, server: string) => {
    try {
      setLoadingPatients(true);
      const res = await getPatients(page, size, server);
      setPatients(res.items || []);
      setTotalPatients(res.total || 0);
      setTotalPages(res.total_pages || 1);
      if (res.items && res.items.length > 0) {
        setSelectedPatientId((prev) => {
          const found = res.items.find((p) => p.id === prev);
          return found ? prev : res.items[0].id;
        });
      }
    } catch (err: unknown) {
      console.error('Failed to load patient directory', err);
      setError(`Failed to query patient directory from ${server.toUpperCase()}`);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  // Load directory when server, page, or pageSize changes
  useEffect(() => {
    loadDirectory(currentPage, pageSize, selectedServer);
    refreshAuditAndFinOps();
  }, [currentPage, pageSize, selectedServer, loadDirectory]);

  // When selected patient changes, fetch details, run UR evaluation, and generate narrative
  useEffect(() => {
    if (!selectedPatientId) return;

    async function loadPatientData() {
      try {
        setLoadingDetail(true);
        setLoadingUR(true);
        setError(null);

        // Fetch detailed patient clinical data from active server
        const detail = await getPatientDetail(selectedPatientId, selectedServer);
        setPatientDetail(detail);
        setLoadingDetail(false);

        // Run UR decision evaluation
        const evalRes = await evaluateUR(selectedPatientId, 48, selectedServer);
        setEvaluation(evalRes);
        setLoadingUR(false);

        // Auto-trigger narrative generation
        setLoadingNarrative(true);
        const narrRes = await generateNarrative(selectedPatientId, 'Medicare Advantage / Commercial', 'gemini-2.5-flash', selectedServer);
        setNarrative(narrRes);
        await refreshAuditAndFinOps();
      } catch (err: unknown) {
        console.error('Error during clinical evaluation', err);
        setError('Error fetching patient data or evaluating clinical guidelines.');
      } finally {
        setLoadingDetail(false);
        setLoadingUR(false);
        setLoadingNarrative(false);
      }
    }

    loadPatientData();
  }, [selectedPatientId, selectedServer]);

  const handleGlobalRefresh = async () => {
    if (!selectedPatientId) return;
    try {
      setLoadingDetail(true);
      setLoadingUR(true);
      setLoadingNarrative(true);
      setEvaluation(null);
      setNarrative(null);

      const [detail, evalRes, narrRes] = await Promise.all([
        getPatientDetail(selectedPatientId, selectedServer),
        evaluateUR(selectedPatientId, 48, selectedServer),
        generateNarrative(selectedPatientId, 'Medicare Advantage / Commercial', 'gemini-2.5-flash', selectedServer),
      ]);
      setPatientDetail(detail);
      setEvaluation(evalRes);
      setNarrative(narrRes);
      await refreshAuditAndFinOps();
    } catch (err) {
      console.error('Error during global refresh', err);
    } finally {
      setLoadingDetail(false);
      setLoadingUR(false);
      setLoadingNarrative(false);
    }
  };

  const handleServerChange = (newServer: string) => {
    setSelectedServer(newServer);
    setCurrentPage(1);
    setSelectedPatientId('');
    setPatientDetail(null);
    setEvaluation(null);
    setNarrative(null);
  };

  const handleCustomPatientFetch = async (patientId: string, server: string) => {
    setLoadingPatients(true);
    setError(null);
    try {
      const fetched = await fetchPatientById(patientId, server);
      // Add or replace in patient list if not already present
      setPatients((prev) => {
        const exists = prev.find((p) => p.id === fetched.id);
        if (!exists) return [fetched, ...prev];
        return prev;
      });
      setSelectedPatientId(fetched.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Patient not found in ${server}`;
      setError(msg);
      throw err;
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleManualGenerate = async (targetPayer: string, provider: string) => {
    if (!selectedPatientId) return;
    try {
      setLoadingNarrative(true);
      setError(null);
      const narrRes = await generateNarrative(selectedPatientId, targetPayer, provider, selectedServer);
      setNarrative(narrRes);
      await refreshAuditAndFinOps();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate narrative';
      setError(msg);
    } finally {
      setLoadingNarrative(false);
    }
  };

  const handleRawJSONFetch = async () => {
    if (!selectedPatientId) return {};
    return await getRawFHIRBundle(selectedPatientId, selectedServer);
  };

  if (currentPath === '/terms') {
    return <TermsPage onBack={() => navigateTo('/')} />;
  }

  const activePatientName = patientDetail?.name || 'Active Patient';
  const gapsCount = evaluation?.documentation_gaps?.length || 0;
  const patientSpecificLogs = auditLogs.filter(
    (l) => l.patient_id === selectedPatientId || l.patient_id === 'general'
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="underline ml-4">
                Dismiss
              </button>
            </div>
          )}

          {/* 1. Reframed Client Story Hero Case Spotlight (Requirement 8 & 10) */}
          <HeroCaseSpotlight
            patient={patientDetail}
            evaluation={evaluation}
            lastRefreshed={lastRefreshed}
            onRefresh={handleGlobalRefresh}
            loading={loadingUR || loadingNarrative}
          />

          {/* 2. Patient Selector & Live Epic Search Bar (Requirement 1, 2, 3) */}
          <PatientSelector
            patients={patients}
            selectedId={selectedPatientId}
            onSelect={setSelectedPatientId}
            onFetchCustomPatient={handleCustomPatientFetch}
            loading={loadingPatients}
            selectedServer={selectedServer}
            onServerChange={handleServerChange}
            page={currentPage}
            pageSize={pageSize}
            total={totalPatients}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />

          {/* 3. Executive CFO / Revenue Defense Card */}
          <CFOOnePager evaluation={evaluation} patientName={activePatientName} />

          {/* 4. Auditor-Grade Dossier Navigation Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/70 px-4 flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('decision')}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'decision'
                    ? 'border-teal-600 text-teal-700 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Level-of-Care Decision & Charts</span>
              </button>

              <button
                onClick={() => setActiveTab('evidence')}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'evidence'
                    ? 'border-teal-600 text-teal-700 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Clinical Evidence & Labs (ICD/LOINC)</span>
              </button>

              <button
                onClick={() => setActiveTab('gaps')}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'gaps'
                    ? 'border-teal-600 text-teal-700 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Documentation Gaps ({gapsCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('narrative')}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'narrative'
                    ? 'border-teal-600 text-teal-700 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Appeal Narrative</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'audit'
                    ? 'border-teal-600 text-teal-700 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Case Audit Trail</span>
              </button>
            </div>

            {/* Tab Content Panes */}
            <div className="p-4 sm:p-6">
              {activeTab === 'decision' && (
                <div className="space-y-6">
                  {/* Visual Charts Grid: Denial Risk Gauge + Two Midnight Donut + Revenue Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DenialRiskGauge evaluation={evaluation} />
                    <TwoMidnightRing evaluation={evaluation} />
                    <RevenueBarChart evaluation={evaluation} />
                  </div>

                  <URDecisionCard evaluation={evaluation} loading={loadingUR} />
                </div>
              )}

              {activeTab === 'evidence' && (
                <EvidenceViewer
                  patient={patientDetail}
                  loading={loadingDetail}
                  onViewRawJSON={handleRawJSONFetch}
                />
              )}

              {activeTab === 'gaps' && (
                <GapList gaps={evaluation?.documentation_gaps || []} />
              )}

              {activeTab === 'narrative' && (
                <NarrativeViewer
                  narrative={narrative}
                  loading={loadingNarrative}
                  onGenerate={handleManualGenerate}
                />
              )}

              {activeTab === 'audit' && (
                <div className="space-y-5">
                  <AuditActivityChart logs={patientSpecificLogs} />
                  <AuditLogViewer logs={patientSpecificLogs} loading={loadingAudit} />
                </div>
              )}
            </div>
          </div>

          {/* 5. FinOps Demo Tracker & Refresh */}
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

          {/* 6. Collapsible Technical & Interoperability Details */}
          <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-teal-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" />
                <span>Technical Specifications & Interoperability Conformance</span>
              </div>
              <span className="text-[11px] text-teal-700">{showTechDetails ? 'Hide' : 'Show Details'}</span>
            </button>

            {showTechDetails && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                <p>
                  • <strong>FHIR Conformance:</strong> Meets HL7 FHIR R4 standard (4.0.1) with SMART App Launch 2.0 PKCE.
                </p>
                <p>
                  • <strong>Capability Statement:</strong> Conformance manifest exposed via standard{' '}
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">/api/fhir/metadata</code>.
                </p>
                <p>
                  • <strong>AI Governance:</strong> Powered by Vertex AI (<code className="bg-slate-100 px-1 py-0.5 rounded">gemini-2.5-flash</code>) with local Ollama offline fallback and HIPAA § 164.312(b) audit trail.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Clean Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">ClinEfficiency Pro UR Console</span>
            <span>•</span>
            <span>HL7 FHIR R4 Standard</span>
            <span>•</span>
            <span>HIPAA & SOC 2 Technical Readiness</span>
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

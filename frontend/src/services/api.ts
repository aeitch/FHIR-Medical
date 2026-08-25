import {
  PatientDetail,
  PaginatedPatientsResponse,
  FHIRServerInfo,
  UREvaluation,
  NarrativeResult,
  AuditLogEntry,
  FinOpsSummary,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function getPatients(
  page: number = 1,
  pageSize: number = 10,
  server: string = 'epic'
): Promise<PaginatedPatientsResponse> {
  const res = await fetch(
    `${API_BASE}/patients?page=${page}&page_size=${pageSize}&server=${server}&_t=${Date.now()}`,
    {
      cache: 'no-store',
      headers: noCacheHeaders,
    }
  );
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function getPatientDetail(patientId: string, server: string = 'epic'): Promise<PatientDetail> {
  const res = await fetch(`${API_BASE}/patients/${patientId}?server=${server}&_t=${Date.now()}`, {
    cache: 'no-store',
    headers: noCacheHeaders,
  });
  if (!res.ok) throw new Error(`Failed to fetch details for patient ${patientId}`);
  return res.json();
}

export async function fetchPatientById(patientId: string, server: string = 'epic'): Promise<PatientDetail> {
  const res = await fetch(`${API_BASE}/patients/fetch?_t=${Date.now()}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...noCacheHeaders,
    },
    body: JSON.stringify({ patient_id: patientId, server, provider: server }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch patient from FHIR repository' }));
    throw new Error(err.detail || `Patient '${patientId}' not found in ${server} sandbox`);
  }
  return res.json();
}

export async function getFHIRServers(): Promise<Record<string, FHIRServerInfo>> {
  const res = await fetch(`${API_BASE}/patients/servers?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: noCacheHeaders,
  });
  if (!res.ok) throw new Error('Failed to fetch FHIR servers registry');
  return res.json();
}

export async function getRawFHIRBundle(patientId: string, server: string = 'epic'): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/patients/${patientId}/raw?server=${server}&_t=${Date.now()}`, {
    cache: 'no-store',
    headers: noCacheHeaders,
  });
  if (!res.ok) throw new Error(`Failed to retrieve raw FHIR bundle for ${patientId}`);
  return res.json();
}

export async function getFHIRMetadata(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/fhir/metadata?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: noCacheHeaders,
  });
  if (!res.ok) throw new Error('Failed to fetch FHIR CapabilityStatement');
  return res.json();
}

export async function evaluateUR(
  patientId: string,
  expectedHours: number = 48,
  server: string = 'epic'
): Promise<UREvaluation> {
  const res = await fetch(`${API_BASE}/ur/evaluate?_t=${Date.now()}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...noCacheHeaders,
    },
    body: JSON.stringify({ patient_id: patientId, expected_stay_hours: expectedHours, server }),
  });
  if (!res.ok) throw new Error('Failed to evaluate UR decision');
  return res.json();
}

export async function generateNarrative(
  patientId: string,
  targetPayer: string = 'Medicare Advantage / Commercial',
  provider: string = 'gemini-2.5-flash',
  server: string = 'epic'
): Promise<NarrativeResult> {
  const res = await fetch(`${API_BASE}/narrative/generate?_t=${Date.now()}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...noCacheHeaders,
    },
    body: JSON.stringify({ patient_id: patientId, target_payer: targetPayer, model_override: provider, server }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to generate narrative' }));
    throw new Error(err.detail || 'Failed to generate narrative');
  }
  return res.json();
}

export async function getAuditLogs(limit: number = 20): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit?limit=${limit}&_t=${Date.now()}`, {
    cache: 'no-store',
    headers: noCacheHeaders,
  });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function getFinOpsMetrics(): Promise<FinOpsSummary> {
  const res = await fetch(`${API_BASE}/audit/finops?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: noCacheHeaders,
  });
  if (!res.ok) throw new Error('Failed to fetch FinOps metrics');
  return res.json();
}

import { PatientSummary, PatientDetail, UREvaluation, NarrativeResult, AuditLogEntry, FinOpsSummary } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export async function getPatients(): Promise<PatientSummary[]> {
  const res = await fetch(`${API_BASE}/patients`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function getPatientDetail(patientId: string): Promise<PatientDetail> {
  const res = await fetch(`${API_BASE}/patients/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch details for patient ${patientId}`);
  return res.json();
}

export async function fetchPatientById(patientId: string, provider: string = 'epic'): Promise<PatientDetail> {
  const res = await fetch(`${API_BASE}/patients/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: patientId, provider }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch patient from FHIR repository' }));
    throw new Error(err.detail || 'Patient not found in sandbox');
  }
  return res.json();
}

export async function getRawFHIRBundle(patientId: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/patients/${patientId}/raw`);
  if (!res.ok) throw new Error(`Failed to retrieve raw FHIR bundle for ${patientId}`);
  return res.json();
}

export async function getFHIRMetadata(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/fhir/metadata`);
  if (!res.ok) throw new Error('Failed to fetch FHIR CapabilityStatement');
  return res.json();
}

export async function evaluateUR(patientId: string, expectedHours: number = 48): Promise<UREvaluation> {
  const res = await fetch(`${API_BASE}/ur/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: patientId, expected_stay_hours: expectedHours }),
  });
  if (!res.ok) throw new Error('Failed to evaluate UR decision');
  return res.json();
}

export async function generateNarrative(
  patientId: string,
  targetPayer: string = 'Medicare Advantage / Commercial',
  provider: string = 'gemini-2.5-flash'
): Promise<NarrativeResult> {
  const res = await fetch(`${API_BASE}/narrative/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: patientId, target_payer: targetPayer, model_override: provider }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to generate narrative' }));
    throw new Error(err.detail || 'Failed to generate narrative');
  }
  return res.json();
}

export async function getAuditLogs(limit: number = 20): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function getFinOpsMetrics(): Promise<FinOpsSummary> {
  const res = await fetch(`${API_BASE}/audit/finops`);
  if (!res.ok) throw new Error('Failed to fetch FinOps metrics');
  return res.json();
}

export interface ClinicalCondition {
  clinicalStatus?: { coding?: Array<{ code?: string; display?: string }> };
  code?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
}

export interface ClinicalObservation {
  code?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value?: number;
    unit?: string;
    code?: string;
  };
  referenceRange?: Array<{
    low?: { value?: number; unit?: string };
    high?: { value?: number; unit?: string };
  }>;
}

export interface ClinicalDocument {
  type?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
  date?: string;
  description?: string;
}

export interface PatientDetail extends PatientSummary {
  conditions?: ClinicalCondition[];
  observations?: ClinicalObservation[];
  documents?: ClinicalDocument[];
  active_encounter?: Record<string, unknown>;
  scenario_description?: string;
}

export interface PatientSummary {
  id: string;
  mrn: string;
  name: string;
  gender: string;
  birthDate: string;
  age: number;
  scenario: string;
  encounter_class?: string;
  provenance?: string;
}

export interface UREvaluation {
  patient_id: string;
  recommended_status: 'inpatient' | 'observation';
  confidence_score: number;
  two_midnight_met: boolean;
  severity_of_illness: string;
  intensity_of_service: string;
  criteria_met: string[];
  documentation_gaps: string[];
}

export interface NarrativeResult {
  patient_id: string;
  narrative_text: string;
  criteria_cited: string[];
  clinical_rationale?: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
  latency_ms: number;
  disclaimer: string;
  correlation_id: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  patient_id: string;
  correlation_id: string;
  model?: string;
  cost_usd?: number;
  details?: Record<string, unknown>;
}

export interface FinOpsSummary {
  total_requests: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost_usd: number;
  average_latency_ms: number;
}

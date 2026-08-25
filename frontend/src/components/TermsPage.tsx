import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, FileText } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const TermsPage: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to UR Console</span>
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2 text-teal-600 mb-2">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider">ClinEfficiency Pro LLC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Terms of Use & Healthcare Data Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Effective Date: August 25, 2026 | Epic on FHIR Integration Specification
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>1. Scope & Purpose of Application</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The ClinEfficiency Pro <strong>UR Console (Utilization Review)</strong> is a specialized clinical decision
            support application designed for healthcare providers, clinical utilization review specialists, and physician
            advisors. It retrieves electronic health records via standard HL7 FHIR R4 (SMART on FHIR) to assist in
            evaluating observation vs. inpatient admission status and drafting evidence-backed medical necessity appeal
            justifications.
          </p>
        </section>

        {/* Section 2: Data Ownership & Zero Sale of Data */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            <span>2. Data Ownership & Protection (Zero Sale of Data)</span>
          </h2>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
            <p>
              • <strong>No Data Selling:</strong> ClinEfficiency Pro does NOT sell, rent, license, or monetize patient or
              user data to third parties, advertisers, or data brokers.
            </p>
            <p>
              • <strong>No Third-Party Advertising:</strong> This application is completely free of commercial
              advertisements and tracking beacons.
            </p>
            <p>
              • <strong>Direct Services Only:</strong> Data retrieved from EHR systems (including Epic on FHIR) is used
              strictly to provide direct utilization review decision support and appeal documentation to authorized
              clinical users.
            </p>
          </div>
        </section>

        {/* Section 3: Data Storage & HIPAA Safeguards */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <span>3. Technical Safeguards & Storage Locations</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Data processed by the application is protected by technical safeguards engineered in alignment with HIPAA (45
            CFR § 164.312) and SOC 2 standards:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
            <li>
              <strong>Encryption in Transit:</strong> TLS 1.3/1.2 enforced across all public endpoints with HTTPS.
            </li>
            <li>
              <strong>Encryption at Rest:</strong> AES-256 / Google KMS encryption across all database stores and Secret
              Manager secrets.
            </li>
            <li>
              <strong>Access Control:</strong> Scoped OAuth2 bearer tokens and least-privilege IAM service accounts.
            </li>
          </ul>
        </section>

        {/* Section 4: Audit Trail & Access Visibility */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-600" />
            <span>4. Immutable Audit Trail (CLAIR Governance)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every clinical chart evaluation, FHIR access, and AI narrative synthesis is recorded in an immutable,
            append-only audit log with correlation IDs, user identifiers, timestamps, and model provenance. Authorized
            users and compliance officers can view a complete record of data accesses at any time via the UR Console
            Audit Trail.
          </p>
        </section>

        {/* Section 5: Human Review Mandate */}
        <section className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-900">
          <h3 className="font-bold mb-1">Mandatory Physician Review Notice:</h3>
          <p>
            All utilization review assessments and payer appeal narratives generated by this software constitute clinical
            decision support and MUST be reviewed and validated by a licensed physician or clinical specialist before
            submission to any payer or insurance carrier.
          </p>
        </section>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© 2026 ClinEfficiency Pro LLC. All rights reserved.</span>
          <span>Contact: support@clinefficiency.demo</span>
        </div>
      </div>
    </div>
  );
};

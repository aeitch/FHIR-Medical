# Infrastructure Outputs Contract (GCP Terraform)

This document specifies the outputs exposed by Terraform modules and consumed by backend, frontend, and deployment automation.

## Outputs Definition

```hcl
output "project_id" {
  description = "The target Google Cloud Project ID"
  value       = var.project_id
}

output "region" {
  description = "The primary Google Cloud region"
  value       = var.region
}

output "backend_cloud_run_url" {
  description = "Public HTTPS URL for the backend FastAPI service"
  value       = module.cloud_run.backend_url
}

output "frontend_cloud_run_url" {
  description = "Public HTTPS URL for the frontend React console"
  value       = module.cloud_run.frontend_url
}

output "healthcare_dataset_id" {
  description = "GCP Cloud Healthcare dataset ID"
  value       = module.fhir.dataset_id
}

output "healthcare_fhir_store_id" {
  description = "GCP Cloud Healthcare FHIR R4 store ID"
  value       = module.fhir.fhir_store_id
}

output "firestore_audit_collection" {
  description = "Firestore collection name for append-only audit logs"
  value       = "ur_audit_logs"
}

output "secret_manager_gemini_key_id" {
  description = "GCP Secret Manager secret ID for Gemini API key"
  value       = module.secrets.gemini_secret_id
}
```

## Zero Orphan Guarantee
Executing `terraform destroy -auto-approve` must cleanly remove all Cloud Run services, IAM bindings, Firestore databases (or collections), Healthcare datasets/stores, and Secret Manager secrets with zero lingering monthly costs.

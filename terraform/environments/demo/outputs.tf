output "project_id" {
  description = "Target GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "Primary GCP Region"
  value       = var.region
}

output "backend_cloud_run_url" {
  description = "Backend Cloud Run public HTTPS URL"
  value       = module.cloud_run.backend_url
}

output "frontend_cloud_run_url" {
  description = "Frontend Cloud Run public HTTPS URL"
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

output "firestore_audit_database" {
  description = "Firestore audit database name"
  value       = module.logging.firestore_database_name
}

output "artifacts_bucket_name" {
  description = "GCS bucket for artifacts and bundles"
  value       = module.storage.bucket_name
}

output "dataset_id" {
  description = "Healthcare dataset ID"
  value       = google_healthcare_dataset.dataset.id
}

output "fhir_store_id" {
  description = "Healthcare FHIR store ID"
  value       = google_healthcare_fhir_store.fhir_store.id
}

output "fhir_store_name" {
  description = "Healthcare FHIR store name"
  value       = google_healthcare_fhir_store.fhir_store.name
}

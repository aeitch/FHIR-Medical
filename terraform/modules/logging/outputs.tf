output "firestore_database_name" {
  description = "Firestore database name"
  value       = google_firestore_database.database.name
}

output "audit_sink_name" {
  description = "Logging audit sink name"
  value       = google_logging_project_sink.audit_sink.name
}

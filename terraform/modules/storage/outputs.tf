output "bucket_name" {
  description = "Artifacts GCS bucket name"
  value       = google_storage_bucket.artifacts.name
}

output "bucket_url" {
  description = "Artifacts GCS bucket URL"
  value       = google_storage_bucket.artifacts.url
}

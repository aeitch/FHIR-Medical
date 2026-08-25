output "gemini_secret_id" {
  description = "Gemini API key Secret ID"
  value       = google_secret_manager_secret.gemini_api_key.secret_id
}

output "gemini_secret_name" {
  description = "Gemini API key Secret Name"
  value       = google_secret_manager_secret.gemini_api_key.name
}

output "epic_client_id_secret" {
  description = "Epic Production Client ID Secret Name"
  value       = google_secret_manager_secret.epic_client_id.name
}

output "epic_nonprod_client_id_secret" {
  description = "Epic Non-Production Client ID Secret Name"
  value       = google_secret_manager_secret.epic_nonprod_client_id.name
}

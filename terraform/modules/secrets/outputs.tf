output "gemini_secret_id" {
  description = "Gemini API key Secret ID"
  value       = google_secret_manager_secret.gemini_api_key.secret_id
}

output "gemini_secret_name" {
  description = "Gemini API key Secret Name"
  value       = google_secret_manager_secret.gemini_api_key.name
}

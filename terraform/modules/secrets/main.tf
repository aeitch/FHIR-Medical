resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "${var.prefix}-gemini-api-key"
  project   = var.project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "gemini_api_key_version" {
  count       = var.gemini_api_key_value != "" ? 1 : 0
  secret      = google_secret_manager_secret.gemini_api_key.id
  secret_data = var.gemini_api_key_value
}

resource "google_secret_manager_secret" "epic_client_id" {
  secret_id = "${var.prefix}-epic-client-id"
  project   = var.project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "epic_nonprod_client_id" {
  secret_id = "${var.prefix}-epic-nonprod-client-id"
  project   = var.project_id

  replication {
    auto {}
  }
}

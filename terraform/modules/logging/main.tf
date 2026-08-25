resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.location
  type        = "FIRESTORE_NATIVE"

  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy         = "DELETE"
}

resource "google_logging_project_sink" "audit_sink" {
  name        = "${var.prefix}-audit-sink"
  destination = "logging.googleapis.com/projects/${var.project_id}/locations/global/buckets/_Default"
  filter      = "resource.type=\"cloud_run_revision\" AND jsonPayload.audit_log=true"

  unique_writer_identity = true
}

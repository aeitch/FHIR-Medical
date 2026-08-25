resource "google_healthcare_dataset" "dataset" {
  name     = "${var.prefix}_healthcare_dataset"
  location = var.location
  project  = var.project_id
}

resource "google_healthcare_fhir_store" "fhir_store" {
  name     = "${var.prefix}_fhir_store"
  dataset  = google_healthcare_dataset.dataset.id
  version  = "R4"

  enable_update_create          = true
  disable_referential_integrity = false
}

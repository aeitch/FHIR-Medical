resource "google_storage_bucket" "artifacts" {
  name          = "${var.prefix}-artifacts-${var.project_id}"
  location      = var.location
  project       = var.project_id
  force_destroy = true

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

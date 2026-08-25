resource "google_service_account" "backend_sa" {
  account_id   = "${var.prefix}-backend-sa"
  display_name = "ClinEfficiency Backend Service Account"
  project      = var.project_id
}

# Least-privilege IAM bindings for backend service account
resource "google_project_iam_member" "vertex_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_project_iam_member" "firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_project_iam_member" "healthcare_user" {
  project = var.project_id
  role    = "roles/healthcare.fhirResourceReader"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.prefix}-backend"
  location = var.region
  project  = var.project_id

  template {
    service_account = google_service_account.backend_sa.email

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = var.backend_image

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "GCP_LOCATION"
        value = var.region
      }

      env {
        name  = "LLM_PROVIDER"
        value = "vertex_ai"
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.prefix}-frontend"
  location = var.region
  project  = var.project_id

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = var.frontend_image

      resources {
        limits = {
          cpu    = "1000m"
          memory = "256Mi"
        }
      }

      env {
        name  = "BACKEND_API_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

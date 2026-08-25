variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "prefix" {
  description = "Resource naming prefix"
  type        = string
  default     = "clinefficiency"
}

variable "backend_image" {
  description = "Container image for FastAPI backend"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "frontend_image" {
  description = "Container image for React frontend"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

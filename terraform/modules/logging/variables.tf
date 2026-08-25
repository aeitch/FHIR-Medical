variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "location" {
  description = "GCP Location for Firestore"
  type        = string
  default     = "us-central1"
}

variable "prefix" {
  description = "Resource naming prefix"
  type        = string
  default     = "clinefficiency"
}

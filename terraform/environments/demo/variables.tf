variable "project_id" {
  description = "Target Google Cloud Project ID"
  type        = string
  default     = "platinum-factor-489721-f0"
}

variable "region" {
  description = "Primary GCP Region"
  type        = string
  default     = "us-central1"
}

variable "prefix" {
  description = "Naming prefix for all resources"
  type        = string
  default     = "clinefficiency"
}

variable "subnet_cidr" {
  description = "VPC Subnet CIDR"
  type        = string
  default     = "10.0.0.0/24"
}

variable "gemini_api_key" {
  description = "Optional Gemini API Key (Vertex AI is used by default with ADC)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "backend_image" {
  description = "Backend container image"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "frontend_image" {
  description = "Frontend container image"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

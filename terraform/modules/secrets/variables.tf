variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "prefix" {
  description = "Resource naming prefix"
  type        = string
  default     = "clinefficiency"
}

variable "gemini_api_key_value" {
  description = "Optional initial Gemini API key value"
  type        = string
  default     = ""
  sensitive   = true
}

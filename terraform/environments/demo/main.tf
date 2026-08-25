terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.30"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.30"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

module "vpc" {
  source      = "../../modules/vpc"
  project_id  = var.project_id
  region      = var.region
  prefix      = var.prefix
  subnet_cidr = var.subnet_cidr
}

module "secrets" {
  source               = "../../modules/secrets"
  project_id           = var.project_id
  prefix               = var.prefix
  gemini_api_key_value = var.gemini_api_key
}

module "fhir" {
  source     = "../../modules/fhir"
  project_id = var.project_id
  location   = var.region
  prefix     = var.prefix
}

module "logging" {
  source     = "../../modules/logging"
  project_id = var.project_id
  location   = var.region
  prefix     = var.prefix
}

module "storage" {
  source     = "../../modules/storage"
  project_id = var.project_id
  location   = var.region
  prefix     = var.prefix
}

module "cloud_run" {
  source         = "../../modules/cloud_run"
  project_id     = var.project_id
  region         = var.region
  prefix         = var.prefix
  backend_image  = var.backend_image
  frontend_image = var.frontend_image
}

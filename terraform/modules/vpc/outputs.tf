output "network_id" {
  description = "VPC Network ID"
  value       = google_compute_network.vpc_network.id
}

output "network_name" {
  description = "VPC Network Name"
  value       = google_compute_network.vpc_network.name
}

output "subnet_id" {
  description = "Subnetwork ID"
  value       = google_compute_subnetwork.subnet.id
}

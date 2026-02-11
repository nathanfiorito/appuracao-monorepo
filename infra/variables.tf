# Variáveis do ambiente MVP (ex.: dev / default)

variable "environment" {
  description = "Nome do ambiente (ex.: dev, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

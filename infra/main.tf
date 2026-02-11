# Infraestrutura Appuracao MVP
# Recursos: API Gateway, SQS, DynamoDB (boletim_urna_registros), EventBridge Schedule,
#           S3 (resultados), CloudFront (opcional), Lambdas (ingest, validate-and-store, aggregate-and-export)
#
# Implementação: descomentar e configurar cada recurso conforme docs/docs/arquitetura.md

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Exemplo de recurso (placeholder) — descomentar e ajustar
# resource "aws_dynamodb_table" "boletim_urna_registros" {
#   name         = "boletim_urna_registros"
#   billing_mode = "PAY_PER_REQUEST"
#   hash_key     = "id"
#   attribute { name = "id"; type = "S" }
#   attribute { name = "boletim_id"; type = "S" }
#   global_secondary_index { name = "boletim_id-index"; hash_key = "boletim_id"; projection_type = "ALL" }
# }

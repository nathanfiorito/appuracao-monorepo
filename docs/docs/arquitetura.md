# Arquitetura

## Diagrama de fluxo

```mermaid
flowchart TB
  subgraph client [Cliente]
    FE[Front-end lê N QRs]
  end
  subgraph ingress [Ingressão]
    APIGW[API Gateway]
    SQS1[SQS Buffer]
  end
  subgraph processing [Processamento]
    L1[Lambda Validar e Armazenar]
  end
  subgraph storage [Persistência]
    DDB[(DynamoDB boletim_urna_registros)]
  end
  subgraph aggregation [Agregação]
    EB[EventBridge Schedule]
    L2[Lambda Agregar e Exportar]
  end
  subgraph delivery [Entrega]
    S3[S3 Bucket]
    CF[CloudFront CDN]
  end
  FE -->|conteúdo e posição ex. 1:4| APIGW
  APIGW --> SQS1
  SQS1 --> L1
  L1 --> DDB
  EB --> L2
  L2 --> DDB
  L2 --> S3
  S3 --> CF
  FE -->|resultados parciais| CF
```

## Componentes

| Componente | Função |
|------------|--------|
| **API Gateway** | Recebe POST com conteúdo do QR e posição; integra com Lambda de ingestão. |
| **SQS (buffer)** | Fila de mensagens; uma mensagem por QR; trigger direto da Lambda Validar e Armazenar. |
| **Lambda Ingest** | Valida o body do request e publica uma mensagem SQS por QR. |
| **Lambda Validar e Armazenar** | Valida formato e assinatura TSE; grava item em DynamoDB. |
| **DynamoDB** | Tabela `boletim_urna_registros` com `boletim_id`, posição e conteúdo/metadados do QR. |
| **EventBridge Schedule** | Dispara a Lambda de agregação em intervalo fixo (ex.: a cada 5 minutos). |
| **Lambda Agregar e Exportar** | Lê a tabela, agrupa por boletim e município, soma votos, gera JSON por cidade e envia ao S3. |
| **S3** | Armazena `resultados/{codigo_municipio}.json`. |
| **CloudFront** | CDN para servir os JSON ao front-end. |

## Decisões técnicas

- **Sem Step Function:** a SQS invoca diretamente a Lambda Validar e Armazenar.
- **Agregação por schedule:** evita disparar agregação a cada mensagem e reduz concorrência na escrita no S3.
- **Um JSON por cidade por execução:** escrita atômica para evitar sobrescrita inconsistente.

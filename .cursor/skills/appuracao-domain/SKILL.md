---
name: appuracao-domain
description: Domínio e contratos da Appuracao (QR Code Boletim de Urna TSE, API de ingestão, Lambdas e DynamoDB). Use ao implementar ou alterar ingestão, validação TSE, agregação de votos, API de boletins, ou ao interpretar formato do conteúdo do QR.
---

# Domínio Appuracao

Contexto para implementação e revisão de código da aplicação de leitura e totalização de QR Codes de Boletim de Urna (BU), conforme manual TSE.

## Modelo de dados

- **Boletim de Urna:** 1 a 4 QR Codes por boletim (quebra por limite de ~1.100 caracteres/QR).
- **Identificação:** `boletim_id` (ex.: UUID no front-end) agrupa os fragmentos; `posicao_atual` e `posicao_total` (ex.: 1:4, 2:4, 3:4, 4:4).
- **Persistência:** tabela DynamoDB `boletim_urna_registros`; um item por QR (com `conteudo_qr`, posição, metadados). Resultados agregados: S3 `resultados/{codigo_municipio}.json`.

## Contrato da API (ingestão)

- **POST** (ex.: `/boletins` ou `/boletins/qr`). Um QR por request ou array de QRs no body.
- Campos obrigatórios por QR: `conteudo_qr` (string), `posicao_atual`, `posicao_total`, `boletim_id`.
- Respostas: 202 Accepted (enfileirado), 400 (payload inválido), 5xx (erro ao publicar na SQS).

## Formato TSE do conteúdo do QR

- **Estrutura:** chave:valor, separadas por espaço; três seções — Cabeçalho, Conteúdo, Segurança.
- **Cabeçalho:** `QRBU:n:x` (n = índice, x = total de QRs), `VRQR`, `VRCH` (versão da chave de assinatura).
- **Segurança:** `HASH` (SHA-512, cumulativo quando N > 1); `ASSI` (Ed25519) **apenas no último QR**. Verificação com chaves públicas TSE por UF e VRCH.
- Quebra entre QRs: último espaço antes do limite; ao remontar, recolocar esse espaço para hash/assinatura.

## Responsabilidades das Lambdas

| Lambda | Trigger | Responsabilidade principal |
|--------|---------|----------------------------|
| **Ingest** | API Gateway | Validar payload, publicar uma mensagem SQS por QR. |
| **Validar e Armazenar** | SQS | Parse TSE, validar hash/assinatura, gravar item no DynamoDB. |
| **Agregar e Exportar** | EventBridge Schedule | Ler DynamoDB, agrupar por boletim e município, somar votos, gerar JSON por cidade no S3. |

## Referência completa

- Arquitetura e fluxo: `docs/docs/arquitetura.md`
- API: `docs/docs/api.md`
- Formato TSE (campos, códigos de cargo, URLs chaves): `docs/docs/formato-tse.md`
- Detalhes por Lambda: `docs/docs/lambdas/ingest.md`, `validate-and-store.md`, `aggregate-and-export.md`

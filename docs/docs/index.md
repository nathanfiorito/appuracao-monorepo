# Visão geral

A **Appuracao** é uma aplicação serverless para **leitura e totalização de QR Codes de Boletim de Urna (BU)**. O front-end é responsável por decodificar os QR Codes no dispositivo do usuário e enviar apenas o conteúdo textual para a API; o backend valida, armazena e agrega os dados para exibição de resultados parciais por município.

## Fluxo em alto nível

1. **Ingressão:** O front-end envia o conteúdo de cada QR (e sua posição no boletim) para a API. Uma Lambda de ingestão valida o payload e publica uma mensagem na fila SQS para cada QR.
2. **Processamento:** A fila SQS dispara diretamente a Lambda **Validar e Armazenar**, que valida o formato e a assinatura conforme o padrão TSE e grava cada QR na tabela DynamoDB `boletim_urna_registros`.
3. **Agregação:** Um agendamento (EventBridge) executa periodicamente a Lambda **Agregar e Exportar**, que lê os registros, monta boletins completos (1 a N QRs), soma os votos por candidato e por município e gera um arquivo JSON por cidade no S3.
4. **Distribuição:** Os arquivos JSON são servidos via CloudFront (CDN) para o front-end exibir os resultados parciais da votação.

## Modelo de dados

- Um **Boletim de Urna** pode ter **1 a 4** QR Codes (conforme limite do TSE).
- Cada QR traz sua **posição** no boletim (ex.: 1:4, 2:4, 3:4, 4:4) e um **identificador de boletim** (`boletim_id`) gerado no front-end, permitindo agrupar os fragmentos na agregação.

## Documentação

Use o menu ao lado para acessar:

- **[Arquitetura](arquitetura.md)** — Diagrama e fluxo detalhado dos componentes.
- **[Formato TSE](formato-tse.md)** — Resumo do formato oficial do QR Code no BU (manual TSE).
- **[API](api.md)** — Contrato do endpoint de envio de QRs.
- **[Lambdas](lambdas/ingest.md)** — Descrição da responsabilidade, entrada, saída e erros de cada função.

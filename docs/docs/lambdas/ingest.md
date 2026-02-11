# Lambda Ingest

Lambda de **ingestão**: recebe o request da API e envia uma mensagem na fila SQS para cada QR Code recebido.

## Trigger

- **API Gateway** (REST ou HTTP API): integração request/resposta com o método POST do endpoint de envio de boletins (ex.: `POST /boletins` ou `POST /boletins/qr`).

## Entrada

- **Body do POST:** JSON com os dados do(s) QR(s).
  - **Formato single:** um objeto com `conteudo_qr`, `posicao_atual`, `posicao_total`, `boletim_id`.
  - **Formato batch (opcional):** objeto com `boletim_id` e array `qrs`, cada elemento com `conteudo_qr`, `posicao_atual`, `posicao_total`.

A Lambda não recebe diretamente eventos da SQS; apenas publica mensagens nela.

## Responsabilidades

1. **Validar o payload:** presença e tipo dos campos obrigatórios; coerência entre `posicao_atual` e `posicao_total` (1 ≤ posicao_atual ≤ posicao_total); tamanho razoável do conteúdo.
2. **Normalizar:** garantir um representação interna “um QR = uma mensagem” (se o request vier com array, iterar e gerar uma mensagem SQS por item).
3. **Publicar na SQS:** enviar cada mensagem com corpo contendo `conteudo_qr`, `posicao_atual`, `posicao_total`, `boletim_id` (e metadados opcionais, ex.: timestamp, request_id).

## Saída

- **Sucesso:** resposta HTTP **202 Accepted**, com opcional identificador no body (ex.: `request_id` ou lista de IDs) para rastreamento.
- **Erro de validação:** **400 Bad Request** com mensagem descritiva (ex.: campo obrigatório ausente, posição inválida).
- **Erro de infraestrutura:** **500** (ou 503) quando falhar a publicação na SQS; o cliente pode tentar novamente.

## Erros e retries

- Falhas na chamada ao SQS (throttling, indisponibilidade) devem resultar em retorno 5xx para que o cliente possa reenviar. O API Gateway pode configurar retry conforme política desejada.
- A Lambda em si não faz retry automático de publicação; cada invocação processa o body uma vez e responde ao cliente.

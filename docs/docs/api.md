# API

## Envio de conteúdo de QR Code

O front-end envia o **conteúdo** decodificado de cada QR Code (e sua posição no boletim) para a API. A aplicação não processa imagem nem PDF; apenas o texto do QR é recebido.

### Endpoint

- **Método:** `POST`
- **Caminho sugerido:** `/boletins` ou `/boletins/qr` (conforme definição no API Gateway).

### Payload (um QR por request)

Envio de **um** QR Code por requisição:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `conteudo_qr` | string | Sim | Conteúdo textual decodificado do QR (formato TSE: chave:valor, etc.). |
| `posicao_atual` | número | Sim | Índice deste QR na sequência do boletim (ex.: 1, 2, 3, 4). |
| `posicao_total` | número | Sim | Quantidade total de QR Codes do boletim (ex.: 4). |
| `boletim_id` | string | Sim | Identificador único do boletim (ex.: UUID gerado no front-end), para agrupar os N QRs do mesmo BU. |

Exemplo:

```json
{
  "conteudo_qr": "QRBU:1:4 VRQR:1.5 VRCH:20240507 ORIG:VOTA ...",
  "posicao_atual": 1,
  "posicao_total": 4,
  "boletim_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Payload alternativo (array de QRs)

A Lambda de ingestão pode aceitar um **array** de QRs no mesmo request; nesse caso, cada elemento deve conter `conteudo_qr`, `posicao_atual`, `posicao_total` e `boletim_id`. A ingestão normaliza e publica **uma mensagem SQS por QR**.

Exemplo:

```json
{
  "boletim_id": "550e8400-e29b-41d4-a716-446655440000",
  "qrs": [
    {
      "conteudo_qr": "QRBU:1:4 ...",
      "posicao_atual": 1,
      "posicao_total": 4
    },
    {
      "conteudo_qr": "QRBU:2:4 ...",
      "posicao_atual": 2,
      "posicao_total": 4
    }
  ]
}
```

(Implementação exata do contrato fica a critério do código da Lambda Ingest.)

### Respostas

- **202 Accepted:** Payload válido; uma mensagem foi enfileirada na SQS para cada QR. O body pode incluir um identificador (ex.: `request_id`) para rastreamento.
- **400 Bad Request:** Payload inválido (campos obrigatórios ausentes, tipos incorretos, `posicao_atual`/`posicao_total` inconsistentes).
- **413 Payload Too Large:** Tamanho do body acima do limite (se aplicável).
- **5xx:** Erro interno (ex.: falha ao publicar na SQS).

### Observações

- O conteúdo do QR deve respeitar o formato do manual TSE (cabeçalho QRBU, campos chave:valor, HASH e ASSI quando for o último). A validação forte (hash e assinatura) é feita na Lambda **Validar e Armazenar**, após o consumo da mensagem SQS.

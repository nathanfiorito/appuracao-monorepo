# Lambda Validar e Armazenar

Lambda acionada pela **SQS**: processa uma mensagem por vez, valida o conteúdo do QR conforme o formato TSE e grava o registro na tabela DynamoDB `boletim_urna_registros`.

## Trigger

- **Amazon SQS:** evento de fila; cada mensagem contém um único QR (campos `conteudo_qr`, `posicao_atual`, `posicao_total`, `boletim_id`).

## Entrada

- **Event SQS:** um ou mais registros em `Records`; o corpo de cada registro é um JSON com:
  - `conteudo_qr`: string com o conteúdo decodificado do QR (formato TSE).
  - `posicao_atual`: número (ordem deste QR no boletim).
  - `posicao_total`: número (total de QRs do boletim).
  - `boletim_id`: identificador do boletim.

## Responsabilidades

1. **Parse do formato TSE:** extrair do `conteudo_qr` o cabeçalho (`QRBU:n:x`, `VRQR`, `VRCH`), a seção de conteúdo (chave:valor) e os campos de segurança (`HASH`, `ASSI` quando existir). Validar que a posição declarada (posicao_atual/posicao_total) é consistente com o valor de QRBU no conteúdo.
2. **Validação de integridade e autenticidade:**
   - Para boletins com um único QR: verificar o HASH (SHA-512) do conteúdo e a assinatura Ed25519 (ASSI) usando a chave pública do TSE correspondente à UF e à versão (VRCH).
   - Para boletins com N QRs: o hash é cumulativo; a verificação completa do boletim exige ter todos os N fragmentos. Nesta Lambda, processando um QR por vez, validar ao menos a estrutura e o hash do fragmento atual; a verificação da assinatura (presente só no último QR) pode ser feita quando o último fragmento for processado (ex.: consultando os itens já gravados para aquele `boletim_id` e recompondo o conteúdo completo para validar o último HASH e a ASSI).
3. **Gravar no DynamoDB:** inserir um item em `boletim_urna_registros` com, por exemplo: `id` (UUID do registro), `boletim_id`, `posicao_atual`, `posicao_total`, `conteudo_qr`, metadados extraídos (UF, município, zona, seção, processo, pleito, etc., se úteis para agregação), `timestamp`, e opcionalmente o hash do fragmento para uso na validação posterior.

## Saída

- **Sucesso:** retorno da Lambda sem exceção; a mensagem SQS é removida da fila (delete após processamento bem-sucedido).
- **Falha:** a Lambda lança exceção ou retorna falha para que a mensagem **não** seja deletada; após o número configurado de recebimentos, a mensagem pode ir para uma **DLQ** (Dead Letter Queue) para análise.

## Erros

- **Conteúdo inválido:** formato não reconhecido, campos obrigatórios do TSE ausentes, QRBU inconsistente com posicao_atual/posicao_total → falhar a invocação para retry ou DLQ.
- **Falha de hash ou assinatura:** quando a verificação de integridade/autenticidade falhar → falhar a invocação; a mensagem pode ser retentada ou enviada à DLQ conforme política da fila.
- **Erro ao gravar no DynamoDB:** falha na escrita → falhar a invocação para retry.

A Lambda não chama agregação nem escreve no S3; apenas valida e persiste um item por QR.

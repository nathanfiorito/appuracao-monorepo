# Lambda Agregar e Exportar

Lambda acionada por **EventBridge Schedule** (ex.: a cada 5 minutos): lê os registros da tabela DynamoDB, agrupa por boletim e município, soma os votos por candidato/cargo e gera um arquivo JSON por cidade no S3.

## Trigger

- **EventBridge (CloudWatch Events) Schedule:** regra em intervalo fixo (ex.: `rate(5 minutes)` ou `cron(0/5 * * * ? *)`). Não há payload de entrada além do evento de agendamento.

## Entrada

- A Lambda **não** recebe parâmetros de negócio no evento; ela inicia uma varredura/consulta na tabela `boletim_urna_registros` (por exemplo, Scan ou Query por índice, conforme modelo de chaves e GSI). Pode usar um cursor ou timestamp da “última agregação” para processamento incremental, ou fazer recálculo completo a cada execução, conforme decisão de implementação.

## Responsabilidades

1. **Ler DynamoDB:** obter os itens de `boletim_urna_registros` necessários (todos ou apenas desde a última execução, se houver controle de cursor).
2. **Agrupar por boletim:** para cada `boletim_id`, reunir os itens por `posicao_atual` (1 até `posicao_total`) e, se a política for considerar apenas boletins completos, descartar boletins que ainda não tenham todos os N fragmentos.
3. **Remontar e interpretar:** para cada boletim completo, recompor a seção de conteúdo (incluindo o espaço em branco na quebra entre QRs, conforme manual TSE) e extrair votos por cargo/partido/candidato e totais (NOMI, LEGC, BRAN, NULO, TOTC, etc.).
4. **Somar por município:** agregar os votos por código de município (e, se aplicável, por cargo e candidato), gerando totais por cidade.
5. **Gerar JSON por cidade:** para cada município com dados, produzir um objeto JSON com os resultados (estrutura definida pelo projeto, ex.: totais por cargo e candidato).
6. **Escrever no S3:** fazer **PutObject** de cada JSON em `resultados/{codigo_municipio}.json` no bucket configurado, em escrita atômica (um arquivo completo por cidade por execução), para evitar sobrescrita concorrente.

## Saída

- **Arquivos no S3:** `resultados/{codigo_municipio}.json` atualizados naquele ciclo de agregação.
- **Logs:** métricas ou logs com quantidade de boletins processados, municípios atualizados e eventuais erros.

## Erros e idempotência

- **Falha parcial (ex.: um PutObject falha):** a Lambda pode registrar o erro e continuar com os demais municípios, ou falhar a execução inteira; em caso de falha, a próxima execução do schedule pode refazer o recálculo (idempotente se a leitura for determinística).
- **Idempotência:** cada execução lê o estado atual da tabela e recalcula os totais; múltiplas execuções seguidas produzem o mesmo resultado para o mesmo conjunto de dados, evitando inconsistência por concorrência.
- **Timeout/memória:** para muitos municípios ou grande volume de registros, considerar paginação na leitura do DynamoDB e, se necessário, mais de uma invocação (ex.: processar por partição de município) ou aumento de timeout/memória da Lambda.

Esta Lambda **não** é acionada por cada mensagem SQS; apenas pelo schedule, mantendo carga e escrita no S3 controladas.

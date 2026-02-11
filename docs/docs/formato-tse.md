# Formato TSE – QR Code no Boletim de Urna

Este documento resume o formato oficial do QR Code no Boletim de Urna (BU), com base na publicação do **Tribunal Superior Eleitoral (TSE)**:

- **Título:** *QR Code no Boletim de Urna – Manual para a criação de aplicativos de leitura*
- **Ano:** 2024
- **Catálogo:** [TSE – Catálogo de publicações](https://www.tse.jus.br/institucional/catalogo-de-publicacoes)

O manual completo descreve a terminologia, a tecnologia, o formato de representação digital do BU no QR Code, os mecanismos de assinatura digital e o modo de obtenção dos dados complementares (nomes de candidatos, cargos etc.).

---

## Estrutura geral do conteúdo no QR

O BU é codificado usando apenas caracteres do **modo alfanumérico** (letras, números, alguns sinais de pontuação e espaço). A estrutura é do tipo **chave:valor**: registros na mesma linha, chave separada do valor por dois-pontos e registros separados por espaço em branco.

Cada QR Code possui **três seções**:

1. **Cabeçalho**
2. **Conteúdo do boletim**
3. **Segurança**

O conteúdo é limitado a **1.100 caracteres por QR Code**. Boletins maiores são divididos em até **quatro** imagens de QR Code (posição 1:N, ex.: 1:4, 2:4, 3:4, 4:4). A quebra é feita no último espaço em branco antes do limite; ao remontar a seção de conteúdo, é necessário recolocar esse espaço para o cálculo de hash e assinatura.

---

## Cabeçalho

| Campo | Descrição |
|-------|------------|
| `QRBU:n:x` | Marca de início. **n** = índice do QR na sequência (1 a N). **x** = quantidade total de QR Codes do boletim. |
| `VRQR:n.y` | Versão do formato (n = ciclos eleitorais, y = revisões no ciclo). Ex.: 1.5. |
| `VRCH:nnnn…` | Versão da chave utilizada para assinar o conteúdo (ex.: 20240507). |

---

## Conteúdo do boletim (principais campos)

- **Origem e processo:** `ORIG` (VOTA, RED, SA), `ORLC` (LEG, COM), `PROC`, `DTPL`, `PLEI`, `TURN`, `FASE` (O, S, T).
- **Localização:** `UNFE` (UF, ZZ no exterior), `MUNI`, `ZONA`, `SECA`, `AGRE`, `IDUE`, `IDCA`, `VERS`.
- **Abertura/fechamento:** `LOCA`, `APTO`, `APTS`, `APTT`, `COMP`, `FALT`, `DTAB`, `HRAB`, `DTFC`, `HRFC`, etc.
- **Eleição e cargo:** `IDEL`, `CARG` (código do cargo), `TIPO` (0 majoritário, 1 proporcional, 2 consulta), `VERC`.
- **Partido e votação:** `PART`, `LEGP`, `TOTP`; para cada candidato/resposta: `ccccc:nnnn` (número do candidato : quantidade de votos).
- **Resumo do cargo:** `APTA`, `APTS`, `APTT`, `CSEC`, `NOMI`, `LEGC`, `BRAN`, `NULO`, `TOTC`.

### Códigos de cargo (TSE)

| Código | Cargo |
|--------|--------|
| 1 | Presidente |
| 3 | Governador |
| 5 | Senador |
| 6 | Deputado Federal |
| 7 | Deputado Estadual |
| 8 | Deputado Distrital |
| 9 | Conselheiro Distrital |
| 11 | Prefeito |
| 13 | Vereador |

---

## Segurança

| Campo | Descrição |
|-------|------------|
| `HASH:xxxxxx…` | Hash **SHA-512** da seção de conteúdo, em hexadecimal. Em boletins com N QRs, cada QR traz um hash **cumulativo** (conteúdo dos QRs anteriores + atual), permitindo verificar a leitura em sequência. |
| `ASSI:xxxxxx…` | **Assinatura digital Ed25519** (EdDSA) sobre o **último** hash, em hexadecimal. Presente **somente no último** QR Code do boletim. |

A assinatura é verificada com as chaves públicas publicadas pelo TSE (uma por UF). URL base das chaves:

```
http://qrcodenobu.tse.jus.br/tse.qrcodebu/{VERSAO_CHAVE}/{LEGAL|COMUNITARIA}/{O|S}{sigla_uf}qrcode.pub
```

- `VERSAO_CHAVE`: valor do campo VRCH no QR (ex.: 20240507).
- `LEGAL` ou `COMUNITARIA`: tipo da eleição.
- `O` (oficial), `S` (simulado) ou `T` (treinamento) + sigla da UF em minúsculo (ex.: `ac`). Exterior: `zz`.

Exemplo: `http://qrcodenobu.tse.jus.br/tse.qrcodebu/20240507/LEGAL/sacqrcode.pub`

---

## Arquivo de complemento dos dados

Os nomes de candidatos, cargos, partidos e eleições não vêm no QR (para economizar espaço); são obtidos de um **arquivo JSON** assinado, publicado pelo TSE:

```
http://qrcodenobu.tse.jus.br/json-bu/{fase}/{idProcesso}/{FpppppUFMMMMM}-qbu.js
```

- **fase:** oficial, simulado ou treinamento (minúsculo).
- **idProcesso:** número do processo eleitoral.
- **F:** O, S ou T; **ppppp:** pleito com zeros; **UF:** sigla minúscula; **MMMMM:** município com zeros.

O arquivo segue um schema JSON com `processoEleitoral` e `assinatura`; a assinatura do complemento utiliza EdDSA com chave distinta da usada no QR Code. Chave pública do arquivo de complemento: `http://qrcodenobu.tse.jus.br/json-bu/s99999br-av.js`.

---

## Uso nas Lambdas

- **Lambda Validar e Armazenar:** deve interpretar o cabeçalho (`QRBU:n:x`), validar a estrutura, recalcular o hash cumulativo quando houver múltiplos QRs e, para o último QR, verificar a assinatura Ed25519 com a chave pública correspondente à UF e à versão (VRCH).
- **Lambda Agregar e Exportar:** lê os itens armazenados, agrupa por `boletim_id` e posição (1:N), remonta o conteúdo completo quando aplicável e soma os votos por candidato/cargo por município para gerar os JSON de resultado.

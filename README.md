# Appuracao

Aplicação serverless para leitura e totalização de QR Codes de Boletim de Urna (BU).

## Documentação

A documentação da aplicação (arquitetura, formato TSE, API e Lambdas) é publicada via **GitHub Pages**:

- **URL (após ativar Pages):** `https://<org>.github.io/<repo>/`

Substitua `<org>` e `<repo>` pelo nome da organização e do repositório. Para ativar: repositório → Settings → Pages → Source: **Deploy from a branch** → Branch: **gh-pages** → Folder: **/ (root)**.

O site é gerado automaticamente pelo workflow [.github/workflows/docs.yml](.github/workflows/docs.yml) quando há alterações em `docs/`.

## Estrutura do monorepo

- **apps/web/** — Front-end React (Vite): leitura de QR, envio para API, exibição de resultados.
- **docs/** — Projeto MkDocs; fonte da documentação e build para GitHub Pages.
- **infra/** — Terraform: API Gateway, SQS, DynamoDB, EventBridge, S3, Lambdas (estrutura inicial).
- **packages/shared/** — Código Python compartilhado pelas Lambdas (tipos, parsing TSE).
- **packages/lambdas/** — Lambdas Python: ingest, validate-and-store, aggregate-and-export.

## Como rodar

**Front-end (React):**

```bash
cd apps/web && npm install && npm run dev
```

Ou na raiz do monorepo (com pnpm): `pnpm install` e `pnpm dev:web`. Acesse `http://localhost:5173`.

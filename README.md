# Appuracao

Aplicação serverless para leitura e totalização de QR Codes de Boletim de Urna (BU).

## Documentação

A documentação da aplicação (arquitetura, formato TSE, API e Lambdas) é publicada via **GitHub Pages**:

- **URL (após ativar Pages):** `https://<org>.github.io/<repo>/`

Substitua `<org>` e `<repo>` pelo nome da organização e do repositório. Para ativar: repositório → Settings → Pages → Source: **Deploy from a branch** → Branch: **gh-pages** → Folder: **/ (root)**.

O site é gerado automaticamente pelo workflow [.github/workflows/docs.yml](.github/workflows/docs.yml) quando há alterações em `docs/`.

## Estrutura do monorepo

- **docs/** — Projeto MkDocs; fonte da documentação e build para GitHub Pages.
- **infra/** — Terraform (a criar).
- **packages/** — Código compartilhado e Lambdas Python (a criar).

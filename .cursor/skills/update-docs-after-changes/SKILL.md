---
name: update-docs-after-changes
description: Atualiza a documentação da Appuracao após conclusão de alterações no projeto. Use quando o usuário finalizar mudanças em código, API, Lambdas, infraestrutura ou fluxo e pedir para atualizar a documentação, ou quando for apropriado garantir que docs/ reflita o estado atual do projeto.
---

# Atualizar documentação após alterações no projeto

Seguir este fluxo quando alterações no projeto forem concluídas e a documentação precisar ser mantida em sincronia.

## Quando atualizar

- Contrato da API alterado (endpoints, payload, respostas).
- Comportamento ou contrato de uma Lambda alterado (entrada, saída, erros, trigger).
- Nova Lambda ou componente (ex.: nova fila, novo recurso).
- Mudança de arquitetura ou fluxo (diagrama, componentes, decisões).
- Alteração no formato TSE ou na forma de validação/assinatura.
- Novo recurso de infra (ex.: nova tabela, bucket, schedule).

## Checklist de atualização

Use como lista de verificação; marque o que se aplica:

- [ ] **API** — `docs/docs/api.md`: endpoint, campos do payload, códigos de resposta e exemplos.
- [ ] **Lambdas** — em `docs/docs/lambdas/`: arquivo da Lambda afetada (`ingest.md`, `validate-and-store.md`, `aggregate-and-export.md`). Atualizar: Trigger, Entrada, Responsabilidades, Saída, Erros.
- [ ] **Arquitetura** — `docs/docs/arquitetura.md`: diagrama Mermaid, tabela de componentes, decisões técnicas.
- [ ] **Formato TSE** — `docs/docs/formato-tse.md`: apenas se houver mudança em campos, segurança ou URLs oficiais.
- [ ] **Índice** — `docs/docs/index.md`: links e descrições se houver nova página ou mudança de estrutura.
- [ ] **Nav** — `docs/mkdocs.yml`: adicionar ou renomear itens em `nav` se criou nova página ou alterou título.

## Regras ao editar

- Idioma: português (pt-BR). Termos consistentes: "Boletim de Urna", "QR Code", "ingestão", etc.
- Qualquer nova página ou mudança de título exige atualização da seção `nav` em `docs/mkdocs.yml` na mesma alteração.
- Conteúdo das páginas em `docs/docs/`; configuração do site em `docs/mkdocs.yml`.

## Validação

Após editar, validar o build a partir da pasta `docs/`:

```bash
cd docs && mkdocs build
```

Se houver erro (nav quebrada, link inválido), corrigir antes de considerar concluído.

## Commits

Incluir alterações de documentação no mesmo PR/commit das alterações de código quando fizer sentido, ou em commit separado com tipo `docs`:

- `docs(api): atualiza contrato do POST com campo opcional x`
- `docs(lambdas): descreve novo comportamento de retry na Ingest`

Respeitar as convenções de branches e commits do projeto (regra git-conventions).

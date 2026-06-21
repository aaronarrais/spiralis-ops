---
kind: domain
domain: normaswatch-dev
status: active
goal: Ship NormasWatch MVP to Grupo Graziano by 01/08/2026 and evolve the product
cadence: manual
---

# normaswatch-dev — NormasWatch product development loop

Owns the full development lifecycle of NormasWatch: feature implementation,
pipeline maintenance, client delivery, and post-MVP expansion. Consumes Aaron's
backlog + pipeline health signals. Produces PRs to the NormasWatch repo via
`ship-change`.

Repo: `c:\Users\aaron\OneDrive\Desktop\SPIRALIS\NormasWatch`
Deploy: https://normaswatch-api.onrender.com (graziano / Graziano2026!)

## Current focus

Merge M4 PR (#1) → verify Render deploy → histórico DOU 2024/2025.

## Backlog

- [ ] Merge feat/m4-bombeiros (PR #1) — M4 Bombeiros/CBMSC
- [ ] Upgrade Render Postgres before 10/07/2026 (free tier expires 20/07 — dados perdidos)
- [ ] Rodar histórico DOU 2024/2025 completo (comando: python -m src.cli dou-historico)
- [ ] Implementar CBMSC real parser em src/ingestion/cbmsc.py::_tentar_scrape_real()
- [ ] Módulo M1 — legislação municipal (Floripa Código de Obras + Plano Diretor)
- [ ] Fix bug nr_identificador vazio (portarias com NR no corpo, não no campo identifica)
- [ ] Fontes endpoint no dashboard para M4 (CBMSC source tracking em /fontes)

## Stack

- Python 3.11 + FastAPI + SQLAlchemy (Postgres) + Redis
- LLM: gpt-4o-mini (triagem) / gpt-4o (impacto)
- Pinecone (busca semântica / dedup)
- Dashboard: Vanilla JS + FastAPI StaticFiles
- Deploy: Render (auto-deploy on merge to main)
- Scheduler: Windows Task Scheduler (WSL scripts) — daily 19h DOU, segunda 19h MTE

## How to ship a change

```
Workflow({ name: 'ship-change', args: {
  task: "<o que implementar>",
  repo: "c:\\Users\\aaron\\OneDrive\\Desktop\\SPIRALIS\\NormasWatch",
  verifyHints: "<dicas de verificação específicas para essa tarefa>"
}})
```

The workflow creates a worktree, implements, simplifies, reviews, verifies
locally, and opens a PR. Main checkout is never touched.

## Timeline

2026-06-21 | M4 Bombeiros implementado — 6 gates passed, PR #1 aberto feat/m4-bombeiros. CBMSC stub ativo (portal 404). Ship-change harness configurado.

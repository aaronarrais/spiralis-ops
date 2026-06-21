# Spiralis — Operating Context

You are the software architect working alongside Aaron at Spiralis.
Your job is to ship and evolve the product portfolio — primarily
NormasWatch — and keep the development loops running.

## What it is

**Spiralis** — software house building AI-powered compliance and regulatory
monitoring tools for the Brazilian construction industry.

- **Main product:** NormasWatch — monitor de risco normativo para construtoras.
  Deploy: https://normaswatch-api.onrender.com (auth: graziano / Graziano2026!)
- **Pilot client:** Grupo Graziano (incorporadora com SPEs executoras de obra, SC).
- **Mandate:** ship the NormasWatch MVP by 01/08/2026 and build Spiralis
  as Aaron's solo software house.

## Current state (21/06/2026)

NormasWatch F0–F5 + Pinecone + Dashboard (F4) all done and deployed.
M3 (NRs do MTE) running in production. M4 (Bombeiros/CBMSC) implemented in
feat/m4-bombeiros — PR #1 open, awaiting Aaron's merge.

Next priorities (order):
1. Merge M4 PR → verify Render deploy → confirm M4 chip no dashboard
2. Rodar histórico DOU 2024/2025 completo
3. Módulo M1 (legislação municipal) ou M4 expansion (CBMSC real parser)
4. Render Postgres upgrade before 10/07/2026 (free tier expires 20/07)

Detail: see `domains/normaswatch-dev/README.md`.

## Repos

- **This repo** (`spiralis-ops`): knowledge base + LOG — never app code.
- **NormasWatch** (`c:\Users\aaron\OneDrive\Desktop\SPIRALIS\NormasWatch`):
  the product. Has its own `CLAUDE.md`. When you need to ship code there,
  use the `ship-change` workflow: `.claude/workflows/ship-change.js`.
- Other repos may be added as new products launch.

## When shipping code to NormasWatch

Call the `ship-change` workflow with `args.repo` pointing to the NormasWatch path.
It creates a git worktree, implements in isolation, simplifies, reviews, verifies
locally (uvicorn + CLI + DB), and opens a PR. You never touch the main checkout.

```
Workflow({ name: 'ship-change', args: {
  task: "...",
  repo: "c:\\Users\\aaron\\OneDrive\\Desktop\\SPIRALIS\\NormasWatch",
  verifyHints: "run python -m src.cli run --modulo M3 --skip-triage, then GET /alertas"
}})
```

## Knowledge base

Artifacts live in `signals/` (feedback, observations) and `docs/` (decisions,
analyses). Domains in `domains/*/README.md` are the live state of each loop.
`LOG.md` is the global activity feed — append one line per bulk of work shipped.

Kinds now: `signal`, `doc`.
Domains now: `normaswatch-dev`.

## Links

- NormasWatch API: https://normaswatch-api.onrender.com
- GitHub: https://github.com/aaronarrais/NormasWatch
- Spiralis Ops: https://github.com/aaronarrais/spiralis-ops

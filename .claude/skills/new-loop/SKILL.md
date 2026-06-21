---
name: new-loop
description: Spin up a new loop (domain) in this knowledge base — gather its charter, scaffold domains/<loop>/README.md, do ONE real test run, and record it in LOG.md. Use when creating a new recurring workstream: "set up a new loop", "create a domain", "start tracking X".
---

# new-loop — spin up a new loop

A **loop** is a recurring thread of work the agent owns: a charter, a cadence,
and the artifacts it produces.

## Inputs to gather

1. **name** — kebab-case (`domains/<name>/`)
2. **goal** — one line: the outcome this loop drives
3. **cadence** — `manual` / `daily` / `weekly` / cron. Default `manual`.
4. **what it does** — what it consumes and produces
5. **tools/data** — sources or credentials it needs

If already specific, infer all five and confirm.

## Procedure

### 1. Ensure substrate exists

From repo root, create if missing:
- `signals/README.md`, `docs/README.md`, `domains/README.md`, `LOG.md`

Do NOT pre-create `tasks/` — earn it later per ARCHITECTURE.md.

### 2. Scaffold `domains/<name>/README.md`

Use the template in `domains/README.md`. Required sections: frontmatter
(`kind: domain`, `domain`, `status: active`, `goal`, `cadence`), description,
`## Current focus`, `## Backlog`, `## Timeline`.

Check for collision first — if `domains/<name>/` exists, ask whether to update.

### 3. Do ONE real test run

Prove the loop actually runs at small scale. Use real tools/data; if a
credential is missing, do the furthest-reachable dry run and note the gap.

Required outputs after the run:
- One dated line in `domains/<name>/README.md ## Timeline`
- One entry in `LOG.md`

### 4. Report back

Charter (the five inputs), what the test run did/found, artifacts created (or
"none — nothing actionable"), missing credentials, how to run it again.

## Notes

- Don't gold-plate the scaffold. Start lean, let it grow via Timeline.
- One loop = one separable workstream. If it's part of an existing loop, add
  it there as a backlog line.
- Code-shipping loops use `ship-change` workflow — point the README backlog at it.

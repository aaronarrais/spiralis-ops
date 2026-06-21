---
title: Knowledge-base architecture
type: decision
status: adopted
---

# Knowledge-base architecture

How this repo is organized as the operating substrate for the Automy agent.
Everything is plain **markdown + frontmatter in git** — diffable, reviewable,
agent-writable. This doc is the durable record of the model.

---

## The model (v1 — deliberately minimal)

Two ideas only:

1. **Artifacts** are global, foldered by **kind**; `domain:` is a **field (a list)**, not a folder.
2. **Domains** are "loops" — a thread of work with a charter, cadence, and metrics.
   A domain folder holds only its **README (charter)**. It **links** artifacts; never contains them.

### Kinds (start with just these two)

| kind | what it is | folder | key frontmatter |
|---|---|---|---|
| `signal` | evidence: feedback / idea / observation (deduped, frequency-counted) | `signals/` | `category, frequency, sources[], domain[], status` |
| `doc` | durable knowledge: an analysis, a decision, a thing learned | `docs/` | `domain[], status?, links` |

### Earning a new kind

Add a new kind only when it has all three of: its own status machine **and**
queryable frontmatter fields **and** a distinct body shape. Otherwise it's a
`doc` or a `signal`. Candidates once volume justifies: `task`, `ticket`, `content`.

### Domains (loops)

A domain is one loop: separable workstream with its own cadence/owner. Spin up
a new domain with the `new-loop` skill. A domain's `README` is its live state:
goal/charter, current focus, backlog (inline until it earns a `task` kind),
links to evidence, and a `## Timeline` (append-only, one line per run).

### Body convention

Each artifact = main body + optional `## Timeline` (append-only, dated).
*"What's true now"* = body. *"What happened"* = Timeline.

### Logs

- **`LOG.md`** (root) — global activity feed; one line per ship. Newest at bottom.
- **No separate daily/journal kind.** Per-run detail lives in domain Timeline entries.
- **`domains/<x>/metrics/*.jsonl`** — numeric time-series written by deterministic
  collectors, not the LLM.

### Rules

1. **One concept = one home** (by kind). Everyone else links via `[[slug]]`.
2. **`domain:` is a field (list), not a folder.**
3. **Collectors write data; agents write knowledge.**
4. **Frontmatter = anything you'd query.** Prose for everything else.

---

## Map

| I want to… | Go to |
|---|---|
| record a fact / insight we learned | `docs/` |
| capture feedback / an idea (with frequency) | `signals/` |
| track a piece of committed work | backlog line in the domain `README` |
| see why we chose something | `docs/` (a decision) |
| see a loop's goal / cadence / state | `domains/<x>/README.md` |
| spin up a new loop | run the `new-loop` skill |
| ship a code change to NormasWatch | run the `ship-change` workflow |

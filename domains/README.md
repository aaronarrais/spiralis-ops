# domains/ — loops

Each subfolder is one **loop**: a thread of work with a charter, cadence, and metrics.
A domain folder holds only its `README.md` (live state) and optional `metrics/*.jsonl`.
It **links** artifacts in `signals/` and `docs/`; never contains them.

Don't create domains by hand — run the `new-loop` skill.

## Domain README template

```markdown
---
kind: domain
domain: <loop-name>
status: active | paused | archived
goal: <one line — the outcome this loop drives>
cadence: <manual | daily | weekly | cron expr>
---

# <loop-name> — <short tagline>

<2-4 lines: what this loop does, what it consumes, what it produces.>

## Current focus
<The single most important thing this loop is working on right now.>

## Backlog
- [ ] <work item>

## Evidence & analysis
[[doc-slug]]

## Timeline
YYYY-MM-DD | <run/source> — <what happened>
```

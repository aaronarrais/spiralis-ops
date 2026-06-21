# signals/ — evidence

One file per **signal**: feedback, idea, or observation worth remembering.
Signals are **deduped and frequency-counted** — when the same thing shows up
again, add a Timeline entry to the existing file and bump `frequency`.

## Frontmatter

```yaml
---
kind: signal
category: feedback | idea | friction | observation
frequency: 1
sources: []
domain: []
status: open | triaged | actioned | closed
---
```

## Body

Short statement of the signal + optional append-only `## Timeline`:

```
## Timeline
2026-06-21 | source — what happened
```

## Naming

`<short-kebab-slug>.md`

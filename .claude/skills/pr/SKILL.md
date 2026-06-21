---
name: pr
description: Prove the feature works via an independent verifier, then open a PR. Use when a change is ready to ship — "open a PR", "ship this", "/pr". Never opens a PR until verification passes.
user_invocable: true
---

# /pr — prove the feature works, then open the PR

You are the **orchestrator + fixer**. Split verification:

- **Does the feature do what was intended?** → delegate to a fresh verifier
  sub-agent that drives the real app independently. Most features have no automated
  spec — this is **agentic verification, not "run the tests."**
- **Objective checks** (black, isort, existing tests) → YOU run them directly.

## For NormasWatch

### 1. Preconditions
On a branch; changes committed. DB accessible (`python -m src.cli migrate` clean).

### 2. Verify the feature (delegate) → fix → re-verify (loop)

Spawn a fresh verifier with this prompt pattern:

```
You are a read-only verifier. Do NOT edit code.

FEATURE to verify: <what should now work>
REPO: <path>
VERIFICATION STEPS:
  1. python -m src.cli run --modulo <X> --skip-triage --skip-impacto
     → expect inseridas: N or duplicatas: N (idempotent)
  2. Check DB: python -c "... query for expected record ..."
  3. python -m src.cli triage  (if triage changed)
  4. python -m src.cli impacto (if impact changed)
  5. Start uvicorn on port 8098, GET /alertas?modulo=X
     → expect the alert in the response

Run each step. Report ONLY:
FEATURE: works | broken
  expected: <criteria>
  observed: <actual output>
```

- **broken** → fix, spawn a fresh verifier. Never declare it works yourself.
- Cap at 3 rounds; if still broken, escalate.

### 3. Objective checks (you run these)
```bash
cd <repo> && python -m black --check src/
cd <repo> && python -m isort --check src/
```

### 4. Open the PR

```bash
git add <only the M4/feature files — exclude pre-existing changes>
git commit -m "feat(...): ..."   # NO Co-Authored-By line
git push -u origin <branch>
gh pr create --base main --head <branch> --title "..." --body "..."
```

PR body:
```markdown
## What changed
<1-3 lines>

## Verified ✅
- <what the verifier confirmed>
- black + isort: pass

## Gates
| Gate | Evidence |
|------|----------|
| ... | ... |

## Out of scope / follow-ups
- ...
```

## Rules

- Feature verdict → independent verifier only. Green tests + unverified feature = not done.
- Never open a PR until the feature is verified.
- No "Co-Authored-By" or AI attribution in commits.

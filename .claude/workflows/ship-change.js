export const meta = {
  name: 'ship-change',
  description:
    'Ship a focused code change to a Python/FastAPI repo end-to-end: isolated worktree → implement → simplify (black+isort+semantic) → review (blocking issues only) → verify (CLI + DB + API) → PR. Only opens a PR after independent verification passes.',
  whenToUse:
    'A scoped change on NormasWatch (or any Python repo) that should end in a PR. Pass args.task (what to build) and args.repo (absolute path). Optional: baseBranch, branch, verifyHints, openPr, runReview.',
  phases: [
    { title: 'Setup' },
    { title: 'Implement' },
    { title: 'Simplify' },
    { title: 'Review' },
    { title: 'Verify' },
    { title: 'PR' },
  ],
}

// ─── args / defaults ───────────────────────────────────────────────────────
const a = args || {}
const TASK = a.task
const REPO = a.repo
if (!TASK || !REPO) throw new Error('ship-change requires args.task and args.repo.')

const BASE        = a.baseBranch || 'main'
const BRANCH_HINT = a.branch     || ''
const VERIFY_HINTS = a.verifyHints || ''
const OPEN_PR     = a.openPr !== false
const RUN_REVIEW  = a.runReview !== false

// ─── Phase 0: Setup (git worktree) ────────────────────────────────────────
phase('Setup')
const SETUP_SCHEMA = {
  type: 'object',
  required: ['worktreePath', 'branch', 'baseRef'],
  properties: {
    worktreePath: { type: 'string' },
    branch:       { type: 'string' },
    baseRef:      { type: 'string' },
    hasPrSkill:   { type: 'boolean' },
    envFilesCopied: { type: 'array', items: { type: 'string' } },
    notes:        { type: 'string' },
  },
}
const setup = await agent(
  `Create an isolated git worktree for an upcoming Python/FastAPI change, WITHOUT disturbing the main checkout.

Repo: ${REPO}
Base branch: ${BASE}
Desired branch: ${BRANCH_HINT || '(none — derive a short kebab feat/<slug> or fix/<slug> from the task)'}
Task (for branch-name derivation only — do NOT implement yet):
"""
${TASK}
"""

Steps:
1. cd ${REPO}. Run \`git fetch origin --prune\` (ignore failure if offline). Prefer \`origin/${BASE}\` as base ref, else local \`${BASE}\`.
2. Pick the feature branch name (or use the given one). Ensure it doesn't already exist (append -2 etc.).
3. Choose a worktree path OUTSIDE the main checkout: sibling dir like \`<repo>-worktrees/<branch-slug>\`. Create the parent dir if needed. Never nest inside the repo.
4. Create: \`git -C ${REPO} worktree add <worktreePath> -b <branch> <baseRef>\`.
5. Verify: path exists, \`git -C <worktreePath> rev-parse --abbrev-ref HEAD\` shows the new branch, status is clean.
6. Copy gitignored env files (.env, .env.*) from main checkout into the worktree preserving relative paths:
   - List: \`git -C ${REPO} ls-files --others --ignored --exclude-standard\`
   - Filter: keep only files matching \`.env\` or \`.env.*\` at any depth.
   - For each match \`<rel>\`: mkdir -p the parent in worktree, then cp.
   - Confirm they don't show in \`git -C <worktreePath> status\`.
   - Record copied paths in envFilesCopied.
7. Python note: no node_modules equivalent. The worktree inherits the system Python/venv. Do NOT install anything — the repo's existing environment is already usable. If the repo uses a local venv, note its path in notes.
8. Check for repo PR skill: test for \`<worktreePath>/.claude/skills/pr/SKILL.md\`. Set hasPrSkill=true if exists.

Do NOT implement. Do NOT touch the main checkout (only read from it for env copy). Return worktreePath, branch, baseRef, hasPrSkill, envFilesCopied.`,
  { phase: 'Setup', schema: SETUP_SCHEMA }
)

if (!setup || !setup.worktreePath) {
  log('Setup failed — aborting.')
  return { setup, aborted: true }
}
const WT     = setup.worktreePath
const BRANCH = setup.branch
log(`Worktree: ${WT} (branch ${BRANCH} off ${setup.baseRef})`)
const envCopied = setup.envFilesCopied || []
log(envCopied.length ? `Env files copied: ${envCopied.join(', ')}` : 'No env files to copy.')

// ─── Phase 1: Implement ────────────────────────────────────────────────────
phase('Implement')
const IMPL_SCHEMA = {
  type: 'object',
  required: ['filesChanged', 'summary', 'decisions'],
  properties: {
    filesChanged:  { type: 'array', items: { type: 'string' } },
    summary:       { type: 'string' },
    decisions:     { type: 'array', items: { type: 'string' } },
    openConcerns:  { type: 'array', items: { type: 'string' } },
  },
}
const impl = await agent(
  `Implement the following task. Work ONLY inside the worktree at ${WT} (branch ${BRANCH}). Do NOT touch the main checkout. Do NOT git commit.

TASK:
"""
${TASK}
"""

NormasWatch-specific approach:
- Read CLAUDE.md at ${WT}/CLAUDE.md first for project conventions (Python 3.11, black, isort, Conventional Commits, no co-author attribution).
- Mirror M3 patterns when adding new modules: see src/ingestion/inlabs.py, src/triage/triagem.py, src/api/main.py.
- Prompts for LLM steps go in src/triage/prompts/ as versioned .txt files (never inline).
- Idempotence via (inlabs_id, content_hash) unique constraint — never generate alerts without a real source link.
- If the CBMSC or any external source is unavailable, use a STUB clearly labeled in orgao + inlabs_id fields.
- Do not add "Co-Authored-By" or AI attribution anywhere.

Return: files changed, concise summary, key decisions, open concerns.`,
  { phase: 'Implement', schema: IMPL_SCHEMA }
)
log(`Implement: ${impl?.filesChanged?.length ?? 0} file(s) changed`)

// ─── Phase 2: Simplify ────────────────────────────────────────────────────
phase('Simplify')
const SIMP_SCHEMA = {
  type: 'object',
  required: ['changesMade', 'summary'],
  properties: {
    changesMade: { type: 'array', items: { type: 'string' } },
    summary:     { type: 'string' },
  },
}
const simp = await agent(
  `Quality pass — SIMPLIFY ONLY (do not change behavior, do not expand scope) over the uncommitted changes in ${WT} (branch ${BRANCH}).

What was implemented:
${JSON.stringify(impl, null, 2)}

Steps:
1. Run \`cd ${WT} && git --no-pager diff\` to see all changes.
2. Run black + isort on every changed Python file:
   \`cd ${WT} && python -m black <files> && python -m isort <files>\`
3. Semantic cleanup — look at the diff and improve ONLY changed code for:
   - Reuse/dedup (avoid duplicating logic that already exists in M3 patterns)
   - Altitude (logic in the right module; CLI stays thin, business logic in src/)
   - Simplification (no over-engineering; three similar lines beat a premature abstraction)
4. Do not commit. Apply edits directly. Return what changed.`,
  { phase: 'Simplify', schema: SIMP_SCHEMA }
)
log(`Simplify: ${simp?.changesMade?.length ?? 0} cleanup(s)`)

// ─── Phase 3: Review ──────────────────────────────────────────────────────
let review = null
if (RUN_REVIEW) {
  phase('Review')
  const REVIEW_SCHEMA = {
    type: 'object',
    required: ['blockingIssues', 'verdict'],
    properties: {
      blockingIssues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            issue:    { type: 'string' },
            severity: { type: 'string' },
            file:     { type: 'string' },
            fixed:    { type: 'boolean' },
          },
        },
      },
      fixesApplied: { type: 'array', items: { type: 'string' } },
      verdict:      { type: 'string' },
    },
  }
  review = await agent(
    `Review the uncommitted diff in ${WT} (branch ${BRANCH}) for BLOCKING issues only, then fix them.

Steps:
1. \`cd ${WT} && git --no-pager diff\` to capture the change set.
2. Check for BLOCKING problems only: correctness bugs, runtime errors, security holes (SQL injection, credential leak), regressions to existing M3 behavior, broken idempotence logic, missing url_fonte (every alert MUST have a source link — CLAUDE.md requirement).
3. NormasWatch-specific checks:
   - Stubs must be explicitly marked (inlabs_id prefix "...-stub-" AND orgao contains "[STUB...]")
   - M4+ modulo additions must not break the default M3 /alertas filter (backward compat)
   - LLM prompts must be in .txt files, never inline in Python
   - No "Co-Authored-By" in any committed content
4. FIX every confirmed blocking issue directly in ${WT}. Do NOT commit. Do NOT expand scope.

Return: blocking issues found (with fixed=true/false), fixes applied, one-line verdict.`,
    { phase: 'Review', schema: REVIEW_SCHEMA }
  )
  log(`Review: ${review?.blockingIssues?.length ?? 0} blocking issue(s) — ${review?.verdict}`)
}

// Delegate verify+PR to repo's own /pr skill if it exists
const USE_PR_SKILL = OPEN_PR && !!setup.hasPrSkill
if (USE_PR_SKILL) log('Found /pr skill in worktree — delegating verify+PR to it.')

// ─── Phase 4: Verify ──────────────────────────────────────────────────────
let verify = null
if (!USE_PR_SKILL) {
  phase('Verify')
  const VERIFY_SCHEMA = {
    type: 'object',
    required: ['passed', 'checks', 'summary'],
    properties: {
      passed:  { type: 'boolean' },
      checks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            ok:   { type: 'boolean' },
            note: { type: 'string' },
          },
        },
      },
      couldNotVerify: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
    },
  }
  verify = await agent(
    `Independently verify the uncommitted changes in ${WT} (branch ${BRANCH}). You did NOT write this code — judge it from outside. Be honest: only set passed=true if you actually confirmed it works.

${VERIFY_HINTS ? `Verification hints from the requester:\n${VERIFY_HINTS}\n\n` : ''}Standard NormasWatch verification sequence (adapt to what the task actually changed):

1. **DB connectivity**: \`cd ${WT} && python -c "from src.storage.database import ping; print('DB:', ping())"\`
   → must print "DB: True"

2. **Migrations** (if schema changed): \`python -m src.cli migrate\`

3. **Collection gate** (if ingestion changed):
   \`python -m src.cli run --modulo <M3|M4> --skip-triage --skip-impacto\`
   → confirm "inseridas: N" or "duplicatas: N" (idempotent on 2nd run)
   → \`python -c "from src.storage... query..."\` to confirm record in DB with url_fonte not null

4. **Triage gate** (if triage changed):
   \`python -m src.cli triage\`
   → confirm relevant=True for the expected publication, correct modulo

5. **Impact gate** (if impact changed):
   \`python -m src.cli impacto\`
   → confirm nivel_risco set, no errors

6. **API gate** (if API or dashboard changed):
   Start uvicorn: \`cd ${WT} && python -m uvicorn src.api.main:app --port 8098 &\`
   Wait 3s, then:
   \`python -c "import os, base64, urllib.request as r; ...GET /alertas?modulo=X..."\`
   → confirm expected alerta in response
   Kill uvicorn after.

7. **Formatting check**: \`python -m black --check src/ && python -m isort --check src/\`
   → must pass (Simplify already ran these, but verify they held)

Report each check as a named entry. Set passed=true ONLY if all relevant checks for this task pass. List under couldNotVerify anything that can't be checked locally (Render deploy, email SMTP, OpenAI calls in production).`,
    { phase: 'Verify', schema: VERIFY_SCHEMA }
  )
  log(`Verify: passed=${verify?.passed}`)
}

// ─── Phase 5: PR ──────────────────────────────────────────────────────────
let pr = null
if (!OPEN_PR) {
  log(`openPr=false — changes uncommitted in ${WT} (branch ${BRANCH}).`)
} else if (USE_PR_SKILL) {
  phase('PR')
  pr = await agent(
    `Commit the change, then run THIS repo's /pr skill to verify-and-ship. Work in ${WT} (branch ${BRANCH}, base ${BASE}).

Steps:
1. \`cd ${WT}\` → review \`git status\` and \`git --no-pager diff\`.
2. git add intended files only (no stray files — NOT src/ingestion/inlabs.py if it has pre-existing uncommitted changes unrelated to this task).
3. Commit with Conventional Commit message. NO "Co-Authored-By" line.
4. Read \`${WT}/.claude/skills/pr/SKILL.md\` and follow it exactly.${VERIFY_HINTS ? `\nVerification hints: ${VERIFY_HINTS}` : ''}
5. Return PR URL, branch, commit sha.

If push or gh fails, return prUrl='' with failure reason.`,
    { phase: 'PR', schema: { type: 'object', required: ['prUrl', 'branch', 'summary'], properties: { prUrl: { type: 'string' }, branch: { type: 'string' }, commit: { type: 'string' }, summary: { type: 'string' } } } }
  )
  log(pr?.prUrl ? `PR opened: ${pr.prUrl}` : `PR not opened: ${pr?.summary}`)
} else if (verify && verify.passed) {
  phase('PR')
  pr = await agent(
    `Commit the verified changes and open a PR. Work in ${WT} (branch ${BRANCH}, base ${BASE}).

Steps:
1. \`cd ${WT}\` → review \`git status\` and \`git --no-pager diff\`.
2. git add intended files only. Exclude unrelated pre-existing uncommitted changes.
3. Commit with Conventional Commit message (feat/fix/chore/refactor/docs). NO "Co-Authored-By" line. Message body: what changed and what gates passed.
4. git push -u origin ${BRANCH}.
5. gh pr create --base ${BASE} --head ${BRANCH} with title and body covering:
   - What changed and why
   - Gate evidence (what was verified, with actual output)
   - Out-of-scope / follow-ups
6. Return PR URL, branch, commit sha.`,
    { phase: 'PR', schema: { type: 'object', required: ['prUrl', 'branch', 'summary'], properties: { prUrl: { type: 'string' }, branch: { type: 'string' }, commit: { type: 'string' }, summary: { type: 'string' } } } }
  )
  log(pr?.prUrl ? `PR opened: ${pr.prUrl}` : `PR not opened: ${pr?.summary}`)
} else {
  log(`Verification did NOT pass — skipping PR. Changes uncommitted in ${WT} (branch ${BRANCH}).`)
}

return { setup, impl, simp, review, verify, pr, worktree: WT, branch: BRANCH }

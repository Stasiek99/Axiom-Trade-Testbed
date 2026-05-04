# Axiom Trade Testbed — Claude Instructions

## Project

Angular (v21 standalone) trading bot testing sandbox. See [DEEPSEEK.md](./DEEPSEEK.md) for full project context and tech stack.

## Frontend Styling

When building or modifying frontend components, build UI using **Nebular (`@nebular/theme`)** components and follow the Nebular theming conventions. Specific style rules are maintained in [DEEPSEEK.md](./DEEPSEEK.md#frontend-styling-guidelines) — refer to the **Frontend Styling Guidelines** section there before implementing any UI work.

The user will add specific style rules to DEEPSEEK.md over time. For now, use `NbThemeModule.forRoot('dark')` and Nebular's component library for all UI.

# CLOUDE.md — Agent Workflow & Field Notes

Operating manual for future Claude instances on this project. Read before acting. Two parts:
1. **Skills Architecture** — how work is decomposed and executed.
2. **Experiment Log** — dated record of mistakes. Append on every unexpected failure.

---

## Skills Architecture

Skills bundle **natural-language intent** with **deterministic scripts**. The point: keep probabilistic decision-making out of the execution path. 90% per-step reliability compounds to 59% over 5 steps — push complexity into code so the LLM only handles routing.

### Three layers

**Layer 1 — Skills** (`.claude/skills/<name>/`)
- `SKILL.md` = when to invoke, inputs/outputs, flow.
- `scripts/` = deterministic execution (Node/TS/Python).
- Self-contained. Auto-activate from task context.

**Layer 2 — Orchestration** (the agent)
- Read `SKILL.md`, run bundled scripts in order, handle errors.
- Ask for clarification when intent is ambiguous.
- Update `SKILL.md` when you learn something the next run should know.

**Layer 3 — Shared utilities** (cross-skill code)
- Common helpers (auth, storage, HTTP clients). Used by multiple skills.
- This project's analogue: `backend/src/modules/prisma`, `backend/src/modules/storage`, `frontend/src/app/core`.

Skills for this project will be added in a later step. Do **not** invent or scaffold skills until requested.

---

## Subagent Design-and-Build Loop

For any non-trivial change (new feature, refactor, script):

1. **Write/edit** the code.
2. **Review** — spawn `code-reviewer` subagent on the changed files. It reports issues; it does not fix them.
3. **QA** — spawn `qa` subagent on the code. It generates tests, runs them, reports pass/fail. It does not fix them.
4. **Fix** — the parent agent (you) applies all fixes from review + QA reports.
5. **Ship** — only after review passes and tests pass.

Subagents are **read-only reporters**. All edits happen in the parent.

For research-heavy tasks, spawn `research` first so exploration doesn't pollute the main context.

**Parallel execution:** when reviewing and QA-ing independent files, spawn both in parallel.

---

## Self-Annealing Loop

Errors are signal. When something breaks:
1. Read the error and stack trace — don't paper over it.
2. Fix the script/code and re-test.
3. Update the relevant `SKILL.md` or this file with what you learned.
4. Append a dated entry to the Experiment Log below if the failure was unexpected.

The system gets stronger with every failure that's written down.

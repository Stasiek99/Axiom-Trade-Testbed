# Axiom Trade Testbed — Claude Instructions

## Project

Angular (v21 standalone) trading bot testing sandbox. See [DEEPSEEK.md](./DEEPSEEK.md) for full project context and tech stack.

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

## Indicator Engine Pattern

Source: `src/app/core/indicators/`

### Adding a new indicator

1. Create `src/app/core/indicators/<category>/<id>.ts`
2. Export the pure function with the exact signature:
   ```typescript
   export function sma(bars: BarInput[], period: number): (number | null)[]
   ```
   Return `null` for every index where there is insufficient data.
3. Export an `IndicatorDef` with full `IndicatorMeta` (id, name, shortName, category, description, overlay, params).  
   `description` powers the future explanation window.  
   `params` (array of `OptionParam`) powers the future parameter-editor UI.
4. Call `indicatorRegistry.register(MY_DEF)` at the bottom of the file (side-effect on import).
5. Re-export the pure function and def from the category `index.ts`.

### Rendering on the chart

```typescript
// 1. Calculate
const values = sma(bars, 20);           // (number | null)[]
// 2. Convert to chart-ready points
const data = toChartData(bars, values); // ChartPoint[] (nulls dropped)
// 3. Draw
const series = chartService.addLineSeries(data, { color: '#2962FF' });
// 4. Remove later
chartService.removeSeries(series);
```

### Categories
`moving-averages` | `oscillators` | `momentum` | `trend` | `volatility` | `channels-bands` | `volume` | `patterns`

### Multi-output indicators (MACD, Bollinger Bands, etc.)
Return `(OutputType | null)[]` where `OutputType` is a named interface (e.g. `MACDPoint`).  
Call `toChartData` once per plot line, extracting the relevant scalar from the object.

---

## DeepSeek Proxy — Rules & Limits

Proxy endpoint: `localhost:8082`. Invocation: `.\subagent.ps1 -Task "..."`.

**Hard payload limit: ~4 KB per call.**  
Tasks larger than ~4 KB reliably return `400 Bad Request`. The proxy silently rejects oversized requests — it does not truncate or warn.

### Batching rule
When generating or translating content for N items, never send all N in one call.

1. Estimate task size: `len(items) × avg_item_size`. If > 3 KB, split.
2. Keep each batch ≤ 8–10 items (safe ceiling for indicator-sized payloads).
3. Run up to 3 batches in parallel (PowerShell background jobs or sequential calls).
4. Merge results after all batches complete.

### Passing large task text
Do NOT inline a large task string into the `-Task` argument — shell quoting mangling causes failures.  
Write the task to a temp file first, then read it:
```powershell
# Write task
Set-Content .claude\task.txt @'
<task content here>
'@ -Encoding utf8

# Invoke
$task = Get-Content .claude\task.txt -Raw
.\subagent.ps1 -Task $task
```

### Language direction
Always state the target language explicitly as the first line of the task:
```
Translate to POLISH. Do not include the original English.
```
Omitting this causes the model to return English.

---

## Self-Annealing Loop

Errors are signal. When something breaks:
1. Read the error and stack trace — don't paper over it.
2. Fix the script/code and re-test.
3. Update the relevant `SKILL.md` or this file with what you learned.
4. Append a dated entry to the Experiment Log below if the failure was unexpected.

The system gets stronger with every failure that's written down.

---

## Experiment Log

### 2026-05-06 — DeepSeek proxy 400 on large batches
**What happened:** Sent 33-indicator translation tasks (~15 KB each) to the proxy. Every call returned `400 Bad Request` with no body.  
**Root cause:** Proxy has an undocumented payload size limit (~4 KB). Large requests are rejected outright.  
**Fix:** Split into 10 batches of 8–10 indicators (~2–4 KB each); all succeeded.  
**Rule added:** See "DeepSeek Proxy — Rules & Limits" section above.

### 2026-05-06 — Batch returned in English instead of Polish
**What happened:** One translation batch came back in English despite the task being in Polish context.  
**Root cause:** Task text was all English source material with no explicit target-language directive.  
**Fix:** Added "Translate to POLISH." as the first line of every translation task.  
**Rule added:** Always state target language explicitly as first line.

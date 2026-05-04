# Axiom Trade Testbed — Roadmap

## Vision

A local Angular sandbox for testing algorithmic trading strategies against real historical and live market data from Alpaca Markets. The user defines parameters and conditions; the engine feeds candles sequentially, simulates a portfolio, and overlays statistics on the finished chart.

---

## Proposed Angular Architecture

```
axiom-trade-testbed/               ← Angular project root
├── .env                           ← API keys (gitignored)
├── .env.example                   ← Template committed to repo
├── scripts/
│   └── generate-env.js            ← Reads .env → writes src/environments/*.ts
├── src/
│   ├── environments/
│   │   ├── environment.ts         ← Generated from .env (gitignored)
│   │   └── environment.prod.ts    ← Same, for production builds
│   └── app/
│       ├── core/                  ← Singletons (providedIn: 'root')
│       │   ├── services/
│       │   │   ├── alpaca.service.ts          ← Alpaca REST + WebSocket wrapper
│       │   │   ├── data-feeder.service.ts     ← Replays bars one-by-one for backtesting
│       │   │   └── backtest-engine.service.ts ← Portfolio sim, order execution
│       │   ├── interceptors/
│       │   │   └── alpaca-auth.interceptor.ts ← Injects APCA-* headers on every request
│       │   └── models/
│       │       ├── bar.model.ts               ← OHLCV + timestamp
│       │       ├── order.model.ts             ← BUY/SELL, size, price, timestamp
│       │       ├── position.model.ts          ← Open position state
│       │       ├── trade-result.model.ts      ← Closed trade PnL record
│       │       └── strategy.model.ts          ← Strategy parameter schema
│       ├── features/
│       │   ├── chart/
│       │   │   ├── chart.component.ts         ← Hosts LightweightCharts canvas
│       │   │   ├── chart.service.ts           ← Chart instance + series management
│       │   │   └── trade-markers.component.ts ← Entry/exit arrow overlays
│       │   ├── strategy-builder/
│       │   │   ├── strategy-builder.component.ts  ← Parameter form UI
│       │   │   ├── condition-editor.component.ts  ← Visual condition builder
│       │   │   └── strategy.store.ts              ← Signal store for active strategy
│       │   ├── backtest/
│       │   │   ├── backtest-runner.component.ts   ← Run/Stop controls + progress
│       │   │   ├── stats-panel.component.ts        ← Drawdown, Win/Loss, PF display
│       │   │   └── backtest.store.ts               ← Signal store for results
│       │   └── dashboard/
│       │       └── dashboard.component.ts          ← Main layout shell
│       ├── shared/
│       │   ├── components/
│       │   │   ├── stat-card/
│       │   │   └── loading-spinner/
│       │   └── pipes/
│       │       └── format-currency.pipe.ts
│       ├── app.component.ts       ← Root shell
│       ├── app.config.ts          ← provideRouter, provideHttpClient, etc.
│       └── app.routes.ts
├── angular.json
├── package.json
└── tsconfig.json
```

### Key Technology Decisions

| Concern | Choice | Reason |
|---|---|---|
| Angular version | **v21 (standalone)** | No NgModules boilerplate, signal-first |
| State management | **Angular Signals + signal stores** | Lightweight, no extra deps for this scope |
| Chart library | **lightweight-charts v5** | Same lib as the prototype, battle-tested |
| HTTP | **HttpClient + interceptor** | Clean header injection, testable |
| Styling | **SCSS + CSS custom properties** | Dark trading theme, easy to theme |
| API keys | **`.env` → `environment.ts` via prebuild script** | Keys never in source control |

### API Key Strategy

Angular is a frontend framework — there is no true server-side secret. For this **local dev sandbox** the pattern is:

1. Store keys in `.env` (gitignored).
2. A prebuild Node script (`scripts/generate-env.js`) reads `.env` and writes `src/environments/environment.ts`.
3. `environment.ts` is also gitignored; only `environment.example.ts` (with placeholder values) is committed.
4. Keys are bundled at build time and only accessible from the local machine's build output.

> **Production note:** If this ever becomes a hosted app, move all Alpaca calls behind a thin Node/Express proxy. The frontend should never ship API keys to a public bundle.

---

## Phases

---

### Phase 0 — Project Bootstrap
**Goal:** Angular app runs, chart renders, keys are safe.

- [ ] `ng new axiom-trade-testbed --standalone --routing --style=scss` (Angular v21)
- [ ] Install `lightweight-charts`, `@types/lightweight-charts`
- [ ] Add `.env` + `.env.example` files
- [ ] Write `scripts/generate-env.js` (reads `.env`, emits `environment.ts`)
- [ ] Add `prestart` / `prebuild` npm scripts that run `generate-env.js`
- [ ] Gitignore `.env` and `src/environments/environment.ts`
- [ ] Scaffold `AppComponent` with dark layout shell
- [ ] Smoke test: chart canvas renders with hardcoded dummy data

**Deliverable:** `npm start` → blank dark page with an empty chart. No keys in git.

---

### Phase 1 — Data Layer
**Goal:** Pull real historical bars from Alpaca and feed them to the chart.

- [ ] Define `Bar` model (`open, high, low, close, volume, time`)
- [ ] `AlpacaService` — `getBars(symbol, timeframe, start, end): Observable<Bar[]>`
- [ ] `AlpacaAuthInterceptor` — attaches `APCA-API-KEY-ID` / `APCA-API-SECRET-KEY` headers
- [ ] `AlpacaService` — WebSocket wrapper (real-time bars, quotes, trades)
- [ ] Unit test: `AlpacaService` returns mapped `Bar[]` from mock HTTP response
- [ ] Asset selector UI (symbol input + timeframe dropdown: 1m, 5m, 15m, 1h, 1d)

**Deliverable:** Chart loads last 2 hours of ETH/USD 1-minute bars from Alpaca.

---

### Phase 2 — Live Chart with Real-Time Updates
**Goal:** Chart updates in real time from the WebSocket feed.

- [ ] `ChartComponent` wraps a LightweightCharts instance (destroy on ngOnDestroy)
- [ ] `ChartService` — manages series (candlestick + optional line series for indicators)
- [ ] WebSocket subscription: update current bar on `t` (trade), finalize on `b` (bar)
- [ ] Responsive chart sizing (ResizeObserver)
- [ ] Crosshair price/time tooltip

**Deliverable:** Live-updating candlestick chart identical in behavior to the prototype.

---

### Phase 3 — Strategy Builder
**Goal:** User can define a parameterized strategy without writing code.

#### 3a — Indicator Engine
- [ ] Built-in indicator functions (pure TS, no side effects):
  - `sma(bars, period): number[]`
  - `ema(bars, period): number[]`
  - `rsi(bars, period): number[]`
  - `macd(bars, fast, slow, signal): { macd, signal, histogram }[]`
- [ ] `ChartService.addLineSeries()` — overlay indicator lines on the chart

#### 3b — Strategy Parameter UI
- [ ] `StrategyBuilderComponent` — reactive form with:
  - **Inputs:** named numeric parameters (e.g., `MA_fast = 10`, `MA_slow = 50`)
  - **Entry condition:** dropdown (e.g., "EMA fast crosses above EMA slow")
  - **Exit condition:** dropdown (e.g., "EMA fast crosses below EMA slow")
  - **Risk:** position size (% of capital), commission (bps), slippage (bps)
- [ ] `StrategyStore` (signal store) — holds active strategy config
- [ ] Preset strategies: EMA Cross, RSI Overbought/Oversold, MACD Signal Cross

**Deliverable:** User can configure an EMA 10/30 crossover strategy via UI.

---

### Phase 4 — Backtest Engine
**Goal:** Replay historical bars through the strategy and simulate a portfolio.

- [ ] `DataFeederService` — iterates a `Bar[]` array, emitting one bar at a time (Observable with configurable speed or instant)
- [ ] `BacktestEngineService`:
  - Maintains portfolio state: `cash`, `position`, `equity curve[]`
  - On each bar: evaluates entry/exit conditions against indicator values computed up to that bar
  - Executes orders with commission and slippage applied
  - Records `TradeResult` on position close
- [ ] `BacktestRunnerComponent` — Run / Pause / Stop controls, progress bar
- [ ] Equity curve as a line series overlaid on the chart (secondary Y-axis)

**Deliverable:** Running a backtest replays all bars, opens/closes positions, builds equity curve.

---

### Phase 5 — Statistics Overlay
**Goal:** After backtest completes, surface meaningful performance metrics.

#### Metrics to compute
| Metric | Formula |
|---|---|
| **Net PnL** | Final equity − starting capital |
| **Total Trades** | Count of closed `TradeResult` |
| **Win Rate** | Winning trades / total trades |
| **Profit Factor** | Gross profit / gross loss |
| **Max Drawdown** | Largest peak-to-trough equity drop (%) |
| **Sharpe Ratio** | Mean daily return / StdDev daily return × √252 |
| **Avg Trade Duration** | Mean bars held per trade |

- [ ] `StatsPanel` component — card grid displaying all metrics post-backtest
- [ ] `TradeMarkersComponent` — render ▲ (green) entry and ▼ (red) exit arrows on the candlestick chart at exact timestamps
- [ ] Drawdown chart — separate area series below the main chart
- [ ] Export to CSV: full trade log + equity curve

**Deliverable:** After backtest, chart shows entry/exit markers; stats panel shows all metrics.

---

### Phase 6 — Polish & UX
**Goal:** Production-quality feel for regular use.

- [ ] Multi-asset support (BTC/USD, SOL/USD, etc.) with symbol search
- [ ] Strategy presets — save/load strategies from `localStorage`
- [ ] Dark theme refinement (match the terminal aesthetic of the prototype)
- [ ] Keyboard shortcuts: Space = Run/Pause, R = Reset, S = Save strategy
- [ ] Responsive layout (side panel collapses on narrow screens)
- [ ] Proper error states: API down, rate limit hit, WebSocket disconnect + reconnect

---

## Out of Scope (for now)

- Paper trading (sending live orders to Alpaca) — Phase 7 candidate
- Multi-strategy comparison — Phase 7 candidate
- Portfolio-level backtesting across multiple assets simultaneously
- Authentication / user accounts (this is a local tool)

---

## Open Questions

1. **Speed of backtest replay** — Should there be a visual "replay at 1×/10×/instant" mode, or always instant?
2. **Indicator extensibility** — Plugin system for custom indicators, or hardcoded set for v1?
3. **Data range** — Cap historical fetch at 30 days to stay within Alpaca free tier limits?
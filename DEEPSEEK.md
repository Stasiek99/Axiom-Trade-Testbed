# Axiom Trade Testbed — DeepSeek Instructions

This file provides context for the DeepSeek model when working on the **Axiom Trade Testbed** project.

---

## Project Overview

A local Angular sandbox for testing algorithmic trading strategies against real historical and live market data from Alpaca Markets. The user defines parameters and conditions; the engine feeds candles sequentially, simulates a portfolio, and overlays statistics on the finished chart.

## What We're Building

A single-page Angular (v21 standalone) application with:
- A **candlestick chart** using LightweightCharts v5 with real-time WebSocket updates from Alpaca
- A **strategy builder** UI for configuring trading strategies (indicators, entry/exit conditions, risk params)
- A **backtest engine** that replays historical bars through the strategy and simulates a portfolio
- **Stats overlay** with performance metrics (PnL, win rate, Sharpe ratio, drawdown, etc.)

## Tech Stack

| Concern | Choice |
|---|---|
| Angular version | **v21 (standalone)** |
| UI library | **Nebular (Akveo)** — `@nebular/theme`, `@nebular/eva-icons`, `@nebular/bootstrap-kit` |
| State management | **Angular Signals + signal stores** |
| Chart library | **lightweight-charts v5** |
| Styling | **SCSS + Nebular theme system** (dark trading theme) |
| HTTP | **HttpClient + interceptor** for Alpaca API |
| API keys | **`.env` → `environment.ts`** via prebuild script |

## Key Directories

```
src/
├── app/core/       — Singletons: services, interceptors, models
├── app/features/   — Feature modules: chart, strategy-builder, backtest, dashboard
├── app/shared/     — Reusable components, pipes
└── environments/   — Generated from .env (gitignored)
```

## Reference

- See [ROADMAP.md](./ROADMAP.md) for full architecture, phases, and implementation order.
- See [CLAUDE.md](./CLAUDE.md) for additional project-level model instructions.

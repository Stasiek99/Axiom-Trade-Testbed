# Axiom Trade Testbed

**A browser-based trading strategy builder and backtesting engine — no server, no database, no install.**

![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![Lightweight Charts](https://img.shields.io/badge/Lightweight%20Charts-v5-2962ff)
![License](https://img.shields.io/badge/license-MIT-green)

🇬🇧 English | [🇵🇱 Polski](README.pl.md)

---

## What it is

Axiom Trade Testbed is a fully client-side Angular application that lets you compose a no-code trading strategy from 80+ technical indicators, run a bar-by-bar backtest against live market data from Binance or Alpaca, and inspect the results through an interactive equity curve, trade log, and statistics panel.

There is no backend. All computation runs in the browser, all data is fetched directly from public exchange APIs, and all state (strategy presets, backtest history) lives in `localStorage`.

---

## Features

### Live Chart

![Live Chart](images/screencapture-localhost-4200-2026-05-08-14_10_17.png)

- Real-time candlestick chart powered by **Lightweight Charts v5**
- Live price stream via **Binance WebSocket** for crypto pairs (BTC, ETH, SOL, DOGE, AVAX)
- Historical OHLCV data from **Alpaca** for US equities
- Timeframes: M1 · M5 · M15 · H1 · H4 · D1
- Symbol selector with both crypto and stock instruments

### Strategy Builder

![Strategy Builder](images/screencapture-localhost-4200-strategy-2026-05-08-14_10_28.png)

- Visual no-code editor — pick entry and exit indicators from a catalogue
- Four indicator slots: entry-primary, entry-secondary, exit-primary, exit-secondary
- **20+ signal conditions**: crossover, threshold, divergence, above/below band, MACD histogram, price vs. indicator, and more
- Risk parameters: commission (bps), slippage (bps), position size (% of equity)
- Save / restore / delete named **user presets** (persisted to `localStorage`)
- Built-in strategy presets for quick exploration

### Statistics & Backtesting

![Statistics](images/screencapture-localhost-4200-statistics-2026-05-08-14_10_46.png)

- Equity curve chart with trade entry/exit markers
- Drawdown area chart
- Full trade log table (entry/exit price, P&L, bars held, exit reason)
- Backtest history sidebar — all previous runs are preserved across sessions
- **Output metrics:** Total return · Net P&L · Max drawdown · Win rate · Profit factor · Sharpe ratio (annualised, √252) · Avg trade duration

### Learn Module

![Learn](images/screencapture-localhost-4200-learn-2026-05-08-14_11_26%20(1).png)

- Financial glossary: 11 topic groups, 117 terms
- Full-text search
- Mathematical formulas rendered with **KaTeX**

### Internationalisation
- English / Polish (EN · PL) — toggleable at runtime
- All UI strings, indicator names, parameter descriptions, and formula legends are i18n-aware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, signals, lazy routes) |
| Language | TypeScript 5 |
| Charting | Lightweight Charts v5 |
| UI components | Angular Material |
| Reactive layer | RxJS 7 |
| Market data — crypto | Binance REST API + WebSocket |
| Market data — equities | Alpaca Markets REST API |
| Math rendering | KaTeX |
| State persistence | `localStorage` (no backend) |
| Build | Angular CLI / esbuild |

---

## How it Works

### Indicator Registry

Every indicator (80+) is a standalone TypeScript module that calls `registerIndicator()` on import. The barrel file `src/app/core/indicators/index.ts` imports all modules as side-effects, populating the registry at boot. The strategy builder reads from this registry to render the catalogue and the backtest engine looks up indicators by key at runtime.

Indicator categories: Moving Averages · Oscillators · Momentum · Trend · Volatility · Volume · Channels & Bands · Candlestick Patterns

### Backtest Engine (`BacktestEngineService`)

```
fetch OHLCV bars  →  compute indicator arrays  →  bar-by-bar loop
                                                        │
                                             evaluate entry condition
                                                        │
                                            [in position] evaluate exit
                                                        │
                                         record trade · update equity curve
                                                        │
                                        compute summary stats → BacktestResult
```

The condition evaluator (`condition-evaluator.ts`) normalises heterogeneous indicator output shapes (single scalar, two-line, MACD triple, band triple, Ichimoku, Alligator…) into a uniform comparison interface so all 20+ condition types work against any indicator combination.

### Data Flow

```
Binance WS (real-time)  ─┐
                          ├──► ChartComponent  ──► Lightweight Charts
Alpaca REST (historical) ─┘

Alpaca / Binance REST ──► BacktestRunnerComponent ──► BacktestEngineService
                                                              │
                                                     BacktestStore (signals)
                                                              │
                                          BacktestChartComponent  +  StatsPanel
```

### State Management

Angular signals are used throughout — there is no NgRx or third-party store. `StrategyStore` and `BacktestStore` are `@Injectable({ providedIn: 'root' })` services that expose `signal()` and `computed()` values directly consumed by components.

---

## Getting Started

### Prerequisites

- Node.js 20+
- An **Alpaca** paper-trading API key (free at [alpaca.markets](https://alpaca.markets)) for stock data

### Setup

```bash
git clone https://github.com/Stasiek99/axiom-trade-testbed.git
cd axiom-trade-testbed
npm install
```

Create an `.env` file in the project root:

```env
ALPACA_API_KEY=your_key_here
ALPACA_API_SECRET=your_secret_here
```

```bash
npm start
# → http://localhost:4200
```

Crypto data (Binance) works with no API key. Stock data requires the Alpaca credentials above.

---

## Project Structure

```
src/app/
├── core/
│   ├── backtest/           # engine, models, store, condition evaluator
│   ├── indicators/         # 80+ indicators — self-registering modules
│   │   ├── moving-averages/
│   │   ├── oscillators/
│   │   ├── momentum/
│   │   ├── trend/
│   │   ├── volatility/
│   │   ├── volume/
│   │   └── channels-bands/
│   ├── strategy/           # strategy model, store, presets
│   ├── services/           # Binance REST, Binance WS, Alpaca REST
│   └── i18n/               # translations, indicator names, formula legends
└── features/
    ├── chart/              # live chart + symbol selector
    ├── strategy-builder/   # strategy editor, backtest runner, trade log
    ├── statistics/         # equity curve, drawdown, history sidebar
    └── learn/              # glossary with search and KaTeX formulas
```

---

## License

MIT

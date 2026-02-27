# Agent System — Detailed Usage Guide

## Overview

This project implements an **agentic inventory management system** composed of four specialised agents coordinated by a central orchestrator. The agents work together to **automatically detect low-stock products, forecast future demand, calculate reorder quantities, select the best supplier, and create purchase-order drafts** — all without manual intervention.

The entire pipeline lives under `lib/agents/` and is exposed to the application via a Next.js API route at `app/api/agent/run/route.ts`.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                     API Route (GET / POST)                      │
│               app/api/agent/run/route.ts                        │
│          Triggers: runAgentSystem(userId)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR                                │
│               lib/agents/orchestrator.ts                        │
│                                                                 │
│  1. Calls Inventory Agent → get low-stock product IDs           │
│  2. For each product:                                           │
│       a. Calls Forecast Agent  → predicted avg. demand          │
│       b. Calls Reorder Agent   → reorder quantity (or skip)     │
│       c. Calls Supplier Agent  → best supplier contact          │
│       d. Creates a DRAFT StockTransfer with a StockMove         │
└─────────────────────────────────────────────────────────────────┘
        │               │               │               │
        ▼               ▼               ▼               ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Inventory│   │ Forecast │   │ Reorder  │   │ Supplier │
  │  Agent   │   │  Agent   │   │  Agent   │   │  Agent   │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

---

## Agent Descriptions

### 1. Inventory Agent (`lib/agents/inventory.agent.ts`)

**Purpose:** Identify every product whose current stock has fallen below its configured minimum.

**How it works:**

```typescript
export async function getLowStockProducts()
```

1. Fetches **all** `StockLevel` records from the database, including the related `Product`.
2. Iterates over the results and compares `stock.quantity` against `product.minStock`.
3. Returns an array of `productId` strings for products that are **below their minimum stock threshold**.

**Database models used:**
| Model | Fields referenced |
|---|---|
| `StockLevel` | `quantity`, `productId` |
| `Product` | `minStock` |

**Key behaviour:**
- A product appears in the result only when `stock.quantity < product.minStock`.
- If no stock levels exist, the returned array is empty and the orchestrator terminates early.

---

### 2. Forecast Agent (`lib/agents/forecast.agent.ts`)

**Purpose:** Predict future demand for a specific product based on its recent historical consumption data.

**How it works:**

```typescript
export async function forecastDemand(productId: string)
```

1. Queries the `DemandHistory` table for up to the **last 30 records** of the given product, ordered newest-first.
2. If no history exists, it returns a **default forecast of 10 units** (safe fallback).
3. Otherwise, it computes the **simple moving average (SMA)** — total quantity ÷ number of records — and returns that value.

**Database models used:**
| Model | Fields referenced |
|---|---|
| `DemandHistory` | `productId`, `quantity`, `date` |

**Forecasting method:**

$$
\text{forecast} = \frac{\sum_{i=1}^{n} \text{quantity}_i}{n}, \quad n \leq 30
$$

**Key behaviour:**
- Uses a trailing window of at most 30 data points (most recent first).
- Falls back to a constant (`10`) when a product has zero history — ensuring the system still attempts a reorder evaluation for brand-new products.

---

### 3. Reorder Agent (`lib/agents/reorder.agent.ts`)

**Purpose:** Decide **whether** a product needs restocking and, if so, **how many units** to order.

**How it works:**

```typescript
export async function calculateReorder(productId: string, forecast: number)
```

1. Looks up the current `StockLevel` for the product (including its `Product` relation).
2. Uses a **fixed lead time of 5 days** and the product's `minStock` as the **safety stock**.
3. Calculates the **reorder point**:

$$
\text{reorderPoint} = (\text{forecast} \times \text{leadTime}) + \text{safetyStock}
$$

4. If `stock.quantity < reorderPoint`, the agent returns:

$$
\text{reorderQuantity} = \lceil \text{reorderPoint} - \text{stock.quantity} \rceil
$$

5. Otherwise, it returns `null` (no order needed).

**Database models used:**
| Model | Fields referenced |
|---|---|
| `StockLevel` | `quantity`, `productId` |
| `Product` | `minStock` |

**Key behaviour:**
- The lead time (5 days) is currently hard-coded and could be enhanced to read from `SupplierProfile.leadTimeDays`.
- Returning `null` signals to the orchestrator that this product can be skipped for the current run.

---

### 4. Supplier Agent (`lib/agents/supplier.agent.ts`)

**Purpose:** Select the **best available supplier** to fulfil an incoming purchase order.

**How it works:**

```typescript
export async function selectBestSupplier()
```

1. Fetches all `SupplierProfile` records (with their linked `Contact`).
2. Sorts them **descending** by `reliabilityScore`.
3. Returns the **top-ranked supplier** (highest reliability).
4. Returns `null` if no suppliers exist.

**Database models used:**
| Model | Fields referenced |
|---|---|
| `SupplierProfile` | `reliabilityScore`, `contactId` |
| `Contact` | (joined) |

**Selection criteria:**

$$
\text{bestSupplier} = \arg\max_{s \in \text{suppliers}} s.\text{reliabilityScore}
$$

**Key behaviour:**
- The same supplier is chosen for every product in a single run because the function does not currently filter by product or category.
- `priceModifier` and `leadTimeDays` fields exist on `SupplierProfile` but are not yet factored into the selection — this is an extension point.

---

## Orchestrator (`lib/agents/orchestrator.ts`)

**Purpose:** Coordinate the four agents into a **sequential pipeline** and persist the results as draft stock transfers.

**How it works:**

```typescript
export async function runAgentSystem(userId: string)
```

### Execution Flow (step-by-step):

| Step | Agent / Action | Input | Output |
|------|---------------|-------|--------|
| 1 | `getLowStockProducts()` | — | `string[]` of product IDs below minimum stock |
| 2 | **For each** `productId`: | | |
| 2a | `forecastDemand(productId)` | `productId` | Predicted average demand (number) |
| 2b | `calculateReorder(productId, forecast)` | `productId`, forecast | `{ productId, quantity }` or `null` |
| 2c | *(skip if reorder is null)* | | |
| 2d | `selectBestSupplier()` | — | Supplier with highest reliability score |
| 2e | **Create `StockTransfer`** | All of the above | A `DRAFT` / `INCOMING` transfer record |

### Database Record Created

For every product that needs restocking, the orchestrator writes:

**`StockTransfer`:**
| Field | Value |
|---|---|
| `reference` | `AUTO-{timestamp}` (e.g. `AUTO-1740681600000`) |
| `type` | `INCOMING` |
| `status` | `DRAFT` |
| `contactId` | Best supplier's contact ID (or `null`) |
| `userId` | The user ID passed to the function |

**`StockMove` (nested create):**
| Field | Value |
|---|---|
| `productId` | The low-stock product |
| `quantity` | Calculated reorder quantity |
| `userId` | The user ID passed to the function |

---

## API Route (`app/api/agent/run/route.ts`)

The agent pipeline is exposed as a Next.js API route supporting both **GET** and **POST** methods.

```
GET  /api/agent/run  →  triggers runAgentSystem(userId)
POST /api/agent/run  →  triggers runAgentSystem(userId)
```

- Currently uses a **hard-coded user ID** (`cmm4lmteq0000rzepq19zanls`); in production this should be resolved from the authenticated session.
- Returns `{ "message": "Agent executed (GET|POST)" }` upon completion.

---

## Data Flow Diagram

```
DemandHistory ──────►  Forecast Agent
                            │
                            ▼ (avg. demand)
                                                    ┌──────────────┐
StockLevel + Product ──►  Inventory Agent ─────────►│ Orchestrator │
                                                    │              │
StockLevel + Product ──►  Reorder Agent ◄───────────│   (loop per  │
                            │                       │   product)   │
                            ▼ (quantity)            │              │
                                                    │              │
SupplierProfile ───────►  Supplier Agent ◄──────────│              │
                            │                       │              │
                            ▼ (contactId)           │              │
                                                    └──────┬───────┘
                                                           │
                                                           ▼
                                                    StockTransfer
                                                      + StockMove
                                                       (DRAFT)
```

---

## Summary Table

| Agent | File | Function | Role |
|---|---|---|---|
| Inventory | `lib/agents/inventory.agent.ts` | `getLowStockProducts()` | Detects products below minimum stock |
| Forecast | `lib/agents/forecast.agent.ts` | `forecastDemand(productId)` | Predicts demand via simple moving average |
| Reorder | `lib/agents/reorder.agent.ts` | `calculateReorder(productId, forecast)` | Computes reorder point & quantity |
| Supplier | `lib/agents/supplier.agent.ts` | `selectBestSupplier()` | Selects highest-reliability supplier |
| Orchestrator | `lib/agents/orchestrator.ts` | `runAgentSystem(userId)` | Coordinates all agents, creates draft transfers |

---

## Possible Enhancements

1. **Dynamic lead time** — Read `leadTimeDays` from the selected `SupplierProfile` instead of the hard-coded `5`.
2. **Product-aware supplier selection** — Filter suppliers by the categories or products they can fulfil.
3. **Weighted supplier scoring** — Combine `reliabilityScore`, `priceModifier`, and `leadTimeDays` into a composite score.
4. **Configurable forecast window** — Allow the number of historical records (currently 30) to be a system setting.
5. **Session-based user resolution** — Replace the hard-coded user ID in the API route with the authenticated user from the session.
6. **Batch optimisation** — Group multiple products into a single `StockTransfer` for the same supplier instead of one transfer per product.
7. **Scheduling** — Run the agent system on a cron schedule (e.g., daily at midnight) rather than on-demand via the API route.
8. **Max stock cap** — Utilise `Product.maxStock` to avoid over-ordering beyond warehouse capacity.

# AgentHacks IMS — Complete Application Flow

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | Custom JWT sessions (`jose`) stored in HTTP-only cookies |
| State / Caching | React Query (`@tanstack/react-query`), Next.js `revalidatePath` |
| Styling | Tailwind CSS, shadcn/ui component library |
| Theming | `next-themes` (light / dark / system) |
| Validation | Zod schemas on every server action |
| Email | Nodemailer (SMTP) for OTP delivery |
| AI / Agents | Custom agentic pipeline (`lib/agents/`) |

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                               │
│  Landing Page  │  Auth Pages  │  Dashboard + Sub-pages                 │
└───────┬────────┴──────┬───────┴────────────┬───────────────────────────┘
        │               │                    │
        ▼               ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               NEXT.JS SERVER  (App Router)                             │
│                                                                        │
│  Server Components (pages)  ──►  Server Actions (app/actions/)         │
│  API Routes (app/api/)      ──►  Agent Orchestrator (lib/agents/)      │
│  Middleware / Session        ──►  Prisma Client  ──►  PostgreSQL       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Application Entry Point & Providers

### Root Layout (`app/layout.tsx`)

Every page is wrapped by:

```
<Providers>          ← React Query + next-themes ThemeProvider
  {children}
  <Toaster />        ← react-hot-toast for notifications
</Providers>
```

The `Providers` component (`components/providers.tsx`) initialises:
- **`QueryClientProvider`** — enables React Query for client-side data fetching/caching.
- **`ThemeProvider`** — enables dark/light/system theme toggling via `next-themes`.

---

## 4. Authentication Flow

### 4.1 Session Management (`lib/session.ts`)

| Function | Purpose |
|---|---|
| `createSession(userId, role)` | Signs a JWT (HS256, 7-day expiry) containing `userId` and `role`, stores it in an HTTP-only `session` cookie |
| `getSession()` | Reads and verifies the `session` cookie; returns the JWT payload or `null` |
| `deleteSession()` | Clears the `session` cookie (logout) |

### 4.2 Sign Up (`/sign-up`)

```
User fills form  ──►  signUp() server action  ──►  Zod validation
         │                                              │
         │                     ┌────────────────────────┘
         │                     ▼
         │         Check for existing user (by email)
         │                     │
         │          ┌──── exists? ────┐
         │          ▼ yes             ▼ no
         │    Return error       Hash password (bcrypt)
         │                           │
         │                     Create User in DB
         │                           │
         │                     Return { success: true }
         ▼
  Client shows toast → redirects to /sign-in
```

**Validation rules:**
- Login ID (name): 6–12 chars, alphanumeric + underscores
- Email: valid email
- Password: ≥8 chars, 1 lowercase, 1 uppercase, 1 special char
- Role: MANAGER | STAFF | STOCK_MASTER (optional, defaults to STAFF)

### 4.3 Sign In (`/sign-in`)

```
User fills form  ──►  signIn() server action  ──►  Zod validation
         │                                              │
         │                     ┌────────────────────────┘
         │                     ▼
         │         Look up user by email OR login ID (name)
         │                     │
         │          ┌──── found? ────┐
         │          ▼ no              ▼ yes
         │    Return error       bcrypt.compare(password)
         │                           │
         │                  ┌── match? ──┐
         │                  ▼ no          ▼ yes
         │           Return error    createSession(userId, role)
         │                                │
         │                          redirect("/dashboard")
```

- If the user is already logged in (session cookie exists), the sign-in page **auto-redirects** to `/dashboard`.

### 4.4 Forgot Password (`/forgot-password`)

```
Step 1 — Request OTP
  Email  ──►  forgotPassword()  ──►  Generate 4-digit OTP
                                      Store OTP + 10-min expiry in User record
                                      Send OTP via email (Nodemailer / SMTP)

Step 2 — Reset Password
  Email + OTP + New Password  ──►  resetPassword()
                                      Verify OTP + expiry
                                      Hash new password (bcrypt)
                                      Update User, clear OTP fields
```

### 4.5 Sign Out

```
signOut()  ──►  deleteSession()  ──►  redirect("/sign-in")
```

Available from the dashboard sidebar's logout button.

---

## 5. Page Routing Map

### 5.1 Public Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Marketing page with hero, stats, features, solutions, CTA sections |
| `/sign-in` | Sign In | Authentication form (redirects to `/dashboard` if session exists) |
| `/sign-up` | Sign Up | Registration form (redirects to `/dashboard` if session exists) |
| `/forgot-password` | Forgot Password | OTP-based password reset |

### 5.2 Dashboard Pages (Authenticated)

All dashboard pages share a common layout with a **sidebar** + **header**.

| Route | Page | Server Action | Description |
|---|---|---|---|
| `/dashboard` | Dashboard Home | `getDashboardStats()`, `getReorderRecommendations()` | KPI cards, operation counts, inventory value, low-stock alerts, AI reorder recommendations |
| `/dashboard/inventory` | Products | `getProducts()` | Product list with CRUD |
| `/dashboard/categories` | Categories | `getCategories()` | Category management (hierarchical) |
| `/dashboard/warehouses` | Warehouses | `getWarehouses()` | Warehouse CRUD with locations |
| `/dashboard/inventory/locations` | Locations | `getLocations()` | Location hierarchy management |
| `/dashboard/operations` | All Operations | `getTransfers()` | Combined view of all transfers |
| `/dashboard/operations/receipts` | Receipts | `getTransfers("INCOMING")` | Incoming stock from vendors |
| `/dashboard/operations/deliveries` | Deliveries | `getTransfers("OUTGOING")` | Outgoing stock to customers |
| `/dashboard/moves` | Stock Moves | `getStockMoves()` | History of individual product movements |
| `/dashboard/stock` | Current Stock | `getCurrentStock()` | Real-time stock levels by location |
| `/dashboard/contacts` | Contacts | `getContacts()` | Vendor and customer management |
| `/dashboard/users` | Users | — | User management (placeholder) |
| `/dashboard/settings` | Settings | — | System configuration (placeholder) |

### 5.3 API Routes

| Route | Method | Description |
|---|---|---|
| `/api/agent/run` | GET / POST | Triggers the autonomous agent pipeline |

---

## 6. Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────────────────────────┐  │
│  │          │  │              HEADER                      │  │
│  │          │  │  [☰ Menu] [User Info] [Theme Toggle]    │  │
│  │  SIDEBAR │  ├──────────────────────────────────────────┤  │
│  │          │  │                                          │  │
│  │ Overview │  │            PAGE CONTENT                  │  │
│  │ Operatns │  │       (Server Component)                 │  │
│  │ Inventoy │  │                                          │  │
│  │ Reportng │  │   Fetches data via Server Actions        │  │
│  │ Config   │  │   Renders tables, cards, dialogs         │  │
│  │          │  │                                          │  │
│  │ [Logout] │  │                                          │  │
│  └──────────┘  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Dashboard Layout** (`app/dashboard/layout.tsx`):
1. Server component calls `getCurrentUser()` to fetch the authenticated user.
2. Passes user data to `DashboardLayoutClient` (client component).
3. Client component renders the sidebar, header, and a scrollable content area.
4. Sidebar is collapsible on mobile (hamburger toggle).

**Sidebar Groups:**
- **Overview** — Dashboard
- **Operations** — Receipts, Deliveries, All Operations
- **Inventory** — Products, Categories, Warehouses, Locations
- **Reporting** — Stock Moves, Current Stock
- **Configuration** — Contacts (Users), Settings

---

## 7. Core Data Flows

### 7.1 Product Management (CRUD)

```
Products Page  ──►  getProducts()  ──►  Prisma query  ──►  Render ProductsView
        │
        ├──  [+ Add Product]  ──►  ProductDialog (form)
        │         │
        │         ▼
        │    createProduct()  ──►  Zod validation  ──►  prisma.product.create
        │         │
        │    revalidatePath("/dashboard/inventory")
        │
        ├──  [Edit]  ──►  updateProduct()  ──►  prisma.product.update
        │
        └──  [Delete]  ──►  deleteProduct()  ──►  prisma.product.delete
```

### 7.2 Stock Transfer Lifecycle

Transfers represent **operational documents** (Receipts, Deliveries, Internal Transfers).

```
                    ┌──────────┐
                    │  DRAFT   │  ← Created by user or agent
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ WAITING  │  (optional intermediate state)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  READY   │  (optional intermediate state)
                    └────┬─────┘
                         │
                  validateTransfer(id)
                         │
                    ┌────▼─────┐
                    │   DONE   │  ← Stock levels updated
                    └──────────┘
```

**`validateTransfer(id)`** — The critical state transition:

1. Sets `StockTransfer.status = DONE`, records `effectiveDate`.
2. For **each StockMove**:
   - Sets `StockMove.status = DONE`.
   - **Decrements** `StockLevel` at source location (or creates a negative record).
   - **Increments** `StockLevel` at destination location (or creates a new record).
3. All updates run inside a **Prisma `$transaction`** for atomicity.

### 7.3 Transfer Creation Flow

```
User clicks [+ New Receipt/Delivery]
        │
        ▼
  TransferDialog (form)
  - Select type (INCOMING / OUTGOING / INTERNAL)
  - Select contact (vendor or customer)
  - Select source & destination locations
  - Add product lines (product + quantity)
        │
        ▼
  createTransfer()
  - Generate reference: WH/IN/00001, WH/OUT/00001, etc.
  - Create StockTransfer + nested StockMoves
  - Status: DRAFT
  - revalidatePath for relevant pages
```

---

## 8. Dashboard Home — Data Aggregation

The dashboard homepage fetches two data sets in parallel:

### `getDashboardStats()`

Returns:
- **Operation counts** per type (INCOMING, OUTGOING, INTERNAL): toProcess, late, waiting, total, completed, pending, issues
- **Low stock count** — products where total stock ≤ `minStock`
- **Total inventory value** — Σ (stock quantity × cost price)
- **Warehouse count**, **Category count**

### `getReorderRecommendations()`

AI-powered reorder suggestions:
1. Fetches all STORABLE products with their stock levels.
2. Analyses outgoing transfers from the last 30 days to compute **daily demand**.
3. Calculates **reorder point** = (dailyDemand × leadTime) + safetyStock.
4. If `currentStock ≤ reorderPoint`, produces a recommendation with:
   - Suggested order quantity
   - Coverage days remaining
   - Priority (HIGH if below safety stock, MEDIUM otherwise)
5. Returns the **top 8** most urgent recommendations, sorted by priority then coverage days.

---

## 9. Agentic Automation Pipeline

The system includes an autonomous **multi-agent pipeline** that can automatically create purchase orders.

### Trigger

```
GET or POST  /api/agent/run
       │
       ▼
  runAgentSystem(userId)    ← lib/agents/orchestrator.ts
```

### Pipeline

```
Step 1:  Inventory Agent  →  Find all products where stock < minStock
              │
              ▼
         For each low-stock product:
              │
Step 2:  ───► Forecast Agent  →  Compute SMA over last 30 DemandHistory records
              │
Step 3:  ───► Reorder Agent   →  Calculate reorder point & quantity
              │                   (skip if stock is above reorder point)
              │
Step 4:  ───► Supplier Agent  →  Select supplier with highest reliabilityScore
              │
Step 5:  ───► Create DRAFT StockTransfer (type: INCOMING)
              with one StockMove for the reorder quantity
```

**Agents:**

| Agent | Function | Data Source |
|---|---|---|
| Inventory Agent | `getLowStockProducts()` | `StockLevel` + `Product.minStock` |
| Forecast Agent | `forecastDemand(productId)` | `DemandHistory` (last 30 records, SMA) |
| Reorder Agent | `calculateReorder(productId, forecast)` | `StockLevel`, lead time (5 days), safety stock |
| Supplier Agent | `selectBestSupplier()` | `SupplierProfile.reliabilityScore` |

Each auto-generated transfer gets a reference like `AUTO-1740681600000`.

---

## 10. Data Model Relationships

```
User ─────────┬──► Category ──► Product ──► StockLevel ◄── Location ◄── Warehouse
              │         │           │             ▲              ▲
              │         │           │             │              │
              │         └───────────┤       StockMove ───────────┘
              │                     │         ▲
              │                     │         │
              │                     ▼         │
              │               DemandHistory   │
              │                               │
              ├──► Contact ──► SupplierProfile │
              │         │                     │
              │         └───► StockTransfer ──┘
              │
              └──► Warehouse ──► Location
```

**Key model relationships:**
- **User** owns all data (multi-tenant by `userId`).
- **Product** belongs to a **Category** (optional, hierarchical).
- **StockLevel** = unique (product, location) pair tracking current quantity.
- **StockTransfer** = the document (receipt, delivery, internal move).
- **StockMove** = individual line items within a transfer.
- **Contact** = vendor or customer; vendors can have a **SupplierProfile** with `reliabilityScore`, `leadTimeDays`, `priceModifier`.
- **DemandHistory** = historical demand records used by the Forecast Agent.

---

## 11. Server Action Summary

| File | Actions | Domain |
|---|---|---|
| `actions/auth.ts` | `signUp`, `signIn`, `signOut`, `forgotPassword`, `resetPassword` | Authentication |
| `actions/user.ts` | `getCurrentUser` | User profile |
| `actions/dashboard.ts` | `getDashboardStats`, `getReorderRecommendations` | Dashboard KPIs |
| `actions/product.ts` | `getProducts`, `createProduct`, `updateProduct`, `deleteProduct` | Product CRUD |
| `actions/category.ts` | `getCategories`, `createCategory`, `updateCategory`, `deleteCategory` | Category CRUD |
| `actions/warehouse.ts` | `getWarehouses`, `createWarehouse`, `updateWarehouse`, `deleteWarehouse`, `getLocations`, `createLocation`, `updateLocation`, `deleteLocation` | Warehouse & Location CRUD |
| `actions/contact.ts` | `getContacts`, `createContact`, `deleteContact` | Contact CRUD |
| `actions/operation.ts` | `getTransfers`, `createTransfer`, `validateTransfer`, `deleteTransfer`, `getTransferById` | Stock transfer operations |
| `actions/stock.ts` | `getStockMoves`, `getCurrentStock` | Stock reporting |

All server actions:
1. Verify the session via `getSession()`.
2. Validate inputs with **Zod** schemas.
3. Scope all DB queries to `userId` (multi-tenant isolation).
4. Call `revalidatePath()` after mutations to refresh cached pages.

---

## 12. End-to-End User Journey

```
1.  User visits  /  (Landing Page)
         │
         ├──►  /sign-up   →  Create account  →  Redirect to /sign-in
         │
         └──►  /sign-in   →  Authenticate    →  JWT cookie set
                                                      │
                                                      ▼
2.  /dashboard  (Home)
    ├── View KPI stats, operation counts, low-stock alerts
    ├── View AI reorder recommendations
    ├── Quick actions: "Add Stock", "Deliver Stock"
    │
3.  /dashboard/warehouses  →  Create warehouses
    /dashboard/inventory/locations  →  Create locations within warehouses
    │
4.  /dashboard/categories  →  Organize products into categories
    /dashboard/inventory   →  Add products (name, SKU, price, min/max stock)
    │
5.  /dashboard/contacts    →  Add vendors and customers
    │
6.  /dashboard/operations/receipts   →  Create receipt (INCOMING transfer)
    │   Select vendor → add product lines → Save as DRAFT
    │   → Validate → Stock levels increase at destination location
    │
7.  /dashboard/operations/deliveries →  Create delivery (OUTGOING transfer)
    │   Select customer → add product lines → Save as DRAFT
    │   → Validate → Stock levels decrease at source location
    │
8.  /dashboard/moves  →  View full audit trail of stock movements
    /dashboard/stock   →  View real-time stock levels by location
    │
9.  GET /api/agent/run  →  Agent system scans for low stock
    │   → Forecasts demand → Calculates reorder → Selects supplier
    │   → Auto-creates DRAFT receipt transfers
    │
10. User reviews auto-created drafts in Receipts page
    → Validates them → Stock is replenished
```

---

## 13. Security Model

| Concern | Implementation |
|---|---|
| Authentication | JWT (HS256) via `jose`, stored in HTTP-only, secure, SameSite=lax cookie |
| Session duration | 7 days |
| Password storage | bcrypt (10 rounds) |
| Multi-tenancy | Every DB query filtered by `userId` from session |
| Input validation | Zod schemas on all server actions |
| CSRF protection | Server Actions use POST by default; cookie is SameSite=lax |
| Role-based access | `UserRole` enum (ADMIN, MANAGER, STOCK_MASTER, STAFF) stored in JWT — extensible but not yet enforced on routes |
| OTP for password reset | 4-digit code, 10-minute expiry, sent via email |

---

## 14. Key Component Map

| Component | Type | Location | Purpose |
|---|---|---|---|
| `Sidebar` | Client | `components/dashboard/sidebar.tsx` | Navigation with collapsible groups |
| `Header` | Client | `components/dashboard/header.tsx` | Top bar with user info, menu toggle |
| `OperationCard` | Server | `components/dashboard/operation-card.tsx` | Stat card for receipts/deliveries/internal |
| `ProductsView` | Client | `components/inventory/products-view.tsx` | Product list with search/filter |
| `ProductDialog` | Client | `components/inventory/product-dialog.tsx` | Create/edit product form |
| `CategoryList` | Client | `components/inventory/category-list.tsx` | Category management |
| `WarehouseList` | Client | `components/inventory/warehouse-list.tsx` | Warehouse cards |
| `LocationList` | Client | `components/inventory/location-list.tsx` | Location hierarchy |
| `TransferDialog` | Client | `components/operations/transfer-dialog.tsx` | Create receipt/delivery/internal transfer |
| `TransferList` | Client | `components/operations/transfer-list.tsx` | Transfer table with actions |
| `ReceiptView` | Client | `components/operations/receipt-view.tsx` | Transfer detail view |
| `StockTable` | Client | `components/inventory/stock-table.tsx` | Current stock levels |
| `MovesContainer` | Client | `components/inventory/moves-container.tsx` | Stock move history (table + kanban) |
| `ContactList` | Client | `components/contacts/contact-list.tsx` | Contact management |
| `SignInForm` | Client | `components/auth/sign-in-form.tsx` | Login form with react-hook-form |
| `SignUpForm` | Client | `components/auth/sign-up-form.tsx` | Registration form |
| `ForgotPasswordForm` | Client | `components/auth/forgot-password-form.tsx` | OTP-based password reset |

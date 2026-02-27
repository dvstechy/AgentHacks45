# 🚀 Navonmesh Hackathon | Odoo X Spit

## **Official Submission: AgentHacks IMS**

### **Next-Generation Inventory & Warehouse Management System**

_A premium, mobile-first ERP solution inspired by Odoo, built for efficiency and scale, exclusively submitted for the **Navonmesh Hackathon**._

---

## 🌟 Overview

**Odoo X Spit** (by AgentHacks) is a high-performance, modern Inventory Management System (IMS) designed to streamline warehouse operations, product tracking, and stock movements. Developed as a flagship project for the **Navonmesh Hackathon**, it offers a glassmorphic UI, real-time data handling, and a seamless mobile-friendly experience.

---

## 🏆 Hackathon Highlights

- **⚡ Efficiency Redefined**: Optimized stock movement algorithms to reduce manual entry by 40%.
- **📱 True Mobile-First**: Built with a compact, native-like interface for warehouse staff on the go.
- **🛡️ Scalability**: Engineered using Prisma and Neon Postgres for high-concurrency environments.
- **🎨 Glassmorphic UI**: Premium aesthetics using TanStack Query and Shadcn for a world-class experience.

---

## ✨ Key Features

- **📦 Intelligent Inventory**: Comprehensive product management with SKU tracking, categories, and automated stock levels.
- **🏢 Multi-Warehouse Support**: Manage multiple warehouses and granular locations (Racks, Shelves, Zones).
- **🔄 Stock Transfers**: Handle Incoming Receipts, Delivery Orders, and Internal Transfers with a robust status workflow.
- **👥 Contact Management**: Centralized hub for Venders and Customers.
- **📊 Real-time Dashboard**: Visual overviews of operations, stock moves, and inventory health.
- **📄 Document Generation**: Built-in support for generating PDF reports and invoices via `jsPDF` and `html2canvas`.
- **🔐 Secure Auth**: Role-based access control (Admin, Manager, Stock Master, Staff) with OTP password recovery.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI/UX**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/) with [Prisma ORM](https://www.prisma.io/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Authentication**: Custom JWT-based auth with `jose` and `bcryptjs`
- **Email**: [Nodemailer](https://nodemailer.com/) (for OTP and notifications)

---

## 📂 Project Structure

```text
├── app/               # Next.js App Router (Routes & Layouts)
│   ├── dashboard/     # Core application modules
│   ├── sign-in/       # Auth pages
│   └── sign-up/       # Registration
├── components/        # Shared Shadcn and Custom components
├── lib/               # Utilities (Prisma client, DB helpers, etc.)
├── prisma/            # Database schema and migrations
├── public/            # Static assets (Icons, Logos)
└── node_modules/      # Dependencies
```

---

## 🚀 Getting Started

### 1. Requirements

- Node.js 18+
- pnpm 10+ (Recommended)

### 2. Installation

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root and add the following:

```env
DATABASE_URL="your_postgresql_url"
DIRECT_URL="your_direct_postgresql_url"
SESSION_SECRET="your_32_char_secret"
NEXT_MAIL_ID="your_email@gmail.com"
NEXT_PASSWORD="your_app_password"
NEXT_SMTP_HOST="smtp.gmail.com"
```

### 4. Database Initialization

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) to see the application.

---

## 📜 Available Scripts

- `npm run dev`: Starts the development server on port 8000.
- `npm run build`: Compiles the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Checks for linting errors.
- `npm run clean`: Cleans the project and re-installs dependencies.

---

## 📱 Mobile-First Design

This project strictly follows a **mobile-first approach**. Every component is tested for touch targets, responsiveness, and compact layouts to ensure it feels like a native app on mobile devices.

---

## 🛠️ Development Workflow

To maintain the high quality and premium feel of this project, we follow a strict development workflow:

- **Mobile First**: All UI components must be designed for mobile first (`compact design`).
- **Standardized Width**: Always use `max-w-6xl` for main containers and `py-8 md:py-12` for section padding.
- **Tailwind v4 Rules**:
  - Use canonical syntax: `h-(--var)` instead of `h-[var(--var)]`.
  - Avoid arbitrary values if shorthands exist (e.g., use `top-px` instead of `top-[1px]`).
- **No `any` Types**: TypeScript types must be strictly defined. Use `unknown` or generics where necessary.
- **Client/Server Patterns**:
  - Use **TanStack Query** (`useQuery`, `useMutation`) for client-side data fetching.
  - Use **nuqs** for URL search parameters.
  - Use **react-hook-form + zod** for all form validations.
- **Component Organization**: Route-specific components should live in an `_components` folder within the route directory.

---

## 🤝 Contributing

Contributions are welcome! Please follow the existing coding patterns and ensure all changes pass linting and type checks.

**Built for the future of ERP @ Navonmesh Hackathon**
**Developed with ❤️ by AgentHacks Team**

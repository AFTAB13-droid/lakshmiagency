# 🪷 Lakshmi Agency - Luxury Review, Rebate & Deal Mediation Platform

> *"Your Needs... Our Priority..."*

A full-stack, enterprise-grade e-commerce review, rebate, and deal mediation web application inspired by AspireMint and ZMAOnline. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas (Mongoose)**, **Framer Motion**, and **Three.js**.

---

## 🌟 Key Features

### 1. 👑 Three Distinct Role Workspaces
* **`ADMIN` (Master Command Center)**:
  * Master overview with live KPIs, active inventory, and Google Form submission streams.
  * **Deals Studio**: Create, edit, and manage deals with granular Rating vs. Review slot meters.
  * **Master Orders Hub**: Dual-form verification desk (Form 1 Order Proof + Form 2 Review Proof).
  * Rejection desk with instant **In-App Notifications** + 1-click **WhatsApp Direct notice** (zero Gmail dependencies).
  * Brand & Marketplace catalogs and WhatsApp pitch templates.
* **`PREMIUM_USER` (Mediator / Agent Desk)**:
  * Browse active deals in Column (Grid) or Row (List) view with pagination.
  * 1-Click WhatsApp pitch generator embedding their unique Mediator Code (e.g. `#LAX096`).
  * Realtime order tracking, 20-day review countdowns, and UPI payout profile.
* **`USER` (Buyer Portal)**:
  * **Active Deals Page (`/buyer/deals`)**: Explore live deals on Amazon, Flipkart, and Myntra with direct product links, Google Order Form, and Google Refund Form buttons.
  * **My Orders & Tracking (`/buyer`)**: Track 4-step progress, holding timers, and dual-form submission details.
  * 1-Click **Order Claiming Tool** by marketplace Order ID.

### 2. 🔔 Realtime Alert Center & Synthesized Audio Chime
* In-app notification drawer mounted directly to `document.body` via React `createPortal` (100vh full viewport height).
* Pleasant 4-tone ascending E-Major arpeggio synthesizer built via **Web Audio API** (zero external `.mp3` dependencies).
* Swinging bell animation with live unread counter badge.
* Filters for `All`, `Unread`, `Read`, individual read/unread toggles, single delete, and bulk "Clear All".

### 3. 🛡️ Enterprise Security & Route Protection
* Edge Middleware (`src/middleware.ts`) using NextAuth JWT decryption.
* Strict Role-Based Access Control (RBAC) across `/admin/*`, `/mediator/*`, `/buyer/*`, and `/api/*`.
* Built-in rate limiting and malicious payload firewall against SQL/NoSQL injection scans.

### 4. 🔗 Dual Google Forms & Webhook Synchronization
* Live webhooks for Google Forms & Google Sheets (`/api/webhooks/google-form/order` and `/refund`).
* Deducts deal slots dynamically and matches registered buyers by email, mobile number, or Order ID.

### 5. 🎨 Luxury Aesthetic & 3D Visuals
* Royal Lakshmi Agency palette (`#520D38` plum, `#E83A89` lotus pink, `#D4AF37` champagne gold).
* Interactive Three.js 3D rotating metallic lotus gem emblem.
* Custom 3D mathematical quantum wave 404 & error boundary pages.
* Strictly Indian Rupee (`₹`) pricing codebase-wide.

---

## 🚀 Tech Stack

* **Framework:** Next.js 14.2 (App Router, Server & Client Components)
* **Language:** TypeScript
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Authentication:** NextAuth.js (JWT session strategy, Edge compatible)
* **Styling:** Tailwind CSS + Custom Design System
* **Animations:** Framer Motion
* **3D Graphics:** Three.js
* **Sound Engine:** Web Audio API (native browser synthesis)
* **Image Cloud:** Cloudinary

---

## 🛠️ Getting Started

### 1. Clone the repository:
```bash
git clone https://github.com/AFTAB13-droid/lakshmiagency.git
cd lakshmiagency
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Configure environment variables:
Copy `.env.example` to `.env.local` and add your credentials:
```bash
cp .env.example .env.local
```

### 4. Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
Private proprietary software developed for **Lakshmi Agency**. All rights reserved.

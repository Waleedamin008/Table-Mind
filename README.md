# TableMind Demo — Interactive Prototype

A full clickable demo of the TableMind AI-powered restaurant management system.

## Quick Start

```bash
npm install
npm start
```

Then open http://localhost:3000

## Screens Included

| Screen | Description |
|--------|-------------|
| 🏠 Home | Demo launcher with all screens |
| 📊 Dashboard | Owner analytics — sales, live orders, inventory, peak hours |
| 📱 Tablet POS | Staff order-taking with menu, cart, modifiers, table selection |
| 👨‍🍳 Kitchen Display (KDS) | Live order flow: New → Preparing → Ready with timers |
| 📲 QR Ordering | Customer-facing mobile menu via QR code scan |
| 📋 Order History | All orders with sync status, service time, payment status |
| 📴 Offline Mode Demo | Step-by-step offline ordering and sync walkthrough |

## Demo Flow (as per brief)

1. Open **Tablet POS** → Select Table 5
2. Add Jollof Rice, Grilled Tilapia, Sobolo
3. Add modifier (e.g. Extra Spicy) → Send to Kitchen
4. Open **Kitchen Display** → See order in "New" column
5. Click "Start Preparing" → "Mark Ready" → "Complete & Serve"
6. Check **Order History** — order appears with service time
7. Check **Dashboard** — live orders update
8. Open **Offline Demo** → Follow the 3-step offline/sync walkthrough

## Design System

- Warm cream `#F5EFE6` background
- Espresso brown `#2C1810` text
- Terracotta red `#C0452A` accents
- Playfair Display (headings) + DM Sans (body)

## Tech Stack

React 18 · Pure CSS (no UI library) · CSS Variables · Context API

---
Made for Ghana 🇬🇭 · TableMind AI-Powered Restaurant Management

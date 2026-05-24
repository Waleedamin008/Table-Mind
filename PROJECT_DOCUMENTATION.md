# TableMind Project Documentation

## 1. Project Overview

TableMind is a React-based interactive restaurant management demo/prototype. It simulates a connected restaurant workflow across multiple interfaces:

- Owner dashboard
- Tablet POS
- Kitchen Display System (KDS)
- QR ordering screen
- Order history
- Offline ordering and sync demo

The app is built as a single-page front-end prototype with local React state and static demo data. There is no backend, database, authentication, API integration, or persistent storage in the current project.

## 2. Main Goal of the Project

The project demonstrates how a restaurant can manage:

- Table-based dine-in orders
- Takeaway orders
- Kitchen order flow
- Dashboard analytics
- Order history and sync states
- Offline order queuing and later sync

It is designed as a clickable pitch/demo experience rather than a production-ready application.

## 3. Tech Stack

- React 18
- React DOM 18
- `react-scripts` 5
- `lucide-react` for icons
- Pure CSS with CSS variables
- React Context API for shared app state

## 4. Project Structure

```text
tablemind/
|-- public/
|   `-- index.html
|-- src/
|   |-- components/
|   |   `-- Shared.js
|   |-- context/
|   |   `-- AppContext.js
|   |-- data/
|   |   `-- index.js
|   |-- screens/
|   |   |-- DashboardScreen.js
|   |   |-- HomeScreen.js
|   |   |-- KDSScreen.js
|   |   |-- OfflineScreen.js
|   |   |-- OrderHistoryScreen.js
|   |   |-- POSScreen.js
|   |   `-- QROrderingScreen.js
|   |-- App.js
|   |-- index.css
|   `-- index.js
|-- .env
|-- package.json
`-- README.md
```

## 5. Application Architecture

### 5.1 Routing

The app does not use `react-router`. Screen navigation is handled manually through a `currentScreen` value stored in context.

Available screens:

- `home`
- `dashboard`
- `pos`
- `kds`
- `qr`
- `history`
- `offline`

### 5.2 Global State

Shared state is managed in `src/context/AppContext.js`.

Main context values:

- `currentScreen`
- `isOnline`
- `kdsOrders`
- `orderHistory`
- `pendingSyncOrders`
- `cart`
- `selectedTable`
- `orderType`
- `nextOrderId`
- `dashboardStats`
- `notification`
- `tick`

### 5.3 Global Actions

Implemented context actions:

- `setCurrentScreen`
- `toggleOnline`
- `addToCart`
- `removeFromCart`
- `updateCartQty`
- `sendOrderToKitchen`
- `updateKdsStatus`
- `setSelectedTable`
- `setOrderType`
- `showNotification`
- `getElapsedMins`

## 6. Demo Data Included

The project ships with hardcoded demo data in `src/data/index.js`.

Included datasets:

- `MENU_ITEMS`
- `CATEGORIES`
- `TABLES`
- `INITIAL_KDS_ORDERS`
- `ORDER_HISTORY`

### 6.1 Menu Data

The menu contains:

- Mains
- Sides
- Drinks
- Desserts

Each menu item includes:

- `id`
- `name`
- `category`
- `price`
- `popular`
- `emoji`
- `description`
- `modifiers`

### 6.2 Table Data

Each table contains:

- `id`
- `number`
- `status`
- `seats`

Table statuses used in the demo:

- `available`
- `occupied`
- `reserved`

### 6.3 KDS Order Data

Kitchen orders include:

- `id`
- `status`
- `table`
- `type`
- `placedAt`
- `items`
- `targetMins`

KDS statuses:

- `new`
- `preparing`
- `ready`
- `completed`

## 7. Shared UI Components

Reusable components are defined in `src/components/Shared.js`.

### 7.1 `Logo`

Displays the TableMind brand mark and subtitle in small, medium, or large size.

### 7.2 `OnlineBadge`

Shows online/offline state and allows toggling connectivity by clicking it.

Behavior:

- Displays `Online` when connected
- Displays `Offline` when disconnected
- Shows pending sync count when offline orders exist

### 7.3 `Notification`

Displays a temporary floating message for:

- Success
- Warning
- Error

### 7.4 `TimerBadge`

Shows an elapsed order timer for kitchen orders.

Behavior:

- Updates every second
- Shows elapsed minutes and seconds
- Compares elapsed time against target minutes
- Changes style for warning and late orders

### 7.5 `Card`

Reusable bordered container with optional hover/click behavior.

### 7.6 `Button`

Reusable button with multiple variants:

- `primary`
- `secondary`
- `ghost`
- `danger`
- `success`

### 7.7 `Badge`

Reusable small label with color themes:

- `nude`
- `green`
- `red`
- `amber`
- `blue`

### 7.8 `SideNav`

Reusable side navigation component. Present in shared code, though some screens use their own custom nav markup instead.

## 8. Screen-by-Screen Functionality

## 8.1 Home Screen

File: `src/screens/HomeScreen.js`

Purpose:

- Entry screen for the demo
- Lets the user open any major module

Working functionality:

- Displays a hero area with product branding
- Shows clickable cards for each main screen
- Navigates to:
  - Dashboard
  - POS
  - KDS
  - QR Ordering
  - Order History
  - Offline Demo

## 8.2 Dashboard Screen

File: `src/screens/DashboardScreen.js`

Purpose:

- Owner-facing analytics and operations summary

Working functionality:

- Left sidebar navigation UI
- Top bar with:
  - Greeting
  - Online badge
  - Notifications icon
  - Outlet selector button
- Summary stat cards for:
  - Live orders
  - Total sales
  - Inventory low-stock count
  - Food waste
  - Customers
  - Peak hours
- Top menu items panel
- Live order summary panel using KDS state
- Weekly revenue sparkline/chart
- CTA button to open POS screen
- Back-to-home button

Dynamic behavior:

- Live order counts are calculated from `kdsOrders`
- `dashboardStats.liveOrders` increases when an online order is sent to the kitchen
- `dashboardStats.liveOrders` decreases when an order is completed in KDS
- `dashboardStats.totalSales` increases when an online POS order is sent

Demo-only/static behavior:

- Most analytics numbers are hardcoded demo values
- Sidebar tabs do not load different internal pages
- Notification bell and outlet selector are visual only
- Inventory, customer, reports, analytics, and settings sections are not implemented as separate screens

## 8.3 POS Screen

File: `src/screens/POSScreen.js`

Purpose:

- Staff-facing ordering interface for table service and takeaway

Working functionality:

- Left vertical POS nav UI
- Switch between `Dine In` and `Takeaway`
- Select a table for dine-in orders
- Search menu items by name
- Filter menu by category
- View menu items as cards
- Add simple items directly to cart
- Open modifier modal for items with modifiers
- Add custom modifier selections
- Add kitchen note
- Change item quantity before adding from modal
- Increase/decrease cart item quantity
- Remove cart items
- View cart subtotal
- View 5% service charge
- View cart grand total
- Send order to kitchen
- Show offline warning when disconnected
- Return to home screen

Table selection behavior:

- Opens a table selector modal
- Displays available, occupied, and reserved tables
- Selected table is stored globally

Order sending behavior:

- If online:
  - Order is pushed into `kdsOrders`
  - Dashboard live orders increase
  - Dashboard total sales increase
  - Success notification is shown
- If offline:
  - Order is saved into `pendingSyncOrders`
  - Warning notification is shown
  - Cart is cleared

Current POS limitations:

- Left-side nav tabs are mostly visual only
- `Pay` button has no payment workflow
- No receipt generation
- No backend order persistence
- No customer profile flow
- No real table occupancy updates after order placement

## 8.4 Kitchen Display Screen

File: `src/screens/KDSScreen.js`

Purpose:

- Kitchen-facing live order board

Working functionality:

- Displays current date and time
- Shows online/offline state
- Groups orders into 3 columns:
  - New
  - Preparing
  - Ready
- Shows order metadata:
  - Order ID
  - Order type
  - Table
  - Placed time
  - Item list
  - Item notes
- Shows timer badge for each order
- Shows order progress bar
- Highlights warning and late orders visually
- Advances order state using action button:
  - `new -> preparing`
  - `preparing -> ready`
  - `ready -> completed`
- Removes completed orders from KDS after a short delay
- Adds completed orders to order history
- Reduces dashboard live order count when completed
- Home button returns to demo launcher

Completion behavior:

When an order is marked `completed`, the app creates a history entry containing:

- Order ID
- Table
- Type
- Item summary
- Payment status
- Sync status
- Service time
- Placed time
- Served time

Current KDS limitations:

- No station filtering logic behind `All Stations`
- No drag-and-drop
- No sound alerts
- No printer integration
- No real-time multi-user sync

## 8.5 QR Ordering Screen

File: `src/screens/QROrderingScreen.js`

Purpose:

- Mobile-style customer ordering screen for QR/table ordering

Working functionality:

- Mobile-width centered layout
- Fixed demo table number: `Table 12`
- Category tabs
- Menu item list
- Add/remove item quantity in a local customer cart
- Modifier sheet for items with modifiers
- Add special instructions
- Expand/collapse cart summary
- View item count, subtotal, service charge, and total
- Checkout button
- Order confirmation screen after submission
- Return to home screen

Important implementation detail:

- This screen uses its own `localCart` for customer-side selection.
- On submit, it attempts to copy items into the shared app cart and then call the same global kitchen-send action used by the POS.

Current QR limitations:

- Fixed table number instead of real QR/table scanning
- No payment integration
- No backend
- No persistent order tracking for customer after confirmation
- No real menu availability logic
- Customer URL and domain are visual/demo text only

## 8.6 Order History Screen

File: `src/screens/OrderHistoryScreen.js`

Purpose:

- View historical and pending-sync orders

Working functionality:

- Sticky top bar with search
- Online/offline badge
- Summary cards for:
  - Total orders
  - Synced orders
  - Pending sync orders
  - Average service time
- Filter tabs for:
  - All orders
  - Pending sync
  - Dine In
  - Takeaway
- Search by:
  - Order number
  - Table name
- Table/grid display of orders
- Payment status badge
- Sync status badge
- Service time display
- Empty-state message when filters return no results

Data sources:

- Existing `orderHistory`
- Pending offline orders mapped from `pendingSyncOrders`

Current history limitations:

- No pagination
- No export
- No order detail drawer/modal
- No editing or refund workflow
- Totals for newly completed KDS orders are stored as `0`

## 8.7 Offline Demo Screen

File: `src/screens/OfflineScreen.js`

Purpose:

- Demonstrates offline ordering and sync behavior as a guided flow

Working functionality:

- Multi-step visual walkthrough:
  - Start
  - Go Offline
  - Create Order
  - Pending Sync
  - Sync
- Connection status banner
- Offline queue panel
- Ability to toggle offline mode
- Add demo items to an offline cart
- Create an offline order
- Reconnect and sync pending orders
- Shows sync completion state
- Button to open KDS after sync

Offline sync behavior:

- While offline, created orders are stored in `pendingSyncOrders`
- When going back online, pending orders are inserted into `kdsOrders`
- Pending queue is then cleared
- Success notification is shown

Current offline demo limitations:

- Guided demo uses static sample items only
- No local storage or IndexedDB persistence
- Offline queue disappears on page refresh
- No sync conflict handling
- No retry/failure state beyond simple pending status

## 9. Detailed Functional Flows

## 9.1 POS to Kitchen Flow

1. User opens POS screen
2. User chooses `Dine In` or `Takeaway`
3. User optionally selects a table
4. User adds menu items to cart
5. User optionally applies modifiers and notes
6. User clicks `Send to Kitchen`
7. If online:
   - Order appears in KDS
   - Dashboard live order count increases
   - Total sales increase
8. If offline:
   - Order is stored in pending sync queue

## 9.2 KDS Completion Flow

1. Kitchen sees new order
2. Kitchen clicks `Start Preparing`
3. Kitchen clicks `Mark Ready`
4. Kitchen clicks `Complete & Serve`
5. Order moves into order history
6. Order is removed from KDS
7. Dashboard live order count is reduced

## 9.3 Offline Sync Flow

1. User toggles app offline
2. New orders are saved into `pendingSyncOrders`
3. User toggles app online
4. Queued orders are pushed to `kdsOrders`
5. Pending queue is cleared

## 10. Styling and Design System

Global styles are defined in `src/index.css`.

### 10.1 Color Palette

Main design tokens:

- Cream background
- Espresso text
- Terracotta accents
- Nude/sand neutrals
- Green success state
- Amber warning state

### 10.2 Typography

Configured fonts:

- `Playfair Display` for headings
- `DM Sans` for body text

### 10.3 UI Patterns Used

- Card-based layout
- Rounded corners
- Soft shadows
- Animated entry transitions
- Status-based badges
- Sticky top bars
- Mobile-style QR layout

### 10.4 Animations Included

- `fadeIn`
- `slideIn`
- `pulse`
- `spin`
- `scaleIn`
- `notifySlide`

## 11. What Is Actually Dynamic in the Current Project

These parts change at runtime:

- Current screen selection
- Online/offline state
- Cart contents
- Cart totals
- Selected table
- Order type
- KDS order list
- KDS order status changes
- Order timers
- Order history additions from completed KDS orders
- Pending sync queue
- Notification messages
- Some dashboard counts tied to app state

## 12. What Is Static or Simulated

These parts are demo/static:

- Authentication
- User accounts
- Restaurant/outlet management
- Inventory management actions
- Reports pages
- Customer records
- Payment processing
- Backend syncing
- Database persistence
- Real QR scanning
- Printer integration
- Real analytics calculations
- Role permissions
- API communication

## 13. Known Gaps and Prototype Boundaries

This project should currently be treated as a front-end prototype. Important boundaries:

- No backend or server
- No real data persistence after refresh
- No real order/payment APIs
- No authentication or authorization
- No responsive routing library
- Some buttons and nav items are visual only
- Several metrics are hardcoded
- Some workflows reuse shared state in a prototype-style way instead of a full production architecture

## 14. Setup and Run Instructions

Install and run locally:

```bash
npm install
npm start
```

Build for production:

```bash
npm run build
```

The app runs with Create React App tooling through `react-scripts`.

## 15. Suggested Future Improvements

Recommended next steps:

- Add React Router for real navigation
- Add backend APIs for orders, tables, and analytics
- Persist offline queue in local storage or IndexedDB
- Add proper payment flow
- Add real QR/table identification
- Add order detail pages and editing
- Add dashboard drill-down views
- Add inventory and customer modules
- Add tests
- Add type safety with TypeScript
- Replace demo data with API-driven data

## 16. Short Summary

TableMind is a polished React demo of a restaurant operating system with multiple connected interfaces. The strongest implemented parts are:

- Screen-to-screen demo navigation
- POS cart/order flow
- KDS workflow and timers
- Order history view
- Dashboard overview
- Offline queue and sync simulation

It is currently best described as an interactive prototype with meaningful front-end behavior, not a production-ready full-stack system.

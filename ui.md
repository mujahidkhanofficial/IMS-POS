# Role & Objective
Act as a Lead UI/UX Engineer specializing in "Data-Dense Desktop Applications."
Your task is to design and implement the user interface for the Inventory & POS system.
The goal is a **"Clean, Modern, Utilitarian"** aesthetic similar to Linear, Stripe Dashboard, or Toast POS.

# Design System & Constraints
- **Library:** Tailwind CSS (v3.4+) + ShadcnUI (Radix Primitives).
- **Icons:** Lucide React (Standard, clean strokes).
- **Font:** 'Inter' or 'Geist Sans' (Variable font, optimized for UI legibility).
- **Theme Mode:** System Default (Support Dark/Light mode via Tailwind `darkMode: 'class'`).

# Color Palette Strategy (Tailwind Configuration)
- **Primary:** Violet/Indigo (`indigo-600`) - Used for active states, primary buttons, and focus rings.
- **Background:**
    - Light: `slate-50` (App bg), `white` (Cards/Panels).
    - Dark: `slate-950` (App bg), `slate-900` (Cards/Panels).
- **Semantic Colors:**
    - **Success (Stock In/Sale):** `emerald-500`
    - **Danger (Low Stock/Delete):** `rose-500`
    - **Warning (Near Expiry):** `amber-500`
- **Borders:** Subtle! Use `slate-200` (Light) and `slate-800` (Dark).

# Layout Architecture (The App Shell)
Since this is an Electron app, we need a custom "frameless" feel.
1.  **Custom Title Bar:**
    - Height: `h-8`.
    - Content: App Icon (Left), Breadcrumbs (Center), Window Controls (Minimize, Maximize, Close - Right).
    - Drag Region: `-webkit-app-region: drag` applied correctly.
2.  **Sidebar Navigation (Left):**
    - Fixed width (`w-64`), collapsible to icon-only (`w-16`).
    - High contrast active state (e.g., bg-indigo-50 text-indigo-700).
    - Links: Dashboard, POS (Highlighted), Products, Inventory, Reports, Settings.
3.  **Main Content Area:**
    - `flex-1`, `overflow-hidden` (Internal scrolling only).
    - Padding: `p-6`.

# Key Screen Directives (Strict Implementation Details)

## 1. The POS Screen (The "Money Maker")
*Design Goal: Speed & Touch-friendliness.*
- **Layout:** Split View.
    - **Left Panel (65%): Product Grid.**
        - Search bar at top (Auto-focus on mount).
        - Grid of Product Cards: Image (placeholder), Name, Stock Badge, Price (Bold).
        - Hover effect: `scale-105` + Shadow-lg.
    - **Right Panel (35%): The Cart.**
        - Fixed height, sticky right side.
        - List of items with `+` / `-` stepper buttons.
        - **Footer:** Massive "Pay / Checkout" button (Green/Indigo).
        - **Key Hints:** Show small badges like `[F10 Pay]` `[F1 Search]` to teach keyboard shortcuts.

## 2. Inventory Data Grid (The "Manager")
*Design Goal: Information Density.*
- **Table Component:**
    - Sticky Header (`th` background must be opaque).
    - Alternating row colors (Zebra striping) optional, but clear border separators required.
    - **Columns:** Name, SKU, Category, Brand, Cost, Price, Stock (Color-coded pill: Red < 10, Green > 10), Actions.
    - **Row Height:** Compact (`h-10`) to see more items at once.
- **Filters:** A toolbar above the table with "Search", "Filter by Category", and "Export" button.

## 3. Dashboard (The "Overview")
- **KPI Cards:** Use a 4-column grid.
    - Icon (Left), Value (Big, Bold), Label (Small, muted), Trend Indicator (+5% vs yesterday in Green).
- **Charts:** Use `recharts` for a clean "Sales over time" Area Chart. Minimal axes, tooltip on hover.

# UX "Micro-Interactions" Requirements
1.  **Focus States:** CRITICAL for keyboard users. Ensure every button/input has a clear `ring-2 ring-indigo-500` on focus.
2.  **Feedback:**
    - When adding to cart: A subtle "Toast" notification (bottom-right).
    - When scanning barcode: A quick flash or sound effect.
3.  **Loading States:** Never show a blank screen. Use Skeleton loaders (`bg-slate-200 animate-pulse`) that mimic the table structure.

# Execution Plan for UI
1.  Configure Tailwind `theme.extend` with the colors above.
2.  Build the **AppLayout** component (Sidebar + Titlebar).
3.  Create reusable atoms: `Button`, `Input`, `Badge`, `Card`.
4.  Implement the **POS Layout** first as it is the most complex UI.

Proceed with configuring the Tailwind theme and creating the App Shell.
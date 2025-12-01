
# Software Requirements Specification (SRS)
**Project Name:** Inventory & POS System (MVP)
**Platform:** Windows (Electron + React)
**Version:** 1.0

---

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to define the requirements for a standalone, offline-first Inventory Management and Point of Sale (POS) application. The software is designed for small to medium retail businesses to manage stock, process sales, and track financial performance without relying on continuous internet connectivity.

### 1.2 Scope
* **Target Audience:** Retail shop owners, wholesalers, and small distributors.
* **Key Capabilities:** Offline database, Hardware-locked licensing, Barcode scanning, Thermal printing, and Automated backups.

---

## 2. Technical Architecture
### 2.1 Tech Stack
* **Frontend/UI:** React.js (with a UI library like Material UI, Tailwind, or Ant Design).
* **App Container:** Electron (Main Process).
* **Database:** SQLite (Stored locally on the user's file system).
* **Inter-Process Communication:** Electron IPC Main/Renderer for safe database queries.

### 2.2 Deployment
* **Installer:** `.exe` or `.msi` generated via `electron-builder`.

---

## 3. Functional Requirements

### Module 1: Licensing & Security (Startup Flow)
**Objective:** Protect the software from unauthorized distribution using a Machine ID mechanism.

1.  **Hardware Fingerprint:** Upon launch, the app must generate a unique `MachineID` (based on Motherboard/HDD serial).
2.  **Verification:**
    * Check for a locally stored `license.key` file.
    * If the key is missing or invalid: Redirect to **Activation Screen**.
    * If the key is valid: Redirect to **Dashboard**.
3.  **Activation Screen:** Display the User's `MachineID` and provide an input field for the `License Key`.
4.  **Validation Logic:** The app validates the input key using a proprietary offline algorithm (e.g., `Hash(MachineID + SecretSalt)`).

### Module 2: Inventory Management (Back Office)
**Objective:** Maintain accurate records of products and stock levels.

1.  **Add/Edit Product:**
    * Fields: Product Name, SKU (Unique), Barcode, Category, Brand, Cost Price (CP), Selling Price (SP), Tax Rate (%), Reorder Level.
2.  **Stock List View:** A data grid showing all products with search, filter, and sort capabilities.
3.  **Barcode Integration:** The search field must accept input from USB Barcode Scanners (simulating keyboard input) ending with an `Enter` key event.
4.  **Stock Adjustment:** Feature to manually decrease stock for non-sales reasons (e.g., Damaged, Expired, Theft) with a "Reason" note.

### Module 3: Point of Sale (POS) Interface
**Objective:** Fast billing process for the front counter.

1.  **Cart System:** Add items to a temporary transaction list via Barcode Scan or Manual Search.
2.  **Calculation:** Auto-calculate Subtotal, Tax, and Grand Total in real-time.
3.  **Keyboard Shortcuts:**
    * `F1`: Focus Search Bar.
    * `F2`: Change Quantity.
    * `F10`: Proceed to Payment/Print.
    * `Del`: Remove item from cart.
4.  **Checkout:**
    * Input "Amount Received" -> Calculate "Change to Return".
    * Payment Modes: Cash, Card, Transfer.
5.  **Printing:** Generate a receipt and send it directly to the default thermal printer (Silent Print) without opening a PDF preview dialog.

### Module 4: Suppliers & Purchase Orders
**Objective:** Track inventory coming *into* the store.

1.  **Supplier Management:** CRUD (Create, Read, Update, Delete) for Supplier details.
2.  **Purchase Entry:** Select Supplier -> Add Products -> Enter Cost Price -> Save.
3.  **Effect:** Clicking "Save" immediately increases the stock count of the selected items.

### Module 5: Reporting & Analytics
**Objective:** Provide insights into business performance.

1.  **Dashboard:**
    * Cards: Total Sales (Today), Total Transactions, Low Stock Alerts (Count).
    * Chart: Last 7 days revenue.
2.  **Sales Report:** Date-range filterable list of all invoices (Exportable to CSV).
3.  **Low Stock Report:** List of products where `Current_Stock <= Reorder_Level`.

### Module 6: Backup & Data Safety
**Objective:** Prevent data loss.

1.  **Auto-Backup:** On application close (`window-all-closed`), a copy of the SQLite `.db` file is saved to a `Documents/App_Backups` folder with a timestamp.
2.  **Cloud Sync (Optional):**
    * User logs in via Google/Email (only for this feature).
    * App detects internet connection.
    * Uploads the latest backup file to the cloud storage bucket.

---

## 4. Non-Functional Requirements

### 4.1 Performance
* **Startup Time:** App must load within 3 seconds on an average PC (i5, 8GB RAM).
* **Search Latency:** Product search must return results in under 200ms for a database of up to 10,000 items.

### 4.2 Reliability
* **Offline Mode:** 100% of core features (POS, Inventory) must work without an internet connection.
* **Crash Recovery:** Database transactions must be atomic (ACID compliant) to prevent data corruption if power is lost during a sale.

### 4.3 Usability
* **Keyboard First:** The POS screen must be usable entirely without a mouse.

---

## 5. Proposed Database Entities (SQLite)

To help you start coding, here is the suggested data structure:

* **Products:** `id, name, sku, barcode, price_cost, price_sell, stock_qty, min_stock_level, category_id`
* **Suppliers:** `id, name, contact, address`
* **Customers:** `id, name, phone, email`
* **Invoices:** `id, invoice_number, date, total_amount, payment_method, customer_id (nullable)`
* **Invoice_Items:** `id, invoice_id, product_id, quantity, unit_price, total`
* **App_Settings:** `id, key, value` (Used for storing Store Name, Address, Tax Rates, License Status).

---

### Next Step for You

Now that the SRS is clear, the development phase begins.

**Would you like me to generate the project structure (folder hierarchy) and the code for the "Machine ID Licensing" module to get you started?**
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'inventory_database.sqlite');

let sqliteDb;

try {
  sqliteDb = new Database(DB_PATH);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  console.log(`[SQLite Database] Connected successfully to ${DB_PATH}`);
} catch (err) {
  console.error('[SQLite Database] Connection error:', err);
}

export function initSqliteSchema() {
  if (!sqliteDb) return;

  console.log('[SQLite Database] Initializing schema for all 22 PDF tables...');

  sqliteDb.exec(`
    -- 1. Users & Roles
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      emp_code TEXT UNIQUE NOT NULL,
      role_id TEXT REFERENCES roles(id),
      department_id TEXT,
      branch_id TEXT,
      company_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT
    );

    -- 2. Organization Masters
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      dept_code TEXT UNIQUE NOT NULL,
      dept_name TEXT NOT NULL,
      dept_head_id TEXT REFERENCES users(id),
      cost_centre_code TEXT,
      monthly_budget REAL DEFAULT 0.00,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      wh_code TEXT UNIQUE NOT NULL,
      wh_name TEXT NOT NULL,
      address TEXT,
      manager_id TEXT REFERENCES users(id),
      wh_type TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS warehouse_locations (
      id TEXT PRIMARY KEY,
      warehouse_id TEXT REFERENCES warehouses(id),
      zone TEXT,
      rack TEXT,
      shelf TEXT,
      bin TEXT,
      is_active INTEGER DEFAULT 1
    );

    -- 3. Item Master
    CREATE TABLE IF NOT EXISTS item_categories (
      id TEXT PRIMARY KEY,
      category_code TEXT UNIQUE NOT NULL,
      category_name TEXT NOT NULL,
      parent_category_id TEXT REFERENCES item_categories(id),
      description TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      item_code TEXT UNIQUE NOT NULL,
      item_name TEXT NOT NULL,
      description TEXT,
      category_id TEXT REFERENCES item_categories(id),
      brand TEXT,
      uom_symbol TEXT DEFAULT 'Pcs',
      purchase_uom_symbol TEXT DEFAULT 'Box',
      hsn_sac_code TEXT,
      tax_rate REAL DEFAULT 18.0,
      min_stock_level REAL DEFAULT 0,
      max_stock_level REAL DEFAULT 0,
      reorder_level REAL DEFAULT 0,
      reorder_quantity REAL DEFAULT 0,
      valuation_rate REAL DEFAULT 0.00,
      on_hand_qty REAL DEFAULT 0,
      available_qty REAL DEFAULT 0,
      reserved_qty REAL DEFAULT 0,
      barcode TEXT UNIQUE,
      qr_code TEXT,
      is_batch_tracked INTEGER DEFAULT 0,
      is_serial_tracked INTEGER DEFAULT 0,
      has_expiry INTEGER DEFAULT 0,
      image_url TEXT,
      is_active INTEGER DEFAULT 1
    );

    -- 4. Supplier Master
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      supplier_code TEXT UNIQUE NOT NULL,
      supplier_name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      pan_number TEXT,
      payment_terms TEXT,
      delivery_lead_time_days INTEGER DEFAULT 7,
      rating REAL DEFAULT 5.0,
      approval_status TEXT DEFAULT 'Approved',
      is_active INTEGER DEFAULT 1
    );

    -- 5. Indents & Approvals
    CREATE TABLE IF NOT EXISTS indents (
      id TEXT PRIMARY KEY,
      indent_number TEXT UNIQUE NOT NULL,
      request_date TEXT NOT NULL,
      department_id TEXT REFERENCES departments(id),
      requested_by_id TEXT REFERENCES users(id),
      required_date TEXT NOT NULL,
      purpose TEXT NOT NULL,
      priority TEXT DEFAULT 'Normal',
      cost_centre TEXT,
      remarks TEXT,
      status TEXT DEFAULT 'Draft',
      cancel_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS indent_items (
      id TEXT PRIMARY KEY,
      indent_id TEXT REFERENCES indents(id),
      item_id TEXT REFERENCES items(id),
      requested_qty REAL NOT NULL,
      approved_qty REAL DEFAULT 0,
      estimated_rate REAL DEFAULT 0.00,
      estimated_amount REAL DEFAULT 0.00,
      required_date TEXT,
      preferred_brand TEXT
    );

    -- 6. RFQs & Quotations
    CREATE TABLE IF NOT EXISTS rfqs (
      id TEXT PRIMARY KEY,
      rfq_number TEXT UNIQUE NOT NULL,
      rfq_date TEXT NOT NULL,
      closing_date TEXT NOT NULL,
      buyer_id TEXT REFERENCES users(id),
      delivery_location TEXT,
      currency TEXT DEFAULT 'INR',
      terms TEXT,
      source_indent_id TEXT REFERENCES indents(id),
      status TEXT DEFAULT 'Sent'
    );

    CREATE TABLE IF NOT EXISTS supplier_quotations (
      id TEXT PRIMARY KEY,
      quotation_number TEXT UNIQUE NOT NULL,
      rfq_id TEXT REFERENCES rfqs(id),
      supplier_id TEXT REFERENCES suppliers(id),
      supplier_quote_ref TEXT,
      quotation_date TEXT NOT NULL,
      valid_until TEXT NOT NULL,
      gross_amount REAL DEFAULT 0.00,
      discount_amount REAL DEFAULT 0.00,
      taxable_amount REAL DEFAULT 0.00,
      tax_amount REAL DEFAULT 0.00,
      freight_amount REAL DEFAULT 0.00,
      total_landed_cost REAL DEFAULT 0.00,
      status TEXT DEFAULT 'Recorded'
    );

    -- 7. Purchase Orders
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      po_number TEXT UNIQUE NOT NULL,
      po_date TEXT NOT NULL,
      supplier_id TEXT REFERENCES suppliers(id),
      quotation_id TEXT REFERENCES supplier_quotations(id),
      indent_id TEXT REFERENCES indents(id),
      buyer_id TEXT REFERENCES users(id),
      total_amount REAL NOT NULL,
      tax_amount REAL DEFAULT 0.00,
      grand_total REAL NOT NULL,
      terms_conditions TEXT,
      status TEXT DEFAULT 'Approved'
    );

    -- 8. Goods Receipts & Quality Inspection
    CREATE TABLE IF NOT EXISTS goods_receipts (
      id TEXT PRIMARY KEY,
      grn_number TEXT UNIQUE NOT NULL,
      receipt_date TEXT NOT NULL,
      po_id TEXT REFERENCES purchase_orders(id),
      supplier_id TEXT REFERENCES suppliers(id),
      supplier_invoice_number TEXT,
      delivery_challan_number TEXT,
      vehicle_number TEXT,
      warehouse_id TEXT REFERENCES warehouses(id),
      received_by TEXT REFERENCES users(id),
      inspection_status TEXT DEFAULT 'Pending',
      status TEXT DEFAULT 'Posted'
    );

    CREATE TABLE IF NOT EXISTS quality_inspections (
      id TEXT PRIMARY KEY,
      grn_id TEXT REFERENCES goods_receipts(id),
      item_id TEXT REFERENCES items(id),
      inspection_parameter TEXT,
      required_spec TEXT,
      actual_result TEXT,
      pass_fail_result TEXT DEFAULT 'Pass',
      inspected_by TEXT REFERENCES users(id),
      inspection_date TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. Stock Ledger & Operations
    CREATE TABLE IF NOT EXISTS inventory_ledger (
      id TEXT PRIMARY KEY,
      transaction_date TEXT DEFAULT CURRENT_TIMESTAMP,
      transaction_type TEXT NOT NULL,
      reference_number TEXT NOT NULL,
      item_id TEXT REFERENCES items(id),
      warehouse_id TEXT REFERENCES warehouses(id),
      location_id TEXT,
      batch_number TEXT,
      serial_number TEXT,
      qty_in REAL DEFAULT 0,
      qty_out REAL DEFAULT 0,
      unit_rate REAL DEFAULT 0.00,
      running_balance REAL NOT NULL,
      created_by TEXT REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS stock_issues (
      id TEXT PRIMARY KEY,
      issue_number TEXT UNIQUE NOT NULL,
      issue_date TEXT NOT NULL,
      department_id TEXT REFERENCES departments(id),
      issued_to TEXT,
      issued_by TEXT REFERENCES users(id),
      warehouse_id TEXT REFERENCES warehouses(id),
      indent_reference TEXT,
      issue_type TEXT DEFAULT 'Consumable issue'
    );

    CREATE TABLE IF NOT EXISTS stock_returns (
      id TEXT PRIMARY KEY,
      return_number TEXT UNIQUE NOT NULL,
      return_date TEXT NOT NULL,
      issue_reference TEXT,
      returned_by TEXT,
      department_id TEXT REFERENCES departments(id),
      warehouse_id TEXT REFERENCES warehouses(id),
      item_id TEXT REFERENCES items(id),
      quantity REAL NOT NULL,
      condition TEXT DEFAULT 'Good',
      return_type TEXT DEFAULT 'Unused material',
      reason TEXT
    );

    CREATE TABLE IF NOT EXISTS supplier_returns (
      id TEXT PRIMARY KEY,
      return_number TEXT UNIQUE NOT NULL,
      return_date TEXT NOT NULL,
      supplier_id TEXT REFERENCES suppliers(id),
      grn_reference TEXT,
      item_id TEXT REFERENCES items(id),
      quantity REAL NOT NULL,
      reason TEXT NOT NULL,
      replacement_expected INTEGER DEFAULT 1,
      credit_note_expected INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stock_transfers (
      id TEXT PRIMARY KEY,
      transfer_number TEXT UNIQUE NOT NULL,
      transfer_date TEXT NOT NULL,
      source_warehouse_id TEXT REFERENCES warehouses(id),
      destination_warehouse_id TEXT REFERENCES warehouses(id),
      requested_by TEXT REFERENCES users(id),
      transport_details TEXT,
      status TEXT DEFAULT 'Dispatched'
    );

    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id TEXT PRIMARY KEY,
      adjustment_number TEXT UNIQUE NOT NULL,
      adjustment_date TEXT NOT NULL,
      warehouse_id TEXT REFERENCES warehouses(id),
      item_id TEXT REFERENCES items(id),
      adjustment_type TEXT NOT NULL,
      system_qty REAL NOT NULL,
      actual_qty REAL NOT NULL,
      difference REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'Approved'
    );

    CREATE TABLE IF NOT EXISTS stock_reservations (
      id TEXT PRIMARY KEY,
      item_id TEXT REFERENCES items(id),
      warehouse_id TEXT REFERENCES warehouses(id),
      transaction_type TEXT NOT NULL,
      transaction_id TEXT NOT NULL,
      reserved_qty REAL NOT NULL,
      consumed_qty REAL DEFAULT 0,
      expiry_date TEXT
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      asset_number TEXT UNIQUE NOT NULL,
      item_id TEXT REFERENCES items(id),
      serial_number TEXT UNIQUE,
      purchase_date TEXT NOT NULL,
      purchase_value REAL NOT NULL,
      warranty_expiry TEXT,
      assigned_employee_id TEXT REFERENCES users(id),
      assigned_location TEXT,
      condition TEXT DEFAULT 'Good',
      status TEXT DEFAULT 'Assigned'
    );

    -- 10. Audit Logs & System Settings
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      user_name TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT,
      details TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT DEFAULT '127.0.0.1'
    );
  `);

  console.log('[SQLite Database] All 22 PDF tables created and verified successfully!');
}

export default sqliteDb;

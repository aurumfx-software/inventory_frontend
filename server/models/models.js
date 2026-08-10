/**
 * Enterprise Database Models & Schema Definition
 * Implements all database tables specified in the 39-page PDF Functional Specification.
 */

// 1. User & Access Control Models (PDF Section 3 & 10)
export const UserModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  name: 'VARCHAR(100) NOT NULL',
  email: 'VARCHAR(100) UNIQUE NOT NULL',
  password: 'VARCHAR(255) NOT NULL',
  emp_code: 'VARCHAR(50) UNIQUE NOT NULL',
  role_id: 'VARCHAR(50) REFERENCES roles(id)',
  department_id: 'VARCHAR(50) REFERENCES departments(id)',
  branch_id: 'VARCHAR(50)',
  company_id: 'VARCHAR(50)',
  is_active: 'BOOLEAN DEFAULT TRUE',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  deleted_at: 'TIMESTAMP NULL'
};

export const RoleModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  name: 'VARCHAR(100) NOT NULL',
  description: 'TEXT',
  is_active: 'BOOLEAN DEFAULT TRUE'
};

export const PermissionModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  action: 'VARCHAR(100) UNIQUE NOT NULL', // e.g. item.create, indent.approve
  module: 'VARCHAR(50) NOT NULL'
};

// 2. Organization & Location Masters (PDF Section 8 & 9)
export const DepartmentModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  dept_code: 'VARCHAR(50) UNIQUE NOT NULL',
  dept_name: 'VARCHAR(100) NOT NULL',
  dept_head_id: 'VARCHAR(50) REFERENCES users(id)',
  cost_centre_code: 'VARCHAR(50)',
  monthly_budget: 'DECIMAL(18, 2) DEFAULT 0.00',
  is_active: 'BOOLEAN DEFAULT TRUE'
};

export const WarehouseModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  wh_code: 'VARCHAR(50) UNIQUE NOT NULL',
  wh_name: 'VARCHAR(100) NOT NULL',
  address: 'TEXT',
  manager_id: 'VARCHAR(50) REFERENCES users(id)',
  wh_type: 'VARCHAR(50)', // Central, Sub-store, Transit
  is_active: 'BOOLEAN DEFAULT TRUE'
};

export const WarehouseLocationModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  zone: 'VARCHAR(50)',
  rack: 'VARCHAR(50)',
  shelf: 'VARCHAR(50)',
  bin: 'VARCHAR(50)',
  is_active: 'BOOLEAN DEFAULT TRUE'
};

// 3. Item Master Models (PDF Section 6)
export const ItemCategoryModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  category_code: 'VARCHAR(50) UNIQUE NOT NULL',
  category_name: 'VARCHAR(100) NOT NULL',
  parent_category_id: 'VARCHAR(50) REFERENCES item_categories(id)',
  description: 'TEXT',
  is_active: 'BOOLEAN DEFAULT TRUE'
};

export const ItemModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  item_code: 'VARCHAR(50) UNIQUE NOT NULL',
  item_name: 'VARCHAR(150) NOT NULL',
  description: 'TEXT',
  category_id: 'VARCHAR(50) REFERENCES item_categories(id)',
  brand: 'VARCHAR(100)',
  uom_id: 'VARCHAR(50)',
  purchase_uom_id: 'VARCHAR(50)',
  hsn_sac_code: 'VARCHAR(50)',
  tax_rate_id: 'VARCHAR(50)',
  min_stock_level: 'DECIMAL(18, 4) DEFAULT 0',
  max_stock_level: 'DECIMAL(18, 4) DEFAULT 0',
  reorder_level: 'DECIMAL(18, 4) DEFAULT 0',
  reorder_quantity: 'DECIMAL(18, 4) DEFAULT 0',
  valuation_rate: 'DECIMAL(18, 2) DEFAULT 0.00',
  barcode: 'VARCHAR(100) UNIQUE',
  qr_code: 'TEXT',
  is_batch_tracked: 'BOOLEAN DEFAULT FALSE',
  is_serial_tracked: 'BOOLEAN DEFAULT FALSE',
  has_expiry: 'BOOLEAN DEFAULT FALSE',
  image_url: 'TEXT',
  is_active: 'BOOLEAN DEFAULT TRUE'
};

// 4. Supplier Master Models (PDF Section 7)
export const SupplierModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  supplier_code: 'VARCHAR(50) UNIQUE NOT NULL',
  supplier_name: 'VARCHAR(150) NOT NULL',
  contact_person: 'VARCHAR(100)',
  phone: 'VARCHAR(50)',
  email: 'VARCHAR(100)',
  address: 'TEXT',
  gst_number: 'VARCHAR(50)',
  pan_number: 'VARCHAR(50)',
  payment_terms: 'VARCHAR(100)',
  lead_time_days: 'INTEGER DEFAULT 7',
  rating: 'DECIMAL(3, 2) DEFAULT 5.00',
  approval_status: 'VARCHAR(50) DEFAULT Approved', // Pending, Approved, Blacklisted
  is_active: 'BOOLEAN DEFAULT TRUE'
};

// 5. Indent & Approval Models (PDF Section 11 & 12)
export const IndentModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  indent_number: 'VARCHAR(50) UNIQUE NOT NULL',
  request_date: 'DATE NOT NULL',
  department_id: 'VARCHAR(50) REFERENCES departments(id)',
  requested_by_id: 'VARCHAR(50) REFERENCES users(id)',
  required_date: 'DATE NOT NULL',
  purpose: 'TEXT NOT NULL',
  priority: 'VARCHAR(20) DEFAULT Normal', // Low, Normal, High, Urgent, Emergency
  cost_centre: 'VARCHAR(50)',
  remarks: 'TEXT',
  status: 'VARCHAR(50) DEFAULT Draft', // Draft, Submitted, Approved, Rejected, Converted to RFQ
  cancel_reason: 'TEXT'
};

export const IndentItemModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  indent_id: 'VARCHAR(50) REFERENCES indents(id)',
  item_id: 'VARCHAR(50) REFERENCES items(id)',
  requested_qty: 'DECIMAL(18, 4) NOT NULL',
  approved_qty: 'DECIMAL(18, 4) DEFAULT 0',
  estimated_rate: 'DECIMAL(18, 2) DEFAULT 0.00',
  estimated_amount: 'DECIMAL(18, 2) DEFAULT 0.00',
  required_date: 'DATE',
  preferred_brand: 'VARCHAR(100)'
};

// 6. RFQ & Quotation Models (PDF Section 14 & 15)
export const RFQModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  rfq_number: 'VARCHAR(50) UNIQUE NOT NULL',
  rfq_date: 'DATE NOT NULL',
  closing_date: 'DATE NOT NULL',
  buyer_id: 'VARCHAR(50) REFERENCES users(id)',
  delivery_location: 'TEXT',
  status: 'VARCHAR(50) DEFAULT Draft' // Draft, Sent, Closed, Cancelled
};

export const SupplierQuotationModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  quotation_number: 'VARCHAR(50) UNIQUE NOT NULL',
  supplier_id: 'VARCHAR(50) REFERENCES suppliers(id)',
  rfq_id: 'VARCHAR(50) REFERENCES rfqs(id)',
  supplier_ref_no: 'VARCHAR(100)',
  quotation_date: 'DATE NOT NULL',
  valid_until_date: 'DATE NOT NULL',
  payment_terms: 'VARCHAR(100)',
  freight_amount: 'DECIMAL(18, 2) DEFAULT 0.00',
  total_tax_amount: 'DECIMAL(18, 2) DEFAULT 0.00',
  total_landed_cost: 'DECIMAL(18, 2) DEFAULT 0.00',
  is_selected: 'BOOLEAN DEFAULT FALSE'
};

// 7. Purchase Order Models (PDF Section 16)
export const PurchaseOrderModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  po_number: 'VARCHAR(50) UNIQUE NOT NULL',
  po_date: 'DATE NOT NULL',
  supplier_id: 'VARCHAR(50) REFERENCES suppliers(id)',
  quotation_id: 'VARCHAR(50) REFERENCES supplier_quotations(id)',
  indent_id: 'VARCHAR(50) REFERENCES indents(id)',
  buyer_id: 'VARCHAR(50) REFERENCES users(id)',
  total_amount: 'DECIMAL(18, 2) NOT NULL',
  tax_amount: 'DECIMAL(18, 2) DEFAULT 0.00',
  grand_total: 'DECIMAL(18, 2) NOT NULL',
  terms_conditions: 'TEXT',
  status: 'VARCHAR(50) DEFAULT Draft' // Draft, Approved, Sent to supplier, Partially received, Fully received, Closed
};

// 8. Goods Receipt & Quality Inspection Models (PDF Section 17 & 18)
export const GoodsReceiptModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  grn_number: 'VARCHAR(50) UNIQUE NOT NULL',
  receipt_date: 'DATE NOT NULL',
  po_id: 'VARCHAR(50) REFERENCES purchase_orders(id)',
  supplier_id: 'VARCHAR(50) REFERENCES suppliers(id)',
  invoice_number: 'VARCHAR(100)',
  invoice_date: 'DATE',
  challan_number: 'VARCHAR(100)',
  vehicle_number: 'VARCHAR(50)',
  warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  received_by_id: 'VARCHAR(50) REFERENCES users(id)',
  inspection_status: 'VARCHAR(50) DEFAULT Pending', // Pending, Inspected & Passed, Rejected
  status: 'VARCHAR(50) DEFAULT Posted'
};

export const QualityInspectionModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  grn_id: 'VARCHAR(50) REFERENCES goods_receipts(id)',
  item_id: 'VARCHAR(50) REFERENCES items(id)',
  inspection_parameter: 'VARCHAR(100)',
  required_spec: 'TEXT',
  actual_result: 'TEXT',
  pass_fail_result: 'VARCHAR(20)', // Pass, Fail
  inspected_by_id: 'VARCHAR(50) REFERENCES users(id)',
  inspection_date: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

// 9. Stock Ledger & Operations Models (PDF Section 19, 20, 21, 22, 23, 24, 25, 26, 27)
export const InventoryLedgerModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  transaction_date: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  transaction_type: 'VARCHAR(50) NOT NULL', // PURCHASE_RECEIPT, STOCK_ISSUE, STOCK_RETURN, TRANSFER_OUT, TRANSFER_IN, ADJUSTMENT
  reference_number: 'VARCHAR(100) NOT NULL',
  item_id: 'VARCHAR(50) REFERENCES items(id)',
  warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  batch_number: 'VARCHAR(100)',
  serial_number: 'VARCHAR(100)',
  quantity_in: 'DECIMAL(18, 4) DEFAULT 0',
  quantity_out: 'DECIMAL(18, 4) DEFAULT 0',
  unit_rate: 'DECIMAL(18, 2) DEFAULT 0.00',
  value: 'DECIMAL(18, 2) DEFAULT 0.00',
  running_balance: 'DECIMAL(18, 4) NOT NULL',
  created_by_id: 'VARCHAR(50) REFERENCES users(id)'
};

export const StockIssueModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  issue_number: 'VARCHAR(50) UNIQUE NOT NULL',
  issue_date: 'DATE NOT NULL',
  department_id: 'VARCHAR(50) REFERENCES departments(id)',
  issued_to: 'VARCHAR(100)',
  issued_by_id: 'VARCHAR(50) REFERENCES users(id)',
  warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  indent_reference: 'VARCHAR(50)',
  issue_type: 'VARCHAR(50)' // Consumable, Returnable, Asset
};

export const StockReturnModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  return_number: 'VARCHAR(50) UNIQUE NOT NULL',
  return_date: 'DATE NOT NULL',
  issue_reference: 'VARCHAR(50)',
  returned_by: 'VARCHAR(100)',
  department_id: 'VARCHAR(50) REFERENCES departments(id)',
  warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  item_id: 'VARCHAR(50) REFERENCES items(id)',
  quantity: 'DECIMAL(18, 4) NOT NULL',
  condition: 'VARCHAR(50)', // Good, Used, Damaged, Scrap, Expired
  return_type: 'VARCHAR(50)',
  reason: 'TEXT'
};

export const SupplierReturnModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  return_number: 'VARCHAR(50) UNIQUE NOT NULL',
  return_date: 'DATE NOT NULL',
  supplier_id: 'VARCHAR(50) REFERENCES suppliers(id)',
  grn_reference: 'VARCHAR(50)',
  item_id: 'VARCHAR(50) REFERENCES items(id)',
  quantity: 'DECIMAL(18, 4) NOT NULL',
  reason: 'TEXT NOT NULL', // Quality rejection, transit damage
  replacement_expected: 'BOOLEAN DEFAULT TRUE',
  credit_note_expected: 'BOOLEAN DEFAULT FALSE'
};

export const StockTransferModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  transfer_number: 'VARCHAR(50) UNIQUE NOT NULL',
  transfer_date: 'DATE NOT NULL',
  source_warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  destination_warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  requested_by_id: 'VARCHAR(50) REFERENCES users(id)',
  transport_details: 'TEXT',
  status: 'VARCHAR(50) DEFAULT Dispatched' // Dispatched, In Transit, Received
};

export const StockAdjustmentModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  adjustment_number: 'VARCHAR(50) UNIQUE NOT NULL',
  adjustment_date: 'DATE NOT NULL',
  warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  item_id: 'VARCHAR(50) REFERENCES items(id)',
  adjustment_type: 'VARCHAR(50) NOT NULL', // Positive adjustment, Negative adjustment, Damage, Expiry
  system_qty: 'DECIMAL(18, 4) NOT NULL',
  actual_qty: 'DECIMAL(18, 4) NOT NULL',
  difference: 'DECIMAL(18, 4) NOT NULL',
  reason: 'TEXT NOT NULL',
  status: 'VARCHAR(50) DEFAULT Approved'
};

export const StockReservationModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  item_id: 'VARCHAR(50) REFERENCES items(id)',
  warehouse_id: 'VARCHAR(50) REFERENCES warehouses(id)',
  transaction_type: 'VARCHAR(50) NOT NULL',
  transaction_id: 'VARCHAR(50) NOT NULL',
  reserved_qty: 'DECIMAL(18, 4) NOT NULL',
  consumed_qty: 'DECIMAL(18, 4) DEFAULT 0',
  expiry_date: 'DATE'
};

export const AssetModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  asset_number: 'VARCHAR(50) UNIQUE NOT NULL',
  item_id: 'VARCHAR(50) REFERENCES items(id)',
  serial_number: 'VARCHAR(100) UNIQUE',
  purchase_date: 'DATE NOT NULL',
  purchase_value: 'DECIMAL(18, 2) NOT NULL',
  warranty_expiry: 'DATE',
  assigned_employee_id: 'VARCHAR(50) REFERENCES users(id)',
  assigned_location: 'VARCHAR(100)',
  condition: 'VARCHAR(50)',
  status: 'VARCHAR(50) DEFAULT Assigned' // Available, Assigned, Under repair, Retired
};

// 10. Audit & Settings Models (PDF Section 31 & 32)
export const AuditLogModel = {
  id: 'VARCHAR(50) PRIMARY KEY',
  user_id: 'VARCHAR(50) REFERENCES users(id)',
  user_name: 'VARCHAR(100)',
  action: 'VARCHAR(100) NOT NULL',
  module: 'VARCHAR(50) NOT NULL',
  record_id: 'VARCHAR(50)',
  details: 'TEXT',
  timestamp: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  ip_address: 'VARCHAR(50)'
};

export const SystemSettingsModel = {
  company_name: 'VARCHAR(150)',
  company_logo: 'TEXT',
  tax_number: 'VARCHAR(50)',
  financial_year: 'VARCHAR(20)',
  allow_negative_stock: 'BOOLEAN DEFAULT FALSE',
  valuation_method: 'VARCHAR(20) DEFAULT FIFO',
  expiry_warning_days: 'INTEGER DEFAULT 30'
};

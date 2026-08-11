import express from 'express';
import { db, saveDb } from '../db/database.js';

const router = express.Router();

// SETTINGS API
router.get('/settings', (req, res) => {
  res.json({ success: true, data: db.settings });
});

router.post('/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  db.audit_logs.unshift({
    id: `aud-${Date.now()}`,
    user_id: req.body.updated_by || 'usr-01',
    action: 'SETTINGS_UPDATE',
    module: 'SETTINGS',
    record_id: 'SET-001',
    details: 'System settings updated by admin',
    timestamp: new Date().toISOString()
  });
  saveDb();
  res.json({ success: true, data: db.settings, message: 'Settings saved successfully.' });
});

// AUDIT LOGS API
router.get('/audit-logs', (req, res) => {
  res.json({ success: true, data: db.audit_logs });
});

// ASSETS API
router.get('/assets', (req, res) => {
  const result = db.assets.map(ast => {
    const itemMaster = db.items.find(i => i.id === ast.item_id) || {};
    const emp = db.users.find(u => u.id === ast.assigned_employee_id) || {};
    return {
      ...ast,
      item_name: itemMaster.item_name,
      assigned_employee_name: emp.name
    };
  });

  res.json({ success: true, data: result });
});

router.post('/assets', (req, res) => {
  const newAsset = {
    id: `ast-${Date.now()}`,
    asset_number: `AST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    item_id: req.body.item_id,
    serial_number: req.body.serial_number,
    purchase_date: req.body.purchase_date || new Date().toISOString().split('T')[0],
    purchase_value: Number(req.body.purchase_value || 0),
    warranty_expiry: req.body.warranty_expiry || '',
    assigned_employee_id: req.body.assigned_employee_id || 'usr-05',
    assigned_location: req.body.assigned_location || 'Office Desk',
    condition: 'Good',
    status: 'Assigned',
    last_service_date: new Date().toISOString().split('T')[0]
  };

  db.assets.unshift(newAsset);
  saveDb();
  res.json({ success: true, data: newAsset, message: 'Asset registered successfully.' });
});

// BULK IMPORT API
router.post('/import/:type', (req, res) => {
  const { type } = req.params;
  const { rows } = req.body;

  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ success: false, message: 'Invalid import dataset.' });
  }

  let count = 0;
  if (type === 'items') {
    rows.forEach(r => {
      if (r.item_name) {
        db.items.push({
          id: `itm-imp-${Date.now()}-${Math.random()}`,
          item_code: r.item_code || `ITM-${Math.floor(10000 + Math.random() * 90000)}`,
          item_name: r.item_name,
          description: r.description || '',
          category_id: 'cat-01',
          brand_id: 'brd-01',
          uom_id: 'uom-01',
          tax_rate_id: 'tax-18',
          min_stock_level: 5,
          max_stock_level: 50,
          reorder_level: 10,
          reorder_qty: 20,
          valuation_rate: Number(r.valuation_rate || 100),
          is_active: true,
          created_at: new Date().toISOString()
        });
        count++;
      }
    });
  } else if (type === 'suppliers') {
    rows.forEach(r => {
      if (r.supplier_name) {
        db.suppliers.push({
          id: `sup-imp-${Date.now()}-${Math.random()}`,
          supplier_code: r.supplier_code || `SUP-${Math.floor(10000 + Math.random() * 90000)}`,
          supplier_name: r.supplier_name,
          contact_person: r.contact_person || 'Contact',
          phone: r.phone || '',
          email: r.email || '',
          approval_status: 'Approved',
          is_active: true
        });
        count++;
      }
    });
  }

  saveDb();
  res.json({ success: true, message: `Successfully imported ${count} ${type} records.` });
});

export default router;

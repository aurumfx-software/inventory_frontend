import express from 'express';
import { db, saveDb, getNextDocNumber } from '../db/database.js';

const router = express.Router();

// GET /api/indents
router.get('/', (req, res) => {
  const result = db.indents.map(indent => {
    const dept = db.departments.find(d => d.id === indent.department_id) || {};
    const requester = db.users.find(u => u.id === indent.requested_by) || {};
    const items = db.indent_items.filter(i => i.indent_id === indent.id).map(line => {
      const itemMaster = db.items.find(im => im.id === line.item_id) || {};
      const uom = db.units_of_measure.find(u => u.id === line.uom_id) || {};
      const balances = db.inventory_balances.filter(b => b.item_id === line.item_id);
      const currentStock = balances.reduce((s, b) => s + (b.on_hand_qty || 0), 0);
      const reservedStock = balances.reduce((s, b) => s + (b.reserved_qty || 0), 0);

      return {
        ...line,
        item_code: itemMaster.item_code,
        item_name: itemMaster.item_name,
        uom_symbol: uom.unit_symbol,
        current_stock: currentStock,
        reserved_stock: reservedStock,
        available_stock: currentStock - reservedStock
      };
    });

    const approvalReq = db.approval_requests.find(a => a.transaction_id === indent.id && a.transaction_type === 'INDENT');

    return {
      ...indent,
      department_name: dept.name,
      requested_by_name: requester.name,
      items,
      approval: approvalReq || null
    };
  });

  res.json({ success: true, data: result });
});

// POST /api/indents
router.post('/', (req, res) => {
  const { department_id, requested_by, required_date, purpose, priority, cost_centre, remarks, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one item is required in the indent.' });
  }

  const indentNumber = getNextDocNumber('IND');
  const now = new Date().toISOString();
  let totalEstAmount = 0;

  const newIndent = {
    id: `ind-${Date.now()}`,
    indent_number: indentNumber,
    request_date: now.split('T')[0],
    department_id: department_id || 'dept-01',
    requested_by: requested_by || 'usr-05',
    required_date: required_date || now.split('T')[0],
    purpose: purpose || 'General Requirement',
    priority: priority || 'Normal',
    cost_centre: cost_centre || 'IT-001',
    remarks: remarks || '',
    status: 'Draft',
    total_estimated_amount: 0,
    created_at: now
  };

  const lineItems = items.map(line => {
    const itemMaster = db.items.find(i => i.id === line.item_id) || {};
    const qty = Number(line.requested_qty || 1);
    const rate = Number(line.estimated_rate || itemMaster.valuation_rate || 0);
    const amount = qty * rate;
    totalEstAmount += amount;

    return {
      id: `ind-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      indent_id: newIndent.id,
      item_id: line.item_id,
      requested_qty: qty,
      approved_qty: qty,
      uom_id: line.uom_id || itemMaster.uom_id,
      estimated_rate: rate,
      estimated_amount: amount,
      required_date: line.required_date || newIndent.required_date,
      preferred_brand_id: line.preferred_brand_id || itemMaster.brand_id,
      suggested_supplier_id: line.suggested_supplier_id || null,
      technical_spec: line.technical_spec || '',
      line_remarks: line.line_remarks || ''
    };
  });

  newIndent.total_estimated_amount = totalEstAmount;

  db.indents.unshift(newIndent);
  db.indent_items.push(...lineItems);
  saveDb();

  res.json({ success: true, data: newIndent, message: `Indent ${indentNumber} saved as draft.` });
});

// POST /api/indents/:id/submit
router.post('/:id/submit', (req, res) => {
  const indent = db.indents.find(i => i.id === req.params.id);
  if (!indent) return res.status(404).json({ success: false, message: 'Indent not found' });

  indent.status = 'Under Review';

  // Create approval request based on department and amount workflow rules
  const deptMgr = db.users.find(u => u.role_id === 'role-dept-mgr') || db.users[0];
  
  db.approval_requests.unshift({
    id: `app-${Date.now()}`,
    transaction_type: 'INDENT',
    transaction_id: indent.id,
    approval_level: 1,
    approver_id: deptMgr.id,
    assigned_date: new Date().toISOString(),
    status: 'Pending',
    comments: ''
  });

  db.audit_logs.unshift({
    id: `aud-${Date.now()}`,
    user_id: indent.requested_by,
    action: 'INDENT_SUBMITTED',
    module: 'PROCUREMENT',
    record_id: indent.id,
    details: `Indent ${indent.indent_number} submitted for approval`,
    timestamp: new Date().toISOString()
  });

  saveDb();
  res.json({ success: true, data: indent, message: `Indent ${indent.indent_number} submitted for manager approval.` });
});

export default router;

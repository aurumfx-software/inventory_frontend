import express from 'express';
import { db, saveDb } from '../db/database.js';

const router = express.Router();

// GET /api/approvals
router.get('/', (req, res) => {
  const approvals = db.approval_requests.map(app => {
    const approver = db.users.find(u => u.id === app.approver_id) || {};
    let txnDetails = null;

    if (app.transaction_type === 'INDENT') {
      const indent = db.indents.find(i => i.id === app.transaction_id);
      if (indent) {
        const dept = db.departments.find(d => d.id === indent.department_id) || {};
        const requester = db.users.find(u => u.id === indent.requested_by) || {};
        const items = db.indent_items.filter(it => it.indent_id === indent.id).map(line => {
          const itemMaster = db.items.find(im => im.id === line.item_id) || {};
          return { ...line, item_code: itemMaster.item_code, item_name: itemMaster.item_name };
        });

        txnDetails = {
          doc_number: indent.indent_number,
          date: indent.request_date,
          department: dept.name,
          requested_by: requester.name,
          amount: indent.total_estimated_amount,
          priority: indent.priority,
          purpose: indent.purpose,
          items
        };
      }
    }

    return {
      ...app,
      approver_name: approver.name,
      txnDetails
    };
  });

  res.json({ success: true, data: approvals });
});

// POST /api/approvals/:id/action
router.post('/:id/action', (req, res) => {
  const { action, comments, approved_items, delegate_user_id } = req.body;
  const app = db.approval_requests.find(a => a.id === req.params.id);

  if (!app) return res.status(404).json({ success: false, message: 'Approval request not found' });

  const now = new Date().toISOString();

  if (action === 'Approve') {
    app.status = 'Approved';
    app.comments = comments || 'Approved';
    app.action_date = now;

    if (app.transaction_type === 'INDENT') {
      const indent = db.indents.find(i => i.id === app.transaction_id);
      if (indent) {
        indent.status = 'Approved';

        // Update approved quantities if modified
        if (approved_items && Array.isArray(approved_items)) {
          approved_items.forEach(mod => {
            const line = db.indent_items.find(li => li.id === mod.id);
            if (line) line.approved_qty = Number(mod.approved_qty);
          });
        }

        // Automatic Stock Reservation logic on approved indents
        const indentItems = db.indent_items.filter(ii => ii.indent_id === indent.id);
        indentItems.forEach(line => {
          const bal = db.inventory_balances.find(b => b.item_id === line.item_id);
          if (bal) {
            const reserveQty = Math.min(bal.available_qty, line.approved_qty);
            bal.reserved_qty = (bal.reserved_qty || 0) + reserveQty;
            bal.available_qty = bal.on_hand_qty - bal.reserved_qty;

            db.stock_reservations.push({
              id: `res-${Date.now()}-${line.id}`,
              item_id: line.item_id,
              transaction_type: 'INDENT',
              transaction_id: indent.id,
              reserved_qty: reserveQty,
              created_at: now
            });
          }
        });
      }
    }
  } else if (action === 'Reject') {
    app.status = 'Rejected';
    app.comments = comments || 'Rejected';
    app.action_date = now;

    if (app.transaction_type === 'INDENT') {
      const indent = db.indents.find(i => i.id === app.transaction_id);
      if (indent) indent.status = 'Rejected';
    }
  } else if (action === 'Return') {
    app.status = 'Returned for Correction';
    app.comments = comments || 'Returned for correction';
    app.action_date = now;

    if (app.transaction_type === 'INDENT') {
      const indent = db.indents.find(i => i.id === app.transaction_id);
      if (indent) indent.status = 'Returned for Correction';
    }
  } else if (action === 'Delegate' && delegate_user_id) {
    const delegateUser = db.users.find(u => u.id === delegate_user_id);
    app.approver_id = delegate_user_id;
    app.comments = `Delegated to ${delegateUser ? delegateUser.name : delegate_user_id}. ${comments || ''}`;
  }

  db.audit_logs.unshift({
    id: `aud-${Date.now()}`,
    user_id: app.approver_id,
    action: `APPROVAL_${action.toUpperCase()}`,
    module: 'WORKFLOW',
    record_id: app.transaction_id,
    details: `Approval action ${action} performed on ${app.transaction_type} request`,
    timestamp: now
  });

  saveDb();
  res.json({ success: true, message: `Approval ${action} completed successfully.` });
});

export default router;

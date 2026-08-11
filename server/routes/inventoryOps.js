import express from 'express';
import { db, saveDb, getNextDocNumber } from '../db/database.js';

const router = express.Router();

// GOODS RECEIPT NOTE (GRN) API
router.get('/goods-receipts', (req, res) => {
  const result = db.goods_receipts.map(grn => {
    const po = db.purchase_orders.find(p => p.id === grn.po_id) || {};
    const supplier = db.suppliers.find(s => s.id === grn.supplier_id) || {};
    const items = db.grn_items.filter(gi => gi.grn_id === grn.id).map(line => {
      const itemMaster = db.items.find(i => i.id === line.item_id) || {};
      return { ...line, item_code: itemMaster.item_code, item_name: itemMaster.item_name };
    });
    const inspection = db.quality_inspections.find(qi => qi.grn_id === grn.id);

    return {
      ...grn,
      po_number: po.po_number,
      supplier_name: supplier.supplier_name,
      items,
      inspection
    };
  });

  res.json({ success: true, data: result });
});

router.post('/goods-receipts', (req, res) => {
  const { po_id, supplier_invoice_number, delivery_challan_number, vehicle_number, warehouse_id, items } = req.body;
  const grnNumber = getNextDocNumber('GRN');
  const now = new Date().toISOString();
  const po = db.purchase_orders.find(p => p.id === po_id) || {};

  const newGrn = {
    id: `grn-${Date.now()}`,
    grn_number: grnNumber,
    receipt_date: now.split('T')[0],
    po_id: po_id || null,
    supplier_id: po.supplier_id || req.body.supplier_id,
    supplier_invoice_number: supplier_invoice_number || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    delivery_challan_number: delivery_challan_number || `DC-${Math.floor(1000 + Math.random() * 9000)}`,
    vehicle_number: vehicle_number || 'KA-01-EA-5566',
    warehouse_id: warehouse_id || 'wh-01',
    received_by: req.body.received_by || 'usr-03',
    inspection_status: 'Pending Inspection',
    status: 'Posted',
    created_at: now
  };

  const grnItems = (items || []).map(line => {
    const recvQty = Number(line.received_qty || 1);
    const acceptedQty = Number(line.accepted_qty !== undefined ? line.accepted_qty : recvQty);
    const rejectedQty = Number(line.rejected_qty || 0);

    return {
      id: `grn-item-${Date.now()}-${Math.random()}`,
      grn_id: newGrn.id,
      po_item_id: line.po_item_id || null,
      item_id: line.item_id,
      ordered_qty: Number(line.ordered_qty || recvQty),
      received_qty: recvQty,
      accepted_qty: acceptedQty,
      rejected_qty: rejectedQty,
      batch_number: line.batch_number || `BAT-${Date.now().toString().substr(-6)}`,
      mfg_date: line.mfg_date || null,
      expiry_date: line.expiry_date || null,
      serial_numbers: line.serial_numbers || [],
      storage_location_id: line.storage_location_id || 'loc-01'
    };
  });

  db.goods_receipts.unshift(newGrn);
  db.grn_items.push(...grnItems);

  // ATOMIC STOCK POSTING LOGIC
  grnItems.forEach(line => {
    // 1. Update PO received qty
    if (line.po_item_id) {
      const poItem = db.po_items.find(pi => pi.id === line.po_item_id);
      if (poItem) {
        poItem.received_quantity += line.accepted_qty;
        poItem.pending_quantity = Math.max(0, poItem.ordered_quantity - poItem.received_quantity);
      }
    }

    // 2. Append-only Inventory Ledger Entry
    db.inventory_ledger.unshift({
      id: `led-${Date.now()}-${Math.random()}`,
      transaction_date: now,
      transaction_type: 'PURCHASE_RECEIPT',
      reference_number: grnNumber,
      item_id: line.item_id,
      warehouse_id: newGrn.warehouse_id,
      location_id: line.storage_location_id,
      batch_number: line.batch_number,
      qty_in: line.accepted_qty,
      qty_out: 0,
      unit_rate: line.unit_rate || 0,
      created_by: newGrn.received_by
    });

    // 3. Update Inventory Balances
    let bal = db.inventory_balances.find(b => b.item_id === line.item_id && b.warehouse_id === newGrn.warehouse_id);
    if (!bal) {
      bal = {
        id: `bal-${Date.now()}`,
        item_id: line.item_id,
        warehouse_id: newGrn.warehouse_id,
        location_id: line.storage_location_id,
        on_hand_qty: 0,
        reserved_qty: 0,
        available_qty: 0,
        valuation_rate: 0
      };
      db.inventory_balances.push(bal);
    }
    bal.on_hand_qty += line.accepted_qty;
    bal.available_qty = bal.on_hand_qty - bal.reserved_qty;

    // 4. Batch & Serial tracking records
    if (line.batch_number) {
      db.item_batches.push({
        id: `btc-${Date.now()}`,
        item_id: line.item_id,
        batch_number: line.batch_number,
        mfg_date: line.mfg_date,
        expiry_date: line.expiry_date,
        received_qty: line.accepted_qty,
        available_qty: line.accepted_qty,
        supplier_id: newGrn.supplier_id
      });
    }

    if (line.serial_numbers && Array.isArray(line.serial_numbers)) {
      line.serial_numbers.forEach(sn => {
        db.item_serials.push({
          id: `ser-${Date.now()}-${Math.random()}`,
          item_id: line.item_id,
          serial_number: sn,
          status: 'Available',
          warehouse_id: newGrn.warehouse_id
        });
      });
    }
  });

  saveDb();
  res.json({ success: true, data: newGrn, message: `GRN ${grnNumber} posted successfully. Inventory balances updated.` });
});

// QUALITY INSPECTION API
router.post('/quality-inspections', (req, res) => {
  const { grn_id, actual_results, pass_fail_result, remarks } = req.body;
  const grn = db.goods_receipts.find(g => g.id === grn_id);
  if (!grn) return res.status(404).json({ success: false, message: 'GRN not found' });

  const inspection = {
    id: `qi-${Date.now()}`,
    grn_id,
    inspection_date: new Date().toISOString().split('T')[0],
    inspected_by: req.body.inspected_by || 'usr-03',
    parameters: 'Dimensions, Weight, Material Integrity, Packaging, Expiry Check',
    actual_results: actual_results || 'All parameters meet quality specifications',
    pass_fail_result: pass_fail_result || 'PASSED',
    remarks: remarks || 'Quality check completed'
  };

  grn.inspection_status = pass_fail_result === 'PASSED' ? 'Inspected & Passed' : 'Failed Inspection';
  db.quality_inspections.unshift(inspection);
  saveDb();

  res.json({ success: true, data: inspection, message: 'Quality inspection recorded successfully.' });
});

// STOCK ISSUES API
router.get('/stock-issues', (req, res) => {
  const result = db.stock_issues.map(iss => {
    const dept = db.departments.find(d => d.id === iss.department_id) || {};
    const recipient = db.users.find(u => u.id === iss.issued_to) || {};
    const items = db.stock_issue_items.filter(si => si.issue_id === iss.id).map(line => {
      const itemMaster = db.items.find(i => i.id === line.item_id) || {};
      return { ...line, item_code: itemMaster.item_code, item_name: itemMaster.item_name };
    });

    return { ...iss, department_name: dept.name, issued_to_name: recipient.name, items };
  });

  res.json({ success: true, data: result });
});

router.post('/stock-issues', (req, res) => {
  const { department_id, issued_to, warehouse_id, issue_type, items } = req.body;
  const issueNumber = getNextDocNumber('ISS');
  const now = new Date().toISOString();

  const newIssue = {
    id: `iss-${Date.now()}`,
    issue_number: issueNumber,
    issue_date: now.split('T')[0],
    department_id: department_id || 'dept-01',
    issued_to: issued_to || 'usr-05',
    issued_by: req.body.issued_by || 'usr-03',
    warehouse_id: warehouse_id || 'wh-01',
    issue_type: issue_type || 'Consumable issue',
    status: 'Posted',
    created_at: now
  };

  const issueItems = (items || []).map(line => {
    const qty = Number(line.issue_qty || 1);
    return {
      id: `iss-item-${Date.now()}-${Math.random()}`,
      issue_id: newIssue.id,
      item_id: line.item_id,
      issue_qty: qty,
      batch_number: line.batch_number || '',
      serial_number: line.serial_number || '',
      condition: 'Good'
    };
  });

  db.stock_issues.unshift(newIssue);
  db.stock_issue_items.push(...issueItems);

  // STOCK OUT LEDGER POSTING
  issueItems.forEach(line => {
    db.inventory_ledger.unshift({
      id: `led-${Date.now()}-${Math.random()}`,
      transaction_date: now,
      transaction_type: 'STOCK_ISSUE',
      reference_number: issueNumber,
      item_id: line.item_id,
      warehouse_id: newIssue.warehouse_id,
      location_id: 'loc-01',
      batch_number: line.batch_number,
      qty_in: 0,
      qty_out: line.issue_qty,
      created_by: newIssue.issued_by
    });

    const bal = db.inventory_balances.find(b => b.item_id === line.item_id && b.warehouse_id === newIssue.warehouse_id);
    if (bal) {
      bal.on_hand_qty = Math.max(0, bal.on_hand_qty - line.issue_qty);
      // Release reservation if any
      bal.reserved_qty = Math.max(0, bal.reserved_qty - line.issue_qty);
      bal.available_qty = bal.on_hand_qty - bal.reserved_qty;
    }
  });

  saveDb();
  res.json({ success: true, data: newIssue, message: `Stock Issue ${issueNumber} posted successfully.` });
});

// TWO-STEP STOCK TRANSFER API
router.get('/stock-transfers', (req, res) => {
  const result = db.stock_transfers.map(trn => {
    const srcWh = db.warehouses.find(w => w.id === trn.source_warehouse_id) || {};
    const destWh = db.warehouses.find(w => w.id === trn.destination_warehouse_id) || {};
    const items = db.stock_transfer_items.filter(ti => ti.transfer_id === trn.id).map(line => {
      const itemMaster = db.items.find(i => i.id === line.item_id) || {};
      return { ...line, item_code: itemMaster.item_code, item_name: itemMaster.item_name };
    });

    return {
      ...trn,
      source_warehouse_name: srcWh.name,
      destination_warehouse_name: destWh.name,
      items
    };
  });

  res.json({ success: true, data: result });
});

router.post('/stock-transfers', (req, res) => {
  const { source_warehouse_id, destination_warehouse_id, items, action } = req.body;
  const trnNumber = getNextDocNumber('TRN');
  const now = new Date().toISOString();

  const newTrn = {
    id: `trn-${Date.now()}`,
    transfer_number: trnNumber,
    transfer_date: now.split('T')[0],
    source_warehouse_id,
    destination_warehouse_id,
    requested_by: req.body.requested_by || 'usr-03',
    status: action === 'Dispatch' ? 'In Transit' : 'Completed',
    created_at: now
  };

  const trnItems = (items || []).map(line => ({
    id: `ti-${Date.now()}-${Math.random()}`,
    transfer_id: newTrn.id,
    item_id: line.item_id,
    quantity: Number(line.quantity || 1)
  }));

  db.stock_transfers.unshift(newTrn);
  db.stock_transfer_items.push(...trnItems);

  // Two-Step Transfer Logic: Dispatch
  trnItems.forEach(line => {
    const srcBal = db.inventory_balances.find(b => b.item_id === line.item_id && b.warehouse_id === source_warehouse_id);
    if (srcBal) {
      srcBal.on_hand_qty = Math.max(0, srcBal.on_hand_qty - line.quantity);
      srcBal.available_qty = srcBal.on_hand_qty - srcBal.reserved_qty;
    }

    if (action !== 'Dispatch') {
      // Direct completed transfer
      let destBal = db.inventory_balances.find(b => b.item_id === line.item_id && b.warehouse_id === destination_warehouse_id);
      if (!destBal) {
        destBal = { id: `bal-${Date.now()}`, item_id: line.item_id, warehouse_id: destination_warehouse_id, location_id: 'loc-01', on_hand_qty: 0, reserved_qty: 0, available_qty: 0, valuation_rate: 0 };
        db.inventory_balances.push(destBal);
      }
      destBal.on_hand_qty += line.quantity;
      destBal.available_qty = destBal.on_hand_qty - destBal.reserved_qty;
    }
  });

  saveDb();
  res.json({ success: true, data: newTrn, message: `Stock Transfer ${trnNumber} created (${newTrn.status}).` });
});

// PHYSICAL STOCK VERIFICATION API (Blind Count Support)
router.get('/stock-counts', (req, res) => {
  res.json({ success: true, data: db.stock_count_sessions });
});

router.post('/stock-counts', (req, res) => {
  const { warehouse_id, is_blind_count, count_entries } = req.body;
  const countNo = `CNT-${Date.now().toString().substr(-6)}`;
  const now = new Date().toISOString();

  const newSession = {
    id: `cnt-${Date.now()}`,
    count_session_number: countNo,
    count_date: now.split('T')[0],
    warehouse_id: warehouse_id || 'wh-01',
    is_blind_count: Boolean(is_blind_count),
    status: 'Completed',
    created_at: now
  };

  const entries = (count_entries || []).map(entry => {
    const itemMaster = db.items.find(i => i.id === entry.item_id) || {};
    const sysQty = Number(entry.system_quantity || 0);
    const physQty = Number(entry.physical_quantity || sysQty);
    const variance = physQty - sysQty;

    return {
      id: `ce-${Date.now()}-${Math.random()}`,
      session_id: newSession.id,
      item_id: entry.item_id,
      item_name: itemMaster.item_name,
      system_quantity: sysQty,
      physical_quantity: physQty,
      variance_quantity: variance,
      variance_value: variance * (itemMaster.valuation_rate || 0),
      reason: entry.reason || 'Annual Verification Count'
    };
  });

  db.stock_count_sessions.unshift({ ...newSession, entries });

  // Post Stock Adjustments for Variances
  entries.forEach(e => {
    if (e.variance_quantity !== 0) {
      const bal = db.inventory_balances.find(b => b.item_id === e.item_id && b.warehouse_id === newSession.warehouse_id);
      if (bal) {
        bal.on_hand_qty += e.variance_quantity;
        bal.available_qty = bal.on_hand_qty - bal.reserved_qty;
      }
      db.inventory_ledger.unshift({
        id: `led-${Date.now()}-${Math.random()}`,
        transaction_date: now,
        transaction_type: e.variance_quantity > 0 ? 'POSITIVE_ADJUSTMENT' : 'NEGATIVE_ADJUSTMENT',
        reference_number: countNo,
        item_id: e.item_id,
        warehouse_id: newSession.warehouse_id,
        location_id: 'loc-01',
        qty_in: e.variance_quantity > 0 ? e.variance_quantity : 0,
        qty_out: e.variance_quantity < 0 ? Math.abs(e.variance_quantity) : 0,
        created_by: 'usr-03'
      });
    }
  });

  saveDb();
  res.json({ success: true, data: newSession, message: `Physical Verification ${countNo} posted and stock balances reconciled.` });
});

export default router;

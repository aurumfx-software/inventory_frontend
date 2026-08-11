import express from 'express';
import { db, saveDb, getNextDocNumber } from '../db/database.js';

const router = express.Router();

// RFQ API
router.get('/rfqs', (req, res) => {
  const result = db.rfqs.map(rfq => {
    const items = db.rfq_items.filter(ri => ri.rfq_id === rfq.id).map(line => {
      const itemMaster = db.items.find(i => i.id === line.item_id) || {};
      return { ...line, item_code: itemMaster.item_code, item_name: itemMaster.item_name };
    });
    const suppliers = db.rfq_suppliers.filter(rs => rs.rfq_id === rfq.id).map(s => {
      const supMaster = db.suppliers.find(sm => sm.id === s.supplier_id) || {};
      return { ...s, supplier_name: supMaster.supplier_name, email: supMaster.email, phone: supMaster.phone };
    });

    return { ...rfq, items, suppliers };
  });

  res.json({ success: true, data: result });
});

router.post('/rfqs', (req, res) => {
  const { rfq_date, closing_date, source_indent_id, supplier_ids, items } = req.body;
  const rfqNumber = getNextDocNumber('RFQ');
  const now = new Date().toISOString();

  const newRfq = {
    id: `rfq-${Date.now()}`,
    rfq_number: rfqNumber,
    rfq_date: rfq_date || now.split('T')[0],
    closing_date: closing_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    buyer_id: req.body.buyer_id || 'usr-02',
    delivery_location: req.body.delivery_location || 'Central Goods Warehouse, Bangalore',
    currency: 'INR',
    terms: 'FOB Destination, Net 30 days',
    source_indent_id: source_indent_id || null,
    status: 'Sent',
    created_at: now
  };

  const rfqItems = (items || []).map(line => ({
    id: `rfq-item-${Date.now()}-${Math.random()}`,
    rfq_id: newRfq.id,
    item_id: line.item_id,
    specification: line.specification || '',
    quantity: Number(line.quantity || 1),
    unit: line.unit || 'Pcs',
    required_delivery_date: line.required_delivery_date || newRfq.closing_date
  }));

  const rfqSuppliers = (supplier_ids || []).map(supId => ({
    id: `rfq-sup-${Date.now()}-${Math.random()}`,
    rfq_id: newRfq.id,
    supplier_id: supId,
    status: 'Invited'
  }));

  db.rfqs.unshift(newRfq);
  db.rfq_items.push(...rfqItems);
  db.rfq_suppliers.push(...rfqSuppliers);

  // If source indent exists, update status to Converted to RFQ
  if (source_indent_id) {
    const indent = db.indents.find(i => i.id === source_indent_id);
    if (indent) indent.status = 'Converted to RFQ';
  }

  saveDb();
  res.json({ success: true, data: newRfq, message: `RFQ ${rfqNumber} created and sent to suppliers.` });
});

// QUOTATIONS & COMPARISON MATRIX
router.get('/quotations', (req, res) => {
  const result = db.quotations.map(quote => {
    const rfq = db.rfqs.find(r => r.id === quote.rfq_id) || {};
    const supplier = db.suppliers.find(s => s.id === quote.supplier_id) || {};
    const items = db.quotation_items.filter(qi => qi.quotation_id === quote.id).map(line => {
      const itemMaster = db.items.find(i => i.id === line.item_id) || {};
      return { ...line, item_code: itemMaster.item_code, item_name: itemMaster.item_name };
    });

    return {
      ...quote,
      rfq_number: rfq.rfq_number,
      supplier_name: supplier.supplier_name,
      supplier_code: supplier.supplier_code,
      supplier_rating: supplier.rating,
      items
    };
  });

  res.json({ success: true, data: result });
});

router.post('/quotations', (req, res) => {
  const { rfq_id, supplier_id, supplier_quote_ref, quotation_date, valid_until, items } = req.body;
  const supplier = db.suppliers.find(s => s.id === supplier_id) || {};
  const quoteNumber = `QT-${Date.now().toString().substr(-6)}`;
  const now = new Date().toISOString();

  let totalGross = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalFreight = 0;
  let totalLanded = 0;

  const quoteItems = (items || []).map(line => {
    const qty = Number(line.offered_quantity || line.quantity || 1);
    const rate = Number(line.unit_rate || 0);
    const discPct = Number(line.discount_pct || 0);
    const taxPct = Number(line.tax_pct || 18);
    const freight = Number(line.freight_allocation || 0);

    const gross = qty * rate;
    const discAmt = (gross * discPct) / 100;
    const taxable = gross - discAmt;
    const taxAmt = (taxable * taxPct) / 100;
    const lineTotal = taxable + taxAmt + freight;

    totalGross += gross;
    totalDiscount += discAmt;
    totalTax += taxAmt;
    totalFreight += freight;
    totalLanded += lineTotal;

    return {
      id: `q-item-${Date.now()}-${Math.random()}`,
      quotation_id: '',
      item_id: line.item_id,
      offered_brand: line.offered_brand || 'Standard',
      offered_quantity: qty,
      unit_rate: rate,
      discount_pct: discPct,
      discount_amount: discAmt,
      taxable_amount: taxable,
      tax_pct: taxPct,
      tax_amount: taxAmt,
      freight_allocation: freight,
      line_total: lineTotal,
      delivery_days: Number(line.delivery_days || supplier.delivery_lead_time_days || 5),
      warranty_period: line.warranty_period || '1 Year',
      technical_compliance: line.technical_compliance || 'Compliant'
    };
  });

  const newQuote = {
    id: `qt-${Date.now()}`,
    quotation_number: quoteNumber,
    rfq_id,
    supplier_id,
    supplier_quote_ref: supplier_quote_ref || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    quotation_date: quotation_date || now.split('T')[0],
    valid_until: valid_until || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    gross_amount: totalGross,
    discount_amount: totalDiscount,
    taxable_amount: totalGross - totalDiscount,
    tax_amount: totalTax,
    freight_amount: totalFreight,
    total_landed_cost: totalLanded,
    status: 'Recorded',
    created_at: now
  };

  quoteItems.forEach(qi => qi.quotation_id = newQuote.id);

  db.quotations.push(newQuote);
  db.quotation_items.push(...quoteItems);
  saveDb();

  res.json({ success: true, data: newQuote, message: `Supplier Quotation ${quoteNumber} recorded successfully.` });
});

// SIDE-BY-SIDE QUOTATION COMPARISON
router.get('/rfqs/:rfqId/comparison', (req, res) => {
  const rfq = db.rfqs.find(r => r.id === req.params.rfqId);
  if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });

  const rfqItems = db.rfq_items.filter(ri => ri.rfq_id === rfq.id).map(ri => {
    const itemMaster = db.items.find(im => im.id === ri.item_id) || {};
    return { ...ri, item_code: itemMaster.item_code, item_name: itemMaster.item_name };
  });

  const quotes = db.quotations.filter(q => q.rfq_id === rfq.id).map(q => {
    const supMaster = db.suppliers.find(sm => sm.id === q.supplier_id) || {};
    const qItems = db.quotation_items.filter(qi => qi.quotation_id === q.id);
    return {
      ...q,
      supplier_name: supMaster.supplier_name,
      supplier_code: supMaster.supplier_code,
      supplier_rating: supMaster.rating,
      payment_terms: supMaster.payment_terms,
      delivery_lead_time_days: supMaster.delivery_lead_time_days,
      items: qItems
    };
  });

  // Calculate lowest cost bidder
  let lowestCostQuoteId = null;
  let minCost = Infinity;
  quotes.forEach(q => {
    if (q.total_landed_cost < minCost) {
      minCost = q.total_landed_cost;
      lowestCostQuoteId = q.id;
    }
  });

  res.json({
    success: true,
    rfq,
    rfqItems,
    quotations: quotes,
    lowestCostQuoteId
  });
});

// PURCHASE ORDERS API
router.get('/purchase-orders', (req, res) => {
  const result = db.purchase_orders.map(po => {
    const supplier = db.suppliers.find(s => s.id === po.supplier_id) || {};
    const items = db.po_items.filter(pi => pi.po_id === po.id).map(line => {
      const itemMaster = db.items.find(i => i.id === line.item_id) || {};
      return { ...line, item_code: itemMaster.item_code, item_name: itemMaster.item_name };
    });

    return {
      ...po,
      supplier_name: supplier.supplier_name,
      supplier_address: supplier.address_billing,
      supplier_gst: supplier.gst_number,
      items
    };
  });

  res.json({ success: true, data: result });
});

router.post('/purchase-orders', (req, res) => {
  const { quotation_id, supplier_id, rfq_id, indent_id, items, non_lowest_reason } = req.body;
  const poNumber = getNextDocNumber('PO');
  const now = new Date().toISOString();
  const supplier = db.suppliers.find(s => s.id === supplier_id) || {};

  let totalAmount = 0;

  const poItems = (items || []).map(line => {
    const qty = Number(line.ordered_quantity || line.offered_quantity || 1);
    const rate = Number(line.unit_rate || 0);
    const lineTotal = qty * rate;
    totalAmount += lineTotal;

    return {
      id: `po-item-${Date.now()}-${Math.random()}`,
      po_id: '',
      item_id: line.item_id,
      description_snapshot: line.description || line.item_name || 'Item description snapshot',
      ordered_quantity: qty,
      received_quantity: 0,
      pending_quantity: qty,
      unit_rate: rate,
      line_total: lineTotal
    };
  });

  const newPo = {
    id: `po-${Date.now()}`,
    po_number: poNumber,
    po_date: now.split('T')[0],
    supplier_id,
    quotation_id: quotation_id || null,
    rfq_id: rfq_id || null,
    indent_id: indent_id || null,
    payment_terms: supplier.payment_terms || 'Net 30 days',
    delivery_terms: 'FOB Destination',
    non_lowest_reason: non_lowest_reason || '',
    total_amount: totalAmount,
    status: 'Approved',
    created_at: now
  };

  poItems.forEach(pi => pi.po_id = newPo.id);

  db.purchase_orders.unshift(newPo);
  db.po_items.push(...poItems);
  saveDb();

  res.json({ success: true, data: newPo, message: `Purchase Order ${poNumber} generated successfully.` });
});

export default router;

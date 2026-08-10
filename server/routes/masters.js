import express from 'express';
import { db, saveDb } from '../db/database.js';

const router = express.Router();

// ITEMS API
router.get('/items', (req, res) => {
  const { search, category, warehouse } = req.query;
  let items = [...db.items];

  if (category) items = items.filter(i => i.category_id === category);
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i => 
      i.item_code.toLowerCase().includes(q) ||
      i.item_name.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    );
  }

  // Populate references & stock balances
  const result = items.map(item => {
    const cat = db.item_categories.find(c => c.id === item.category_id) || {};
    const brand = db.brands.find(b => b.id === item.brand_id) || {};
    const uom = db.units_of_measure.find(u => u.id === item.uom_id) || {};
    const tax = db.tax_rates.find(t => t.id === item.tax_rate_id) || {};
    const balances = db.inventory_balances.filter(b => b.item_id === item.id);
    
    const onHand = balances.reduce((sum, b) => sum + (b.on_hand_qty || 0), 0);
    const reserved = balances.reduce((sum, b) => sum + (b.reserved_qty || 0), 0);
    const available = onHand - reserved;

    return {
      ...item,
      category_name: cat.category_name,
      brand_name: brand.brand_name,
      uom_symbol: uom.unit_symbol,
      tax_percentage: tax.percentage,
      on_hand_qty: onHand,
      reserved_qty: reserved,
      available_qty: available,
      stock_value: onHand * item.valuation_rate
    };
  });

  res.json({ success: true, data: result });
});

router.post('/items', (req, res) => {
  const newItem = {
    id: `itm-${Date.now()}`,
    item_code: req.body.item_code || `ITM-${Date.now()}`,
    item_name: req.body.item_name,
    description: req.body.description || '',
    category_id: req.body.category_id,
    brand_id: req.body.brand_id,
    uom_id: req.body.uom_id,
    purchase_uom_id: req.body.purchase_uom_id || req.body.uom_id,
    tax_rate_id: req.body.tax_rate_id,
    hsn_sac_code: req.body.hsn_sac_code || '',
    min_stock_level: Number(req.body.min_stock_level || 0),
    max_stock_level: Number(req.body.max_stock_level || 100),
    reorder_level: Number(req.body.reorder_level || 10),
    reorder_qty: Number(req.body.reorder_qty || 20),
    valuation_rate: Number(req.body.valuation_rate || 0),
    default_location_id: req.body.default_location_id || 'loc-01',
    is_batch_tracked: Boolean(req.body.is_batch_tracked),
    is_serial_tracked: Boolean(req.body.is_serial_tracked),
    is_expiry_tracked: Boolean(req.body.is_expiry_tracked),
    barcode: req.body.barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
    image_url: req.body.image_url || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=60',
    is_active: true,
    created_at: new Date().toISOString()
  };

  db.items.push(newItem);
  
  // Initial zero balance
  db.inventory_balances.push({
    id: `bal-${Date.now()}`,
    item_id: newItem.id,
    warehouse_id: 'wh-01',
    location_id: newItem.default_location_id,
    on_hand_qty: 0,
    reserved_qty: 0,
    available_qty: 0,
    valuation_rate: newItem.valuation_rate
  });

  saveDb();
  res.json({ success: true, data: newItem, message: 'Item created successfully' });
});

// SUPPLIERS API
router.get('/suppliers', (req, res) => {
  res.json({ success: true, data: db.suppliers });
});

router.post('/suppliers', (req, res) => {
  const newSup = {
    id: `sup-${Date.now()}`,
    supplier_code: req.body.supplier_code || `SUP-${Math.floor(10000 + Math.random() * 90000)}`,
    supplier_name: req.body.supplier_name,
    contact_person: req.body.contact_person,
    phone: req.body.phone,
    email: req.body.email,
    address_registered: req.body.address_registered || '',
    address_billing: req.body.address_billing || '',
    gst_number: req.body.gst_number || '',
    pan_number: req.body.pan_number || '',
    payment_terms: req.body.payment_terms || 'Net 30 days',
    delivery_lead_time_days: Number(req.body.delivery_lead_time_days || 5),
    rating: 5.0,
    approval_status: 'Approved',
    bank_details: req.body.bank_details || {},
    is_active: true
  };
  db.suppliers.push(newSup);
  saveDb();
  res.json({ success: true, data: newSup, message: 'Supplier created successfully' });
});

// DEPARTMENTS API
router.get('/departments', (req, res) => {
  res.json({ success: true, data: db.departments });
});

// WAREHOUSES API
router.get('/warehouses', (req, res) => {
  const data = db.warehouses.map(w => {
    const locations = db.warehouse_locations.filter(l => l.warehouse_id === w.id);
    return { ...w, locations };
  });
  res.json({ success: true, data });
});

// CATEGORIES, BRANDS, UOMS, TAXES
router.get('/categories', (req, res) => res.json({ success: true, data: db.item_categories }));
router.get('/brands', (req, res) => res.json({ success: true, data: db.brands }));
router.get('/uoms', (req, res) => res.json({ success: true, data: db.units_of_measure }));
router.get('/taxes', (req, res) => res.json({ success: true, data: db.tax_rates }));

export default router;

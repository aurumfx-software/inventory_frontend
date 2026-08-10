import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/reports/:reportType
router.get('/:reportType', (req, res) => {
  const { reportType } = req.params;
  const { startDate, endDate, warehouse_id, department_id, category_id } = req.query;

  let reportData = [];

  switch (reportType) {
    case 'current-stock':
      reportData = db.items.map(item => {
        const cat = db.item_categories.find(c => c.id === item.category_id) || {};
        const uom = db.units_of_measure.find(u => u.id === item.uom_id) || {};
        const balances = db.inventory_balances.filter(b => b.item_id === item.id);
        const onHand = balances.reduce((s, b) => s + (b.on_hand_qty || 0), 0);
        const reserved = balances.reduce((s, b) => s + (b.reserved_qty || 0), 0);

        return {
          item_code: item.item_code,
          item_name: item.item_name,
          category_name: cat.category_name,
          uom: uom.unit_symbol,
          on_hand_qty: onHand,
          reserved_qty: reserved,
          available_qty: onHand - reserved,
          valuation_rate: item.valuation_rate,
          total_stock_value: onHand * item.valuation_rate
        };
      });
      break;

    case 'stock-ledger':
      reportData = db.inventory_ledger.map(entry => {
        const item = db.items.find(i => i.id === entry.item_id) || {};
        const wh = db.warehouses.find(w => w.id === entry.warehouse_id) || {};
        return {
          ...entry,
          item_code: item.item_code,
          item_name: item.item_name,
          warehouse_name: wh.name
        };
      });
      break;

    case 'low-stock':
      reportData = db.items.filter(item => {
        const balances = db.inventory_balances.filter(b => b.item_id === item.id);
        const available = balances.reduce((s, b) => s + (b.available_qty || 0), 0);
        return available <= item.reorder_level;
      }).map(item => {
        const cat = db.item_categories.find(c => c.id === item.category_id) || {};
        const balances = db.inventory_balances.filter(b => b.item_id === item.id);
        const available = balances.reduce((s, b) => s + (b.available_qty || 0), 0);

        return {
          item_code: item.item_code,
          item_name: item.item_name,
          category_name: cat.category_name,
          reorder_level: item.reorder_level,
          available_qty: available,
          shortage_qty: Math.max(0, item.reorder_level - available),
          suggested_reorder_qty: item.reorder_qty
        };
      });
      break;

    case 'out-of-stock':
      reportData = db.items.filter(item => {
        const balances = db.inventory_balances.filter(b => b.item_id === item.id);
        const onHand = balances.reduce((s, b) => s + (b.on_hand_qty || 0), 0);
        return onHand === 0;
      }).map(item => ({
        item_code: item.item_code,
        item_name: item.item_name,
        min_stock_level: item.min_stock_level,
        reorder_qty: item.reorder_qty,
        status: 'OUT_OF_STOCK'
      }));
      break;

    case 'stock-valuation':
      reportData = db.items.map(item => {
        const balances = db.inventory_balances.filter(b => b.item_id === item.id);
        const qty = balances.reduce((s, b) => s + (b.on_hand_qty || 0), 0);
        return {
          item_code: item.item_code,
          item_name: item.item_name,
          quantity: qty,
          unit_rate: item.valuation_rate,
          total_value: qty * item.valuation_rate,
          method: db.settings.valuation_method || 'FIFO'
        };
      });
      break;

    case 'ageing':
      reportData = db.items.map(item => {
        const balances = db.inventory_balances.filter(b => b.item_id === item.id);
        const qty = balances.reduce((s, b) => s + (b.on_hand_qty || 0), 0);
        return {
          item_code: item.item_code,
          item_name: item.item_name,
          total_qty: qty,
          bucket_0_30: Math.round(qty * 0.5),
          bucket_31_60: Math.round(qty * 0.3),
          bucket_61_90: Math.round(qty * 0.15),
          bucket_91_180: Math.round(qty * 0.05),
          bucket_180_plus: 0
        };
      });
      break;

    case 'supplier-performance':
      reportData = db.suppliers.map(sup => {
        const pos = db.purchase_orders.filter(p => p.supplier_id === sup.id);
        const totalValue = pos.reduce((s, p) => s + (p.total_amount || 0), 0);
        return {
          supplier_code: sup.supplier_code,
          supplier_name: sup.supplier_name,
          total_orders: pos.length,
          total_purchase_value: totalValue,
          on_time_delivery_pct: 95.5,
          rejection_pct: 0.8,
          average_lead_time_days: sup.delivery_lead_time_days,
          rating: sup.rating
        };
      });
      break;

    case 'department-consumption':
      reportData = db.departments.map(dept => {
        const issues = db.stock_issues.filter(i => i.department_id === dept.id);
        return {
          department_code: dept.code,
          department_name: dept.name,
          cost_centre: dept.cost_centre,
          total_issues: issues.length,
          annual_budget: dept.budget_annual,
          consumed_value: 345000,
          budget_remaining: dept.budget_annual - 345000
        };
      });
      break;

    case 'expiry':
      reportData = db.item_batches.filter(b => b.expiry_date).map(b => {
        const item = db.items.find(i => i.id === b.item_id) || {};
        const daysToExpiry = Math.ceil((new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        return {
          batch_number: b.batch_number,
          item_code: item.item_code,
          item_name: item.item_name,
          available_qty: b.available_qty,
          expiry_date: b.expiry_date,
          days_to_expiry: daysToExpiry,
          risk_status: daysToExpiry < 30 ? 'CRITICAL_EXPIRED_SOON' : 'NORMAL'
        };
      });
      break;

    default:
      reportData = db.items.map(i => ({ item_code: i.item_code, item_name: i.item_name, rate: i.valuation_rate }));
      break;
  }

  res.json({ success: true, reportType, count: reportData.length, data: reportData });
});

export default router;

import urllib.request
import json
import sys

# Configure UTF-8 encoding for Windows terminal output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

endpoints = [
    '/api/health',
    '/api/items',
    '/api/items/search?q=laptop',
    '/api/categories',
    '/api/item-categories',
    '/api/masters/item-categories',
    '/api/brands',
    '/api/uom',
    '/api/uoms',
    '/api/units-of-measure',
    '/api/taxes',
    '/api/tax-rates',
    '/api/suppliers',
    '/api/departments',
    '/api/warehouses',
    '/api/locations',
    '/api/warehouse-locations',
    '/api/users',
    '/api/roles',
    '/api/permissions',
    '/api/indents',
    '/api/indents/stock-review-queue',
    '/api/approvals',
    '/api/approvals/history',
    '/api/approvals/workflows',
    '/api/approvals/delegations',
    '/api/rfqs',
    '/api/quotations',
    '/api/purchase-orders',
    '/api/goods-receipts',
    '/api/quality-inspections',
    '/api/stock-issues',
    '/api/stock-transfers',
    '/api/stock-returns',
    '/api/supplier-returns',
    '/api/stock-adjustments',
    '/api/stock',
    '/api/inventory-balances',
    '/api/inventory-ledger',
    '/api/stock-counts',
    '/api/reservations',
    '/api/assets',
    '/api/reports/current-stock',
    '/api/reports/low-stock',
    '/api/reports/supplier-performance',
    '/api/settings',
    '/api/audit-logs',
    '/api/notifications',
    '/api/attachments'
]

base_url = 'http://127.0.0.1:8000'
passed = 0
failed = 0

print("=" * 65)
print("=== TESTING ALL 49 FASTAPI BACKEND API ENDPOINTS ===")
print("=" * 65)

for ep in endpoints:
    url = base_url + ep
    try:
        req = urllib.request.urlopen(url, timeout=5)
        status = req.getcode()
        body = json.loads(req.read().decode('utf-8'))
        is_success = body.get('success', False) or status == 200
        if status == 200 and is_success:
            print(f"[PASS 200 OK] {ep}")
            passed += 1
        else:
            print(f"[FAIL {status}] {ep}")
            failed += 1
    except Exception as e:
        print(f"[ERROR] {ep} -> {e}")
        failed += 1

print("=" * 65)
print(f"=== SUMMARY: {passed} PASSED, {failed} FAILED out of {len(endpoints)} ENDPOINTS ===")
print("=" * 65)

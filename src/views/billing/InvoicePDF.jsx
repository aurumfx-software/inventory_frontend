import React, { useState } from 'react';
import { ShoppingCart, Laptop, Armchair, Printer, Palette } from 'lucide-react';

const fmtDec = (n, d = 2) => (Number(n) || 0).toFixed(d);

function formatReceiptDateTime(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return {
    date: `${day}-${month}-${yyyy}`,
    time: `${hours}:${minutes} ${ampm}`
  };
}

// Visual Bill Designer Live Element Renderer for Real Invoice Data
function renderLiveBuilderElement(el, data) {
  const {
    storeName,
    storeSubtitle,
    storeAddress,
    storePhone,
    storeEmail,
    storeGstin,
    storeFssai,
    invoiceNumber,
    billDate,
    billTime,
    paymentMethod,
    billerName,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    customerGstin,
    receiptItems,
    grossBillTotal,
    finalBillTotal,
    finalGrandTotal,
    roundoff,
    savings,
    cgstVal,
    sgstVal,
    igstVal,
    cashReceived,
    change,
    customConfig
  } = data;

  const isThermal = (customConfig?.paper_size && customConfig.paper_size.includes('thermal')) || (customConfig?.layout_type && customConfig.layout_type.includes('thermal'));
  const primaryColor = customConfig?.primary_color || '#2563eb';

  switch (el.type) {
    case 'business_name':
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 16}px`,
            fontWeight: el.fontWeight || 'bold',
            textAlign: el.alignment || 'center',
            color: el.color || '#0f172a'
          }}
          className="uppercase tracking-wide"
        >
          {el.text || storeName}
        </div>
      );

    case 'business_subtitle':
      if (el.showOnlyIfAvailable && !storeSubtitle && !el.text) return null;
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 11}px`,
            textAlign: el.alignment || 'center',
            color: el.color || '#64748b'
          }}
        >
          {el.text || storeSubtitle}
        </div>
      );

    case 'business_address':
      if (el.showOnlyIfAvailable && !storeAddress && !el.text) return null;
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 10}px`,
            textAlign: el.alignment || 'center',
            color: el.color || '#475569'
          }}
        >
          {el.text || storeAddress}
        </div>
      );

    case 'business_phone':
      if (el.showOnlyIfAvailable && !storePhone && !el.text) return null;
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 10}px`,
            textAlign: el.alignment || 'center',
            color: el.color || '#475569'
          }}
        >
          {el.text || (storePhone ? `Ph: ${storePhone}` : '')}
        </div>
      );

    case 'business_gstin':
      if (el.showOnlyIfAvailable && !storeGstin && !el.text) return null;
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 10}px`,
            textAlign: el.alignment || 'center',
            color: el.color || '#0f172a',
            fontWeight: el.fontWeight || 'bold'
          }}
        >
          {el.text || (storeGstin ? `GSTIN: ${storeGstin}` : '')}
        </div>
      );

    case 'business_header_split':
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div className="flex items-center space-x-3">
            {el.logo && (
              <div 
                className="w-11 h-11 rounded-xl text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {storeName.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">{el.storeName || storeName}</h2>
              {(el.address || storeAddress) && <p className="text-[11px] text-slate-500">{el.address || storeAddress}</p>}
              <div className="text-[10px] text-slate-600 mt-0.5 space-x-2">
                {(el.phone || storePhone) && <span>Ph: {el.phone || storePhone}</span>}
                {(el.gstin || storeGstin) && <span>• GSTIN: <strong>{el.gstin || storeGstin}</strong></span>}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span 
              className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg text-white inline-block shadow-2xs"
              style={{ backgroundColor: primaryColor }}
            >
              {el.title || 'TAX INVOICE'}
            </span>
            <div className="text-[11px] font-mono text-slate-600 mt-1">
              <div>Inv: <strong>{invoiceNumber}</strong></div>
              <div>Date: {billDate}</div>
            </div>
          </div>
        </div>
      );

    case 'divider':
      return (
        <div 
          className="my-1.5"
          style={{
            borderTop: `1px ${el.style || 'dashed'} ${el.color || '#cbd5e1'}`
          }}
        />
      );

    case 'spacer':
      return <div style={{ height: `${el.height || 16}px` }} />;

    case 'custom_text':
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 11}px`,
            textAlign: el.alignment || 'center',
            fontWeight: el.fontWeight || 'normal',
            color: el.color || '#334155'
          }}
        >
          {el.text}
        </div>
      );

    case 'badge_alert':
      return (
        <div
          style={{
            backgroundColor: el.bg || '#f1f5f9',
            color: el.color || '#475569',
            fontSize: `${el.fontSize || 10}px`
          }}
          className="p-2 rounded-lg text-center font-medium"
        >
          {el.text}
        </div>
      );

    case 'invoice_meta':
      return (
        <div className="text-[10px] text-slate-700 font-mono space-y-0.5">
          {el.showBillNo !== false && (
            <div className="flex justify-between">
              <span>Bill No:</span>
              <strong className="text-slate-900">{invoiceNumber}</strong>
            </div>
          )}
          {el.showDate !== false && (
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{billDate}</span>
            </div>
          )}
          {el.showTime !== false && (
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{billTime}</span>
            </div>
          )}
          {el.showCashier !== false && (
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{billerName || 'Admin Desk'}</span>
            </div>
          )}
        </div>
      );

    case 'customer_section':
      if (el.showOnlyIfAvailable && !customerName && !customerPhone) return null;
      return (
        <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs space-y-1">
          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Billed To (Customer)</span>
          {el.showName !== false && <div className="font-bold text-slate-900">{customerName}</div>}
          {el.showPhone !== false && customerPhone && <div className="text-slate-600 font-mono">{customerPhone}</div>}
          {el.showAddress && customerAddress && <div className="text-slate-500 text-[11px]">{customerAddress}</div>}
          {el.showGstin !== false && customerGstin && (
            <div className="text-slate-700 text-[10px] font-mono">
              GSTIN: <strong className="text-slate-900">{customerGstin}</strong>
            </div>
          )}
        </div>
      );

    case 'product_table': {
      const cols = el.columns || ['sno', 'name', 'qty', 'rate', 'amount'];
      return (
        <div className="overflow-x-auto text-[11px] my-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr 
                style={{
                  backgroundColor: el.headerBg || (isThermal ? '#ffffff' : primaryColor),
                  color: el.headerColor || (isThermal ? '#000000' : '#ffffff')
                }}
                className={isThermal ? 'border-b border-black font-mono' : 'font-bold uppercase text-[10px]'}
              >
                {cols.includes('sno') && <th className="py-1 px-1.5 w-7 text-center">#</th>}
                {cols.includes('name') && <th className="py-1 px-2">Item</th>}
                {cols.includes('sku') && <th className="py-1 px-1.5 text-center">SKU</th>}
                {cols.includes('hsn') && <th className="py-1 px-1.5 text-center">HSN</th>}
                {cols.includes('batch') && <th className="py-1 px-1.5 text-center">Batch</th>}
                {cols.includes('expiry') && <th className="py-1 px-1.5 text-center">Exp</th>}
                {cols.includes('qty') && <th className="py-1 px-1.5 text-center">Qty</th>}
                {cols.includes('mrp') && <th className="py-1 px-1.5 text-right">MRP</th>}
                {cols.includes('rate') && <th className="py-1 px-1.5 text-right">Rate</th>}
                {cols.includes('discount') && <th className="py-1 px-1.5 text-right">Disc</th>}
                {cols.includes('gst_rate') && <th className="py-1 px-1.5 text-right">GST%</th>}
                {cols.includes('amount') && <th className="py-1 px-2 text-right">Total</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {receiptItems.map((it, i) => (
                <tr key={it.sno || i} className={el.zebra && i % 2 === 1 ? 'bg-slate-50' : ''}>
                  {cols.includes('sno') && <td className="py-1 px-1.5 text-center text-slate-500 font-mono">{it.sno}</td>}
                  {cols.includes('name') && <td className="py-1 px-2 font-medium text-slate-900">{it.name}</td>}
                  {cols.includes('sku') && <td className="py-1 px-1.5 text-center font-mono text-slate-500 text-[10px]">{it.sku || '-'}</td>}
                  {cols.includes('hsn') && <td className="py-1 px-1.5 text-center font-mono text-slate-500 text-[10px]">{it.hsn || '-'}</td>}
                  {cols.includes('batch') && <td className="py-1 px-1.5 text-center font-mono text-slate-500 text-[10px]">{it.batch || '-'}</td>}
                  {cols.includes('expiry') && <td className="py-1 px-1.5 text-center font-mono text-slate-500 text-[10px]">{it.expiry || '-'}</td>}
                  {cols.includes('qty') && <td className="py-1 px-1.5 text-center font-bold">{it.qty}</td>}
                  {cols.includes('mrp') && <td className="py-1 px-1.5 text-right font-mono text-slate-400 line-through">₹{it.mrp}</td>}
                  {cols.includes('rate') && <td className="py-1 px-1.5 text-right font-mono">₹{it.rate}</td>}
                  {cols.includes('discount') && <td className="py-1 px-1.5 text-right font-mono text-emerald-600">{it.discount > 0 ? `${it.discount}%` : '-'}</td>}
                  {cols.includes('gst_rate') && <td className="py-1 px-1.5 text-right font-mono">{it.gst_rate}%</td>}
                  {cols.includes('amount') && <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">₹{it.amount}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'tax_breakdown_summary': {
      const totalTax = cgstVal + sgstVal + igstVal;
      if (el.hideIfZero && totalTax <= 0) return null;
      return (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 font-mono">
          <div className="font-bold text-slate-800 mb-1">GST Breakdown:</div>
          <div className="grid grid-cols-3 gap-2">
            <div>Taxable: ₹{(grossBillTotal || finalBillTotal || 0).toFixed(2)}</div>
            <div>CGST: ₹{(cgstVal || 0).toFixed(2)}</div>
            <div>SGST: ₹{(sgstVal || 0).toFixed(2)}</div>
            {igstVal > 0 && <div>IGST: ₹{(igstVal || 0).toFixed(2)}</div>}
          </div>
        </div>
      );
    }

    case 'bill_totals': {
      const totTax = cgstVal + sgstVal + igstVal;
      return (
        <div className="space-y-1 text-xs text-slate-700 py-1">
          {el.showSubtotal !== false && (
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">₹{(grossBillTotal || finalBillTotal || 0).toFixed(2)}</span>
            </div>
          )}
          {el.showDiscount !== false && savings > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount / Savings:</span>
              <span className="font-mono">-₹{savings.toFixed(2)}</span>
            </div>
          )}
          {el.showTax !== false && (!el.hideIfZero || totTax > 0) && (
            <div className="flex justify-between">
              <span>Total GST:</span>
              <span className="font-mono">₹{totTax.toFixed(2)}</span>
            </div>
          )}
          {el.showRoundOff !== false && roundoff !== 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Round Off:</span>
              <span className="font-mono">₹{roundoff.toFixed(2)}</span>
            </div>
          )}
          {el.showGrandTotal !== false && (
            <div 
              className="flex justify-between py-1.5 px-2 rounded-lg font-bold text-sm my-1"
              style={{
                backgroundColor: isThermal ? '#f1f5f9' : `${primaryColor}15`,
                color: isThermal ? '#000000' : primaryColor
              }}
            >
              <span>Grand Total:</span>
              <span className="font-mono">₹{(finalGrandTotal || 0).toFixed(2)}</span>
            </div>
          )}
          {el.showAmountPaid !== false && (
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Amount Paid:</span>
              <span className="font-mono">₹{(cashReceived || finalGrandTotal || 0).toFixed(2)}</span>
            </div>
          )}
          {el.showBalance !== false && change > 0 && (
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Change / Balance:</span>
              <span className="font-mono">₹{change.toFixed(2)}</span>
            </div>
          )}
        </div>
      );
    }

    case 'savings_badge':
      if (savings <= 0) return null;
      return (
        <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold text-center">
          {el.labelText || 'You Have Saved Rs.'} {savings.toFixed(2)}
        </div>
      );

    case 'upi_qr': {
      const upiId = el.upiId || customConfig?.bank_upi || 'store@upi';
      const payee = el.payeeName || storeName;
      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payee)}&am=${finalGrandTotal}&cu=INR`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiString)}&size=150x150`;

      return (
        <div className="flex flex-col items-center justify-center my-2 p-2">
          <div className="p-1.5 bg-white border border-slate-300 rounded-xl shadow-2xs">
            <img 
              src={qrUrl} 
              alt="UPI QR Code" 
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain" 
              loading="lazy"
            />
          </div>
          {el.showLabel !== false && (
            <div className="text-center mt-1 text-[10px] text-slate-600 font-mono">
              <span className="font-bold block">Scan to Pay via UPI</span>
              <span className="text-slate-400">{upiId}</span>
            </div>
          )}
        </div>
      );
    }

    case 'bank_remittance':
      return (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-700 space-y-0.5">
          <span className="font-bold uppercase tracking-wider text-slate-400 block">Bank Wire Remittance</span>
          <div>Bank: <strong className="text-slate-900">{el.bankName || customConfig?.bank_name}</strong></div>
          <div>Account No: <strong className="font-mono text-slate-900">{el.accountNo || customConfig?.bank_account_no}</strong></div>
          <div>IFSC Code: <strong className="font-mono text-purple-700">{el.ifsc || customConfig?.bank_ifsc}</strong></div>
        </div>
      );

    case 'signature_block':
      return (
        <div className="pt-6 border-t border-dotted border-slate-300 flex justify-between items-end text-[10px] text-slate-500 my-4">
          <div>
            {el.companyStamp && (
              <div className="w-16 h-16 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400 uppercase font-bold text-center p-1">
                Company Seal
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="w-36 border-b border-slate-400 mb-1" />
            <div className="font-bold text-slate-800">{el.title || customConfig?.signature_title || 'Authorized Signatory'}</div>
            <div className="text-[9px] text-slate-400">For {storeName}</div>
          </div>
        </div>
      );

    case 'footer_greeting':
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 11}px`,
            textAlign: el.alignment || 'center',
            fontWeight: el.fontWeight || 'bold',
            color: el.color || '#334155'
          }}
          className="uppercase tracking-wider my-1"
        >
          {el.text || customConfig?.footer_greeting || '**** Thank You Visit Again ****'}
        </div>
      );

    case 'footer_terms':
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 9}px`,
            textAlign: el.alignment || 'center',
            color: el.color || '#94a3b8'
          }}
          className="whitespace-pre-line leading-relaxed my-1"
        >
          {el.text || customConfig?.terms_and_conditions}
        </div>
      );

    case 'page_break':
      return (
        <div 
          className="my-3 py-1 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-400 font-mono"
          style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
        >
          ✂ --- Page Break ---
        </div>
      );

    default:
      return null;
  }
}

export default function InvoicePDF({
  invoiceNumber = 'SH/25-27/0000001',
  cartItems = [],
  customer = {},
  summary = {},
  saleType = 'intra',
  paymentMethod = 'Cash',
  billerName = '',
  amountPaid,
  transactionId = '',
  invoiceDate,
  preview = false,
  settings = null,
  theme: propTheme = null,
  onThemeChange = null,
  customConfig: propCustomConfig = null
}) {
  const [internalTheme, setInternalTheme] = useState(null);

  // Determine active theme (priority: internal state > prop > settings > default 'supermarket')
  const activeTheme = internalTheme || propTheme || settings?.bill_theme || 'supermarket';

  // Customizer dynamic configuration
  const customConfig = propCustomConfig || settings?.custom_theme_config || {
    theme_id: 'custom',
    theme_name: 'Custom Tailored Theme',
    layout_type: 'a4',
    primary_color: '#2563eb',
    accent_color: '#0f172a',
    header_bg_color: '#f8fafc',
    text_color: '#0f172a',
    font_family: "Inter, -apple-system, sans-serif",
    font_size: 'medium',
    border_style: 'card',
    header_alignment: 'split',
    invoice_title: 'TAX INVOICE',
    show_logo: true,
    show_subtitle: true,
    show_phone: true,
    show_email: true,
    show_address: true,
    show_gstin: true,
    show_fssai: false,
    show_sku: true,
    show_hsn: true,
    show_mrp: false,
    show_discount: true,
    show_tax_rate: true,
    show_tax_breakdown: true,
    show_bank_details: true,
    bank_name: 'HDFC Bank Ltd',
    bank_account_no: '50200084920194',
    bank_ifsc: 'HDFC0001248',
    bank_upi: 'store@upi',
    show_signatures: 'single',
    signature_title: 'Authorized Signatory',
    terms_and_conditions: 'Thank you for your business. Please retain this invoice for your records.',
    footer_greeting: 'Thank you! Visit again.'
  };

  const handleSelectTheme = (t) => {
    setInternalTheme(t);
    if (onThemeChange) onThemeChange(t);
  };

  const { date: billDate, time: billTime } = formatReceiptDateTime(invoiceDate);

  const storeName = settings?.store_name || (
    activeTheme === 'software' ? 'AURUM TECH SOLUTIONS PVT LTD' :
    activeTheme === 'furniture' ? 'ROYAL LIVING FURNITURE & INTERIORS' :
    'AMMUS SUPERMARKET'
  );
  const storeSubtitle = settings?.store_subtitle || (
    activeTheme === 'software' ? 'Enterprise Software, Cloud & Digital Systems' :
    activeTheme === 'furniture' ? 'Exclusive Handcrafted Living & Office Furnishings' :
    'Fresh Grocery & Supermarket'
  );
  const storeAddress = settings?.store_address || (
    activeTheme === 'software' ? 'Cyber City Tech Park, Phase II, Trivandrum - 695581' :
    activeTheme === 'furniture' ? 'Grand Showroom, Ring Road Bypass, Trivandrum - 695024' :
    'JUNCTION ROAD, NEAR BUS STAND, TRIVANDRUM'
  );
  const storePhone = settings?.store_phone || '9895820417, 0471-224488';
  const storeEmail = settings?.store_email || (
    activeTheme === 'software' ? 'billing@aurumtech.com' :
    activeTheme === 'furniture' ? 'contact@royalliving.com' :
    'contact@ammussupermarket.com'
  );
  const storeGstin = settings?.gstin || '32DPHPB3199N1ZL';
  const storeFssai = settings?.fssai || '';
  const invoiceTitle = settings?.invoice_title || (
    activeTheme === 'software' ? 'TAX INVOICE / SERVICE BILL' :
    activeTheme === 'furniture' ? 'SHOWROOM TAX INVOICE' :
    'TAX INVOICE'
  );
  const footerGreeting = settings?.footer_greeting || '**** Thank You Visit Again ****';
  const footerNote = settings?.footer_note || (
    activeTheme === 'software' ? 'Terms: Payment due within 15 days of invoice date. Bank wire or UPI accepted.' :
    activeTheme === 'furniture' ? 'Warranty: 3-Year comprehensive warranty on wood & fabrication against manufacturing defects.' :
    'Exchange within 7 days with original bill. Thank you!'
  );
  const savingsText = settings?.savings_text || 'You Have Saved Rs.';

  let grossBillTotal = 0;
  let netTotal = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  const receiptItems = cartItems.map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.unit_price) || 0;
    const mrp = Number(item.mrp) || Number(item.max_retail_price) || rate;
    const amount = Number((qty * rate).toFixed(2));
    const itemTotalMRP = Number((qty * mrp).toFixed(2));

    grossBillTotal += itemTotalMRP;
    netTotal += amount;

    const gstRate = Number(item.gst_rate) || 0;
    if (gstRate > 0) {
      const gstAmt = (amount * gstRate) / 100;
      if (saleType === 'inter') {
        totalIGST += gstAmt;
      } else {
        totalCGST += gstAmt / 2;
        totalSGST += gstAmt / 2;
      }
    }

    return {
      sno: idx + 1,
      name: item.name || item.product_name || item.product_name_snapshot || 'Product Item',
      sku: item.sku || item.item_code || '',
      hsn: item.hsn_sac || item.hsn_sac_code || (activeTheme === 'software' ? '998314' : activeTheme === 'furniture' ? '9403' : '2106'),
      qty: qty % 1 === 0 ? qty.toString() : qty.toFixed(2),
      mrp: mrp.toFixed(2),
      rate: rate.toFixed(2),
      discount: Number(item.discount) || 0,
      gst_rate: gstRate,
      amount: amount.toFixed(2)
    };
  });

  grossBillTotal = Number(grossBillTotal.toFixed(2));
  netTotal = Number(netTotal.toFixed(2));

  const finalBillTotal = summary.bill_total ? Number(summary.bill_total) : (grossBillTotal > 0 ? grossBillTotal : netTotal);
  const finalGrandTotal = summary.grandTotal !== undefined ? Number(summary.grandTotal) : netTotal;
  const roundoff = summary.roundOff !== undefined ? Number(summary.roundOff) : 0;
  const savings = Math.max(0, Number((finalBillTotal - finalGrandTotal).toFixed(2)));

  const cgstVal = summary.totalCGST !== undefined && summary.totalCGST > 0 ? Number(summary.totalCGST) : totalCGST;
  const sgstVal = summary.totalSGST !== undefined && summary.totalSGST > 0 ? Number(summary.totalSGST) : totalSGST;
  const igstVal = summary.totalIGST !== undefined && summary.totalIGST > 0 ? Number(summary.totalIGST) : totalIGST;

  const cashReceived = amountPaid !== undefined && amountPaid !== '' ? Number(amountPaid) : finalGrandTotal;
  const change = Math.max(0, Number((cashReceived - finalGrandTotal).toFixed(2)));

  const handlePrint = () => {
    window.print();
  };

  const customerName = customer.name && customer.name.trim() !== '' ? customer.name : 'Walk-in Customer';
  const customerGstin = customer.gstin || '';
  const customerPhone = customer.phone || '';
  const customerEmail = customer.email || '';
  const customerAddress = customer.address || '';

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* ── THEME SWITCHER & PRINT TOOLBAR (Visible on screen, hidden in print) ── */}
      {preview && (
        <div className="no-print mb-4 w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider mr-1">Bill Theme:</span>
            <button
              type="button"
              onClick={() => handleSelectTheme('supermarket')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer ${
                activeTheme === 'supermarket'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Supermarket</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTheme('software')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer ${
                activeTheme === 'software'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Software Bill</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTheme('furniture')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer ${
                activeTheme === 'furniture'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              <span>Furniture Bill</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTheme('custom')}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer ${
                activeTheme === 'custom'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Custom Theme</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Bill</span>
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. THEME: SUPERMARKET (POS Thermal 80mm Roll Receipt)                   */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTheme === 'supermarket' && (
        <div
          id="thermal-receipt"
          className="thermal-receipt-container font-mono bg-white text-black p-4 sm:p-5 w-full max-w-[340px] shadow-sm border border-slate-300 select-text"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '11px',
            lineHeight: '1.35',
            color: '#000000',
            background: '#ffffff'
          }}
        >
          {/* Header - Supermarket Store Details */}
          <div className="text-center font-bold tracking-wider mb-2">
            <div className="text-base sm:text-lg font-black tracking-widest leading-tight uppercase">
              {storeName}
            </div>
            {storeSubtitle && (
              <div className="text-[10px] font-bold text-slate-700 tracking-wider uppercase mt-0.5">
                {storeSubtitle}
              </div>
            )}
            <div className="text-[11px] font-semibold tracking-wide mt-0.5 uppercase">
              {storeAddress}
            </div>
            {storePhone && (
              <div className="text-[11px] font-normal tracking-wide mt-0.5">
                PH: {storePhone}
              </div>
            )}
            {storeGstin && (
              <div className="text-[11px] font-normal tracking-wide mt-0.5">
                GSTIN: {storeGstin}
              </div>
            )}
            {storeFssai && (
              <div className="text-[10px] font-normal tracking-wide mt-0.5">
                FSSAI Lic: {storeFssai}
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-black my-1.5" />

          <div className="text-center font-black tracking-widest text-xs uppercase mb-1">
            {invoiceTitle}
          </div>

          <div className="text-xs space-y-0.5 mb-1.5 leading-tight">
            <div className="flex justify-between">
              <span className="font-semibold">Bill No :</span>
              <span className="font-bold">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date    : {billDate}</span>
              <span className="font-semibold">{billTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Bill To :</span>
              <span className="truncate max-w-[190px]">{customerName}</span>
            </div>
            {customerPhone && (
              <div className="flex justify-between">
                <span className="font-semibold">Phone   :</span>
                <span>{customerPhone}</span>
              </div>
            )}
            {customerGstin && (
              <div className="flex justify-between">
                <span className="font-semibold">GSTIN   :</span>
                <span className="font-mono">{customerGstin}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-black my-1.5" />

          {/* Table Column Header */}
          <div className="text-[10.5px] font-bold">
            <div className="flex justify-between items-center text-left">
              <span style={{ width: '22px' }}>S.No</span>
              <span style={{ flex: 1, paddingLeft: '4px', paddingRight: '4px' }}>Item</span>
              <span style={{ width: '28px', textAlign: 'right' }}>Qty</span>
              <span style={{ width: '45px', textAlign: 'right' }}>MRP</span>
              <span style={{ width: '45px', textAlign: 'right' }}>Rate</span>
              <span style={{ width: '48px', textAlign: 'right' }}>Amount</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-1" />

          {/* Item Rows */}
          <div className="space-y-1 my-1 text-xs">
            {receiptItems.map((it) => (
              <div key={it.sno} className="leading-tight">
                <div className="flex items-start justify-between">
                  <span style={{ width: '22px' }} className="font-semibold">{it.sno}</span>
                  <span style={{ flex: 1, paddingLeft: '4px', paddingRight: '4px' }} className="font-bold uppercase break-words leading-tight">
                    {it.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span style={{ width: '22px' }}></span>
                  <span style={{ flex: 1, paddingLeft: '4px', paddingRight: '4px' }} className="text-[10px] text-slate-600 font-mono">
                    {it.sku ? `${it.sku}` : ''}
                  </span>
                  <span style={{ width: '28px', textAlign: 'right' }} className="font-mono">{it.qty}</span>
                  <span style={{ width: '45px', textAlign: 'right' }} className="font-mono">{it.mrp}</span>
                  <span style={{ width: '45px', textAlign: 'right' }} className="font-mono">{it.rate}</span>
                  <span style={{ width: '48px', textAlign: 'right' }} className="font-mono font-bold">{it.amount}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {/* Totals & Payments Section */}
          <div className="text-xs space-y-0.5 leading-normal">
            {(cgstVal > 0 || sgstVal > 0 || igstVal > 0) && (
              <div className="flex justify-between text-[10px] text-slate-700 pb-1 mb-1 border-b border-dotted border-slate-300">
                <span>GST Breakdown:</span>
                <span>
                  {cgstVal > 0 && `CGST: ${fmtDec(cgstVal)} `}
                  {sgstVal > 0 && `SGST: ${fmtDec(sgstVal)} `}
                  {igstVal > 0 && `IGST: ${fmtDec(igstVal)}`}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>RoundOff:</span>
              <span className="font-mono">{fmtDec(roundoff, 2)}</span>
            </div>

            {paymentMethod === 'Cash' ? (
              <>
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span className="font-mono font-bold">{fmtDec(cashReceived, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className="font-mono">{fmtDec(change, 2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>Paid by {paymentMethod}:</span>
                <span className="font-mono font-bold">{fmtDec(finalGrandTotal, 2)}</span>
              </div>
            )}

            <div className="border-t border-dashed border-black my-1" />

            <div className="flex justify-between text-xs font-bold pt-0.5">
              <span>Bill Total:</span>
              <span className="font-mono">{fmtDec(finalBillTotal, 2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-0.5">
              <span>Total:</span>
              <span className="font-mono">{fmtDec(finalGrandTotal, 2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {savings > 0 && (
            <div className="text-center font-bold text-xs my-1.5 tracking-wide">
              {savingsText} {fmtDec(savings, 2)}
            </div>
          )}

          {footerGreeting && (
            <div className="text-center font-bold text-xs mt-2 mb-1 tracking-wider uppercase">
              {footerGreeting}
            </div>
          )}
          {footerNote && (
            <div className="text-center text-[10px] text-slate-700 mt-1 leading-snug">
              {footerNote}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. THEME: SOFTWARE COMPANY (A4 Executive Corporate Tech Invoice)       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTheme === 'software' && (
        <div
          id="thermal-receipt"
          className="software-invoice-container bg-white text-slate-900 p-6 sm:p-8 w-full max-w-[760px] shadow-sm border border-slate-200 rounded-2xl select-text"
          style={{
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '12px',
            lineHeight: '1.45',
            color: '#0f172a',
            background: '#ffffff'
          }}
        >
          {/* Top Tech Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  &lt;/&gt;
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                    {storeName}
                  </h1>
                  <p className="text-xs font-semibold text-blue-600 tracking-wide">
                    {storeSubtitle}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p>{storeAddress}</p>
                <p>Phone: <span className="font-medium text-slate-800">{storePhone}</span> • Email: <span className="font-medium text-slate-800">{storeEmail}</span></p>
                <p>GSTIN: <span className="font-mono font-bold text-slate-900">{storeGstin}</span> • PAN: <span className="font-mono font-bold text-slate-900">AAACH2849P</span></p>
              </div>
            </div>

            <div className="sm:text-right shrink-0 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] tracking-wider uppercase mb-1">
                {invoiceTitle}
              </span>
              <div className="text-sm font-mono font-black text-slate-900 mt-1">
                #{invoiceNumber}
              </div>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <p>Invoice Date: <strong className="text-slate-800 font-mono">{billDate}</strong></p>
                <p>Time: <strong className="text-slate-800 font-mono">{billTime}</strong></p>
                <p>Payment Terms: <strong className="text-slate-800">Net 15 Days</strong></p>
              </div>
            </div>
          </div>

          {/* Client & Project Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                CLIENT / BILLED TO
              </span>
              <p className="font-bold text-sm text-slate-900">{customerName}</p>
              {customerEmail && <p className="text-xs text-slate-600 mt-0.5">Email: {customerEmail}</p>}
              {customerPhone && <p className="text-xs text-slate-600 mt-0.5">Phone: {customerPhone}</p>}
              {customerAddress && <p className="text-xs text-slate-600 mt-0.5">{customerAddress}</p>}
              {customerGstin ? (
                <p className="text-xs text-slate-700 mt-1">GSTIN: <strong className="font-mono text-blue-700">{customerGstin}</strong></p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-0.5">Client GST: Unregistered</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                BILLING & DISPATCH METRICS
              </span>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <strong className="text-slate-900">{paymentMethod}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tax Nature:</span>
                  <strong className="text-slate-900">{saleType === 'inter' ? 'Inter-State (IGST 18%)' : 'Intra-State (CGST + SGST)'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Lead:</span>
                  <span className="font-medium text-slate-800">{billerName || 'Enterprise Billing Desk'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">PAID IN FULL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Software Deliverables Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden my-4 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Service / Deliverable Description</th>
                  <th className="py-2.5 px-2 text-center w-20">SAC / HSN</th>
                  <th className="py-2.5 px-2 text-right w-16">Qty / Hrs</th>
                  <th className="py-2.5 px-3 text-right w-24">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right w-24">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-right w-24">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {receiptItems.map((it) => (
                  <tr key={it.sno} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">{it.sno}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Code: {it.sku || `IT-DEL-${it.sno}`} • GST: {it.gst_rate}%
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[11px] text-slate-600">{it.hsn}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">{it.qty}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">{it.rate}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">{it.amount}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{it.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Financial & Bank Wire Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-5">
            {/* Bank Wire Details */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                BANK WIRE & REMITTANCE DETAILS
              </span>
              <p className="text-slate-700">Beneficiary: <strong className="text-slate-900">{storeName}</strong></p>
              <p className="text-slate-700">Bank: <strong className="text-slate-900">HDFC Bank Ltd, Techno Park Branch</strong></p>
              <p className="text-slate-700">Account No: <strong className="font-mono text-slate-900">50200084920194</strong></p>
              <p className="text-slate-700">IFSC Code: <strong className="font-mono text-blue-700">HDFC0001248</strong> • SWIFT: <strong className="font-mono text-slate-700">HDFCINBB</strong></p>
              <p className="text-slate-700">UPI VPA: <strong className="font-mono text-blue-700">aurumtechnologies@okhdfcbank</strong></p>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Subtotal (Gross Value):</span>
                <span className="font-mono font-semibold text-slate-900">₹{fmtDec(netTotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span>Enterprise Discount Applied:</span>
                  <span className="font-mono font-bold">-₹{fmtDec(savings)}</span>
                </div>
              )}
              {cgstVal > 0 && (
                <div className="flex justify-between py-0.5">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono">₹{fmtDec(cgstVal)}</span>
                </div>
              )}
              {sgstVal > 0 && (
                <div className="flex justify-between py-0.5">
                  <span>State GST (SGST):</span>
                  <span className="font-mono">₹{fmtDec(sgstVal)}</span>
                </div>
              )}
              {igstVal > 0 && (
                <div className="flex justify-between py-0.5">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-mono">₹{fmtDec(igstVal)}</span>
                </div>
              )}
              <div className="flex justify-between py-0.5 text-slate-500">
                <span>Round Off:</span>
                <span className="font-mono">{fmtDec(roundoff)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-xl mt-2">
                <span className="font-bold text-sm tracking-wide">GRAND TOTAL DUE:</span>
                <span className="font-mono text-lg font-black tracking-tight">₹{fmtDec(finalGrandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Digital Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-4 text-[11px] text-slate-500">
            <div className="max-w-md space-y-1">
              <p className="font-bold text-slate-700 uppercase tracking-wide">Terms & Service Notes:</p>
              <p>{footerNote}</p>
              <p>All intellectual property rights and code licenses transfer upon complete receipt of settlement.</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-[10px] text-slate-600 font-mono mb-1">
                Verified Digitally by {storeName}
              </div>
              <p className="font-bold text-slate-800 text-xs">Authorized Signatory</p>
              <p className="text-[10px] text-slate-400">Computer Generated Tax Invoice</p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. THEME: FURNITURE & SHOWROOM (A4 Luxury & Showroom Invoice)          */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTheme === 'furniture' && (
        <div
          id="thermal-receipt"
          className="furniture-invoice-container bg-white text-stone-900 p-6 sm:p-8 w-full max-w-[760px] shadow-sm border border-stone-300 rounded-2xl select-text"
          style={{
            fontFamily: "Cambria, Georgia, serif, system-ui",
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#1c1917',
            background: '#ffffff'
          }}
        >
          {/* Showroom Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b-2 border-amber-900/80">
            <div>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm shadow-sm">
                  ☖
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-wide text-amber-950 uppercase font-serif">
                    {storeName}
                  </h1>
                  <p className="text-xs italic text-amber-800 font-medium tracking-wide">
                    {storeSubtitle}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-stone-600 space-y-0.5">
                <p>{storeAddress}</p>
                <p>Showroom Desk: <strong className="text-stone-800">{storePhone}</strong> • Email: <strong className="text-stone-800">{storeEmail}</strong></p>
                <p>GSTIN: <span className="font-mono font-bold text-amber-950">{storeGstin}</span></p>
              </div>
            </div>

            <div className="sm:text-right shrink-0 bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-800 text-amber-50 font-bold text-[11px] tracking-wider uppercase mb-1">
                {invoiceTitle}
              </span>
              <div className="text-sm font-mono font-bold text-stone-900 mt-1">
                Bill No: {invoiceNumber}
              </div>
              <div className="text-xs text-stone-600 mt-1 space-y-0.5">
                <p>Order Date: <strong className="font-mono text-stone-800">{billDate}</strong></p>
                <p>Dispatch Slot: <strong className="text-stone-800">48-Hour White Glove Delivery</strong></p>
                <p>Payment: <strong className="text-amber-900">{paymentMethod} (Cleared)</strong></p>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                CUSTOMER & BILLING DETAILS
              </span>
              <p className="font-bold text-sm text-stone-900 font-serif">{customerName}</p>
              {customerPhone && <p className="text-xs text-stone-600 mt-0.5">Phone: {customerPhone}</p>}
              {customerEmail && <p className="text-xs text-stone-600 mt-0.5">Email: {customerEmail}</p>}
              {customerAddress && <p className="text-xs text-stone-600 mt-0.5">{customerAddress}</p>}
              {customerGstin && <p className="text-xs text-stone-700 mt-1">GSTIN: <span className="font-mono font-bold">{customerGstin}</span></p>}
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                SITE DELIVERY & ASSEMBLY PROTOCOL
              </span>
              <p className="text-xs text-stone-700">Delivery Address: <strong>{customerAddress || 'Customer Doorstep Delivery'}</strong></p>
              <p className="text-xs text-stone-700 mt-1">On-Site Assembly: <strong className="text-amber-900">Complimentary Carpentry & Fitting Included</strong></p>
              <p className="text-xs text-stone-700 mt-1">Transit Insurance: <strong className="text-emerald-800">Covered 100% Against Transit Breakage</strong></p>
            </div>
          </div>

          {/* Furniture Line Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden my-4 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-amber-950 text-amber-50 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Furniture Model / Specifications</th>
                  <th className="py-2.5 px-2 text-center w-20">HSN</th>
                  <th className="py-2.5 px-2 text-right w-16">Qty</th>
                  <th className="py-2.5 px-3 text-right w-24">Showroom MRP</th>
                  <th className="py-2.5 px-3 text-right w-24">Net Rate</th>
                  <th className="py-2.5 px-3 text-right w-24">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {receiptItems.map((it) => (
                  <tr key={it.sno} className="hover:bg-amber-50/30">
                    <td className="py-3 px-3 text-center text-stone-400 font-mono">{it.sno}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900 font-serif">{it.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                        Code: {it.sku || `FURN-${it.sno}`} • GST: {it.gst_rate}% • 3-Yr Warranty Included
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[11px] text-stone-600">{it.hsn}</td>
                    <td className="py-3 px-2 text-right font-mono text-stone-700">{it.qty} Pcs</td>
                    <td className="py-3 px-3 text-right font-mono text-stone-500 line-through">₹{it.mrp}</td>
                    <td className="py-3 px-3 text-right font-mono text-stone-800 font-bold">₹{it.rate}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-950">₹{it.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Showroom Policies & Calculations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-5">
            {/* Showroom Warranty & Delivery Notes */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider block">
                SHOWROOM QUALITY & WARRANTY POLICY
              </span>
              <p className="text-stone-700 font-serif">✓ 3-Year comprehensive warranty on wood borer, termites & joinery defects.</p>
              <p className="text-stone-700 font-serif">✓ Please inspect polished surfaces & fabric before signing the handover challan.</p>
              <p className="text-stone-700 font-serif">✓ Natural wood grains and textural variations are inherent to solid timber craft.</p>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Showroom MRP Total:</span>
                <span className="font-mono text-stone-500 line-through">₹{fmtDec(grossBillTotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between py-1 border-b border-stone-100 text-amber-800 font-bold">
                  <span>Showroom Privilege Savings:</span>
                  <span className="font-mono">-₹{fmtDec(savings)}</span>
                </div>
              )}
              {cgstVal > 0 && (
                <div className="flex justify-between py-0.5">
                  <span>CGST ({fmtDec(cgstVal / netTotal * 100, 1)}%):</span>
                  <span className="font-mono">₹{fmtDec(cgstVal)}</span>
                </div>
              )}
              {sgstVal > 0 && (
                <div className="flex justify-between py-0.5">
                  <span>SGST ({fmtDec(sgstVal / netTotal * 100, 1)}%):</span>
                  <span className="font-mono">₹{fmtDec(sgstVal)}</span>
                </div>
              )}
              {igstVal > 0 && (
                <div className="flex justify-between py-0.5">
                  <span>IGST:</span>
                  <span className="font-mono">₹{fmtDec(igstVal)}</span>
                </div>
              )}
              <div className="flex justify-between py-0.5 text-stone-500">
                <span>Round Off Adjustment:</span>
                <span className="font-mono">{fmtDec(roundoff)}</span>
              </div>
              <div className="flex justify-between items-center bg-amber-950 text-amber-50 p-3 rounded-xl mt-2 shadow-xs">
                <span className="font-bold text-sm tracking-wide font-serif">FINAL INVOICE TOTAL:</span>
                <span className="font-mono text-lg font-black tracking-tight">₹{fmtDec(finalGrandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Dual Signatures */}
          <div className="pt-5 border-t border-stone-200 grid grid-cols-2 gap-8 text-[11px] text-stone-600 mt-6">
            <div className="text-center pt-8 border-t border-dotted border-stone-400">
              <p className="font-bold text-stone-800">Customer Delivery Handover Signature</p>
              <p className="text-[10px] text-stone-400">(Goods received in good condition)</p>
            </div>
            <div className="text-center pt-8 border-t border-dotted border-stone-400">
              <p className="font-bold text-stone-800">For {storeName}</p>
              <p className="text-[10px] text-stone-400">(Showroom Manager / Authorized Signatory)</p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 4. THEME: CUSTOM (WordPress-Style Fully Tailored Bill Theme)            */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTheme === 'custom' && (
        <div
          id="thermal-receipt"
          className="custom-invoice-container bg-white shadow-sm p-5 sm:p-7 select-text"
          style={{
            fontFamily: customConfig.font_family || "Inter, -apple-system, sans-serif",
            fontSize: customConfig.font_size === 'compact' ? '11px' : customConfig.font_size === 'large' ? '13px' : '12px',
            lineHeight: '1.45',
            color: customConfig.text_color || '#0f172a',
            backgroundColor: customConfig.bg_color || '#ffffff',
            maxWidth: (customConfig.layout_type === 'thermal_80mm' || customConfig.paper_size === 'thermal_80mm') ? '340px' :
                      (customConfig.layout_type === 'thermal_58mm' || customConfig.paper_size === 'thermal_58mm') ? '280px' :
                      (customConfig.layout_type === 'a5' || customConfig.paper_size === 'a5') ? '580px' : '760px',
            width: '100%',
            border: customConfig.border_style === 'dashed' ? '1px dashed #000000' :
                    customConfig.border_style === 'card' ? '1px solid #e2e8f0' :
                    customConfig.border_style === 'luxury' ? `2px solid ${customConfig.primary_color || '#92400e'}` : 'none',
            borderRadius: customConfig.border_style === 'card' ? '16px' : customConfig.border_style === 'luxury' ? '12px' : '0px'
          }}
        >
          {customConfig?.sections && customConfig.sections.length > 0 ? (
            <div className="space-y-2">
              {customConfig.sections.filter(sec => sec.visible !== false).map(sec => (
                <div
                  key={sec.id}
                  style={{
                    backgroundColor: sec.bg_color && sec.bg_color !== 'transparent' ? sec.bg_color : undefined,
                    padding: `${sec.padding?.top ?? 6}px ${sec.padding?.right ?? 8}px ${sec.padding?.bottom ?? 6}px ${sec.padding?.left ?? 8}px`,
                    marginTop: `${sec.margin?.top ?? 0}px`,
                    marginBottom: `${sec.margin?.bottom ?? 8}px`,
                    border: sec.border_style && sec.border_style !== 'none' ? `${sec.border_width || 1}px ${sec.border_style} ${sec.border_color || '#cbd5e1'}` : undefined,
                    borderRadius: `${sec.border_radius || 0}px`,
                    minHeight: sec.min_height ? `${sec.min_height}px` : undefined
                  }}
                >
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: sec.columns?.map(c => c.width || '1fr').join(' ') || '1fr'
                    }}
                  >
                    {sec.columns?.map(col => (
                      <div key={col.id} className="space-y-1.5 flex flex-col">
                        {col.elements?.filter(el => el.visible !== false).map(el => (
                          <div key={el.id}>
                            {renderLiveBuilderElement(el, {
                              storeName,
                              storeSubtitle,
                              storeAddress,
                              storePhone,
                              storeEmail,
                              storeGstin,
                              storeFssai,
                              invoiceNumber,
                              billDate,
                              billTime,
                              paymentMethod,
                              billerName,
                              saleType,
                              customerName,
                              customerPhone,
                              customerEmail,
                              customerAddress,
                              customerGstin,
                              receiptItems,
                              grossBillTotal,
                              finalBillTotal,
                              finalGrandTotal,
                              roundoff,
                              savings,
                              cgstVal,
                              sgstVal,
                              igstVal,
                              cashReceived,
                              change,
                              customConfig
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : customConfig?.builder_elements && customConfig.builder_elements.length > 0 ? (
            <div className="space-y-2">
              {customConfig.builder_elements.filter(el => el.visible !== false).map(el => (
                <div key={el.id} className="p-0.5">
                  {renderLiveBuilderElement(el, {
                    storeName,
                    storeSubtitle,
                    storeAddress,
                    storePhone,
                    storeEmail,
                    storeGstin,
                    storeFssai,
                    invoiceNumber,
                    billDate,
                    billTime,
                    paymentMethod,
                    billerName,
                    saleType,
                    customerName,
                    customerPhone,
                    customerEmail,
                    customerAddress,
                    customerGstin,
                    receiptItems,
                    grossBillTotal,
                    finalBillTotal,
                    finalGrandTotal,
                    roundoff,
                    savings,
                    cgstVal,
                    sgstVal,
                    igstVal,
                    cashReceived,
                    change,
                    customConfig
                  })}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div
            className={`pb-5 border-b-2 flex flex-col ${
              customConfig.header_alignment === 'center'
                ? 'items-center text-center'
                : customConfig.header_alignment === 'left'
                ? 'items-start text-left'
                : 'sm:flex-row justify-between items-start gap-4'
            }`}
            style={{
              borderColor: customConfig.primary_color || '#2563eb',
              backgroundColor: customConfig.header_bg_color || 'transparent',
              padding: customConfig.header_bg_color && customConfig.header_bg_color !== '#ffffff' ? '12px' : undefined,
              borderRadius: customConfig.header_bg_color && customConfig.header_bg_color !== '#ffffff' ? '12px' : undefined
            }}
          >
            <div>
              <div className={`flex items-center space-x-2.5 ${customConfig.header_alignment === 'center' ? 'justify-center' : ''}`}>
                {customConfig.show_logo !== false && (
                  <div
                    className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0"
                    style={{ backgroundColor: customConfig.primary_color || '#2563eb' }}
                  >
                    ✦
                  </div>
                )}
                <div>
                  <h1
                    className="text-xl font-extrabold tracking-tight uppercase"
                    style={{ color: customConfig.primary_color || '#0f172a' }}
                  >
                    {storeName}
                  </h1>
                  {customConfig.show_subtitle !== false && storeSubtitle && (
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {storeSubtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                {customConfig.show_address !== false && storeAddress && <p>{storeAddress}</p>}
                <p>
                  {customConfig.show_phone !== false && storePhone && <span>Phone: <strong className="text-slate-800">{storePhone}</strong> </span>}
                  {customConfig.show_email !== false && storeEmail && <span>• Email: <strong className="text-slate-800">{storeEmail}</strong></span>}
                </p>
                {customConfig.show_gstin !== false && storeGstin && (
                  <p>GSTIN: <span className="font-mono font-bold text-slate-900">{storeGstin}</span></p>
                )}
                {customConfig.show_fssai !== false && storeFssai && (
                  <p>FSSAI Lic: <span className="font-mono text-slate-700">{storeFssai}</span></p>
                )}
              </div>
            </div>

            <div className={`mt-3 sm:mt-0 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs ${customConfig.header_alignment === 'center' ? 'text-center' : 'sm:text-right'}`}>
              <span
                className="inline-block px-2.5 py-0.5 rounded-md text-white font-bold text-[10px] tracking-wider uppercase mb-1"
                style={{ backgroundColor: customConfig.primary_color || '#2563eb' }}
              >
                {customConfig.invoice_title || invoiceTitle}
              </span>
              <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                #{invoiceNumber}
              </div>
              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                <p>Date: <strong className="text-slate-800 font-mono">{billDate}</strong></p>
                <p>Time: <strong className="text-slate-800 font-mono">{billTime}</strong></p>
                <p>Payment: <strong className="text-slate-800">{paymentMethod}</strong></p>
              </div>
            </div>
          </div>

          {/* Client & Billing Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                BILLED TO / CUSTOMER
              </span>
              <p className="font-bold text-slate-900 text-sm">{customerName}</p>
              {customerPhone && <p className="text-slate-600 mt-0.5">Phone: {customerPhone}</p>}
              {customerEmail && <p className="text-slate-600 mt-0.5">Email: {customerEmail}</p>}
              {customerAddress && <p className="text-slate-600 mt-0.5">{customerAddress}</p>}
              {customerGstin && <p className="text-slate-800 mt-1">GSTIN: <span className="font-mono font-bold">{customerGstin}</span></p>}
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                INVOICE ATTRIBUTES
              </span>
              <div className="flex justify-between">
                <span>Tax Supply:</span>
                <strong>{saleType === 'inter' ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Cashier / Lead:</span>
                <span>{billerName || 'Authorized Desk'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">CLEARED</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden my-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead
                className="text-white font-bold text-[10px] uppercase tracking-wider"
                style={{ backgroundColor: customConfig.primary_color || '#2563eb' }}
              >
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  {customConfig.show_hsn !== false && <th className="py-2.5 px-2 text-center w-20">HSN/SAC</th>}
                  <th className="py-2.5 px-2 text-right w-14">Qty</th>
                  {customConfig.show_mrp && <th className="py-2.5 px-3 text-right w-20">MRP</th>}
                  <th className="py-2.5 px-3 text-right w-20">Rate</th>
                  {customConfig.show_discount && <th className="py-2.5 px-2 text-right w-16">Disc</th>}
                  {customConfig.show_tax_rate !== false && <th className="py-2.5 px-2 text-right w-16">GST</th>}
                  <th className="py-2.5 px-3 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receiptItems.map((it) => (
                  <tr key={it.sno} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{it.sno}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{it.name}</div>
                      {customConfig.show_sku !== false && it.sku && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Code: {it.sku}</div>
                      )}
                    </td>
                    {customConfig.show_hsn !== false && (
                      <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-600">{it.hsn}</td>
                    )}
                    <td className="py-2.5 px-2 text-right font-mono text-slate-800">{it.qty}</td>
                    {customConfig.show_mrp && (
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400 line-through">₹{it.mrp}</td>
                    )}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">₹{it.rate}</td>
                    {customConfig.show_discount && (
                      <td className="py-2.5 px-2 text-right font-mono text-emerald-700">{it.discount > 0 ? `${it.discount}%` : '—'}</td>
                    )}
                    {customConfig.show_tax_rate !== false && (
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{it.gst_rate}%</td>
                    )}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹{it.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Financial Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {/* Bank Details Box */}
            {customConfig.show_bank_details && (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  BANK WIRE / UPI DETAILS
                </span>
                <p>Bank: <strong className="text-slate-900">{customConfig.bank_name || 'HDFC Bank'}</strong></p>
                <p>Account No: <strong className="font-mono text-slate-900">{customConfig.bank_account_no || '50200084920194'}</strong></p>
                <p>IFSC Code: <strong className="font-mono text-purple-700">{customConfig.bank_ifsc || 'HDFC0001248'}</strong></p>
                {customConfig.bank_upi && (
                  <p>UPI ID: <strong className="font-mono text-slate-800">{customConfig.bank_upi}</strong></p>
                )}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className={`space-y-1 text-xs text-slate-700 ${!customConfig.show_bank_details ? 'sm:col-span-2' : ''}`}>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Subtotal (Base Value):</span>
                <span className="font-mono font-bold text-slate-900">₹{fmtDec(netTotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700 font-bold">
                  <span>Savings / Discount Applied:</span>
                  <span className="font-mono">-₹{fmtDec(savings)}</span>
                </div>
              )}
              {customConfig.show_tax_breakdown !== false && (
                <>
                  {cgstVal > 0 && (
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>Central GST (CGST):</span>
                      <span className="font-mono">₹{fmtDec(cgstVal)}</span>
                    </div>
                  )}
                  {sgstVal > 0 && (
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>State GST (SGST):</span>
                      <span className="font-mono">₹{fmtDec(sgstVal)}</span>
                    </div>
                  )}
                  {igstVal > 0 && (
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>Integrated GST (IGST):</span>
                      <span className="font-mono">₹{fmtDec(igstVal)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between py-0.5 text-slate-400">
                <span>Round Off:</span>
                <span className="font-mono">{fmtDec(roundoff)}</span>
              </div>
              <div
                className="flex justify-between items-center text-white p-3 rounded-xl mt-2"
                style={{ backgroundColor: customConfig.primary_color || '#2563eb' }}
              >
                <span className="font-bold text-sm tracking-wide">TOTAL AMOUNT DUE:</span>
                <span className="font-mono text-lg font-black tracking-tight">₹{fmtDec(finalGrandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Footer */}
          {customConfig.terms_and_conditions && (
            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block uppercase tracking-wide">Terms & Conditions:</span>
              <p className="whitespace-pre-line leading-relaxed">{customConfig.terms_and_conditions}</p>
            </div>
          )}

          {customConfig.footer_greeting && (
            <div className="text-center font-bold text-xs mt-3 text-slate-700 tracking-wider uppercase">
              {customConfig.footer_greeting}
            </div>
          )}

          {/* Signatures */}
          {customConfig.show_signatures === 'dual' ? (
            <div className="pt-5 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px] text-slate-600 mt-5">
              <div className="text-center pt-8 border-t border-dotted border-slate-300">
                <p className="font-bold text-slate-800">Customer Signature / Receipt Acknowledgment</p>
              </div>
              <div className="text-center pt-8 border-t border-dotted border-slate-300">
                <p className="font-bold text-slate-800">{customConfig.signature_title || 'Authorized Signatory'}</p>
                <p className="text-[10px] text-slate-400">For {storeName}</p>
              </div>
            </div>
          ) : customConfig.show_signatures === 'stamp' ? (
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 mt-4">
              <p>Computer Generated Tax Invoice — No Physical Signature Required</p>
              <div className="border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-700 bg-slate-50">
                Verified Digitally by {storeName}
              </div>
            </div>
          ) : customConfig.show_signatures === 'single' ? (
            <div className="pt-4 border-t border-slate-200 flex justify-end text-[11px] text-slate-600 mt-4">
              <div className="text-center pt-6 border-t border-dotted border-slate-300 w-52">
                <p className="font-bold text-slate-800">{customConfig.signature_title || 'Authorized Signatory'}</p>
                <p className="text-[10px] text-slate-400">For {storeName}</p>
              </div>
            </div>
          ) : null}
            </>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* PRINT STYLESHEET (Dynamically supports 80mm Roll vs A4 Corporate)       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          /* Hide everything except receipt */
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible !important;
          }
          #thermal-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            ${(activeTheme === 'supermarket' || (activeTheme === 'custom' && (customConfig?.layout_type?.includes('thermal') || customConfig?.paper_size?.includes('thermal')))) ? `
              width: ${(customConfig?.layout_type === 'thermal_58mm' || customConfig?.paper_size === 'thermal_58mm') ? '54mm' : '76mm'} !important;
              max-width: ${(customConfig?.layout_type === 'thermal_58mm' || customConfig?.paper_size === 'thermal_58mm') ? '58mm' : '80mm'} !important;
              padding: 3mm 2mm !important;
              border: none !important;
              font-family: ${customConfig?.font_family || "'Courier New', Courier, monospace"} !important;
              font-size: 11px !important;
              line-height: 1.3 !important;
            ` : `
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              border: none !important;
            `}
          }
          @page {
            ${(activeTheme === 'supermarket' || (activeTheme === 'custom' && (customConfig?.layout_type?.includes('thermal') || customConfig?.paper_size?.includes('thermal')))) ? `
              size: ${(customConfig?.layout_type === 'thermal_58mm' || customConfig?.paper_size === 'thermal_58mm') ? '58mm auto' : '80mm auto'};
              margin: 0;
            ` : (activeTheme === 'custom' && (customConfig?.layout_type === 'a5' || customConfig?.paper_size === 'a5')) ? `
              size: A5 portrait;
              margin: 8mm;
            ` : `
              size: A4 portrait;
              margin: 10mm;
            `}
          }
        }
      `}</style>
    </div>
  );
}

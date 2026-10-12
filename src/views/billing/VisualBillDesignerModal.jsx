import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Layout,
  Type,
  FileText,
  Check,
  RotateCcw,
  RotateCw,
  Printer,
  X,
  Sparkles,
  Sliders,
  Save,
  CreditCard,
  ShoppingCart,
  Laptop,
  Armchair,
  Maximize2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  CheckCircle2,
  Move,
  Trash2,
  Copy,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Grid,
  Search,
  ArrowLeft,
  QrCode,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Settings2,
  Store,
  User,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Hash,
  Shield,
  HelpCircle,
  Wand2,
  Lock,
  Unlock,
  Columns,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  Unlink,
  Bookmark,
  FilePlus,
  Split,
  Tag,
  Scissors
} from 'lucide-react';

// ==============================================================================
// 1. DEFAULT ELEMENT DEFINITIONS & 9 PRESET TEMPLATES (SECTION-BASED)
// ==============================================================================

export const DESIGNER_TEMPLATES = {
  modern_store: {
    id: 'modern_store',
    name: 'Modern Store (Vibrant Card Style)',
    paper_size: 'a4',
    orientation: 'portrait',
    primary_color: '#7c3aed',
    accent_color: '#0f172a',
    font_family: "Outfit, Inter, sans-serif",
    bg_color: '#ffffff',
    margins: { top: 12, right: 12, bottom: 12, left: 12, linked: true },
    sections: [
      {
        id: 'sec-mod-1',
        title: 'Header Section',
        columns: [
          {
            id: 'col-mod-1-1',
            width: '65%',
            elements: [
              { id: 'el-m1', type: 'business_header_split', label: 'Store Header', logo: true, title: 'SALES RECEIPT', storeName: 'AMMUS LIFESTYLE STORE', address: 'Junction Road, Trivandrum, Kerala', phone: '9895820417', gstin: '32DPHPB3199N1ZL', visible: true }
            ]
          },
          {
            id: 'col-mod-1-2',
            width: '35%',
            elements: [
              { id: 'el-m2', type: 'invoice_meta', label: 'Invoice Meta', showBillNo: true, showDate: true, showTime: true, showCashier: true, visible: true }
            ]
          }
        ],
        padding: { top: 8, right: 12, bottom: 12, left: 12, linked: true },
        margin: { top: 0, bottom: 8 },
        bg_color: '#f8fafc',
        border_style: 'solid',
        border_width: 1,
        border_color: '#e2e8f0',
        border_radius: 12
      },
      {
        id: 'sec-mod-2',
        title: 'Customer Details',
        columns: [
          {
            id: 'col-mod-2-1',
            width: '100%',
            elements: [
              { id: 'el-m3', type: 'customer_section', label: 'Billed To Customer', showName: true, showPhone: true, showGstin: true, showAddress: true, visible: true }
            ]
          }
        ],
        padding: { top: 6, right: 8, bottom: 6, left: 8, linked: true },
        margin: { top: 0, bottom: 8 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-mod-3',
        title: 'Items Table',
        columns: [
          {
            id: 'col-mod-3-1',
            width: '100%',
            elements: [
              { id: 'el-m4', type: 'product_table', label: 'Dynamic Products Table', columns: ['sno', 'name', 'sku', 'qty', 'rate', 'discount', 'amount'], headerBg: '#7c3aed', headerColor: '#ffffff', zebra: true, visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 0, bottom: 4, left: 0, linked: true },
        margin: { top: 0, bottom: 8 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-mod-4',
        title: 'Settlement & Remittance',
        columns: [
          {
            id: 'col-mod-4-1',
            width: '45%',
            elements: [
              { id: 'el-m5', type: 'upi_qr', label: 'Instant Pay UPI QR', upiId: 'ammusstore@upi', payeeName: 'Ammus Lifestyle', size: 100, showLabel: true, visible: true },
              { id: 'el-m6', type: 'footer_terms', label: 'Return Policy', text: 'Exchange within 7 days with original invoice.', fontSize: 9, alignment: 'center', color: '#64748b', visible: true }
            ]
          },
          {
            id: 'col-mod-4-2',
            width: '55%',
            elements: [
              { id: 'el-m7', type: 'bill_totals', label: 'Bill Totals & Breakdown', showSubtotal: true, showDiscount: true, showTax: true, showRoundOff: true, showGrandTotal: true, showAmountPaid: true, showBalance: true, visible: true },
              { id: 'el-m8', type: 'signature_block', label: 'Authorized Signatory', title: 'Authorized Signatory', companyStamp: true, visible: true }
            ]
          }
        ],
        padding: { top: 8, right: 8, bottom: 8, left: 8, linked: true },
        margin: { top: 0, bottom: 8 },
        bg_color: '#f8fafc',
        border_style: 'solid',
        border_width: 1,
        border_color: '#e2e8f0',
        border_radius: 12
      },
      {
        id: 'sec-mod-5',
        title: 'Footer Greeting',
        columns: [
          {
            id: 'col-mod-5-1',
            width: '100%',
            elements: [
              { id: 'el-m9', type: 'footer_greeting', label: 'Thank You Greeting', text: 'Thank you for shopping with us! Visit again soon.', fontSize: 12, fontWeight: 'bold', alignment: 'center', color: '#7c3aed', visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 4, bottom: 4, left: 4, linked: true },
        margin: { top: 4, bottom: 0 },
        bg_color: 'transparent',
        border_style: 'none'
      }
    ]
  },

  gst_professional: {
    id: 'gst_professional',
    name: 'GST Professional (A4 Corporate Tax)',
    paper_size: 'a4',
    orientation: 'portrait',
    primary_color: '#2563eb',
    accent_color: '#1e293b',
    font_family: "Inter, -apple-system, sans-serif",
    bg_color: '#ffffff',
    margins: { top: 12, right: 12, bottom: 12, left: 12, linked: true },
    sections: [
      {
        id: 'sec-gst-1',
        title: 'Header Split',
        columns: [
          {
            id: 'col-gst-1-1',
            width: '100%',
            elements: [
              { id: 'el-g1', type: 'business_header_split', label: 'Corporate Split Header', logo: true, title: 'TAX INVOICE', storeName: 'AURUM TECHNOLOGIES PVT LTD', address: 'Cyber City Tech Park, Phase II, Trivandrum - 695581', gstin: '32DPHPB3199N1ZL', phone: '9895820417', email: 'billing@aurumtech.com', visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 4, bottom: 8, left: 4, linked: true },
        margin: { top: 0, bottom: 6 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-gst-2',
        title: 'Client & Attributes',
        columns: [
          {
            id: 'col-gst-2-1',
            width: '55%',
            elements: [
              { id: 'el-g2', type: 'customer_section', label: 'Billed To Client', showName: true, showPhone: true, showEmail: true, showAddress: true, showGstin: true, visible: true }
            ]
          },
          {
            id: 'col-gst-2-2',
            width: '45%',
            elements: [
              { id: 'el-g3', type: 'invoice_meta', label: 'Invoice Meta', showBillNo: true, showDate: true, showTime: true, showCashier: true, visible: true },
              { id: 'el-g4', type: 'badge_alert', label: 'Tax Supply Badge', text: 'Intra-State Supply (CGST + SGST) • Rule 46 CGST Rules', bg: '#eff6ff', color: '#1e40af', fontSize: 10, visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 0, bottom: 4, left: 0, linked: true },
        margin: { top: 0, bottom: 8 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-gst-3',
        title: 'GST Line Items Table',
        columns: [
          {
            id: 'col-gst-3-1',
            width: '100%',
            elements: [
              { id: 'el-g5', type: 'product_table', label: 'Comprehensive GST Table', columns: ['sno', 'name', 'hsn', 'qty', 'rate', 'discount', 'gst_rate', 'amount'], headerBg: '#2563eb', headerColor: '#ffffff', zebra: true, visible: true }
            ]
          }
        ],
        padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        margin: { top: 0, bottom: 8 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-gst-4',
        title: 'Tax Breakdown & Bank Wire',
        columns: [
          {
            id: 'col-gst-4-1',
            width: '50%',
            elements: [
              { id: 'el-g6', type: 'tax_breakdown_summary', label: 'GST Tax Slabs Breakdown', showCgst: true, showSgst: true, showIgst: true, visible: true },
              { id: 'el-g7', type: 'bank_remittance', label: 'Bank Wire Transfer Details', bankName: 'HDFC Bank Ltd, Techno Park Branch', accountNo: '50200084920194', ifsc: 'HDFC0001248', upiId: 'aurumworks@okhdfcbank', visible: true }
            ]
          },
          {
            id: 'col-gst-4-2',
            width: '50%',
            elements: [
              { id: 'el-g8', type: 'bill_totals', label: 'Grand Total & Remittance', showSubtotal: true, showDiscount: true, showTax: true, showRoundOff: true, showGrandTotal: true, showAmountPaid: true, showBalance: true, visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 0, bottom: 4, left: 0, linked: true },
        margin: { top: 0, bottom: 8 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-gst-5',
        title: 'Signatures & Terms',
        columns: [
          {
            id: 'col-gst-5-1',
            width: '55%',
            elements: [
              { id: 'el-g9', type: 'footer_terms', label: 'Commercial Terms', text: '1. Payment due within 15 days of invoice date.\n2. Interest @ 18% p.a. applicable for delayed payments.\n3. All disputes subject to Trivandrum jurisdiction.', fontSize: 9, visible: true }
            ]
          },
          {
            id: 'col-gst-5-2',
            width: '45%',
            elements: [
              { id: 'el-g10', type: 'signature_block', label: 'Authorized Signatory & Stamp', title: 'Authorized Signatory', companyStamp: true, visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 0, bottom: 4, left: 0, linked: true },
        margin: { top: 0, bottom: 0 },
        bg_color: 'transparent',
        border_style: 'none'
      }
    ]
  },

  thermal_pos: {
    id: 'thermal_pos',
    name: 'Thermal POS (80mm Supermarket Roll)',
    paper_size: 'thermal_80mm',
    orientation: 'portrait',
    primary_color: '#000000',
    accent_color: '#000000',
    font_family: "'Courier New', Courier, monospace",
    bg_color: '#ffffff',
    margins: { top: 6, right: 6, bottom: 6, left: 6, linked: true },
    sections: [
      {
        id: 'sec-th-1',
        title: 'Store Header',
        columns: [
          {
            id: 'col-th-1-1',
            width: '100%',
            elements: [
              { id: 'el-t1', type: 'business_name', label: 'Store Name', text: 'MARRYBOY SUPERMARKET', fontSize: 16, fontWeight: 'bold', alignment: 'center', visible: true },
              { id: 'el-t2', type: 'business_subtitle', label: 'Subtitle', text: 'Department & Grocery Store', fontSize: 11, alignment: 'center', visible: true },
              { id: 'el-t3', type: 'business_address', label: 'Address', text: 'JUNCTION ROAD, NEAR BUS STAND, TRIVANDRUM', fontSize: 10, alignment: 'center', visible: true },
              { id: 'el-t4', type: 'business_phone', label: 'Phone', text: 'Phone: 9895820417, 0471-224488', fontSize: 10, alignment: 'center', visible: true },
              { id: 'el-t5', type: 'business_gstin', label: 'GSTIN', text: 'GSTIN: 32DPHPB3199N1ZL', fontSize: 10, alignment: 'center', visible: true },
              { id: 'el-t6', type: 'divider', style: 'dashed', color: '#000000', visible: true }
            ]
          }
        ],
        padding: { top: 2, right: 2, bottom: 2, left: 2, linked: true },
        margin: { top: 0, bottom: 4 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-th-2',
        title: 'Receipt Metadata',
        columns: [
          {
            id: 'col-th-2-1',
            width: '100%',
            elements: [
              { id: 'el-t7', type: 'invoice_meta', label: 'Receipt Metadata', showBillNo: true, showDate: true, showTime: true, showCashier: true, fontSize: 10, visible: true },
              { id: 'el-t8', type: 'divider', style: 'dashed', color: '#000000', visible: true }
            ]
          }
        ],
        padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        margin: { top: 0, bottom: 4 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-th-3',
        title: 'Receipt Items',
        columns: [
          {
            id: 'col-th-3-1',
            width: '100%',
            elements: [
              { id: 'el-t9', type: 'product_table', label: 'Receipt Items Table', columns: ['sno', 'name', 'qty', 'rate', 'amount'], headerBg: '#ffffff', headerColor: '#000000', visible: true },
              { id: 'el-t10', type: 'divider', style: 'dashed', color: '#000000', visible: true }
            ]
          }
        ],
        padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        margin: { top: 0, bottom: 4 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-th-4',
        title: 'Totals & Savings',
        columns: [
          {
            id: 'col-th-4-1',
            width: '100%',
            elements: [
              { id: 'el-t11', type: 'bill_totals', label: 'Totals Breakdown', showSubtotal: true, showDiscount: true, showTax: true, showRoundOff: true, showGrandTotal: true, visible: true },
              { id: 'el-t12', type: 'savings_badge', label: 'Customer Savings', labelText: 'You Have Saved Rs.', visible: true },
              { id: 'el-t13', type: 'divider', style: 'dashed', color: '#000000', visible: true }
            ]
          }
        ],
        padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        margin: { top: 0, bottom: 4 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-th-5',
        title: 'UPI & Footer',
        columns: [
          {
            id: 'col-th-5-1',
            width: '100%',
            elements: [
              { id: 'el-t14', type: 'upi_qr', label: 'Instant Pay UPI QR', upiId: 'marryboy@upi', payeeName: 'Marryboy Supermarket', size: 90, showLabel: true, visible: true },
              { id: 'el-t15', type: 'footer_greeting', label: 'Footer Greeting', text: '**** Thank You Visit Again ****', fontSize: 11, fontWeight: 'bold', alignment: 'center', visible: true },
              { id: 'el-t16', type: 'footer_terms', label: 'Return Policy', text: 'Exchange within 7 days with original bill.', fontSize: 9, alignment: 'center', visible: true }
            ]
          }
        ],
        padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        margin: { top: 0, bottom: 0 },
        bg_color: 'transparent',
        border_style: 'none'
      }
    ]
  },

  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy / Healthcare',
    paper_size: 'a4',
    orientation: 'portrait',
    primary_color: '#059669',
    accent_color: '#064e3b',
    font_family: "Inter, sans-serif",
    bg_color: '#ffffff',
    margins: { top: 10, right: 10, bottom: 10, left: 10, linked: true },
    sections: [
      {
        id: 'sec-ph-1',
        title: 'Pharmacy Header',
        columns: [
          {
            id: 'col-ph-1-1',
            width: '100%',
            elements: [
              { id: 'el-p1', type: 'business_header_split', label: 'Pharmacy Header', logo: false, title: 'RETAIL PHARMACY BILL', storeName: 'SANJEEVANI HEALTHCARE PHARMACY', address: 'Medical College Road, Trivandrum. D.L. No: KL-TVM-29381', gstin: '32DPHPB3199N1ZL', phone: '0471-2449191', visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 4, bottom: 4, left: 4, linked: true },
        margin: { top: 0, bottom: 6 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-ph-2',
        title: 'Patient & Doctor Info',
        columns: [
          {
            id: 'col-ph-2-1',
            width: '50%',
            elements: [
              { id: 'el-p2', type: 'customer_section', label: 'Patient Information', showName: true, showPhone: true, visible: true }
            ]
          },
          {
            id: 'col-ph-2-2',
            width: '50%',
            elements: [
              { id: 'el-p3', type: 'invoice_meta', label: 'Doctor & Dispense Date', showBillNo: true, showDate: true, showCashier: true, visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 0, bottom: 4, left: 0, linked: true },
        margin: { top: 0, bottom: 6 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-ph-3',
        title: 'Medicines Table',
        columns: [
          {
            id: 'col-ph-3-1',
            width: '100%',
            elements: [
              { id: 'el-p4', type: 'product_table', label: 'Medicine Table with Batch & Expiry', columns: ['sno', 'name', 'batch', 'expiry', 'qty', 'mrp', 'rate', 'gst_rate', 'amount'], headerBg: '#059669', headerColor: '#ffffff', visible: true }
            ]
          }
        ],
        padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        margin: { top: 0, bottom: 6 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-ph-4',
        title: 'Totals & Pharmacist Sign',
        columns: [
          {
            id: 'col-ph-4-1',
            width: '50%',
            elements: [
              { id: 'el-p5', type: 'signature_block', label: 'Registered Pharmacist Sign', title: 'Registered Pharmacist', companyStamp: false, visible: true },
              { id: 'el-p6', type: 'footer_terms', label: 'Drug Return Policy', text: 'Schedule H & H1 drugs require doctor prescription. Store below 25°C.', fontSize: 9, visible: true }
            ]
          },
          {
            id: 'col-ph-4-2',
            width: '50%',
            elements: [
              { id: 'el-p7', type: 'bill_totals', label: 'Bill Summary', showSubtotal: true, showDiscount: true, showTax: true, showRoundOff: true, showGrandTotal: true, visible: true }
            ]
          }
        ],
        padding: { top: 4, right: 0, bottom: 4, left: 0, linked: true },
        margin: { top: 0, bottom: 0 },
        bg_color: 'transparent',
        border_style: 'none'
      }
    ]
  },

  thermal_58mm: {
    id: 'thermal_58mm',
    name: 'Compact 58mm Thermal Mini Roll',
    paper_size: 'thermal_58mm',
    orientation: 'portrait',
    primary_color: '#000000',
    accent_color: '#000000',
    font_family: "'Courier New', Courier, monospace",
    bg_color: '#ffffff',
    margins: { top: 4, right: 4, bottom: 4, left: 4, linked: true },
    sections: [
      {
        id: 'sec-58-1',
        title: 'Mini Header',
        columns: [
          {
            id: 'col-58-1-1',
            width: '100%',
            elements: [
              { id: 'el-58-1', type: 'business_name', label: 'Store Name', text: 'EXPRESS MART', fontSize: 15, fontWeight: 'bold', alignment: 'center', visible: true },
              { id: 'el-58-2', type: 'business_phone', label: 'Phone', text: 'Ph: 9895820417', fontSize: 9, alignment: 'center', visible: true },
              { id: 'el-58-3', type: 'divider', style: 'dashed', color: '#000000', visible: true },
              { id: 'el-58-4', type: 'invoice_meta', label: 'Invoice Meta', showBillNo: true, showDate: true, showTime: false, showCashier: false, fontSize: 9, visible: true },
              { id: 'el-58-5', type: 'divider', style: 'dashed', color: '#000000', visible: true }
            ]
          }
        ],
        padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        margin: { top: 0, bottom: 4 },
        bg_color: 'transparent',
        border_style: 'none'
      },
      {
        id: 'sec-58-2',
        title: 'Items & Totals',
        columns: [
          {
            id: 'col-58-2-1',
            width: '100%',
            elements: [
              { id: 'el-58-6', type: 'product_table', label: 'Mini Table', columns: ['name', 'qty', 'rate', 'amount'], headerBg: '#ffffff', headerColor: '#000000', visible: true },
              { id: 'el-58-7', type: 'divider', style: 'dashed', color: '#000000', visible: true },
              { id: 'el-58-8', type: 'bill_totals', label: 'Grand Total', showSubtotal: true, showDiscount: false, showTax: false, showGrandTotal: true, visible: true },
              { id: 'el-58-9', type: 'footer_greeting', label: 'Greeting', text: '** THANK YOU **', fontSize: 10, alignment: 'center', fontWeight: 'bold', visible: true }
            ]
          }
        ],
        padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        margin: { top: 0, bottom: 0 },
        bg_color: 'transparent',
        border_style: 'none'
      }
    ]
  }
};

// Available Element Palette for the Left Toolbar
export const TOOLBAR_CATEGORIES = [
  {
    category: 'BASIC',
    items: [
      { type: 'custom_text', label: 'Custom Text', icon: Type, defaultProps: { text: 'Special Offer: 10% off on your next visit!', fontSize: 11, alignment: 'center', fontWeight: 'normal', color: '#334155' } },
      { type: 'divider', label: 'Divider Line', icon: Minus, defaultProps: { style: 'dashed', color: '#cbd5e1' } },
      { type: 'spacer', label: 'Vertical Spacer', icon: Layout, defaultProps: { height: 16 } },
      { type: 'badge_alert', label: 'Notice / Badge Box', icon: Square, defaultProps: { text: 'Official Tax Invoice under Section 31 of CGST Act', bg: '#f1f5f9', color: '#475569', fontSize: 10 } },
      { type: 'page_break', label: 'Page Break', icon: Scissors, defaultProps: { label: '--- Page Break ---' } }
    ]
  },
  {
    category: 'BUSINESS INFO',
    items: [
      { type: 'business_header_split', label: 'Full Business Header', icon: Store, defaultProps: { logo: true, title: 'TAX INVOICE', storeName: 'STORE NAME', address: 'Main Street, City Center', phone: '98470 12345', gstin: '32DPHPB3199N1ZL' } },
      { type: 'business_name', label: 'Store Name (Text)', icon: Store, defaultProps: { text: 'STORE NAME', fontSize: 18, fontWeight: 'bold', alignment: 'center', color: '#0f172a' } },
      { type: 'business_subtitle', label: 'Tagline / Subtitle', icon: Type, defaultProps: { text: 'Grocery & Department Store', fontSize: 11, alignment: 'center', color: '#64748b' } },
      { type: 'business_address', label: 'Store Address', icon: MapPin, defaultProps: { text: 'Main Street, City Center', fontSize: 10, alignment: 'center', color: '#475569' } },
      { type: 'business_phone', label: 'Contact Phone', icon: Phone, defaultProps: { text: 'Ph: +91 98470 12345', fontSize: 10, alignment: 'center', color: '#475569' } },
      { type: 'business_gstin', label: 'GSTIN Number', icon: Hash, defaultProps: { text: 'GSTIN: 32DPHPB3199N1ZL', fontSize: 10, alignment: 'center', color: '#0f172a', fontWeight: 'bold' } }
    ]
  },
  {
    category: 'INVOICE INFO',
    items: [
      { type: 'invoice_meta', label: 'Invoice Meta Block', icon: FileText, defaultProps: { showBillNo: true, showDate: true, showTime: true, showCashier: true, fontSize: 10 } }
    ]
  },
  {
    category: 'CUSTOMER INFO',
    items: [
      { type: 'customer_section', label: 'Customer Card', icon: User, defaultProps: { showName: true, showPhone: true, showEmail: false, showAddress: false, showGstin: true } }
    ]
  },
  {
    category: 'ITEMS / TABLE',
    items: [
      { type: 'product_table', label: 'Dynamic Products Table', icon: ShoppingCart, defaultProps: { columns: ['sno', 'name', 'qty', 'rate', 'amount'], headerBg: '#2563eb', headerColor: '#ffffff', zebra: true } }
    ]
  },
  {
    category: 'TOTALS & PAYMENT',
    items: [
      { type: 'bill_totals', label: 'Bill Totals & Breakdown', icon: DollarSign, defaultProps: { showSubtotal: true, showDiscount: true, showTax: true, showRoundOff: true, showGrandTotal: true, showAmountPaid: true, showBalance: true } },
      { type: 'savings_badge', label: 'Customer Savings Badge', icon: Sparkles, defaultProps: { labelText: 'You Have Saved Rs.' } },
      { type: 'upi_qr', label: 'Dynamic UPI QR Code', icon: QrCode, defaultProps: { upiId: 'store@upi', payeeName: 'Store Name', size: 100, showLabel: true } },
      { type: 'bank_remittance', label: 'Bank Wire Transfer Info', icon: CreditCard, defaultProps: { bankName: 'State Bank of India', accountNo: '39482910482', ifsc: 'SBIN0004829', upiId: 'store@upi' } }
    ]
  },
  {
    category: 'SIGNATURE & FOOTER',
    items: [
      { type: 'signature_block', label: 'Authorized Signatory', icon: Shield, defaultProps: { title: 'Authorized Signatory', companyStamp: true } },
      { type: 'footer_greeting', label: 'Thank You Greeting', icon: Sparkles, defaultProps: { text: '**** Thank You Visit Again ****', fontSize: 11, fontWeight: 'bold', alignment: 'center' } },
      { type: 'footer_terms', label: 'Terms & Conditions', icon: HelpCircle, defaultProps: { text: 'Exchange within 7 days with original bill. Thank you!', fontSize: 9, alignment: 'center', color: '#64748b' } }
    ]
  }
];

// Preset Section Layouts
export const SECTION_PRESETS = [
  { id: '1-col', name: '1 Column (Full Width)', columns: [{ width: '100%' }] },
  { id: '2-col-50', name: '2 Columns (50% | 50%)', columns: [{ width: '50%' }, { width: '50%' }] },
  { id: '2-col-30-70', name: '2 Columns (30% | 70%)', columns: [{ width: '30%' }, { width: '70%' }] },
  { id: '2-col-70-30', name: '2 Columns (70% | 30%)', columns: [{ width: '70%' }, { width: '30%' }] },
  { id: '3-col', name: '3 Columns (33% | 33% | 33%)', columns: [{ width: '33.33%' }, { width: '33.33%' }, { width: '33.33%' }] },
  { id: '4-col', name: '4 Columns (25% | 25% | 25% | 25%)', columns: [{ width: '25%' }, { width: '25%' }, { width: '25%' }, { width: '25%' }] },
  { id: 'header-split', name: 'Header Section (Logo Left | Meta Right)', columns: [{ width: '60%' }, { width: '40%' }], isHeader: true },
  { id: 'footer-split', name: 'Footer Section (Terms Left | Sign Right)', columns: [{ width: '55%' }, { width: '45%' }], isFooter: true }
];

// Sample Test Data for Realistic Simulation
const REALISTIC_SAMPLE_DATA = {
  invoiceNumber: 'SH/25-27/0000084',
  date: '07-Oct-2026',
  time: '10:28 AM',
  cashier: 'Admin Cashier',
  paymentMethod: 'UPI / GooglePay',
  customer: {
    name: 'Rahul Nair',
    phone: '+91 98470 12345',
    email: 'rahul.nair@example.com',
    address: 'Flat 4B, Emerald Heights, Vazhuthacaud, Trivandrum',
    gstin: '32AABCA8912P1ZM'
  },
  items: [
    { sno: 1, name: 'Aashirvaad Superior MP Atta 5kg', sku: 'ATT-005', hsn: '1101', batch: 'BT-902', expiry: 'Dec-2026', qty: 1, unit: 'Bag', mrp: 275.0, rate: 245.0, discount: 0, gst_rate: 5, amount: 245.0 },
    { sno: 2, name: 'Fortune Sunlite Refined Sunflower Oil 1L', sku: 'OIL-100', hsn: '1512', batch: 'BT-481', expiry: 'Jan-2027', qty: 2, unit: 'Pouch', mrp: 155.0, rate: 135.0, discount: 0, gst_rate: 5, amount: 270.0 },
    { sno: 3, name: 'Tata Tea Gold Leaf Pouch 500g', sku: 'TEA-500', hsn: '0902', batch: 'BT-112', expiry: 'Mar-2027', qty: 1, unit: 'Pkt', mrp: 340.0, rate: 310.0, discount: 0, gst_rate: 5, amount: 310.0 }
  ],
  totals: {
    subtotal: 825.0,
    mrpTotal: 925.0,
    discount: 0,
    taxable: 785.71,
    cgst: 19.64,
    sgst: 19.64,
    igst: 0,
    roundOff: 0.0,
    grandTotal: 825.0,
    paid: 825.0,
    balance: 0.0,
    savings: 100.0
  }
};

// Normalizer to convert flat elements into sections and guarantee two-way compatibility
function normalizeConfig(cfg) {
  if (!cfg) return { ...DESIGNER_TEMPLATES.modern_store };

  let sections = cfg.sections;
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    const rawElements = cfg.elements || cfg.builder_elements || [];
    if (rawElements.length > 0) {
      sections = [
        {
          id: 'sec-auto-1',
          title: 'Document Body',
          columns: [
            {
              id: 'col-auto-1',
              width: '100%',
              elements: [...rawElements]
            }
          ],
          padding: { top: 8, right: 8, bottom: 8, left: 8, linked: true },
          margin: { top: 0, bottom: 8 },
          bg_color: 'transparent',
          border_style: 'none'
        }
      ];
    } else {
      sections = [...DESIGNER_TEMPLATES.modern_store.sections];
    }
  }

  // Collect flat elements for two-way compatibility
  const allElements = [];
  sections.forEach(sec => {
    (sec.columns || []).forEach(col => {
      (col.elements || []).forEach(el => allElements.push(el));
    });
  });

  return {
    ...cfg,
    paper_size: cfg.paper_size || 'a4',
    orientation: cfg.orientation || 'portrait',
    font_family: cfg.font_family || 'Inter, -apple-system, sans-serif',
    bg_color: cfg.bg_color || '#ffffff',
    primary_color: cfg.primary_color || '#7c3aed',
    accent_color: cfg.accent_color || '#0f172a',
    margins: cfg.margins || { top: 12, right: 12, bottom: 12, left: 12, linked: true },
    sections,
    elements: allElements,
    builder_elements: allElements
  };
}

// ==============================================================================
// 2. MAIN VISUAL BILL DESIGNER COMPONENT
// ==============================================================================

export default function VisualBillDesignerModal({
  isOpen,
  onClose,
  initialSettings,
  onSave
}) {
  if (!isOpen) return null;

  // Initialize Config
  const getInitial = () => {
    if (initialSettings?.custom_theme_config) {
      return normalizeConfig(initialSettings.custom_theme_config);
    }
    return normalizeConfig(DESIGNER_TEMPLATES.modern_store);
  };

  const [currentConfig, setCurrentConfig] = useState(getInitial);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeTab, setActiveTab] = useState('elements'); // 'elements' | 'sections' | 'design' | 'layers' | 'templates'
  const [activeViewMode, setActiveViewMode] = useState('design'); // 'design' | 'preview' | 'test'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(10); // 5, 10, 20
  const [showRulers, setShowRulers] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveAsModalOpen, setSaveAsModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [contextMenu, setContextMenu] = useState(null); // { x, y, elementId, sectionId }
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const [targetInsertSectionIdx, setTargetInsertSectionIdx] = useState(null);

  // Drag-and-drop state
  const [dragOverColumn, setDragOverColumn] = useState(null); // { sectionId, colId }
  const [dragOverSection, setDragOverSection] = useState(null); // sectionId

  // Undo / Redo History
  const [history, setHistory] = useState([getInitial()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushState = (newCfg) => {
    const normalized = normalizeConfig(newCfg);
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(JSON.parse(JSON.stringify(normalized)));
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setCurrentConfig(normalized);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentConfig(JSON.parse(JSON.stringify(history[newIdx])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentConfig(JSON.parse(JSON.stringify(history[newIdx])));
    }
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V, Ctrl+D, Delete)
  const copiedElementRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElementId) {
        e.preventDefault();
        const found = findElementById(selectedElementId);
        if (found) copiedElementRef.current = found.element;
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedElementRef.current) {
        e.preventDefault();
        handlePasteElement();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElementId) {
        e.preventDefault();
        handleDuplicateElement(selectedElementId);
      } else if (e.key === 'Delete' && (selectedElementId || selectedSectionId)) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          if (selectedElementId) handleDeleteElement(selectedElementId);
          else if (selectedSectionId) handleDeleteSection(selectedSectionId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedElementId, selectedSectionId]);

  // Click outside context menu to close
  useEffect(() => {
    const closeContext = () => setContextMenu(null);
    window.addEventListener('click', closeContext);
    return () => window.removeEventListener('click', closeContext);
  }, []);

  // Helper: Find element and its location
  const findElementById = (id) => {
    for (const sec of currentConfig.sections) {
      for (const col of sec.columns) {
        const el = col.elements.find(e => e.id === id);
        if (el) return { section: sec, column: col, element: el };
      }
    }
    return null;
  };

  // ── SECTION OPERATIONS ──
  const handleAddSectionPreset = (preset, atIndex = null) => {
    const newSecId = `sec-${Date.now()}`;
    const newColumns = preset.columns.map((c, i) => ({
      id: `col-${Date.now()}-${i}`,
      width: c.width,
      elements: []
    }));

    // If preset is header or footer, insert appropriate starter elements
    if (preset.isHeader) {
      newColumns[0].elements.push({
        id: `el-${Date.now()}-1`,
        type: 'business_header_split',
        label: 'Brand Header',
        logo: true,
        title: 'TAX INVOICE',
        storeName: initialSettings?.store_name || 'STORE NAME',
        address: initialSettings?.store_address || 'City Center, Main Road',
        phone: initialSettings?.store_phone || '98470 12345',
        gstin: initialSettings?.gstin || '32DPHPB3199N1ZL',
        visible: true
      });
      newColumns[1].elements.push({
        id: `el-${Date.now()}-2`,
        type: 'invoice_meta',
        label: 'Invoice Metadata',
        showBillNo: true,
        showDate: true,
        showTime: true,
        showCashier: true,
        visible: true
      });
    } else if (preset.isFooter) {
      newColumns[0].elements.push({
        id: `el-${Date.now()}-1`,
        type: 'footer_terms',
        label: 'Terms & Return Policy',
        text: 'Goods once sold can be exchanged within 7 days with original invoice.',
        fontSize: 9,
        alignment: 'center',
        visible: true
      });
      newColumns[1].elements.push({
        id: `el-${Date.now()}-2`,
        type: 'signature_block',
        label: 'Authorized Signatory',
        title: 'Authorized Signatory',
        companyStamp: true,
        visible: true
      });
    }

    const newSec = {
      id: newSecId,
      title: preset.name,
      columns: newColumns,
      padding: { top: 8, right: 8, bottom: 8, left: 8, linked: true },
      margin: { top: 0, bottom: 8 },
      bg_color: 'transparent',
      border_style: 'none',
      visible: true
    };

    const newSections = [...currentConfig.sections];
    if (atIndex !== null && atIndex >= 0) {
      newSections.splice(atIndex, 0, newSec);
    } else {
      newSections.push(newSec);
    }

    pushState({ ...currentConfig, sections: newSections });
    setSelectedSectionId(newSec.id);
    setSelectedElementId(null);
    setAddSectionModalOpen(false);
  };

  const handleDuplicateSection = (secId) => {
    const sec = currentConfig.sections.find(s => s.id === secId);
    if (!sec) return;
    const duplicated = JSON.parse(JSON.stringify(sec));
    duplicated.id = `sec-${Date.now()}`;
    duplicated.title = `${sec.title} (Copy)`;
    duplicated.columns.forEach((col, i) => {
      col.id = `col-${Date.now()}-${i}`;
      col.elements.forEach((el, j) => {
        el.id = `el-${Date.now()}-${i}-${j}`;
      });
    });

    const idx = currentConfig.sections.findIndex(s => s.id === secId);
    const newSections = [...currentConfig.sections];
    newSections.splice(idx + 1, 0, duplicated);

    pushState({ ...currentConfig, sections: newSections });
    setSelectedSectionId(duplicated.id);
  };

  const handleDeleteSection = (secId) => {
    const newSections = currentConfig.sections.filter(s => s.id !== secId);
    pushState({ ...currentConfig, sections: newSections });
    if (selectedSectionId === secId) setSelectedSectionId(null);
  };

  const handleMoveSection = (secId, direction) => {
    const idx = currentConfig.sections.findIndex(s => s.id === secId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentConfig.sections.length) return;

    const newSections = [...currentConfig.sections];
    const temp = newSections[idx];
    newSections[idx] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    pushState({ ...currentConfig, sections: newSections });
  };

  const updateSectionProp = (secId, key, val) => {
    const newSections = currentConfig.sections.map(s => {
      if (s.id === secId) {
        return { ...s, [key]: val };
      }
      return s;
    });
    pushState({ ...currentConfig, sections: newSections });
  };

  const updateSectionPadding = (secId, side, val) => {
    const newSections = currentConfig.sections.map(s => {
      if (s.id === secId) {
        const curPad = s.padding || { top: 8, right: 8, bottom: 8, left: 8, linked: true };
        if (curPad.linked) {
          return { ...s, padding: { top: val, right: val, bottom: val, left: val, linked: true } };
        }
        return { ...s, padding: { ...curPad, [side]: val } };
      }
      return s;
    });
    pushState({ ...currentConfig, sections: newSections });
  };

  // ── ELEMENT OPERATIONS ──
  const handleAddElementToColumn = (item, targetSecId, targetColId) => {
    const newEl = {
      id: `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: item.type,
      label: item.label,
      visible: true,
      ...item.defaultProps
    };

    const newSections = currentConfig.sections.map(sec => {
      if (sec.id === targetSecId) {
        const newCols = sec.columns.map(col => {
          if (col.id === targetColId) {
            return { ...col, elements: [...col.elements, newEl] };
          }
          return col;
        });
        return { ...sec, columns: newCols };
      }
      return sec;
    });

    pushState({ ...currentConfig, sections: newSections });
    setSelectedElementId(newEl.id);
    setSelectedSectionId(null);
  };

  const handleDuplicateElement = (elId) => {
    const loc = findElementById(elId);
    if (!loc) return;
    const dup = {
      ...JSON.parse(JSON.stringify(loc.element)),
      id: `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: `${loc.element.label || loc.element.type} (Copy)`
    };

    const newSections = currentConfig.sections.map(sec => {
      if (sec.id === loc.section.id) {
        const newCols = sec.columns.map(col => {
          if (col.id === loc.column.id) {
            const idx = col.elements.findIndex(e => e.id === elId);
            const newElems = [...col.elements];
            newElems.splice(idx + 1, 0, dup);
            return { ...col, elements: newElems };
          }
          return col;
        });
        return { ...sec, columns: newCols };
      }
      return sec;
    });

    pushState({ ...currentConfig, sections: newSections });
    setSelectedElementId(dup.id);
  };

  const handlePasteElement = () => {
    if (!copiedElementRef.current) return;
    const toPaste = {
      ...JSON.parse(JSON.stringify(copiedElementRef.current)),
      id: `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: `${copiedElementRef.current.label || copiedElementRef.current.type} (Pasted)`
    };

    // If an element is selected, paste after it; else paste in first column of first section
    let targetSecId = currentConfig.sections[0]?.id;
    let targetColId = currentConfig.sections[0]?.columns[0]?.id;

    if (selectedElementId) {
      const loc = findElementById(selectedElementId);
      if (loc) {
        targetSecId = loc.section.id;
        targetColId = loc.column.id;
      }
    }

    if (!targetSecId || !targetColId) return;

    const newSections = currentConfig.sections.map(sec => {
      if (sec.id === targetSecId) {
        const newCols = sec.columns.map(col => {
          if (col.id === targetColId) {
            return { ...col, elements: [...col.elements, toPaste] };
          }
          return col;
        });
        return { ...sec, columns: newCols };
      }
      return sec;
    });

    pushState({ ...currentConfig, sections: newSections });
    setSelectedElementId(toPaste.id);
  };

  const handleDeleteElement = (elId) => {
    const newSections = currentConfig.sections.map(sec => {
      const newCols = sec.columns.map(col => {
        return { ...col, elements: col.elements.filter(e => e.id !== elId) };
      });
      return { ...sec, columns: newCols };
    });

    pushState({ ...currentConfig, sections: newSections });
    if (selectedElementId === elId) setSelectedElementId(null);
  };

  const updateElementProp = (elId, key, val) => {
    const newSections = currentConfig.sections.map(sec => {
      const newCols = sec.columns.map(col => {
        const newElems = col.elements.map(el => {
          if (el.id === elId) {
            return { ...el, [key]: val };
          }
          return el;
        });
        return { ...col, elements: newElems };
      });
      return { ...sec, columns: newCols };
    });

    pushState({ ...currentConfig, sections: newSections });
  };

  // Move element within or between columns
  const handleMoveElement = (elId, direction) => {
    const loc = findElementById(elId);
    if (!loc) return;
    const { section, column } = loc;
    const idx = column.elements.findIndex(e => e.id === elId);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= column.elements.length) return;

    const newSections = currentConfig.sections.map(s => {
      if (s.id === section.id) {
        const newCols = s.columns.map(c => {
          if (c.id === column.id) {
            const elems = [...c.elements];
            const temp = elems[idx];
            elems[idx] = elems[targetIdx];
            elems[targetIdx] = temp;
            return { ...c, elements: elems };
          }
          return c;
        });
        return { ...s, columns: newCols };
      }
      return s;
    });

    pushState({ ...currentConfig, sections: newSections });
  };

  // ── DRAG AND DROP HANDLERS (HTML5 DnD) ──
  const handleDragStartElementPalette = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'NEW_ELEMENT', item }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartSectionPalette = (e, preset) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'NEW_SECTION', preset }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartCanvasElement = (e, elId, secId, colId) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'MOVE_ELEMENT',
      elementId: elId,
      fromSectionId: secId,
      fromColId: colId
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStartCanvasSection = (e, secId) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'MOVE_SECTION',
      sectionId: secId
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnColumn = (e, secId, colId, dropIdx = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch (err) { return; }

    if (data.type === 'NEW_ELEMENT') {
      const newEl = {
        id: `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: data.item.type,
        label: data.item.label,
        visible: true,
        ...data.item.defaultProps
      };

      const newSections = currentConfig.sections.map(sec => {
        if (sec.id === secId) {
          const newCols = sec.columns.map(col => {
            if (col.id === colId) {
              const newElems = [...col.elements];
              if (dropIdx !== null && dropIdx >= 0) {
                newElems.splice(dropIdx, 0, newEl);
              } else {
                newElems.push(newEl);
              }
              return { ...col, elements: newElems };
            }
            return col;
          });
          return { ...sec, columns: newCols };
        }
        return sec;
      });

      pushState({ ...currentConfig, sections: newSections });
      setSelectedElementId(newEl.id);
      setSelectedSectionId(null);
    } else if (data.type === 'MOVE_ELEMENT') {
      const loc = findElementById(data.elementId);
      if (!loc) return;
      const elementToMove = { ...loc.element };

      // Remove from old column
      const cleanedSections = currentConfig.sections.map(s => {
        if (s.id === data.fromSectionId) {
          const newCols = s.columns.map(c => {
            if (c.id === data.fromColId) {
              return { ...c, elements: c.elements.filter(e => e.id !== data.elementId) };
            }
            return c;
          });
          return { ...s, columns: newCols };
        }
        return s;
      });

      // Insert into new column
      const finalSections = cleanedSections.map(s => {
        if (s.id === secId) {
          const newCols = s.columns.map(c => {
            if (c.id === colId) {
              const newElems = [...c.elements];
              if (dropIdx !== null && dropIdx >= 0) {
                newElems.splice(dropIdx, 0, elementToMove);
              } else {
                newElems.push(elementToMove);
              }
              return { ...c, elements: newElems };
            }
            return c;
          });
          return { ...s, columns: newCols };
        }
        return s;
      });

      pushState({ ...currentConfig, sections: finalSections });
      setSelectedElementId(data.elementId);
    }
  };

  const handleDropOnSectionReorder = (e, targetSecId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(null);

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch (err) { return; }

    if (data.type === 'MOVE_SECTION' && data.sectionId !== targetSecId) {
      const fromIdx = currentConfig.sections.findIndex(s => s.id === data.sectionId);
      const toIdx = currentConfig.sections.findIndex(s => s.id === targetSecId);
      if (fromIdx === -1 || toIdx === -1) return;

      const newSections = [...currentConfig.sections];
      const [movedSec] = newSections.splice(fromIdx, 1);
      newSections.splice(toIdx, 0, movedSec);

      pushState({ ...currentConfig, sections: newSections });
      setSelectedSectionId(data.sectionId);
    } else if (data.type === 'NEW_SECTION') {
      const toIdx = currentConfig.sections.findIndex(s => s.id === targetSecId);
      handleAddSectionPreset(data.preset, toIdx);
    }
  };

  // ── RESIZING WITH MOUSE HANDLES (Canva-style) ──
  const handleResizeStart = (e, handle, el) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialFontSize = el.fontSize || 12;
    const initialHeight = el.height || 40;

    const onMouseMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - startX;
      const deltaY = moveEvt.clientY - startY;

      if (handle === 's' || handle === 'n') {
        const newHeight = Math.max(10, initialHeight + (handle === 's' ? deltaY : -deltaY));
        updateElementProp(el.id, 'height', Math.round(newHeight));
      } else if (handle === 'se' || handle === 'sw' || handle === 'ne' || handle === 'nw') {
        const factor = (handle === 'se' || handle === 'ne') ? deltaX : -deltaX;
        const newFont = Math.max(8, Math.min(48, initialFontSize + Math.round(factor / 12)));
        updateElementProp(el.id, 'fontSize', newFont);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Apply Global Font to Entire Invoice
  const handleApplyFontToAll = (fontName) => {
    const newSections = currentConfig.sections.map(sec => {
      const newCols = sec.columns.map(col => {
        const newElems = col.elements.map(el => ({ ...el, fontFamily: fontName }));
        return { ...col, elements: newElems };
      });
      return { ...sec, columns: newCols };
    });
    pushState({ ...currentConfig, font_family: fontName, sections: newSections });
  };

  // Save to PostgreSQL via Settings
  const handleSaveDesign = (customTitle = null) => {
    const fullSavedConfig = {
      ...currentConfig,
      theme_id: 'custom_builder',
      theme_name: customTitle || currentConfig.theme_name || currentConfig.name || 'Custom Visual Bill Design',
      builder_elements: currentConfig.elements
    };

    if (onSave) {
      onSave(fullSavedConfig);
    }

    setSaveSuccess(true);
    setSaveAsModalOpen(false);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  // Selected object references
  const selectedSection = currentConfig.sections.find(s => s.id === selectedSectionId);
  const selectedElementInfo = selectedElementId ? findElementById(selectedElementId) : null;
  const selectedElement = selectedElementInfo?.element;

  // Store information overrides
  const storeName = initialSettings?.store_name || 'AMMUS SUPERMARKET';
  const storeSubtitle = initialSettings?.store_subtitle || 'Fresh Grocery & Department Store';
  const storeAddress = initialSettings?.store_address || 'Junction Road, Near Bus Stand, Trivandrum';
  const storePhone = initialSettings?.store_phone || '9895820417, 0471-224488';
  const storeGstin = initialSettings?.gstin || '32DPHPB3199N1ZL';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col overflow-hidden text-slate-800 font-sans select-none">

      {/* ── TOP HEADER / TOOLBAR (Canva + WordPress Top Navigation) ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-sm z-30">
        
        {/* Left: Exit & Title */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            title="Exit without saving"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600" />
            <span>Exit</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 font-heading">
                  Visual Bill Designer & Invoice Builder
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-800 uppercase tracking-wider">
                  Canva + Elementor
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Drag sections & elements onto canvas • Click to customize styles
              </p>
            </div>
          </div>
        </div>

        {/* Center: Undo/Redo & Paper Selector & Canvas View Controls */}
        <div className="flex items-center space-x-2">
          {/* Undo / Redo */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Paper Size Quick Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Paper:</span>
            <select
              value={currentConfig.paper_size || 'a4'}
              onChange={(e) => pushState({ ...currentConfig, paper_size: e.target.value })}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="a4">A4 Corporate Sheet</option>
              <option value="a5">A5 Half Sheet</option>
              <option value="thermal_80mm">80mm POS Roll</option>
              <option value="thermal_58mm">58mm Mini Roll</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveViewMode('design')}
              className={`px-3 py-1 rounded-lg transition ${activeViewMode === 'design' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Design Canvas
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('preview')}
              className={`px-3 py-1 rounded-lg transition ${activeViewMode === 'preview' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Clean Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('test')}
              className={`px-3 py-1 rounded-lg transition ${activeViewMode === 'test' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Test Bill Mode
            </button>
          </div>
        </div>

        {/* Right: Print Test & Save Options */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition cursor-pointer"
            title="Print Test Bill"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Test</span>
          </button>

          <button
            type="button"
            onClick={() => setSaveAsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition cursor-pointer"
            title="Save as a new named template"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save As New</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveDesign()}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition cursor-pointer active:scale-95"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Saved & Applied!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Template</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── WORKSPACE BODY: 3-COLUMN STUDIO (Left Palette | Canvas | Right Properties) ── */}
      <div className="flex-1 flex overflow-hidden bg-slate-200/80">

        {/* ── LEFT COLUMN: 5-TAB DESIGN PALETTE ── */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-xs z-20">
          
          {/* Navigation Tabs (Elements | Sections | Design | Layers | Templates) */}
          <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-center">
            <button
              type="button"
              onClick={() => setActiveTab('elements')}
              className={`py-2.5 flex flex-col items-center justify-center space-y-1 transition border-b-2 cursor-pointer ${
                activeTab === 'elements' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Elements</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sections')}
              className={`py-2.5 flex flex-col items-center justify-center space-y-1 transition border-b-2 cursor-pointer ${
                activeTab === 'sections' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('design')}
              className={`py-2.5 flex flex-col items-center justify-center space-y-1 transition border-b-2 cursor-pointer ${
                activeTab === 'design' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('layers')}
              className={`py-2.5 flex flex-col items-center justify-center space-y-1 transition border-b-2 cursor-pointer ${
                activeTab === 'layers' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`py-2.5 flex flex-col items-center justify-center space-y-1 transition border-b-2 cursor-pointer ${
                activeTab === 'templates' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>
          </div>

          {/* TAB 1: ELEMENTS PALETTE */}
          {activeTab === 'elements' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50/70">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search draggable elements..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-purple-600 outline-none transition"
                  />
                </div>
                <div className="mt-2 text-[10px] text-purple-700 bg-purple-50 p-1.5 rounded-lg border border-purple-200 flex items-center space-x-1.5">
                  <Move className="w-3 h-3 shrink-0" />
                  <span><strong>Tip:</strong> Drag any element directly onto the bill canvas columns!</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                {TOOLBAR_CATEGORIES.map((cat) => {
                  const filtered = cat.items.filter(it =>
                    it.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    it.type.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (filtered.length === 0) return null;

                  return (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                        {cat.category}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {filtered.map((item) => {
                          const IconComp = item.icon || Square;
                          return (
                            <div
                              key={item.type}
                              draggable={true}
                              onDragStart={(e) => handleDragStartElementPalette(e, item)}
                              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white hover:bg-purple-50/60 hover:border-purple-400 transition cursor-grab active:cursor-grabbing group shadow-2xs select-none"
                              title="Drag into any column on canvas, or click to append"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-purple-100 group-hover:text-purple-700 text-slate-600 flex items-center justify-center transition">
                                  <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-semibold text-slate-800 text-xs">{item.label}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-400 group-hover:text-purple-600">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const targetSec = currentConfig.sections[currentConfig.sections.length - 1];
                                    if (targetSec && targetSec.columns[0]) {
                                      handleAddElementToColumn(item, targetSec.id, targetSec.columns[0].id);
                                    }
                                  }}
                                  className="p-1 hover:bg-purple-100 rounded text-slate-400 hover:text-purple-700"
                                  title="Add to bottom"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <Move className="w-3 h-3" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS PALETTE (WordPress Elementor Style) */}
          {activeTab === 'sections' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">WordPress-Style Section Layouts</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Drag a section preset onto the canvas or click to insert.
                </p>
              </div>

              <div className="space-y-2.5">
                {SECTION_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStartSectionPalette(e, preset)}
                    onClick={() => handleAddSectionPreset(preset)}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50/40 transition cursor-grab shadow-2xs group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-xs">{preset.name}</span>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
                    </div>

                    {/* Visual Column Representation */}
                    <div className="flex items-center space-x-1 h-7">
                      {preset.columns.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ width: col.width }}
                          className="h-full bg-slate-100 group-hover:bg-purple-100 border border-dashed border-slate-300 group-hover:border-purple-300 rounded flex items-center justify-center text-[9px] font-bold text-slate-500 group-hover:text-purple-700"
                        >
                          {col.width}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL DESIGN SETTINGS */}
          {activeTab === 'design' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Global Invoice Styling</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Controls typography, branding colors, and canvas dimensions.
                </p>
              </div>

              {/* Global Typography */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Global Typography
                </span>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Font Family</label>
                  <select
                    value={currentConfig.font_family || 'Inter, -apple-system, sans-serif'}
                    onChange={(e) => pushState({ ...currentConfig, font_family: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  >
                    <option value="Inter, -apple-system, sans-serif">Inter Clean Sans</option>
                    <option value="'Courier New', Courier, monospace">Courier Thermal Monospace</option>
                    <option value="Outfit, Inter, sans-serif">Outfit Modern Geometric</option>
                    <option value="Arial, sans-serif">Arial Standard</option>
                    <option value="Roboto, sans-serif">Roboto Material</option>
                    <option value="Poppins, sans-serif">Poppins Premium</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="Lato, sans-serif">Lato Corporate</option>
                    <option value="Montserrat, sans-serif">Montserrat Editorial</option>
                    <option value="Georgia, serif">Georgia Elegant Serif</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyFontToAll(currentConfig.font_family || 'Inter, sans-serif')}
                  className="w-full py-1.5 bg-white border border-purple-300 hover:bg-purple-50 text-purple-700 rounded-lg font-bold text-[11px] transition shadow-2xs"
                >
                  Apply Font To Entire Invoice
                </button>
              </div>

              {/* Brand Colors */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Brand Color Palette
                </span>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Color (Headers / Accents)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentConfig.primary_color || '#7c3aed'}
                      onChange={(e) => pushState({ ...currentConfig, primary_color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={currentConfig.primary_color || '#7c3aed'}
                      onChange={(e) => pushState({ ...currentConfig, primary_color: e.target.value })}
                      className="flex-1 px-3 py-1 text-xs rounded-xl border border-slate-300 font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Canvas Background</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentConfig.bg_color || '#ffffff'}
                      onChange={(e) => pushState({ ...currentConfig, bg_color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={currentConfig.bg_color || '#ffffff'}
                      onChange={(e) => pushState({ ...currentConfig, bg_color: e.target.value })}
                      className="flex-1 px-3 py-1 text-xs rounded-xl border border-slate-300 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAYERS HIERARCHY TREE */}
          {activeTab === 'layers' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Invoice Layer Tree</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage sections and elements hierarchy.
                </p>
              </div>

              <div className="space-y-2">
                {currentConfig.sections.map((sec, secIdx) => (
                  <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div
                      onClick={() => {
                        setSelectedSectionId(sec.id);
                        setSelectedElementId(null);
                      }}
                      className={`p-2 flex items-center justify-between cursor-pointer transition ${
                        selectedSectionId === sec.id ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Columns className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-xs">{sec.title || `Section ${secIdx + 1}`}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSectionProp(sec.id, 'visible', sec.visible === false ? true : false);
                          }}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {sec.visible === false ? <EyeOff className="w-3 h-3 text-rose-500" /> : <Eye className="w-3 h-3 text-slate-500" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(sec.id);
                          }}
                          className="p-1 hover:bg-rose-100 rounded text-rose-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Columns & Elements */}
                    <div className="p-2 space-y-1.5 bg-white border-t border-slate-100">
                      {sec.columns.map((col, colIdx) => (
                        <div key={col.id} className="pl-2 border-l-2 border-purple-200 space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Col {colIdx + 1} ({col.width})
                          </span>
                          {col.elements.map(el => (
                            <div
                              key={el.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElementId(el.id);
                                setSelectedSectionId(null);
                              }}
                              className={`p-1.5 rounded-lg flex items-center justify-between text-[11px] cursor-pointer transition ${
                                selectedElementId === el.id ? 'bg-purple-50 text-purple-700 font-bold border border-purple-300' : 'hover:bg-slate-50 border border-slate-100'
                              }`}
                            >
                              <div className="flex items-center space-x-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <span className="truncate">{el.label || el.type}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteElement(el.id);
                                }}
                                className="p-0.5 text-slate-300 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PRESET TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Ready-Made Templates</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pick from 5 pre-built industry layouts.
                </p>
              </div>

              <div className="space-y-2.5">
                {Object.values(DESIGNER_TEMPLATES).map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-purple-400 transition shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{tpl.name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">
                        {tpl.paper_size}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => pushState(normalizeConfig(tpl))}
                      className="w-full py-1.5 rounded-lg bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold text-xs transition cursor-pointer"
                    >
                      Apply Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── CENTER COLUMN: LIVE BILL CANVAS ── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">

          {/* Canvas Floating Top Toolbar (Zoom, Grid, Rulers, Snap) */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full shadow-lg px-4 py-1.5 flex items-center space-x-2 text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-600 transition cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-[11px] text-slate-700 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-600 transition cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Fit
            </button>

            <div className="h-4 w-px bg-slate-200" />

            {/* Grid Toggle */}
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${showGrid ? 'bg-purple-100 text-purple-700 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Toggle Alignment Grid (5px/10px/20px)"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            {/* Rulers Toggle */}
            <button
              type="button"
              onClick={() => setShowRulers(!showRulers)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition cursor-pointer ${showRulers ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Toggle Horizontal & Vertical Rulers"
            >
              Rulers
            </button>
          </div>

          {/* Canvas Scrollable Viewport with Rulers & Grid */}
          <div
            onClick={() => {
              setSelectedElementId(null);
              setSelectedSectionId(null);
            }}
            className="flex-1 overflow-auto p-12 flex justify-center items-start select-none relative"
            style={{
              backgroundImage: showGrid ? `radial-gradient(#94a3b8 1px, transparent 1px)` : 'none',
              backgroundSize: `${gridSize * 2}px ${gridSize * 2}px`
            }}
          >
            {/* Horizontal Top Ruler */}
            {showRulers && (
              <div className="absolute top-0 left-0 right-0 h-6 bg-slate-100 border-b border-slate-300 flex items-end text-[8px] text-slate-400 font-mono overflow-hidden select-none z-10">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="w-10 border-r border-slate-300 h-2.5 pl-0.5 shrink-0">
                    {i * 40}
                  </div>
                ))}
              </div>
            )}

            {/* The Actual Invoice Paper Sheet */}
            <div
              id="bill-designer-paper"
              onClick={(e) => e.stopPropagation()}
              className={`bg-white shadow-2xl transition-all duration-150 select-text relative border border-slate-300 ${
                currentConfig.paper_size?.includes('thermal') ? 'rounded-xs' : 'rounded-lg'
              }`}
              style={{
                width: currentConfig.paper_size === 'thermal_58mm' ? '280px' :
                       currentConfig.paper_size === 'thermal_80mm' ? '340px' :
                       currentConfig.paper_size === 'a5' ? '560px' : '790px',
                minHeight: currentConfig.paper_size?.includes('thermal') ? '450px' : '1050px',
                padding: `${currentConfig.margins?.top || 12}px ${currentConfig.margins?.right || 12}px ${currentConfig.margins?.bottom || 12}px ${currentConfig.margins?.left || 12}px`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                fontFamily: currentConfig.font_family || 'Inter, sans-serif',
                backgroundColor: currentConfig.bg_color || '#ffffff'
              }}
            >
              {/* Stack of Sections */}
              <div className="space-y-2">
                {currentConfig.sections.map((sec, secIdx) => {
                  if (sec.visible === false && activeViewMode !== 'design') return null;

                  const isSecSelected = selectedSectionId === sec.id;

                  return (
                    <div
                      key={sec.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverSection(sec.id);
                      }}
                      onDragLeave={() => setDragOverSection(null)}
                      onDrop={(e) => handleDropOnSectionReorder(e, sec.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSectionId(sec.id);
                        setSelectedElementId(null);
                      }}
                      className={`relative group/sec transition-all rounded-lg ${
                        dragOverSection === sec.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                      } ${
                        activeViewMode === 'design'
                          ? isSecSelected
                            ? 'ring-2 ring-blue-500 bg-blue-50/10'
                            : 'hover:ring-1 hover:ring-blue-300'
                          : ''
                      }`}
                      style={{
                        backgroundColor: sec.bg_color || 'transparent',
                        padding: `${sec.padding?.top ?? 8}px ${sec.padding?.right ?? 8}px ${sec.padding?.bottom ?? 8}px ${sec.padding?.left ?? 8}px`,
                        marginTop: `${sec.margin?.top ?? 0}px`,
                        marginBottom: `${sec.margin?.bottom ?? 8}px`,
                        border: sec.border_style && sec.border_style !== 'none' ? `${sec.border_width || 1}px ${sec.border_style} ${sec.border_color || '#cbd5e1'}` : undefined,
                        borderRadius: `${sec.border_radius || 0}px`,
                        minHeight: sec.min_height ? `${sec.min_height}px` : undefined
                      }}
                    >
                      {/* Elementor Section Floating Control Handle on Hover / Selection */}
                      {activeViewMode === 'design' && (
                        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 bg-blue-600 text-white px-2.5 py-0.5 rounded-t-lg shadow-md text-[10px] font-bold transition-opacity ${
                          isSecSelected ? 'opacity-100' : 'opacity-0 group-hover/sec:opacity-100'
                        }`}>
                          <span
                            draggable={true}
                            onDragStart={(e) => handleDragStartCanvasSection(e, sec.id)}
                            className="cursor-grab active:cursor-grabbing flex items-center space-x-1"
                            title="Drag to reorder section"
                          >
                            <Move className="w-3 h-3" />
                            <span>{sec.title || 'Section'}</span>
                          </span>
                          <span className="opacity-40">|</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSectionId(sec.id);
                              setSelectedElementId(null);
                            }}
                            className="hover:text-blue-200 cursor-pointer"
                            title="Edit Section Settings"
                          >
                            <Settings2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateSection(sec.id);
                            }}
                            className="hover:text-blue-200 cursor-pointer"
                            title="Duplicate Section"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(sec.id, 'up');
                            }}
                            className="hover:text-blue-200 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(sec.id, 'down');
                            }}
                            className="hover:text-blue-200 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(sec.id);
                            }}
                            className="hover:text-rose-300 cursor-pointer"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3 h-3 text-rose-200" />
                          </button>
                        </div>
                      )}

                      {/* Section Columns Grid */}
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: sec.columns?.map(c => c.width || '1fr').join(' ') || '1fr'
                        }}
                      >
                        {sec.columns?.map((col) => (
                          <div
                            key={col.id}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'copy';
                              setDragOverColumn({ sectionId: sec.id, colId: col.id });
                            }}
                            onDragLeave={() => setDragOverColumn(null)}
                            onDrop={(e) => handleDropOnColumn(e, sec.id, col.id)}
                            className={`min-h-[38px] rounded-lg transition-all flex flex-col space-y-1 relative ${
                              dragOverColumn?.sectionId === sec.id && dragOverColumn?.colId === col.id
                                ? 'bg-purple-100/60 ring-2 ring-purple-400 ring-dashed'
                                : activeViewMode === 'design' && col.elements.length === 0
                                ? 'border-2 border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center text-[10px] text-slate-400'
                                : ''
                            }`}
                          >
                            {col.elements.length === 0 && activeViewMode === 'design' && (
                              <div className="py-2 text-center text-slate-400 font-mono text-[10px]">
                                Drag elements here
                              </div>
                            )}

                            {col.elements.map((el, elIdx) => {
                              if (el.visible === false && activeViewMode !== 'design') return null;

                              const isElSelected = selectedElementId === el.id;

                              return (
                                <div
                                  key={el.id}
                                  draggable={activeViewMode === 'design'}
                                  onDragStart={(e) => handleDragStartCanvasElement(e, el.id, sec.id, col.id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElementId(el.id);
                                    setSelectedSectionId(null);
                                  }}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    setSelectedElementId(el.id);
                                    setContextMenu({ x: e.clientX, y: e.clientY, elementId: el.id, sectionId: sec.id });
                                  }}
                                  className={`relative group/el transition rounded-lg ${
                                    activeViewMode === 'design'
                                      ? isElSelected
                                        ? 'ring-2 ring-purple-600 bg-purple-50/30 shadow-xs'
                                        : 'hover:ring-1 hover:ring-purple-300 hover:bg-slate-50/40 cursor-grab active:cursor-grabbing'
                                      : ''
                                  } ${el.visible === false ? 'opacity-35 line-through' : ''}`}
                                >
                                  {/* Floating Canva Toolbar on Selected Element */}
                                  {activeViewMode === 'design' && isElSelected && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-1.5 bg-slate-900 text-white px-2 py-0.5 rounded-lg shadow-xl text-[10px] whitespace-nowrap">
                                      <span className="font-bold mr-1 text-purple-300">{el.label || el.type}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDuplicateElement(el.id);
                                        }}
                                        className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                                        title="Duplicate (Ctrl+D)"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveElement(el.id, 'up');
                                        }}
                                        className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                                        title="Move Up"
                                      >
                                        <ChevronUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveElement(el.id, 'down');
                                        }}
                                        className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                                        title="Move Down"
                                      >
                                        <ChevronDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateElementProp(el.id, 'locked', !el.locked);
                                        }}
                                        className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                                        title={el.locked ? "Unlock" : "Lock"}
                                      >
                                        {el.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteElement(el.id);
                                        }}
                                        className="p-1 hover:bg-rose-900 text-rose-300 rounded cursor-pointer"
                                        title="Delete (Del)"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}

                                  {/* 8 Canva Resize Handles on Selected Element */}
                                  {activeViewMode === 'design' && isElSelected && (
                                    <>
                                      <div
                                        onMouseDown={(e) => handleResizeStart(e, 'nw', el)}
                                        className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-full cursor-nwse-resize z-30"
                                      />
                                      <div
                                        onMouseDown={(e) => handleResizeStart(e, 'ne', el)}
                                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-full cursor-nesw-resize z-30"
                                      />
                                      <div
                                        onMouseDown={(e) => handleResizeStart(e, 'sw', el)}
                                        className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-full cursor-nesw-resize z-30"
                                      />
                                      <div
                                        onMouseDown={(e) => handleResizeStart(e, 'se', el)}
                                        className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-full cursor-nwse-resize z-30"
                                      />
                                    </>
                                  )}

                                  {/* Render Actual Element Content */}
                                  <div className="p-0.5">
                                    {renderElementContent(el, storeName, storeSubtitle, storeAddress, storePhone, storeGstin, currentConfig)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* "+ Add Section" Big Canvas Button (Elementor Style) */}
                {activeViewMode === 'design' && (
                  <div className="pt-4 pb-8 flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setAddSectionModalOpen(true)}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-full border-2 border-dashed border-purple-400 bg-purple-50/50 hover:bg-purple-100 hover:border-purple-600 text-purple-800 text-xs font-bold transition shadow-xs cursor-pointer group"
                    >
                      <Plus className="w-4 h-4 text-purple-600 group-hover:scale-125 transition" />
                      <span>+ Add New Section</span>
                    </button>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Choose 1-column, multi-column or header/footer layout
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: CONTEXTUAL PROPERTIES PANEL ── */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-xs z-20">
          
          {/* Header of Properties Panel */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-xs text-slate-800 font-heading">
                {selectedElement ? 'Element Properties' : selectedSection ? 'Section Properties' : 'Document Settings'}
              </h3>
            </div>
            {(selectedElement || selectedSection) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedElementId(null);
                  setSelectedSectionId(null);
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Properties Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">

            {/* ── 1. ELEMENT SELECTED PROPERTIES ── */}
            {selectedElement ? (
              <div className="space-y-4">
                <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Component</span>
                    <h4 className="font-bold text-slate-900 text-xs">{selectedElement.label || selectedElement.type}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateElementProp(selectedElement.id, 'visible', selectedElement.visible === false ? true : false)}
                    className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition cursor-pointer"
                    title={selectedElement.visible === false ? "Show" : "Hide"}
                  >
                    {selectedElement.visible === false ? <EyeOff className="w-4 h-4 text-rose-500" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Custom Label Renaming */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Label / Rename</label>
                  <input
                    type="text"
                    value={selectedElement.label || ''}
                    onChange={(e) => updateElementProp(selectedElement.id, 'label', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-purple-600 outline-none transition"
                  />
                </div>

                {/* Text Content */}
                {selectedElement.text !== undefined && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Text Content</label>
                    <textarea
                      rows={2}
                      value={selectedElement.text}
                      onChange={(e) => updateElementProp(selectedElement.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-purple-600 outline-none transition resize-none"
                    />
                  </div>
                )}

                {/* Typography Controls */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">Typography</span>

                  {/* Font Size & Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Font Size</label>
                      <input
                        type="number"
                        min="8"
                        max="36"
                        value={selectedElement.fontSize || 12}
                        onChange={(e) => updateElementProp(selectedElement.id, 'fontSize', parseInt(e.target.value) || 12)}
                        className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Font Weight</label>
                      <select
                        value={selectedElement.fontWeight || 'normal'}
                        onChange={(e) => updateElementProp(selectedElement.id, 'fontWeight', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-xl border border-slate-300 outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="500">Medium</option>
                        <option value="bold">Bold</option>
                        <option value="800">Extra Bold</option>
                      </select>
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Text Alignment</label>
                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                      {['left', 'center', 'right'].map((al) => (
                        <button
                          key={al}
                          type="button"
                          onClick={() => updateElementProp(selectedElement.id, 'alignment', al)}
                          className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                            selectedElement.alignment === al ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {al}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedElement.color || '#0f172a'}
                        onChange={(e) => updateElementProp(selectedElement.id, 'color', e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border border-slate-200"
                      />
                      <input
                        type="text"
                        value={selectedElement.color || '#0f172a'}
                        onChange={(e) => updateElementProp(selectedElement.id, 'color', e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Component-Specific Controls: PRODUCT TABLE */}
                {selectedElement.type === 'product_table' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
                      Table Columns Manager
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {[
                        { key: 'sno', label: '# Serial Number' },
                        { key: 'name', label: 'Item Name' },
                        { key: 'sku', label: 'Item SKU / Code' },
                        { key: 'hsn', label: 'HSN / SAC Code' },
                        { key: 'batch', label: 'Batch No' },
                        { key: 'expiry', label: 'Expiry Date' },
                        { key: 'qty', label: 'Quantity' },
                        { key: 'mrp', label: 'MRP Price' },
                        { key: 'rate', label: 'Unit Rate' },
                        { key: 'discount', label: 'Discount %' },
                        { key: 'gst_rate', label: 'GST Tax %' },
                        { key: 'amount', label: 'Total Amount' }
                      ].map(colDef => {
                        const curCols = selectedElement.columns || ['sno', 'name', 'qty', 'rate', 'amount'];
                        const isChecked = curCols.includes(colDef.key);

                        return (
                          <label key={colDef.key} className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newCols = e.target.checked
                                  ? [...curCols, colDef.key]
                                  : curCols.filter(k => k !== colDef.key);
                                updateElementProp(selectedElement.id, 'columns', newCols);
                              }}
                              className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
                            />
                            <span className="text-xs">{colDef.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedElement.zebra !== false}
                        onChange={(e) => updateElementProp(selectedElement.id, 'zebra', e.target.checked)}
                        className="w-3.5 h-3.5 accent-purple-600 rounded"
                      />
                      <span>Alternating zebra row colors</span>
                    </label>
                  </div>
                )}

                {/* Component-Specific Controls: UPI QR */}
                {selectedElement.type === 'upi_qr' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
                      UPI QR Code Parameters
                    </span>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">VPA / UPI ID</label>
                      <input
                        type="text"
                        value={selectedElement.upiId || 'store@upi'}
                        onChange={(e) => updateElementProp(selectedElement.id, 'upiId', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Payee Name</label>
                      <input
                        type="text"
                        value={selectedElement.payeeName || 'Store'}
                        onChange={(e) => updateElementProp(selectedElement.id, 'payeeName', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : selectedSection ? (
              // ── 2. SECTION SELECTED PROPERTIES (WordPress Elementor Style) ──
              <div className="space-y-4">
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Layout Section</span>
                    <h4 className="font-bold text-slate-900 text-xs">{selectedSection.title || 'Section'}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSectionProp(selectedSection.id, 'visible', selectedSection.visible === false ? true : false)}
                    className="p-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                    title={selectedSection.visible === false ? "Show" : "Hide"}
                  >
                    {selectedSection.visible === false ? <EyeOff className="w-4 h-4 text-rose-500" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Section Title */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={selectedSection.title || ''}
                    onChange={(e) => updateSectionProp(selectedSection.id, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-purple-600 outline-none"
                  />
                </div>

                {/* Section Background Color */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section Background</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedSection.bg_color && selectedSection.bg_color !== 'transparent' ? selectedSection.bg_color : '#ffffff'}
                      onChange={(e) => updateSectionProp(selectedSection.id, 'bg_color', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => updateSectionProp(selectedSection.id, 'bg_color', 'transparent')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[10px]"
                    >
                      Transparent
                    </button>
                  </div>
                </div>

                {/* Section Padding Controls */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section Padding (px)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const curPad = selectedSection.padding || { top: 8, right: 8, bottom: 8, left: 8, linked: true };
                        updateSectionProp(selectedSection.id, 'padding', { ...curPad, linked: !curPad.linked });
                      }}
                      className="text-purple-600 hover:text-purple-800"
                      title={selectedSection.padding?.linked ? "Unlink padding sides" : "Link padding sides together"}
                    >
                      {selectedSection.padding?.linked ? <LinkIcon className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {['top', 'right', 'bottom', 'left'].map(side => (
                      <div key={side}>
                        <span className="text-[9px] font-bold uppercase text-slate-400">{side}</span>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={selectedSection.padding?.[side] ?? 8}
                          onChange={(e) => updateSectionPadding(selectedSection.id, side, parseInt(e.target.value) || 0)}
                          className="w-full text-center px-1 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Border */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Border Style</label>
                  <select
                    value={selectedSection.border_style || 'none'}
                    onChange={(e) => updateSectionProp(selectedSection.id, 'border_style', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none"
                  >
                    <option value="none">No Border</option>
                    <option value="solid">Solid Line</option>
                    <option value="dashed">Dashed Line</option>
                    <option value="dotted">Dotted Line</option>
                  </select>
                </div>

                {/* Section Actions */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicateSection(selectedSection.id)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(selectedSection.id)}
                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition"
                  >
                    Delete Section
                  </button>
                </div>
              </div>
            ) : (
              // ── 3. GLOBAL DOCUMENT SETTINGS (Nothing Selected) ──
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Page & Paper Dimensions
                  </span>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Paper Format</label>
                    <select
                      value={currentConfig.paper_size || 'a4'}
                      onChange={(e) => pushState({ ...currentConfig, paper_size: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                    >
                      <option value="a4">A4 Corporate Sheet (210 × 297 mm)</option>
                      <option value="a5">A5 Half Sheet (148 × 210 mm)</option>
                      <option value="thermal_80mm">80mm POS Thermal Roll</option>
                      <option value="thermal_58mm">58mm Mini POS Roll</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Page Margins (px)</label>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {['top', 'right', 'bottom', 'left'].map(side => (
                        <div key={side}>
                          <span className="text-[9px] font-bold uppercase text-slate-400">{side}</span>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={currentConfig.margins?.[side] ?? 12}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const cur = currentConfig.margins || { top: 12, right: 12, bottom: 12, left: 12 };
                              pushState({ ...currentConfig, margins: { ...cur, [side]: val } });
                            }}
                            className="w-full text-center px-1 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200 text-[11px] text-purple-900 leading-relaxed">
                  <strong>💡 Builder Guide:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-600">
                    <li>Click any element on canvas to customize typography, colors, and columns.</li>
                    <li>Hover over a section to reveal Elementor controls (reorder, duplicate, settings).</li>
                    <li>Drag elements from the left panel directly into any column.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ── "+ ADD SECTION" MODAL PRESET SELECTOR ── */}
      {addSectionModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Columns className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Select Section Layout Preset</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddSectionModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
              {SECTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAddSectionPreset(preset, targetInsertSectionIdx)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-purple-600 hover:bg-purple-50/50 text-left transition shadow-2xs group cursor-pointer"
                >
                  <span className="font-bold text-slate-800 text-xs group-hover:text-purple-700 block mb-2">
                    {preset.name}
                  </span>
                  <div className="flex items-center space-x-1 h-7">
                    {preset.columns.map((c, i) => (
                      <div
                        key={i}
                        style={{ width: c.width }}
                        className="h-full bg-slate-100 group-hover:bg-purple-100 border border-dashed border-slate-300 group-hover:border-purple-300 rounded flex items-center justify-center text-[9px] font-bold text-slate-500 group-hover:text-purple-700"
                      >
                        {c.width}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── "SAVE AS NEW TEMPLATE" PROMPT MODAL ── */}
      {saveAsModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Save As New Template</h3>
              <p className="text-xs text-slate-500 mt-1">Enter a memorable name for this invoice layout.</p>
            </div>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g. Luxury Wholesale A4"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-purple-600 outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSaveAsModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveDesign(newTemplateName.trim() || 'Custom Invoice Design')}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RIGHT-CLICK CONTEXT MENU (Canva-style) ── */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-60 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 text-xs text-slate-700 w-44 font-semibold animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={() => {
              setSelectedElementId(contextMenu.elementId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Edit Properties</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleDuplicateElement(contextMenu.elementId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate (Ctrl+D)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const found = findElementById(contextMenu.elementId);
              if (found) copiedElementRef.current = found.element;
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Copy (Ctrl+C)</span>
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            type="button"
            onClick={() => {
              handleDeleteElement(contextMenu.elementId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center space-x-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete (Del)</span>
          </button>
        </div>
      )}

    </div>
  );
}

// ==============================================================================
// 3. CANVAS ELEMENT RENDER HELPER (WYSIWYG REAL-TIME PREVIEW)
// ==============================================================================

function renderElementContent(el, storeName, storeSubtitle, storeAddress, storePhone, storeGstin, config) {
  const isThermal = config.paper_size?.includes('thermal');
  const primaryColor = config.primary_color || '#7c3aed';

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
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 10}px`,
            textAlign: el.alignment || 'center',
            color: el.color || '#475569'
          }}
        >
          {el.text || `Ph: ${storePhone}`}
        </div>
      );

    case 'business_gstin':
      return (
        <div
          style={{
            fontSize: `${el.fontSize || 10}px`,
            textAlign: el.alignment || 'center',
            color: el.color || '#0f172a',
            fontWeight: el.fontWeight || 'bold'
          }}
        >
          {el.text || `GSTIN: ${storeGstin}`}
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
              <p className="text-[11px] text-slate-500">{el.address || storeAddress}</p>
              <div className="text-[10px] text-slate-600 mt-0.5 space-x-2">
                <span>Ph: {el.phone || storePhone}</span>
                {el.gstin && <span>• GSTIN: <strong>{el.gstin || storeGstin}</strong></span>}
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
              <div>Inv: <strong>{REALISTIC_SAMPLE_DATA.invoiceNumber}</strong></div>
              <div>Date: {REALISTIC_SAMPLE_DATA.date}</div>
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
              <strong className="text-slate-900">{REALISTIC_SAMPLE_DATA.invoiceNumber}</strong>
            </div>
          )}
          {el.showDate !== false && (
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{REALISTIC_SAMPLE_DATA.date}</span>
            </div>
          )}
          {el.showTime !== false && (
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{REALISTIC_SAMPLE_DATA.time}</span>
            </div>
          )}
          {el.showCashier !== false && (
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{REALISTIC_SAMPLE_DATA.cashier}</span>
            </div>
          )}
        </div>
      );

    case 'customer_section':
      return (
        <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs space-y-1">
          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Billed To (Customer)</span>
          {el.showName !== false && <div className="font-bold text-slate-900">{REALISTIC_SAMPLE_DATA.customer.name}</div>}
          {el.showPhone !== false && <div className="text-slate-600 font-mono">{REALISTIC_SAMPLE_DATA.customer.phone}</div>}
          {el.showAddress && <div className="text-slate-500 text-[11px]">{REALISTIC_SAMPLE_DATA.customer.address}</div>}
          {el.showGstin !== false && (
            <div className="text-slate-700 text-[10px] font-mono">
              GSTIN: <strong className="text-slate-900">{REALISTIC_SAMPLE_DATA.customer.gstin}</strong>
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
              {REALISTIC_SAMPLE_DATA.items.map((it, i) => (
                <tr key={it.sno} className={el.zebra && i % 2 === 1 ? 'bg-slate-50' : ''}>
                  {cols.includes('sno') && <td className="py-1 px-1.5 text-center text-slate-500 font-mono">{it.sno}</td>}
                  {cols.includes('name') && <td className="py-1 px-2 font-medium text-slate-900">{it.name}</td>}
                  {cols.includes('sku') && <td className="py-1 px-1.5 text-center font-mono text-slate-500 text-[10px]">{it.sku}</td>}
                  {cols.includes('hsn') && <td className="py-1 px-1.5 text-center font-mono text-slate-500 text-[10px]">{it.hsn}</td>}
                  {cols.includes('batch') && <td className="py-1 px-1.5 text-center font-mono text-slate-500 text-[10px]">{it.batch}</td>}
                  {cols.includes('expiry') && <td className="py-1 px-1.5 text-center font-mono text-slate-500 text-[10px]">{it.expiry}</td>}
                  {cols.includes('qty') && <td className="py-1 px-1.5 text-center font-bold">{it.qty}</td>}
                  {cols.includes('mrp') && <td className="py-1 px-1.5 text-right font-mono text-slate-400 line-through">₹{it.mrp.toFixed(2)}</td>}
                  {cols.includes('rate') && <td className="py-1 px-1.5 text-right font-mono">₹{it.rate.toFixed(2)}</td>}
                  {cols.includes('discount') && <td className="py-1 px-1.5 text-right font-mono text-emerald-600">₹{it.discount.toFixed(2)}</td>}
                  {cols.includes('gst_rate') && <td className="py-1 px-1.5 text-right font-mono">{it.gst_rate}%</td>}
                  {cols.includes('amount') && <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">₹{it.amount.toFixed(2)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'tax_breakdown_summary':
      return (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 font-mono">
          <div className="font-bold text-slate-800 mb-1">GST Breakdown:</div>
          <div className="grid grid-cols-3 gap-2">
            <div>Taxable: ₹{REALISTIC_SAMPLE_DATA.totals.taxable.toFixed(2)}</div>
            <div>CGST: ₹{REALISTIC_SAMPLE_DATA.totals.cgst.toFixed(2)}</div>
            <div>SGST: ₹{REALISTIC_SAMPLE_DATA.totals.sgst.toFixed(2)}</div>
          </div>
        </div>
      );

    case 'bill_totals':
      return (
        <div className="space-y-1 text-xs text-slate-700 py-1">
          {el.showSubtotal !== false && (
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">₹{REALISTIC_SAMPLE_DATA.totals.subtotal.toFixed(2)}</span>
            </div>
          )}
          {el.showTax !== false && (
            <div className="flex justify-between">
              <span>Total GST:</span>
              <span className="font-mono">₹{(REALISTIC_SAMPLE_DATA.totals.cgst + REALISTIC_SAMPLE_DATA.totals.sgst).toFixed(2)}</span>
            </div>
          )}
          {el.showRoundOff !== false && (
            <div className="flex justify-between">
              <span>Round Off:</span>
              <span className="font-mono">₹{REALISTIC_SAMPLE_DATA.totals.roundOff.toFixed(2)}</span>
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
              <span className="font-mono">₹{REALISTIC_SAMPLE_DATA.totals.grandTotal.toFixed(2)}</span>
            </div>
          )}
          {el.showAmountPaid !== false && (
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Amount Paid:</span>
              <span className="font-mono">₹{REALISTIC_SAMPLE_DATA.totals.paid.toFixed(2)}</span>
            </div>
          )}
        </div>
      );

    case 'savings_badge':
      return (
        <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold text-center">
          {el.labelText || 'You Have Saved Rs.'} {REALISTIC_SAMPLE_DATA.totals.savings.toFixed(2)}
        </div>
      );

    case 'upi_qr': {
      const upiString = `upi://pay?pa=${el.upiId || 'store@upi'}&pn=${encodeURIComponent(el.payeeName || 'Store')}&am=${REALISTIC_SAMPLE_DATA.totals.grandTotal}&cu=INR`;
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
              <span className="text-slate-400">{el.upiId || 'store@upi'}</span>
            </div>
          )}
        </div>
      );
    }

    case 'bank_remittance':
      return (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-700 space-y-0.5">
          <span className="font-bold uppercase tracking-wider text-slate-400 block">Bank Wire Remittance</span>
          <div>Bank: <strong className="text-slate-900">{el.bankName}</strong></div>
          <div>Account No: <strong className="font-mono text-slate-900">{el.accountNo}</strong></div>
          <div>IFSC Code: <strong className="font-mono text-purple-700">{el.ifsc}</strong></div>
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
            <div className="font-bold text-slate-800">{el.title || 'Authorized Signatory'}</div>
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
          {el.text || '**** Thank You Visit Again ****'}
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
          {el.text}
        </div>
      );

    case 'page_break':
      return (
        <div className="my-3 py-2 border-y-2 border-dashed border-amber-300 bg-amber-50/50 text-center text-[10px] font-bold text-amber-800 tracking-wider">
          ✂ --- PAGE BREAK (Next content prints on new sheet) ---
        </div>
      );

    default:
      return <div className="text-xs text-slate-400">[Element: {el.type}]</div>;
  }
}

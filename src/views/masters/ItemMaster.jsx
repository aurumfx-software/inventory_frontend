import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  QrCode, 
  Barcode,
  X, 
  Upload, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sliders, 
  Layers, 
  Tag, 
  ShieldCheck, 
  Eye,
  Printer,
  Scan,
  RefreshCw,
  Clock,
  Boxes,
  MapPin,
  FileText,
  MoreVertical,
  Edit,
  Power,
  Ban,
  Building2,
  Check,
  Plus
} from 'lucide-react';
import QRCodeSVG from '../../components/common/QRCodeSVG';

export default function ItemMaster() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const [deactivateConfirmItem, setDeactivateConfirmItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(null);
  const [openActionDropdown, setOpenActionDropdown] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToastNotification = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Barcode Printing State
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(null);
  const [printQuantity, setPrintQuantity] = useState(6);
  const [labelFormat, setLabelFormat] = useState('grid');
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includePrice, setIncludePrice] = useState(true);

  // Scanning simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Frontend validation state
  const [touched, setTouched] = useState({});

  // Comprehensive Form State according to Sections 6.1 through 6.21 Specification
  const initialFormState = {
    item_code: '',
    item_name: '',
    description: '',
    category_id: 'cat-01',
    subcategory: 'Laptops',
    brand_id: 'brd-01',
    uom_id: 'uom-01',
    purchase_uom_id: 'uom-02',
    conversion_ratio: 20,
    tax_name: 'GST 18%',
    tax_percentage: 18,
    tax_type: 'Exclusive',
    effective_date: '2026-08-11',
    hsn_sac_code: '84713010',
    min_stock_level: 5,
    max_stock_level: 50,
    reorder_level: 10,
    reorder_qty: 15,
    valuation_rate: 72000,
    warehouse: 'WH-MAIN',
    zone: 'Zone A - Electronics & IT',
    rack: 'Rack R-01',
    shelf: 'Shelf S-1',
    bin: 'Bin B-101',
    barcode: '',
    qr_code: '',
    is_batch_tracked: false,
    batch_number: 'BAT-2026-0801',
    mfg_date: '2026-08-01',
    expiry_date: '2027-08-01',
    batch_received_qty: 50,
    batch_avail_qty: 50,
    batch_supplier: 'Dell India Pvt Ltd',
    is_serial_tracked: false,
    serial_status: 'Available',
    serial_prefix: 'SN-DELL-',
    is_expiry_tracked: false,
    expiry_warning_days: 30,
    image_url: null,
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Subcategory mapping based on selected Category
  const categorySubcategories = {
    'cat-01': ['Laptops', 'Desktops', 'Networking', 'Monitors', 'Peripherals'],
    'cat-02': ['Stationeries', 'Cleaning Supplies', 'Printer Ink/Toner', 'Paper Products'],
    'cat-03': ['Metals', 'Plastics', 'Chemicals', 'Fabrics'],
    'cat-04': ['Electrical', 'Mechanical', 'Pneumatic', 'Hydraulic'],
    'cat-05': ['Ethernet Cables', 'Power Cords', 'Switches & Sockets']
  };

  // Default UOM options fallback
  const uomOptions = uoms.length > 0 ? uoms : [
    { id: 'uom-01', unit_name: 'Piece', unit_symbol: 'Pcs' },
    { id: 'uom-02', unit_name: 'Box', unit_symbol: 'Box' },
    { id: 'uom-03', unit_name: 'Kilogram', unit_symbol: 'Kg' },
    { id: 'uom-04', unit_name: 'Litre', unit_symbol: 'Ltr' },
    { id: 'uom-05', unit_name: 'Metre', unit_symbol: 'Mtr' },
    { id: 'uom-06', unit_name: 'Pack', unit_symbol: 'Pck' },
    { id: 'uom-07', unit_name: 'Set', unit_symbol: 'Set' },
    { id: 'uom-08', unit_name: 'Carton', unit_symbol: 'Ctn' }
  ];

  // Default Fallback Items
  const sampleItemsFallback = [
    {
      id: 'itm-001',
      item_code: 'IT-LAP-0001',
      item_name: 'Dell Latitude 5440 Laptop',
      description: '14-inch FHD, Intel Core i7 13th Gen, 16GB RAM, 512GB SSD',
      category_id: 'cat-01',
      category_name: 'IT Equipment',
      subcategory: 'Laptops',
      brand_id: 'brd-01',
      brand_name: 'Dell',
      uom_id: 'uom-01',
      uom_symbol: 'Pcs',
      purchase_uom_id: 'uom-02',
      conversion_ratio: 1,
      tax_name: 'GST 18%',
      tax_percentage: 18,
      tax_type: 'Exclusive',
      effective_date: '2026-08-01',
      hsn_sac_code: '84713010',
      on_hand_qty: 25,
      available_qty: 20,
      min_stock_level: 5,
      max_stock_level: 50,
      reorder_level: 10,
      reorder_qty: 15,
      valuation_rate: 72000,
      warehouse: 'WH-MAIN',
      zone: 'Zone A - Electronics & IT',
      rack: 'Rack R-01',
      shelf: 'Shelf S-1',
      bin: 'Bin B-101',
      barcode: '890123456789',
      qr_code: 'IT-LAP-0001',
      is_batch_tracked: true,
      batch_number: 'BAT-2026-0801',
      mfg_date: '2026-08-01',
      expiry_date: '2028-08-01',
      batch_received_qty: 25,
      batch_avail_qty: 20,
      batch_supplier: 'Dell India Pvt Ltd',
      is_serial_tracked: true,
      serial_status: 'Available',
      serial_prefix: 'SN-DELL-',
      is_expiry_tracked: false,
      expiry_warning_days: 30,
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=60',
      status: 'Active'
    },
    {
      id: 'itm-002',
      item_code: 'CON-STN-0002',
      item_name: 'HP A4 Printing Paper Box (5000 Sheets)',
      description: '80 GSM bright white photocopy paper carton box',
      category_id: 'cat-02',
      category_name: 'Consumables & Office',
      subcategory: 'Paper Products',
      brand_id: 'brd-02',
      brand_name: 'HP',
      uom_id: 'uom-02',
      uom_symbol: 'Box',
      purchase_uom_id: 'uom-08',
      conversion_ratio: 5,
      tax_name: 'GST 12%',
      tax_percentage: 12,
      tax_type: 'Exclusive',
      effective_date: '2026-08-01',
      hsn_sac_code: '48025610',
      on_hand_qty: 8,
      available_qty: 8,
      min_stock_level: 10,
      max_stock_level: 100,
      reorder_level: 15,
      reorder_qty: 30,
      valuation_rate: 1200,
      warehouse: 'WH-MAIN',
      zone: 'Zone C - Consumables',
      rack: 'Rack R-04',
      shelf: 'Shelf S-2',
      bin: 'Bin B-204',
      barcode: '890987654321',
      qr_code: 'CON-STN-0002',
      is_batch_tracked: true,
      batch_number: 'BAT-PAP-001',
      mfg_date: '2026-07-15',
      expiry_date: '2029-07-15',
      batch_received_qty: 50,
      batch_avail_qty: 8,
      batch_supplier: 'HP Sales India',
      is_serial_tracked: false,
      is_expiry_tracked: false,
      expiry_warning_days: 30,
      image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=60',
      status: 'Active'
    },
    {
      id: 'itm-003',
      item_code: 'ELE-CBL-0003',
      item_name: 'Cisco Cat6 Ethernet Cable (305m Drum)',
      description: 'Gigabit high-speed shielded twisted pair network cable',
      category_id: 'cat-05',
      category_name: 'Electrical & Cables',
      subcategory: 'Ethernet Cables',
      brand_id: 'brd-04',
      brand_name: 'Cisco',
      uom_id: 'uom-05',
      uom_symbol: 'Mtr',
      purchase_uom_id: 'uom-06',
      conversion_ratio: 305,
      tax_name: 'GST 18%',
      tax_percentage: 18,
      tax_type: 'Exclusive',
      effective_date: '2026-08-01',
      hsn_sac_code: '85444999',
      on_hand_qty: 40,
      available_qty: 40,
      min_stock_level: 10,
      max_stock_level: 100,
      reorder_level: 15,
      reorder_qty: 20,
      valuation_rate: 8500,
      warehouse: 'WH-SUB1',
      zone: 'Zone A - Electronics & IT',
      rack: 'Rack R-02',
      shelf: 'Shelf S-3',
      bin: 'Bin B-105',
      barcode: '890555444333',
      qr_code: 'ELE-CBL-0003',
      is_batch_tracked: true,
      batch_number: 'BAT-CBL-99',
      mfg_date: '2026-06-01',
      expiry_date: '2031-06-01',
      batch_received_qty: 100,
      batch_avail_qty: 40,
      batch_supplier: 'Cisco Systems',
      is_serial_tracked: true,
      serial_status: 'Available',
      serial_prefix: 'SN-CSC-',
      is_expiry_tracked: false,
      expiry_warning_days: 30,
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&auto=format&fit=crop&q=60',
      status: 'Active'
    },
    {
      id: 'itm-004',
      item_code: 'CHM-CLN-0004',
      item_name: '3M Industrial Cleaning Solvent 5L Can',
      description: 'Heavy duty degreaser & surface cleaner for machine parts',
      category_id: 'cat-02',
      category_name: 'Consumables & Office',
      subcategory: 'Cleaning Supplies',
      brand_id: 'brd-05',
      brand_name: '3M Industrial',
      uom_id: 'uom-04',
      uom_symbol: 'Ltr',
      purchase_uom_id: 'uom-06',
      conversion_ratio: 5,
      tax_name: 'GST 18%',
      tax_percentage: 18,
      tax_type: 'Exclusive',
      effective_date: '2026-08-01',
      hsn_sac_code: '34029090',
      on_hand_qty: 2,
      available_qty: 2,
      min_stock_level: 5,
      max_stock_level: 30,
      reorder_level: 8,
      reorder_qty: 10,
      valuation_rate: 3400,
      warehouse: 'CHEM-STORE',
      zone: 'Zone D - Cold Storage',
      rack: 'Rack R-03',
      shelf: 'Shelf S-1',
      bin: 'Bin B-301',
      barcode: '890777888999',
      qr_code: 'CHM-CLN-0004',
      is_batch_tracked: true,
      batch_number: 'BAT-3M-2026',
      mfg_date: '2026-01-10',
      expiry_date: '2026-12-31',
      batch_received_qty: 20,
      batch_avail_qty: 2,
      batch_supplier: '3M Industrial Supplies',
      is_serial_tracked: false,
      is_expiry_tracked: true,
      expiry_warning_days: 30,
      image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300&auto=format&fit=crop&q=60',
      status: 'Active'
    },
    {
      id: 'itm-005',
      item_code: 'IT-DSK-0005',
      item_name: 'Lenovo ThinkCentre M70q Micro Desktop',
      description: 'Intel i5 12th Gen, 8GB RAM, 256GB SSD, Win 11 Pro',
      category_id: 'cat-01',
      category_name: 'IT Equipment',
      subcategory: 'Desktops',
      brand_id: 'brd-03',
      brand_name: 'Lenovo',
      uom_id: 'uom-01',
      uom_symbol: 'Pcs',
      purchase_uom_id: 'uom-01',
      conversion_ratio: 1,
      tax_name: 'GST 18%',
      tax_percentage: 18,
      tax_type: 'Exclusive',
      effective_date: '2026-08-01',
      hsn_sac_code: '84713010',
      on_hand_qty: 0,
      available_qty: 0,
      min_stock_level: 2,
      max_stock_level: 15,
      reorder_level: 5,
      reorder_qty: 5,
      valuation_rate: 58000,
      warehouse: 'IT-STORE',
      zone: 'Zone A - Electronics & IT',
      rack: 'Rack R-01',
      shelf: 'Shelf S-2',
      bin: 'Bin B-102',
      barcode: '890111222333',
      qr_code: 'IT-DSK-0005',
      is_batch_tracked: false,
      is_serial_tracked: true,
      serial_status: 'Disposed',
      serial_prefix: 'SN-LNV-',
      is_expiry_tracked: false,
      expiry_warning_days: 30,
      image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300&auto=format&fit=crop&q=60',
      status: 'Inactive'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resItems, resCats, resBrands, resUoms, resTaxes] = await Promise.all([
        fetch('/api/items').then(r => r.json()).catch(() => ({})),
        fetch('/api/categories').then(r => r.json()).catch(() => ({})),
        fetch('/api/brands').then(r => r.json()).catch(() => ({})),
        fetch('/api/uoms').then(r => r.json()).catch(() => ({})),
        fetch('/api/taxes').then(r => r.json()).catch(() => ({}))
      ]);

      if (resItems.success && Array.isArray(resItems.data) && resItems.data.length > 0) {
        // Merge API data with subcategory/status formatting
        const formatted = resItems.data.map(i => ({
          ...i,
          subcategory: i.subcategory || (categorySubcategories[i.category_id] ? categorySubcategories[i.category_id][0] : 'General'),
          brand_name: i.brand_name || i.brand || 'Generic',
          status: i.status || (i.is_active === false ? 'Inactive' : 'Active')
        }));
        setItems(formatted);
      } else {
        setItems(sampleItemsFallback);
      }

      if (resCats.success && Array.isArray(resCats.data)) setCategories(resCats.data);
      if (resBrands.success && Array.isArray(resBrands.data)) setBrands(resBrands.data);
      if (resUoms.success && Array.isArray(resUoms.data)) setUoms(resUoms.data);
      if (resTaxes.success && Array.isArray(resTaxes.data)) setTaxes(resTaxes.data);
    } catch (err) {
      console.error(err);
      setItems(sampleItemsFallback);
    }
  };

  // Validation Checkers
  const getValidationErrors = () => {
    const errors = {};
    if (!formData.item_name || !formData.item_name.trim()) {
      errors.item_name = 'Item Name is required.';
    }
    if (!formData.category_id) {
      errors.category_id = 'Category selection is required.';
    }
    if (!formData.uom_id) {
      errors.uom_id = 'Stock Unit (UOM) is required.';
    }
    if (formData.reorder_level < 0) {
      errors.reorder_level = 'Reorder level cannot be negative.';
    }
    if (Number(formData.max_stock_level) < Number(formData.min_stock_level)) {
      errors.max_stock_level = `Maximum stock level (${formData.max_stock_level}) cannot be below minimum stock level (${formData.min_stock_level}).`;
    }
    if (formData.is_expiry_tracked && formData.mfg_date && formData.expiry_date) {
      if (new Date(formData.expiry_date) <= new Date(formData.mfg_date)) {
        errors.expiry_date = 'Expiry date must be later than manufacturing date.';
      }
    }
    if (formData.barcode && formData.barcode.trim() !== '' && items.some(i => i.barcode === formData.barcode.trim() && i.id !== editingItem?.id)) {
      errors.barcode = 'Barcode matches an existing item in the system.';
    }
    return errors;
  };

  const errors = getValidationErrors();

  const handleCategoryChange = (catId) => {
    const subs = categorySubcategories[catId] || ['General'];
    setFormData({
      ...formData,
      category_id: catId,
      subcategory: subs[0]
    });
  };

  const generateBarcode = () => {
    const code = '890' + Math.floor(100000000 + Math.random() * 900000000);
    setFormData({ ...formData, barcode: code });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    setScanMessage('Scanning barcode...');
    setTimeout(() => {
      const scannedCode = '890' + Math.floor(100000000 + Math.random() * 900000000);
      setFormData({ ...formData, barcode: scannedCode });
      setScanMessage(`Barcode scanned successfully: ${scannedCode}`);
      setTimeout(() => setIsScanning(false), 1200);
    }, 1000);
  };

  // Open Create Form
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setTouched({});
    setShowCreateModal(true);
  };

  // Open Edit Form
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...initialFormState,
      ...item,
      category_id: item.category_id || 'cat-01',
      subcategory: item.subcategory || 'Laptops',
      brand_id: item.brand_id || 'brd-01',
      uom_id: item.uom_id || 'uom-01',
      purchase_uom_id: item.purchase_uom_id || 'uom-02',
      status: item.status || (item.is_active === false ? 'Inactive' : 'Active')
    });
    setTouched({});
    setShowCreateModal(true);
    setOpenActionDropdown(null);
  };

  // Open View Details Modal
  const openViewModal = (item) => {
    setShowViewModal(item);
    setOpenActionDropdown(null);
  };

  // Deactivate Action Handler
  const handleDeactivateConfirm = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!deactivateConfirmItem) return;
    const target = deactivateConfirmItem;

    setItems(prevItems => prevItems.map(i => (i.id === target.id || i.item_code === target.item_code) ? { ...i, status: 'Inactive', is_active: false } : i));
    setDeactivateConfirmItem(null);
    setOpenActionDropdown(null);

    showToastNotification(
      'warning',
      'Item Status Deactivated',
      `Item "${target.item_name}" (${target.item_code}) has been marked as Inactive.`
    );

    fetch(`/api/items/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Inactive', is_active: false })
    }).catch(err => console.error(err));
  };

  // Delete Action Handler
  const handleDeleteConfirm = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!deleteConfirmItem) return;
    const target = deleteConfirmItem;

    setItems(prevItems => prevItems.filter(i => i.id !== target.id && i.item_code !== target.item_code));
    setDeleteConfirmItem(null);
    setOpenActionDropdown(null);

    showToastNotification(
      'danger',
      'Item Master Deleted',
      `Item "${target.item_name}" (${target.item_code}) has been permanently deleted.`
    );

    fetch(`/api/items/${target.id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));
  };

  // Save/Update Handler
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setTouched({
      item_name: true,
      category_id: true,
      uom_id: true,
      reorder_level: true,
      max_stock_level: true,
      expiry_date: true
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      if (editingItem) {
        // Update Existing Item
        const updatedItems = items.map(i => {
          if (i.id === editingItem.id || i.item_code === editingItem.item_code) {
            return {
              ...i,
              ...formData,
              category_name: categories.find(c => c.id === formData.category_id)?.category_name || i.category_name,
              brand_name: brands.find(b => b.id === formData.brand_id)?.brand_name || i.brand_name || formData.brand_id,
              uom_symbol: uomOptions.find(u => u.id === formData.uom_id)?.unit_symbol || i.uom_symbol
            };
          }
          return i;
        });
        setItems(updatedItems);
        setShowCreateModal(false);
        setEditingItem(null);

        showToastNotification(
          'info',
          'Item Master Updated',
          `Item "${formData.item_name}" (${formData.item_code || editingItem.item_code}) specifications updated successfully.`
        );

        setFormData(initialFormState);

        fetch(`/api/items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }).catch(() => null);
      } else {
        // Create New Item
        const newItem = {
          id: `item-${Date.now()}`,
          item_code: formData.item_code || `ITM-${Math.floor(1000 + Math.random() * 9000)}`,
          item_name: formData.item_name,
          description: formData.description,
          category_id: formData.category_id,
          category_name: categories.find(c => c.id === formData.category_id)?.category_name || 'IT Equipment',
          subcategory: formData.subcategory || 'General',
          brand_id: formData.brand_id,
          brand_name: brands.find(b => b.id === formData.brand_id)?.brand_name || 'Dell',
          on_hand_qty: 0,
          available_qty: 0,
          uom_id: formData.uom_id,
          uom_symbol: uomOptions.find(u => u.id === formData.uom_id)?.unit_symbol || 'Pcs',
          purchase_uom_id: formData.purchase_uom_id,
          conversion_ratio: formData.conversion_ratio,
          tax_name: formData.tax_name,
          tax_percentage: formData.tax_percentage,
          tax_type: formData.tax_type,
          effective_date: formData.effective_date,
          hsn_sac_code: formData.hsn_sac_code,
          min_stock_level: formData.min_stock_level,
          max_stock_level: formData.max_stock_level,
          reorder_level: formData.reorder_level,
          reorder_qty: formData.reorder_qty,
          valuation_rate: formData.valuation_rate,
          warehouse: formData.warehouse,
          zone: formData.zone,
          rack: formData.rack,
          shelf: formData.shelf,
          bin: formData.bin,
          is_serial_tracked: formData.is_serial_tracked,
          is_batch_tracked: formData.is_batch_tracked,
          is_expiry_tracked: formData.is_expiry_tracked,
          barcode: formData.barcode,
          qr_code: formData.qr_code || formData.item_code,
          image_url: formData.image_url,
          status: formData.status
        };

        setItems([newItem, ...items]);
        setShowCreateModal(false);

        showToastNotification(
          'success',
          'Item Added',
          `Item "${newItem.item_name}" (${newItem.item_code}) added successfully.`
        );

        setFormData(initialFormState);

        fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }).catch(() => null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(i => 
    (i.item_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.item_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.category_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.subcategory || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.brand_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.hsn_sac_code || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStockUOMSymbol = () => {
    return uomOptions.find(u => u.id === formData.uom_id)?.unit_symbol || 'Pcs';
  };

  const getPurchaseUOMSymbol = () => {
    return uomOptions.find(u => u.id === formData.purchase_uom_id)?.unit_symbol || 'Box';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span>Item Master Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Permanent catalog of inventory items, specs, UOM conversions & barcode tracking.</p>
        </div>
        <button 
          type="button"
          onClick={openCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Inventory Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, category, brand, HSN..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total Items: <span className="font-bold text-slate-900">{filteredItems.length}</span>
        </div>
      </div>

      {/* ITEMS TABLE — 14 REQUIRED COLUMNS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold tracking-wider">
                <th className="p-3.5">1. Item Code</th>
                <th className="p-3.5 min-w-[200px]">2. Item Name & Specs</th>
                <th className="p-3.5">3. Category</th>
                <th className="p-3.5">4. Subcategory</th>
                <th className="p-3.5">5. Brand</th>
                <th className="p-3.5">6. Stock & UOM</th>
                <th className="p-3.5">7. Min Stock</th>
                <th className="p-3.5">8. Max Stock</th>
                <th className="p-3.5">9. Reorder Level</th>
                <th className="p-3.5">10. Reorder Qty</th>
                <th className="p-3.5">11. Valuation Rate</th>
                <th className="p-3.5">12. Tracking Features</th>
                <th className="p-3.5">13. Status</th>
                <th className="p-3.5 text-right">14. Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const availQty = item.available_qty !== undefined ? item.available_qty : (item.on_hand_qty || 0);
                const isLowStock = availQty <= item.reorder_level;
                const isInactive = item.status === 'Inactive' || item.is_active === false;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                    
                    {/* 1. Item Code */}
                    <td className="p-3.5 font-mono font-bold text-purple-700">{item.item_code}</td>

                    {/* 2. Item Name & Specifications */}
                    <td className="p-3.5 max-w-xs whitespace-normal">
                      <p className="font-bold text-slate-800 line-clamp-1">{item.item_name}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">{item.description}</p>
                      )}
                    </td>

                    {/* 3. Category */}
                    <td className="p-3.5 text-slate-700 font-medium">{item.category_name || 'IT Equipment'}</td>

                    {/* 4. Subcategory */}
                    <td className="p-3.5 text-slate-600 font-medium">{item.subcategory || 'General'}</td>

                    {/* 5. Brand */}
                    <td className="p-3.5 text-slate-700 font-semibold">{item.brand_name || item.brand || 'Dell'}</td>

                    {/* 6. Stock & UOM */}
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-emerald-600">{availQty}</span> {item.uom_symbol || 'Pcs'}
                    </td>

                    {/* 7. Minimum Stock */}
                    <td className="p-3.5 font-mono text-slate-600">{item.min_stock_level || 0} {item.uom_symbol || 'Pcs'}</td>

                    {/* 8. Maximum Stock */}
                    <td className="p-3.5 font-mono text-slate-600">{item.max_stock_level || 50} {item.uom_symbol || 'Pcs'}</td>

                    {/* 9. Reorder Level */}
                    <td className="p-3.5 font-mono text-slate-700">
                      <span>{item.reorder_level} {item.uom_symbol || 'Pcs'}</span>
                      {isLowStock && (
                        <span className="ml-2 text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                          Reorder
                        </span>
                      )}
                    </td>

                    {/* 10. Reorder Quantity */}
                    <td className="p-3.5 font-mono text-slate-600">{item.reorder_qty || 15} {item.uom_symbol || 'Pcs'}</td>

                    {/* 11. Valuation Rate */}
                    <td className="p-3.5 font-mono font-bold text-slate-800">₹{(item.valuation_rate || 0).toLocaleString()}</td>

                    {/* 12. Tracking Features */}
                    <td className="p-3.5">
                      <div className="flex space-x-1">
                        {item.is_batch_tracked && <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">BATCH</span>}
                        {item.is_serial_tracked && <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">SERIAL</span>}
                        {item.is_expiry_tracked && <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">EXPIRY</span>}
                        {!item.is_batch_tracked && !item.is_serial_tracked && !item.is_expiry_tracked && (
                          <span className="text-[10px] text-slate-400 font-normal">Standard</span>
                        )}
                      </div>
                    </td>

                    {/* 13. Status */}
                    <td className="p-3.5">
                      {isInactive ? (
                        <span className="bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center">
                          ● Inactive
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center">
                          ● Active
                        </span>
                      )}
                    </td>

                    {/* 14. Actions Dropdown / Menu */}
                    <td className="p-3.5 text-right relative">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Quick View Button */}
                        <button 
                          type="button"
                          onClick={() => openViewModal(item)}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                          title="View Complete Item Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {/* Prominent High-Visibility EDIT Button */}
                        <button 
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/20 hover:scale-105"
                          title="Edit Item Specifications"
                        >
                          <Edit className="w-3.5 h-3.5 text-white" />
                          <span>Edit</span>
                        </button>

                        {/* Actions Menu Dropdown Trigger */}
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={() => setOpenActionDropdown(openActionDropdown === item.id ? null : item.id)}
                            className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition flex items-center space-x-1 cursor-pointer"
                            title="More Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Popup Dropdown Menu */}
                          {openActionDropdown === item.id && (
                            <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button 
                                type="button"
                                onClick={() => openViewModal(item)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-purple-600" />
                                <span>View Details</span>
                              </button>

                              <button 
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2 font-medium"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit Item</span>
                              </button>

                              <button 
                                type="button"
                                onClick={() => {
                                  setShowPrintLabelModal(item);
                                  setOpenActionDropdown(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2 font-medium"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-600" />
                                <span>Print Label Sheet</span>
                              </button>

                              {!isInactive && (
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setDeactivateConfirmItem(item);
                                    setOpenActionDropdown(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center space-x-2 font-medium border-t border-slate-100"
                                >
                                  <Power className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Deactivate</span>
                                </button>
                              )}

                              <button 
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmItem(item);
                                  setOpenActionDropdown(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center space-x-2 font-medium border-t border-slate-100"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete Item</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* READ-ONLY ITEM DETAILS VIEW MODAL (ALL 22 SPECIFICATION FIELDS) */}
      {showViewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">Item Master Specifications View</h3>
                  <p className="text-xs text-slate-500 font-mono">Code: <strong className="text-purple-700">{showViewModal.item_code}</strong> | Status: <span className="font-bold text-slate-800">{showViewModal.status || 'Active'}</span></p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowViewModal(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only Form Specs Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* Basic Information */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700 border-b border-slate-200 pb-2">1. Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><span className="text-slate-400 font-bold block">Item Code:</span><p className="font-mono font-bold text-slate-900 text-sm">{showViewModal.item_code}</p></div>
                  <div><span className="text-slate-400 font-bold block">Item Name:</span><p className="font-bold text-slate-900 text-sm">{showViewModal.item_name}</p></div>
                  <div><span className="text-slate-400 font-bold block">Brand / Mfr:</span><p className="font-semibold text-slate-800">{showViewModal.brand_name || showViewModal.brand || 'Dell'}</p></div>
                  <div><span className="text-slate-400 font-bold block">Category:</span><p className="font-medium text-slate-800">{showViewModal.category_name || 'IT Equipment'}</p></div>
                  <div><span className="text-slate-400 font-bold block">Subcategory:</span><p className="font-medium text-slate-800">{showViewModal.subcategory || 'Laptops'}</p></div>
                  <div><span className="text-slate-400 font-bold block">Status:</span><span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${showViewModal.status === 'Inactive' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>{showViewModal.status || 'Active'}</span></div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Description & Specs:</span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 mt-1">{showViewModal.description || 'No detailed specifications recorded.'}</p>
                </div>
              </div>

              {/* Units & Stock */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-2">2. Units & Stock Balances</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200"><span className="text-slate-400 font-sans font-bold block text-[10px]">Stock Unit (UOM)</span><strong className="text-slate-900">{showViewModal.uom_symbol || 'Pcs'}</strong></div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200"><span className="text-slate-400 font-sans font-bold block text-[10px]">Purchase Unit</span><strong className="text-slate-900">{showViewModal.purchase_uom_id || 'Box'}</strong></div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200"><span className="text-slate-400 font-sans font-bold block text-[10px]">Conversion Ratio</span><strong className="text-blue-700">1 Box = {showViewModal.conversion_ratio || 1} Pcs</strong></div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200"><span className="text-slate-400 font-sans font-bold block text-[10px]">Valuation Rate</span><strong className="text-purple-700">₹{(showViewModal.valuation_rate || 0).toLocaleString()}</strong></div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200"><span className="text-slate-400 font-sans font-bold block text-[10px]">Min Stock Level</span><strong className="text-slate-800">{showViewModal.min_stock_level || 0}</strong></div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200"><span className="text-slate-400 font-sans font-bold block text-[10px]">Max Stock Level</span><strong className="text-slate-800">{showViewModal.max_stock_level || 50}</strong></div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200"><span className="text-slate-400 font-sans font-bold block text-[10px]">Reorder Level</span><strong className="text-amber-700">{showViewModal.reorder_level || 10}</strong></div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200"><span className="text-slate-400 font-sans font-bold block text-[10px]">Reorder Quantity</span><strong className="text-slate-800">{showViewModal.reorder_qty || 15}</strong></div>
                </div>
              </div>

              {/* Tax & Storage Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 border-b border-slate-200 pb-2">3. Tax & Classification</h4>
                  <p><span className="text-slate-400 font-bold">Tax Name:</span> <strong className="text-slate-800">{showViewModal.tax_name || 'GST 18%'}</strong></p>
                  <p><span className="text-slate-400 font-bold">Tax Type:</span> <strong className="text-slate-800">{showViewModal.tax_type || 'Exclusive'}</strong></p>
                  <p><span className="text-slate-400 font-bold">Effective Date:</span> <span className="font-mono text-slate-700">{showViewModal.effective_date || '2026-08-01'}</span></p>
                  <p><span className="text-slate-400 font-bold">HSN/SAC Code:</span> <span className="font-mono font-bold text-purple-700">{showViewModal.hsn_sac_code || '84713010'}</span></p>
                </div>

                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-700 border-b border-slate-200 pb-2">4. Storage Location Hierarchy</h4>
                  <p><span className="text-slate-400 font-bold">Warehouse:</span> <strong className="text-slate-800">{showViewModal.warehouse || 'WH-MAIN'}</strong></p>
                  <p><span className="text-slate-400 font-bold">Zone:</span> <strong className="text-slate-800">{showViewModal.zone || 'Zone A'}</strong></p>
                  <p><span className="text-slate-400 font-bold">Rack / Shelf / Bin:</span> <span className="font-mono text-slate-800">{showViewModal.rack || 'R-01'} → {showViewModal.shelf || 'S-1'} → {showViewModal.bin || 'B-101'}</span></p>
                </div>
              </div>

              {/* Identifiers & Tracking */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700 border-b border-slate-200 pb-2">5. Barcode, QR Code & Tracking Controls</h4>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center flex-1">
                    <div className="font-mono text-xs font-bold tracking-widest text-slate-900">|||| | ||| || |||| | ||||</div>
                    <p className="font-mono text-[9px] text-slate-700 font-bold mt-1">*{showViewModal.barcode || '890123456789'}*</p>
                  </div>
                  <QRCodeSVG text={showViewModal.item_code} size={70} className="shrink-0" />
                  <div className="space-y-1 text-slate-700 flex-1">
                    <p><strong className="text-slate-900">Batch Tracking:</strong> {showViewModal.is_batch_tracked ? 'Enabled (BAT-2026)' : 'Disabled'}</p>
                    <p><strong className="text-slate-900">Serial Tracking:</strong> {showViewModal.is_serial_tracked ? 'Enabled (Available/Issued)' : 'Disabled'}</p>
                    <p><strong className="text-slate-900">Expiry Tracking:</strong> {showViewModal.is_expiry_tracked ? 'Enabled (FEFO Rule)' : 'Disabled'}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button 
                type="button"
                onClick={() => {
                  const target = showViewModal;
                  setShowViewModal(null);
                  setShowPrintLabelModal(target);
                }} 
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
              >
                <Printer className="w-4 h-4 text-purple-600" />
                <span>Print Barcode Label</span>
              </button>

              <div className="flex items-center space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowViewModal(null)} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close View
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const target = showViewModal;
                    setShowViewModal(null);
                    openEditModal(target);
                  }} 
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Item Specifications</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DEACTIVATE CONFIRMATION DIALOG */}
      {deactivateConfirmItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold shrink-0">
                <Power className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">Confirm Deactivate Item</h3>
                <p className="text-xs font-mono text-purple-700 font-bold">{deactivateConfirmItem.item_code}</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">Deactivation Impact Notice:</p>
              <p>Are you sure you want to deactivate <strong>{deactivateConfirmItem.item_name}</strong>?</p>
              <p className="text-[11px] text-amber-800 mt-1">
                Inactive items remain visible in historical transactions & past log entries, but cannot be selected for new purchase orders, stock issues, or indents.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button 
                type="button"
                onClick={() => setDeactivateConfirmItem(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeactivateConfirm} 
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <Power className="w-4 h-4" />
                <span>Deactivate Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">Confirm Delete Item Master</h3>
                <p className="text-xs font-mono text-purple-700 font-bold">{deleteConfirmItem.item_code}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
              <p className="font-bold">Permanent Deletion Warning:</p>
              <p>Are you sure you want to permanently delete <strong>{deleteConfirmItem.item_name}</strong>?</p>
              <p className="text-[11px] text-rose-800 mt-1">
                This action will remove the item master record from the system catalog if not referenced in active stock transactions.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button 
                type="button"
                onClick={() => setDeleteConfirmItem(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteConfirm} 
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Item Master</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode / QR Identifier Modal */}
      {showBarcodeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm text-center shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-800">Barcode & QR Identifier</h3>
              <button type="button" onClick={() => setShowBarcodeModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <p className="font-bold text-slate-900 text-sm">{showBarcodeModal.item_name}</p>
            <p className="text-xs font-mono text-purple-700 font-bold">{showBarcodeModal.item_code}</p>

            <div className="flex items-center justify-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center flex-1">
                <div className="font-mono text-xs text-slate-900 font-bold tracking-widest text-center">
                  ||| | |||| | ||| |||| | |||
                </div>
                <p className="font-mono text-[9px] text-slate-800 mt-1 font-bold">*{showBarcodeModal.barcode || '890123456789'}*</p>
              </div>
              <QRCodeSVG text={showBarcodeModal.item_code || showBarcodeModal.barcode} size={70} className="shrink-0" />
            </div>

            <div className="space-y-2">
              <button 
                type="button"
                onClick={() => {
                  const target = showBarcodeModal;
                  setShowBarcodeModal(null);
                  setShowPrintLabelModal(target);
                }} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Barcode Label Sheet</span>
              </button>
              <button type="button" onClick={() => setShowBarcodeModal(null)} className="w-full bg-slate-100 text-slate-800 font-bold text-xs py-2 rounded-xl border border-slate-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT INVENTORY ITEM MODAL (Large Responsive Layout with 6 Logical Sections) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form 
            onSubmit={handleSave} 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading tracking-tight">
                    {editingItem ? 'Edit Inventory Item Master' : 'Create New Inventory Item'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Configure item master specifications, UOM conversions, taxation, storage location & tracking rules</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 p-1.5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body with 6 Logical Sections */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* SECTION 1 — Basic Information */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">1</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 1 — Basic Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Code */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Item Code <span className="text-slate-400 font-normal">(Leave blank for auto-gen)</span></label>
                    <input 
                      type="text" 
                      value={formData.item_code} 
                      onChange={e => setFormData({ ...formData, item_code: e.target.value })} 
                      placeholder="IT-LAP-0005" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Item Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.item_name} 
                      onBlur={() => setTouched({ ...touched, item_name: true })}
                      onChange={e => setFormData({ ...formData, item_name: e.target.value })} 
                      placeholder="Dell XPS 15 Laptop" 
                      className={`w-full bg-slate-50 border ${touched.item_name && errors.item_name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.item_name && errors.item_name && (
                      <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />{errors.item_name}</p>
                    )}
                  </div>
                </div>

                {/* Description & Specifications */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description & Specifications</label>
                  <textarea 
                    rows="2" 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Enter detailed technical specs, model numbers, component specifications..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.category_id} 
                      onChange={e => handleCategoryChange(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="cat-01">IT Equipment</option>
                      <option value="cat-02">Consumables & Office</option>
                      <option value="cat-03">Raw Materials</option>
                      <option value="cat-04">Spare Parts</option>
                      <option value="cat-05">Electrical & Cables</option>
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Subcategory <span className="text-purple-600 font-normal">(Dependent)</span></label>
                    <select 
                      value={formData.subcategory} 
                      onChange={e => setFormData({ ...formData, subcategory: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      {(categorySubcategories[formData.category_id] || ['General']).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Brand</label>
                    <select 
                      value={formData.brand_id} 
                      onChange={e => setFormData({ ...formData, brand_id: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="brd-01">Dell</option>
                      <option value="brd-02">HP</option>
                      <option value="brd-03">Lenovo</option>
                      <option value="brd-04">Cisco</option>
                      <option value="brd-05">3M Industrial</option>
                      <option value="brd-06">Generic / Unbranded</option>
                    </select>
                  </div>
                </div>

                {/* Item Image Upload & Preview */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-slate-700 font-bold mb-1.5">Item Image Upload & Preview</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/70 p-3.5 border border-slate-200 border-dashed rounded-xl">
                    <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative">
                      {formData.image_url ? (
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition inline-flex items-center space-x-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {formData.image_url && (
                          <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, image_url: null })}
                            className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            <span>Remove Image</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, WEBP (Max 2MB). Used for product gallery & audit verification.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2 — Units & Stock */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">2</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 2 — Units & Stock Conversion</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Purchase Unit */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Purchase Unit</label>
                    <select 
                      value={formData.purchase_uom_id} 
                      onChange={e => setFormData({ ...formData, purchase_uom_id: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      {uomOptions.map(u => (
                        <option key={u.id} value={u.id}>{u.unit_name} ({u.unit_symbol})</option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Unit */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stock Unit (UOM) <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.uom_id} 
                      onChange={e => setFormData({ ...formData, uom_id: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      {uomOptions.map(u => (
                        <option key={u.id} value={u.id}>{u.unit_name} ({u.unit_symbol})</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Conversion Ratio */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Conversion Ratio</label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.conversion_ratio} 
                      onChange={e => setFormData({ ...formData, conversion_ratio: Number(e.target.value) })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>

                {/* Conversion Preview Sentence */}
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center space-x-2 text-blue-900 font-medium">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Unit Conversion Rule: <strong>1 {getPurchaseUOMSymbol()}</strong> = <strong>{formData.conversion_ratio} {getStockUOMSymbol()}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                  {/* Min Stock Level */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Min Stock Level</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.min_stock_level} 
                      onChange={e => setFormData({ ...formData, min_stock_level: Number(e.target.value) })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  {/* Max Stock Level */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Max Stock Level</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.max_stock_level} 
                      onBlur={() => setTouched({ ...touched, max_stock_level: true })}
                      onChange={e => setFormData({ ...formData, max_stock_level: Number(e.target.value) })} 
                      className={`w-full bg-slate-50 border ${touched.max_stock_level && errors.max_stock_level ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.max_stock_level && errors.max_stock_level && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.max_stock_level}</p>
                    )}
                  </div>

                  {/* Reorder Level */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Reorder Level</label>
                    <input 
                      type="number" 
                      value={formData.reorder_level} 
                      onBlur={() => setTouched({ ...touched, reorder_level: true })}
                      onChange={e => setFormData({ ...formData, reorder_level: Number(e.target.value) })} 
                      className={`w-full bg-slate-50 border ${touched.reorder_level && errors.reorder_level ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500`} 
                    />
                    {touched.reorder_level && errors.reorder_level && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.reorder_level}</p>
                    )}
                  </div>

                  {/* Reorder Quantity */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Reorder Qty</label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.reorder_qty} 
                      onChange={e => setFormData({ ...formData, reorder_qty: Number(e.target.value) })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  {/* Valuation Rate */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Valuation Rate (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.valuation_rate} 
                      onChange={e => setFormData({ ...formData, valuation_rate: Number(e.target.value) })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold text-purple-700 focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3 — Tax & Classification */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">3</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 3 — Tax & Classification</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Tax Name & Rate */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tax Name & Rate</label>
                    <select 
                      value={formData.tax_name} 
                      onChange={e => {
                        const val = e.target.value;
                        let pct = 18;
                        if (val.includes('12%')) pct = 12;
                        else if (val.includes('5%')) pct = 5;
                        else if (val.includes('28%')) pct = 28;
                        else if (val.includes('Exempt')) pct = 0;
                        setFormData({ ...formData, tax_name: val, tax_percentage: pct });
                      }} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="GST 18%">GST 18% Standard</option>
                      <option value="GST 12%">GST 12% Reduced</option>
                      <option value="GST 5%">GST 5% Lower</option>
                      <option value="GST 28%">GST 28% Premium</option>
                      <option value="Exempt 0%">Exempt (0%)</option>
                    </select>
                  </div>

                  {/* Tax Type */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tax Type</label>
                    <select 
                      value={formData.tax_type} 
                      onChange={e => setFormData({ ...formData, tax_type: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Exclusive">Exclusive (Added to Base Price)</option>
                      <option value="Inclusive">Inclusive (Included in Base Price)</option>
                      <option value="IGST">IGST (Inter-State Tax)</option>
                      <option value="CGST+SGST">CGST + SGST (Intra-State Split)</option>
                    </select>
                  </div>

                  {/* Tax Effective Date */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Effective Date</label>
                    <input 
                      type="date" 
                      value={formData.effective_date} 
                      onChange={e => setFormData({ ...formData, effective_date: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  {/* HSN / SAC Code */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">HSN / SAC Code</label>
                    <input 
                      type="text" 
                      value={formData.hsn_sac_code} 
                      onChange={e => setFormData({ ...formData, hsn_sac_code: e.target.value })} 
                      placeholder="84713010" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4 — Storage Location */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">4</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 4 — Storage Location Hierarchy</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Warehouse */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Warehouse</label>
                    <select 
                      value={formData.warehouse} 
                      onChange={e => setFormData({ ...formData, warehouse: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="WH-MAIN">WH-MAIN (Main Warehouse)</option>
                      <option value="WH-SUB1">WH-SUB1 (Sub Warehouse 1)</option>
                      <option value="IT-STORE">IT-STORE (IT Store)</option>
                      <option value="CHEM-STORE">CHEM-STORE (Chemical Store)</option>
                    </select>
                  </div>

                  {/* Zone */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Zone</label>
                    <select 
                      value={formData.zone} 
                      onChange={e => setFormData({ ...formData, zone: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Zone A - Electronics & IT">Zone A - Electronics</option>
                      <option value="Zone B - Heavy Equipment">Zone B - Heavy Equipment</option>
                      <option value="Zone C - General Consumables">Zone C - Consumables</option>
                      <option value="Zone D - Cold Storage">Zone D - Cold Storage</option>
                    </select>
                  </div>

                  {/* Rack */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Rack</label>
                    <input 
                      type="text" 
                      value={formData.rack} 
                      onChange={e => setFormData({ ...formData, rack: e.target.value })} 
                      placeholder="Rack R-01" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  {/* Shelf */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Shelf</label>
                    <input 
                      type="text" 
                      value={formData.shelf} 
                      onChange={e => setFormData({ ...formData, shelf: e.target.value })} 
                      placeholder="Shelf S-1" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  {/* Bin */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bin</label>
                    <input 
                      type="text" 
                      value={formData.bin} 
                      onChange={e => setFormData({ ...formData, bin: e.target.value })} 
                      placeholder="Bin B-101" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5 — Tracking */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-5">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">5</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 5 — Tracking & Identification</h4>
                </div>

                {/* Toggles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Batch Tracking Toggle */}
                  <div className={`p-4 rounded-xl border transition ${formData.is_batch_tracked ? 'bg-cyan-50/60 border-cyan-300' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">Enable Batch Tracking</span>
                        <span className="text-[10px] text-slate-500 block">Track inventory by manufacturing lots & batches</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.is_batch_tracked} 
                        onChange={e => setFormData({ ...formData, is_batch_tracked: e.target.checked })} 
                        className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500" 
                      />
                    </label>
                  </div>

                  {/* Serial Number Tracking Toggle */}
                  <div className={`p-4 rounded-xl border transition ${formData.is_serial_tracked ? 'bg-purple-50/60 border-purple-300' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">Enable Serial Tracking</span>
                        <span className="text-[10px] text-slate-500 block">Track each piece by unique serial number</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.is_serial_tracked} 
                        onChange={e => setFormData({ ...formData, is_serial_tracked: e.target.checked })} 
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" 
                      />
                    </label>
                  </div>

                  {/* Expiry Tracking Toggle */}
                  <div className={`p-4 rounded-xl border transition ${formData.is_expiry_tracked ? 'bg-rose-50/60 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">Enable Expiry Tracking</span>
                        <span className="text-[10px] text-slate-500 block">Enforce shelf life & FEFO dispatch rules</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.is_expiry_tracked} 
                        onChange={e => setFormData({ ...formData, is_expiry_tracked: e.target.checked })} 
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500" 
                      />
                    </label>
                  </div>
                </div>

                {/* Conditional Batch Tracking Fields */}
                {formData.is_batch_tracked && (
                  <div className="p-4 bg-cyan-50/40 border border-cyan-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <h5 className="font-bold text-xs text-cyan-900 flex items-center space-x-1.5">
                      <Boxes className="w-4 h-4 text-cyan-700" />
                      <span>Batch Tracking Configuration</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Initial Batch Number</label>
                        <input type="text" value={formData.batch_number} onChange={e => setFormData({ ...formData, batch_number: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Manufacturing Date</label>
                        <input type="date" value={formData.mfg_date} onChange={e => setFormData({ ...formData, mfg_date: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Expiry Date</label>
                        <input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Received Quantity</label>
                        <input type="number" min="0" value={formData.batch_received_qty} onChange={e => setFormData({ ...formData, batch_received_qty: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Available Quantity</label>
                        <input type="number" min="0" value={formData.batch_avail_qty} onChange={e => setFormData({ ...formData, batch_avail_qty: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Supplier</label>
                        <select value={formData.batch_supplier} onChange={e => setFormData({ ...formData, batch_supplier: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium">
                          {['Dell India Pvt Ltd', 'HP Sales India', 'Lenovo Enterprise Corp', 'Cisco Systems', '3M Industrial Supplies', 'Schneider Electric'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Serial Tracking Status Badges */}
                {formData.is_serial_tracked && (
                  <div className="p-4 bg-purple-50/40 border border-purple-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <h5 className="font-bold text-xs text-purple-900 flex items-center space-x-1.5">
                      <Tag className="w-4 h-4 text-purple-700" />
                      <span>Serial Number Tracking & Supported Statuses</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Available', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                        { label: 'Issued', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                        { label: 'In Repair', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                        { label: 'Damaged', color: 'bg-rose-100 text-rose-800 border-rose-300' },
                        { label: 'Returned', color: 'bg-purple-100 text-purple-800 border-purple-300' },
                        { label: 'Disposed', color: 'bg-slate-100 text-slate-800 border-slate-300' }
                      ].map(st => (
                        <span key={st.label} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${st.color}`}>
                          ● {st.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditional Expiry Tracking & FEFO Strategy Indicator */}
                {formData.is_expiry_tracked && (
                  <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-rose-900 flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-rose-700" />
                        <span>Expiry Date Configuration</span>
                      </h5>
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                        <span>⚡ FEFO Enabled: "First Expiry, First Out"</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Manufacturing Date</label>
                        <input type="date" value={formData.mfg_date} onChange={e => setFormData({ ...formData, mfg_date: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Expiry Date</label>
                        <input 
                          type="date" 
                          value={formData.expiry_date} 
                          onBlur={() => setTouched({ ...touched, expiry_date: true })}
                          onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} 
                          className={`w-full bg-white border ${touched.expiry_date && errors.expiry_date ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-3 py-1.5 text-slate-800`} 
                        />
                        {touched.expiry_date && errors.expiry_date && (
                          <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.expiry_date}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Expiry Alert Warning (Days)</label>
                        <input type="number" min="1" value={formData.expiry_warning_days} onChange={e => setFormData({ ...formData, expiry_warning_days: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Barcode & QR Code Sub-Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  
                  {/* Barcode Sub-Panel */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <Barcode className="w-4 h-4 text-purple-600" />
                        <span>Barcode Identifier</span>
                      </label>
                      <div className="flex space-x-1.5">
                        <button type="button" onClick={generateBarcode} className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold rounded-lg transition">Generate</button>
                        <button type="button" onClick={() => setShowPrintLabelModal(formData)} className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition flex items-center space-x-1 shadow-2xs"><Printer className="w-3.5 h-3.5" /><span>Print Label Sheet</span></button>
                        <button type="button" onClick={simulateScan} className="px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 text-[10px] font-bold rounded-lg transition flex items-center space-x-1"><Scan className="w-3 h-3" /><span>Scan</span></button>
                      </div>
                    </div>

                    <input 
                      type="text" 
                      value={formData.barcode} 
                      onChange={e => setFormData({ ...formData, barcode: e.target.value })} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono font-bold" 
                    />

                    {isScanning && (
                      <div className="p-2 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg animate-pulse">
                        {scanMessage}
                      </div>
                    )}

                    {errors.barcode && (
                      <p className="text-[10px] text-rose-600 font-semibold">{errors.barcode}</p>
                    )}

                    {/* Barcode Visual Line Card */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
                      <div className="font-mono text-xs font-bold tracking-widest text-slate-900">
                        |||| | ||| || |||| | |||| | ||
                      </div>
                      <p className="font-mono text-[10px] text-slate-600 font-bold mt-1">{formData.barcode || '890123456789'}</p>
                    </div>
                  </div>

                  {/* QR Code Sub-Panel */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <QrCode className="w-4 h-4 text-purple-600" />
                        <span>QR Code Support</span>
                      </label>
                      <button type="button" onClick={() => setFormData({ ...formData, qr_code: `ITEM:${formData.item_code}|BATCH:${formData.batch_number}|URL:https://inventory.enterprise.com/assets/${formData.item_code}` })} className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold rounded-lg transition">Generate QR Payload</button>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center space-x-3">
                      {/* Authentic Vector QR Code SVG */}
                      <QRCodeSVG text={formData.qr_code || formData.item_code || 'IT-LAP-0005'} size={72} className="shrink-0" />
                      <div className="text-[10px] space-y-0.5 font-mono text-slate-600 overflow-hidden">
                        <p><strong className="text-slate-800 font-sans">Item Code:</strong> {formData.item_code || 'IT-LAP-0005'}</p>
                        <p><strong className="text-slate-800 font-sans">Batch No:</strong> {formData.batch_number}</p>
                        <p><strong className="text-slate-800 font-sans">Serial Prefix:</strong> {formData.serial_prefix}</p>
                        <p className="truncate text-purple-700"><strong className="text-slate-800 font-sans">URL:</strong> https://inventory.enterprise.com/assets/{formData.item_code || 'IT-LAP-0005'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6 — Status */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">6</div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">SECTION 6 — Lifecycle Status</h4>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">Item Status</label>
                    <p className="text-[11px] text-slate-500">
                      Inactive items remain visible in old transactions but cannot be used for new purchases or indents.
                    </p>
                  </div>

                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${formData.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Form Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-500 font-medium">
                {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 ? (
                  <div className="text-rose-600 font-bold flex flex-col space-y-0.5">
                    <span className="flex items-center text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0 text-rose-600" />
                      Please fix {Object.keys(errors).length} validation error(s):
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 pl-4">
                      {Object.values(errors).join(' • ')}
                    </span>
                  </div>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    All required specification fields configured cleanly.
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                  }} 
                  className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  {editingItem ? 'Update Item Master' : 'Save Item Master'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* BARCODE & QR CODE PRINT LABEL SHEET MODAL */}
      {showPrintLabelModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Top Bar (no-print) */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading tracking-tight">Barcode & QR Label Printing Engine</h3>
                  <p className="text-xs text-slate-500 font-medium">Item: <strong className="text-slate-800">{showPrintLabelModal.item_name || 'Dell XPS 15 Laptop'}</strong> (<span className="font-mono text-purple-700">{showPrintLabelModal.item_code || 'IT-LAP-0005'}</span>)</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  type="button"
                  onClick={() => window.print()}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ Print Labels Now (window.print)</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPrintLabelModal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Configuration Controls (no-print) */}
            <div className="p-4 bg-slate-100/80 border-b border-slate-200 no-print flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-slate-700">Label Quantity:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={printQuantity} 
                    onChange={e => setPrintQuantity(Math.max(1, Math.min(100, Number(e.target.value))))} 
                    className="w-16 bg-white border border-slate-300 rounded-xl px-2 py-1 text-center font-bold text-slate-900 font-mono shadow-2xs"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <label className="font-bold text-slate-700">Label Size / Format:</label>
                  <select 
                    value={labelFormat} 
                    onChange={e => setLabelFormat(e.target.value)} 
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1 font-medium text-slate-800 shadow-2xs"
                  >
                    <option value="grid">A4 Sheet Grid (3 Columns × Labels)</option>
                    <option value="single">Thermal Sticker (50mm × 25mm Standard)</option>
                    <option value="compact">Compact Tag (4 Columns × Mini Labels)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-[11px]">
                <span className="font-bold text-slate-500">Include Info:</span>
                <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-700">
                  <input type="checkbox" checked={includeLocation} onChange={e => setIncludeLocation(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  <span>Storage Location</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-700">
                  <input type="checkbox" checked={includePrice} onChange={e => setIncludePrice(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  <span>Valuation Rate (₹)</span>
                </label>
              </div>
            </div>

            {/* Printable Label Sheet Canvas Area (printable-area) */}
            <div className="flex-1 overflow-y-auto p-6 printable-area bg-slate-50">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="no-print bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center justify-between font-medium">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Print Preview ready. Clicking <strong>Print Labels Now</strong> sends formatted stickers directly to your connected thermal printer or PDF generator.</span>
                  </div>
                </div>

                {/* Printable Labels Grid */}
                <div className={labelFormat === 'grid' ? "grid grid-cols-3 gap-4" : labelFormat === 'compact' ? "grid grid-cols-4 gap-3" : "flex flex-wrap gap-4 justify-center"}>
                  {Array.from({ length: printQuantity }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="border-2 border-slate-900 rounded-xl p-3 bg-white text-slate-900 w-56 flex flex-col justify-between shadow-xs page-break-inside-avoid"
                    >
                      {/* Sticker Brand Header */}
                      <div className="border-b border-slate-300 pb-1 mb-1.5 flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs uppercase leading-tight line-clamp-1 text-slate-900">{showPrintLabelModal.item_name || 'Dell XPS 15 Laptop'}</h4>
                          <p className="font-mono text-[10px] text-purple-700 font-bold">{showPrintLabelModal.item_code || 'IT-LAP-0005'}</p>
                        </div>
                        {includePrice && (
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded border border-slate-300 shrink-0">
                            ₹{(showPrintLabelModal.valuation_rate || 72000).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Barcode & QR Graphic Row */}
                      <div className="my-1 py-1.5 px-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between space-x-2">
                        <div className="flex-1 text-center">
                          <div className="font-mono text-xs font-bold tracking-widest leading-none text-slate-900">
                            |||| | ||| || |||| | ||||
                          </div>
                          <p className="font-mono text-[8px] text-slate-800 font-bold mt-1">*{showPrintLabelModal.barcode || '890123456789'}*</p>
                        </div>
                        <QRCodeSVG text={showPrintLabelModal.item_code || 'IT-LAP-0005'} size={44} className="shrink-0 border-0 p-0 shadow-none bg-transparent" />
                      </div>

                      {/* QR Code & Location Row */}
                      <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-700">
                        {includeLocation ? (
                          <span className="truncate max-w-[130px]">Loc: {showPrintLabelModal.warehouse || 'WH-MAIN'} / {showPrintLabelModal.rack || 'R-01'}</span>
                        ) : (
                          <span>Cat: {showPrintLabelModal.category_name || 'IT Equipment'}</span>
                        )}
                        <span className="font-bold">HSN: {showPrintLabelModal.hsn_sac_code || '84713010'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar (no-print) */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print shrink-0">
              <span className="text-xs text-slate-500 font-medium">Ready to print {printQuantity} barcode sticker label(s)</span>
              <div className="flex items-center space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowPrintLabelModal(null)} 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition"
                >
                  Close Preview
                </button>
                <button 
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Labels Sheet</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-start space-x-3 p-4 rounded-2xl border shadow-2xl max-w-md w-full backdrop-blur-md transition ${
            toast.type === 'success' 
              ? 'bg-slate-900 text-emerald-300 border-emerald-500/60 shadow-emerald-950/40' 
              : toast.type === 'info'
              ? 'bg-slate-900 text-purple-300 border-purple-500/60 shadow-purple-950/40'
              : toast.type === 'warning'
              ? 'bg-slate-900 text-amber-300 border-amber-500/60 shadow-amber-950/40'
              : 'bg-slate-900 text-rose-300 border-rose-500/60 shadow-rose-950/40'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              toast.type === 'info' ? 'bg-purple-500/20 text-purple-400' :
              toast.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
              'bg-rose-500/20 text-rose-400'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'info' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'warning' && <Power className="w-5 h-5" />}
              {toast.type === 'danger' && <Trash2 className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="font-bold text-xs uppercase tracking-wider font-heading">{toast.title}</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-snug font-medium text-slate-200">{toast.message}</p>
            </div>

            <button 
              type="button" 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

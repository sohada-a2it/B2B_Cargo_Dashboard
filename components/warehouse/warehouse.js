// app/warehouse/page.jsx - সম্পূর্ণ ওয়্যারহাউস ম্যানেজমেন্ট সিস্টেম (ফিক্সড ভার্সন)

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getExpectedShipments, 
  receiveShipment, 
  getWarehouseReceipts,
  inspectShipment,
  getReceiptById,
  generateReceiptPDF, 
  formatLocation,
  getConditionDisplayText,
  getConditionColor ,
  deleteWarehouseReceipt
} from '@/Api/warehouse';
import { formatDate } from '@/Api/booking';
import { 
  Loader2, Package, Search, Calendar, MapPin, User, 
  X, CheckCircle, Map, AlertTriangle, Save, Boxes,
  Warehouse, Layers, Tag, Hash, Weight, Ruler, AlertOctagon,
  RefreshCw, Eye, Download, Filter, ArrowLeft, ChevronLeft, ChevronRight,
  ClipboardList, ThumbsUp, ThumbsDown, Camera, FileText, Upload, Image, Trash2,
  Home, Clock, Printer, Box, Truck, DollarSign, Plus, Minus, Edit, ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';

// ==================== CONSTANTS ====================

// Package Type wise Storage Zone Mapping
const PACKAGE_STORAGE_MAP = {
  'pallet': { zone: 'P', zoneName: 'Pallet Zone', default: 'P-1-1-1', description: 'Heavy duty pallet racking' },
  'crate': { zone: 'C', zoneName: 'Crate Zone', default: 'C-1-1-1', description: 'Wooden crate storage' },
  'wooden_box': { zone: 'W', zoneName: 'Wooden Box Zone', default: 'W-1-1-1', description: 'Wooden box storage area' },
  'carton': { zone: 'A', zoneName: 'General Carton Zone', default: 'A-1-1-1', description: 'Standard carton storage' },
  'box': { zone: 'A', zoneName: 'General Carton Zone', default: 'A-1-1-1', description: 'Standard box storage' },
  'container': { zone: 'L', zoneName: 'Large Container Zone', default: 'L-1-1-1', description: 'Empty container storage' },
  '20ft_container': { zone: 'Y20', zoneName: '20ft Container Yard', default: 'Y20-1-1-1', description: '20ft container parking' },
  '40ft_container': { zone: 'Y40', zoneName: '40ft Container Yard', default: 'Y40-1-1-1', description: '40ft container parking' },
  'loose_cargo': { zone: 'B', zoneName: 'Bulk Cargo Zone', default: 'B-1-1-1', description: 'Bulk cargo storage' },
  'loose_tires': { zone: 'T', zoneName: 'Tire Storage Zone', default: 'T-1-1-1', description: 'Tire storage racks' },
  'envelope': { zone: 'S', zoneName: 'Small Items Zone', default: 'S-1-1-1', description: 'Small parcel storage' }
};

// 🚨 DAMAGE ZONE
const DAMAGE_ZONE = {
  zone: 'DZ',
  zoneName: '🚨 DAMAGE ZONE - Inspection Area',
  default: 'DZ-1-1-1',
  description: 'Damaged goods - Awaiting inspection/disposal'
};

// Default storage
const DEFAULT_STORAGE = { 
  zone: 'G', 
  zoneName: 'General Storage', 
  default: 'G-1-1-1',
  description: 'General purpose storage'
};

// Condition options for receiving
const RECEIVE_CONDITION_OPTIONS = [
  { value: 'Good', label: '✅ Good - No damage', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'Damaged', label: '❌ Damaged - Send to DAMAGE ZONE', color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'Partial', label: '⚠️ Partially Damaged - Send to DAMAGE ZONE', color: 'text-yellow-600', bg: 'bg-yellow-50' }
];

// Condition options for inspection
const INSPECTION_CONDITION_OPTIONS = [
  { value: 'Good', label: '✅ Good - No Issues', color: 'green', icon: ThumbsUp },
  { value: 'Minor Damage', label: '⚠️ Minor Damage', color: 'yellow', icon: AlertTriangle },
  { value: 'Major Damage', label: '❌ Major Damage', color: 'red', icon: ThumbsDown }
];

const DISPOSITION_OPTIONS = [
  { value: 'restock', label: 'Restock - Return to Inventory', icon: Package },
  { value: 'scrap', label: 'Scrap - Dispose', icon: Trash2 },
  { value: 'return', label: 'Return to Supplier', icon: X },
  { value: 'rework', label: 'Rework - Repair', icon: FileText },
  { value: 'quarantine', label: 'Quarantine - Hold', icon: AlertOctagon }
];

const STATUS_COLORS = {
  'expected': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expected' },
  'received': { bg: 'bg-green-100', text: 'text-green-700', label: 'Received' },
  'inspected': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Inspected' },
  'stored': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Storage' },
  'damaged_report': { bg: 'bg-red-100', text: 'text-red-700', label: 'Damaged' },
  'shortage_report': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Shortage' }
};

const ZONE_COLORS = {
  'P': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'C': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'W': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'A': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'L': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Y20': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'Y40': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'B': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  'T': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'S': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  'DZ': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'G': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract packages from various data structures
 */
const extractPackages = (item) => {
  if (!item) return [];
  
  // Check different possible package locations
  if (item.packages && Array.isArray(item.packages) && item.packages.length > 0) {
    return item.packages;
  }
  
  if (item.receivedPackages && Array.isArray(item.receivedPackages) && item.receivedPackages.length > 0) {
    return item.receivedPackages;
  }
  
  if (item.shipmentId?.packages && Array.isArray(item.shipmentId.packages) && item.shipmentId.packages.length > 0) {
    return item.shipmentId.packages;
  }
  
  // If no packages found, return a default package based on image data
  // This handles the case from the image where packages array might be empty
  return [{
    packagingType: 'carton',
    quantity: 1,
    weight: 10,
    volume: 0.1,
    description: 'Standard Package',
    condition: 'Good'
  }];
};

/**
 * Calculate totals from packages
 */
const calculateTotals = (item) => {
  const packages = extractPackages(item);
  
  if (!packages || packages.length === 0) {
    return { totalWeight: 0, totalVolume: 0, totalItems: 0, packageCount: 0 };
  }
  
  const packageCount = packages.length;
  let totalWeight = 0;
  let totalVolume = 0;
  let totalItems = 0;
  
  packages.forEach(pkg => {
    const quantity = pkg.quantity || 1;
    totalItems += quantity;
    totalWeight += (pkg.weight || 0) * quantity;
    totalVolume += (pkg.volume || 0) * quantity;
  });
  
  return { totalWeight, totalVolume, totalItems, packageCount };
};

/**
 * Get package types from shipment
 */
const getPackageTypes = (shipment) => {
  const packages = extractPackages(shipment);
  
  if (!packages || packages.length === 0) {
    return ['carton'];
  }
  
  const types = packages.map(p => p.packagingType || p.packageType || 'carton');
  return [...new Set(types)];
};

/**
 * Get suggested storage based on package types and condition
 */
const getSuggestedStorage = (shipment, condition = 'Good') => {
  if (condition === 'Damaged' || condition === 'Partial') {
    return {
      location: DAMAGE_ZONE.default,
      zone: DAMAGE_ZONE.zoneName,
      zoneCode: DAMAGE_ZONE.zone,
      packageTypes: getPackageTypes(shipment),
      description: DAMAGE_ZONE.description,
      isDamageZone: true
    };
  }
  
  const packageTypes = getPackageTypes(shipment);
  
  if (packageTypes.length === 1) {
    const map = PACKAGE_STORAGE_MAP[packageTypes[0]] || DEFAULT_STORAGE;
    return {
      location: map.default,
      zone: map.zoneName,
      zoneCode: map.zone,
      packageTypes: packageTypes,
      description: map.description,
      isDamageZone: false
    };
  } else {
    return {
      location: 'M-1-1-1',
      zone: 'Mixed Storage Zone',
      zoneCode: 'M',
      packageTypes: packageTypes,
      description: 'Multi-type package storage',
      isDamageZone: false
    };
  }
};

const getZoneColorClass = (zoneCode) => {
  return ZONE_COLORS[zoneCode] || ZONE_COLORS['G'];
};

const formatLocationDisplay = (location) => {
  if (!location) return 'Not assigned';
  const parts = location.split('-');
  if (parts.length === 4) {
    return `${parts[0]} • Aisle ${parts[1]} • Rack ${parts[2]} • Bin ${parts[3]}`;
  }
  return location;
};

// ==================== COMPONENTS ====================

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-[#E67E22] text-white' 
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
    }`}
  >
    {children}
  </button>
);

const FilterBar = ({ filters, setFilters, total, placeholder = "Search..." }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            />
          </div>

          {filters.status !== undefined && (
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="expected">Expected</option>
              <option value="received">Received</option>
              <option value="inspected">Inspected</option>
              <option value="damaged_report">Damaged</option>
            </select>
          )}

          <button
            onClick={() => setFilters({ search: '', status: '' })}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Total: {total} items</span>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== RECEIVE & INSPECTION MODAL ====================

const WarehouseModal = ({ shipment, receipt, mode, onClose, onComplete }) => {
  const [step, setStep] = useState(mode === 'inspect' ? 'inspection' : 'receive');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Inspection states
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const [inspections, setInspections] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [findings, setFindings] = useState('');
  const [disposition, setDisposition] = useState('restock');
  const [packageErrors, setPackageErrors] = useState({});

  // Data to work with
  const data = shipment || receipt;
  const packages = extractPackages(data);

  // Initialize
  useEffect(() => {
    if (mode === 'receive') {
      const suggested = getSuggestedStorage(data, condition);
      setLocation(suggested.location);
      setSelectedPackages(packages.map((_, idx) => idx));
    } else if (mode === 'inspect' && packages.length > 0) {
      if (receipt?.inspection?.details) {
        setInspections(receipt.inspection.details);
        setFindings(receipt.inspection.findings || '');
        setDisposition(receipt.inspection.disposition || 'restock');
      } else {
        const initialInspections = packages.map((pkg, index) => ({
          packageIndex: index,
          condition: pkg.condition || 'Good',
          quantity: pkg.quantity || 1,
          passed: pkg.quantity || 1,
          failed: 0,
          notes: ''
        }));
        setInspections(initialInspections);
      }
    }
  }, [data, mode, condition, receipt]);

  useEffect(() => {
    if (mode === 'receive' && data) {
      const suggested = getSuggestedStorage(data, condition);
      setLocation(suggested.location);
    }
  }, [condition, data, mode]);

  // Toggle package selection
  const togglePackage = (index) => {
    setSelectedPackages(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const selectAllPackages = () => {
    setSelectedPackages(packages.map((_, idx) => idx));
  };

  const clearAllPackages = () => {
    setSelectedPackages([]);
  };

  // Inspection handlers
  const handleInspectionChange = (field, value) => {
    if (packages.length === 0) {
      toast.error('No packages to inspect');
      return;
    }

    const currentPkg = packages[currentPackageIndex];
    const maxQuantity = currentPkg?.quantity || 1;
    
    setInspections(prev => {
      const updated = [...prev];
      
      if (!updated[currentPackageIndex]) {
        updated[currentPackageIndex] = {
          packageIndex: currentPackageIndex,
          condition: 'Good',
          quantity: maxQuantity,
          passed: maxQuantity,
          failed: 0,
          notes: ''
        };
      }

      if (field === 'condition') {
        updated[currentPackageIndex] = {
          ...updated[currentPackageIndex],
          condition: value
        };
      }
      else if (field === 'passed' || field === 'failed') {
        const otherField = field === 'passed' ? 'failed' : 'passed';
        const otherValue = updated[currentPackageIndex]?.[otherField] || 0;
        
        const numValue = parseInt(value) || 0;
        
        if (numValue < 0) return prev;
        if (numValue + otherValue > maxQuantity) return prev;
        
        updated[currentPackageIndex] = {
          ...updated[currentPackageIndex],
          [field]: numValue
        };
      } 
      else if (field === 'notes') {
        updated[currentPackageIndex] = {
          ...updated[currentPackageIndex],
          notes: value
        };
      }
      
      return updated;
    });

    setPackageErrors(prev => ({
      ...prev,
      [currentPackageIndex]: null
    }));
  };

  const handleNext = () => {
    if (packages.length === 0) {
      toast.error('No packages to inspect');
      return;
    }
    
    if (!inspections[currentPackageIndex]) {
      toast.error('Please fill inspection for this package first');
      const currentPkg = packages[currentPackageIndex];
      if (currentPkg) {
        setInspections(prev => {
          const updated = [...prev];
          updated[currentPackageIndex] = {
            packageIndex: currentPackageIndex,
            condition: 'Good',
            quantity: currentPkg.quantity || 1,
            passed: currentPkg.quantity || 1,
            failed: 0,
            notes: ''
          };
          return updated;
        });
      }
      return;
    }

    const currentInspection = inspections[currentPackageIndex];
    const total = (currentInspection.passed || 0) + (currentInspection.failed || 0);
    const expectedTotal = packages[currentPackageIndex]?.quantity || 1;
    
    if (total !== expectedTotal) {
      setPackageErrors(prev => ({
        ...prev,
        [currentPackageIndex]: `Package ${currentPackageIndex + 1}: Total (${total}) must equal ${expectedTotal}`
      }));
      toast.error(`Quantity mismatch: Total must equal ${expectedTotal}`);
      return;
    }

    setPackageErrors(prev => ({
      ...prev,
      [currentPackageIndex]: null
    }));

    if (currentPackageIndex < packages.length - 1) {
      setCurrentPackageIndex(currentPackageIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPackageIndex > 0) {
      setCurrentPackageIndex(currentPackageIndex - 1);
    }
  };

  // Photo handlers
  const handleAddPhoto = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (photoId) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId);
      const removed = prev.find(p => p.id === photoId);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return filtered;
    });
  };

  // Submit handlers
  const handleReceiveSubmit = async () => {
    if (!location.trim()) {
      toast.error('Please enter storage location');
      return;
    }
    
    if (selectedPackages.length === 0) {
      toast.error('Please select at least one package to receive');
      return;
    }
    
    setSubmitting(true);
    
    const receiveData = {
      location: location,
      notes: notes,
      packages: selectedPackages.map(idx => ({
        ...packages[idx],
        received: true,
        receivedAt: new Date(),
        condition: condition
      })),
      condition: condition,
      receivedBy: 'warehouse_staff',
      receivedAt: new Date()
    };
    
    const result = await receiveShipment(data._id, receiveData);
    
    if (result.success) {
      if (condition === 'Damaged' || condition === 'Partial') {
        toast.warning(`⚠️ Shipment moved to DAMAGE ZONE for inspection`);
      } else {
        toast.success(`Shipment received successfully at ${formatLocationDisplay(location)}`);
      }
      
      // If received successfully, move to inspection step if needed
      if (condition === 'Damaged' || condition === 'Partial') {
        setStep('inspection');
        // Reload receipt data for inspection
        const receiptResult = await getReceiptById(data._id);
        if (receiptResult.success) {
          // Update with receipt data
          onComplete(receiptResult.data);
        }
      } else {
        onComplete();
        onClose();
      }
    } else {
      toast.error(result.message || 'Failed to receive shipment');
    }
    
    setSubmitting(false);
  };

  const handleInspectionSubmit = async () => {
    if (packages.length === 0) {
      toast.error('No packages to inspect');
      return;
    }

    // Validate all packages
    let hasError = false;
    const newErrors = {};

    inspections.forEach((insp, index) => {
      if (!insp) {
        newErrors[index] = `Package ${index + 1}: Not inspected`;
        hasError = true;
        return;
      }
      
      const total = (insp.passed || 0) + (insp.failed || 0);
      const expected = packages[index]?.quantity || 1;
      
      if (total !== expected) {
        newErrors[index] = `Package ${index + 1}: Total must equal ${expected}`;
        hasError = true;
      }
    });

    if (hasError) {
      setPackageErrors(newErrors);
      const firstErrorIndex = Object.keys(newErrors)[0];
      if (firstErrorIndex) {
        setCurrentPackageIndex(parseInt(firstErrorIndex));
      }
      toast.error('Please fix all package errors');
      return;
    }

    setSubmitting(true);
    try {
      const totalGood = inspections.reduce((sum, i) => sum + (i?.passed || 0), 0);
      const totalDamaged = inspections.reduce((sum, i) => sum + (i?.failed || 0), 0);
      
      const hasMajorDamage = inspections.some(i => i?.condition === 'Major Damage');
      const hasMinorDamage = inspections.some(i => i?.condition === 'Minor Damage');
      
      let overallCondition = 'Good';
      if (hasMajorDamage) {
        overallCondition = 'Major Damage';
      } else if (hasMinorDamage) {
        overallCondition = 'Minor Damage';
      } else if (totalDamaged > 0) {
        overallCondition = 'Minor Damage';
      }

      const inspectionData = {
        condition: overallCondition,
        findings: findings || 'Inspection completed',
        photos: photos.map(p => p.preview || p.url).filter(Boolean),
        disposition: disposition,
        details: inspections.map(insp => ({
          ...insp,
          condition: insp.condition || 'Good'
        })),
        summary: {
          totalPackages: packages.length,
          totalItems: inspections.reduce((sum, i) => sum + (i?.quantity || 1), 0),
          goodItems: totalGood,
          damagedItems: totalDamaged
        }
      };

      const receiptId = receipt?._id || data._id;
      const result = await inspectShipment(receiptId, inspectionData);
      
      if (result.success) {
        toast.success('✅ Inspection completed successfully');
        if (overallCondition !== 'Good') {
          toast.warning(`⚠️ Shipment marked as ${overallCondition}`);
        }
        onComplete();
        onClose();
      } else {
        toast.error(result.message || 'Failed to complete inspection');
      }
    } catch (error) {
      console.error('❌ Inspection error:', error);
      toast.error(error.message || 'Failed to complete inspection');
    } finally {
      setSubmitting(false);
    }
  };

  // If no packages
  if (packages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertOctagon className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              This shipment has no packages to process. Creating default package...
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const suggested = getSuggestedStorage(data, condition);
  const zoneColor = getZoneColorClass(suggested.zoneCode);

  // RECEIVE STEP
  if (step === 'receive') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Receive Shipment</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Shipment Summary */}
            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Tracking Number:</span>
                  <p className="font-medium">{data.trackingNumber || data.shipmentNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Shipment Number:</span>
                  <p className="font-medium">{data.shipmentNumber || data._id}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Customer:</span>
                  <p className="font-medium">
                    {data.customerId?.firstName || data.customerId?.companyName || 'Unknown'} {data.customerId?.lastName || ''}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Origin/Destination:</span>
                  <p className="font-medium">
                    {data.shipmentDetails?.origin || 'N/A'} → {data.shipmentDetails?.destination || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Package Summary</span>
                </div>
                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                  {packages.length} Package(s)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                <div>
                  <span className="text-gray-500">Types:</span>
                  <span className="ml-1 font-medium">
                    {[...new Set(packages.map(p => p.packagingType || p.packageType || 'carton'))].join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Total Qty:</span>
                  <span className="ml-1 font-medium">
                    {packages.reduce((sum, p) => sum + (p.quantity || 1), 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Total Weight:</span>
                  <span className="ml-1 font-medium">
                    {packages.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 1)), 0)} kg
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Total Volume:</span>
                  <span className="ml-1 font-medium">
                    {packages.reduce((sum, p) => sum + ((p.volume || 0) * (p.quantity || 1)), 0)} m³
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-Suggested Location */}
            <div className={`${zoneColor.bg} ${zoneColor.border} border rounded-lg p-4 mb-4`}>
              <div className="flex items-start">
                {condition === 'Damaged' || condition === 'Partial' ? (
                  <AlertOctagon className={`h-5 w-5 ${zoneColor.text} mt-0.5 mr-3`} />
                ) : (
                  <Map className={`h-5 w-5 ${zoneColor.text} mt-0.5 mr-3`} />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${zoneColor.text}`}>
                    {condition === 'Damaged' || condition === 'Partial' 
                      ? '🚨 DAMAGE ZONE - Inspection Required' 
                      : 'Suggested Storage Location'}
                  </p>
                  <p className={`text-xs ${zoneColor.text} mt-1`}>{suggested.description}</p>
                  <div className="mt-2">
                    <span className="text-gray-600 text-xs">Location:</span>
                    <span className={`ml-1 font-medium ${zoneColor.text}`}>{suggested.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Select Packages to Receive</label>
                <div className="space-x-2">
                  <button type="button" onClick={selectAllPackages} className="text-xs text-[#E67E22] hover:text-[#d35400]">
                    Select All
                  </button>
                  <button type="button" onClick={clearAllPackages} className="text-xs text-gray-500 hover:text-gray-700">
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                {packages.map((pkg, idx) => {
                  const storage = PACKAGE_STORAGE_MAP[pkg.packagingType || pkg.packageType] || DEFAULT_STORAGE;
                  const pkgZoneColor = getZoneColorClass(storage.zone);
                  return (
                    <label key={idx} className={`flex items-start p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPackages.includes(idx) ? pkgZoneColor.bg : 'hover:bg-gray-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedPackages.includes(idx)}
                        onChange={() => togglePackage(idx)}
                        className="mt-1 h-4 w-4 text-[#E67E22] rounded border-gray-300 focus:ring-[#E67E22]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{pkg.description || 'Package'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${pkgZoneColor.bg} ${pkgZoneColor.text}`}>
                            {pkg.packagingType || pkg.packageType || 'carton'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-gray-500">
                          <span>Qty: {pkg.quantity || 1}</span>
                          <span>Wt: {pkg.weight || 0}kg</span>
                          <span>Vol: {pkg.volume || 0}m³</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Receive Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleReceiveSubmit(); }} className="space-y-4">
              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                >
                  {RECEIVE_CONDITION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {(condition === 'Damaged' || condition === 'Partial') && (
                  <p className="text-xs text-red-500 mt-1">⚠️ This package will be sent to DAMAGE ZONE for inspection</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                    readOnly={condition === 'Damaged' || condition === 'Partial'}
                  />
                  {condition !== 'Damaged' && condition !== 'Partial' && (
                    <button
                      type="button"
                      onClick={() => {
                        const suggested = getSuggestedStorage(data, condition);
                        setLocation(suggested.location);
                      }}
                      className="ml-2 px-3 py-2 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                    >
                      Use Suggested
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {condition === 'Damaged' || condition === 'Partial' 
                    ? 'Damage Zone - Fixed location for damaged goods'
                    : 'Format: Zone-Aisle-Rack-Bin (e.g., P-1-1-1)'}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={condition === 'Damaged' || condition === 'Partial' 
                    ? 'Please describe the damage in detail...' 
                    : 'Any special notes about this receipt...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                />
              </div>

              {/* Summary */}
              <div className={`${condition === 'Damaged' || condition === 'Partial' ? 'bg-red-50' : 'bg-gray-50'} rounded-lg p-3`}>
                <p className="text-xs font-medium text-gray-700 mb-2">Receipt Summary</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Packages:</span>
                    <span className="ml-1 font-medium">{selectedPackages.length} of {packages.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-1 font-medium">{formatLocationDisplay(location)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Condition:</span>
                    <span className={`ml-1 font-medium ${condition === 'Good' ? 'text-green-600' : 'text-red-600'}`}>
                      {condition}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-1 font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedPackages.length === 0}
                  className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                    condition === 'Damaged' || condition === 'Partial'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-[#E67E22] hover:bg-[#d35400] text-white'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {condition === 'Damaged' || condition === 'Partial'
                        ? 'Send to Damage Zone'
                        : `Receive ${selectedPackages.length} Package(s)`}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // INSPECTION STEP
  const currentPkg = packages[currentPackageIndex];
  const currentInspection = inspections[currentPackageIndex] || {
    condition: 'Good',
    quantity: currentPkg?.quantity || 1,
    passed: currentPkg?.quantity || 1,
    failed: 0,
    notes: ''
  };
  const totalForCurrent = (currentInspection.passed || 0) + (currentInspection.failed || 0);
  const expectedTotal = currentPkg?.quantity || 1;
  const isTotalValid = totalForCurrent === expectedTotal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {receipt?.inspection ? 'Re-inspect Shipment' : 'Inspect Shipment'}
            </h2>
            <p className="text-sm text-gray-500">
              Receipt: {data.receiptNumber || data._id} • Package {currentPackageIndex + 1} of {packages.length}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Package Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentPackageIndex === 0}
              className={`px-3 py-1.5 rounded-lg flex items-center text-sm ${
                currentPackageIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {packages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPackageIndex(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    idx === currentPackageIndex
                      ? 'bg-[#E67E22] text-white'
                      : inspections[idx]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPackageIndex === packages.length - 1}
              className={`px-3 py-1.5 rounded-lg flex items-center text-sm ${
                currentPackageIndex === packages.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Package Details */}
        <div className="p-6">
          {/* Package Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Package Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium">{currentPkg?.packagingType || currentPkg?.packageType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="text-sm font-medium">{currentPkg?.quantity || 1} items</p>
              </div>
              {currentPkg?.weight && (
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-sm font-medium">{currentPkg.weight} kg</p>
                </div>
              )}
              {currentPkg?.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm font-medium">{currentPkg.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {packageErrors[currentPackageIndex] && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              {packageErrors[currentPackageIndex]}
            </div>
          )}

          {/* Inspection Form */}
          <div className="space-y-6">
            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INSPECTION_CONDITION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInspectionChange('condition', option.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        currentInspection.condition === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mx-auto mb-1 text-${option.color}-600`} />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Check */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Check <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Passed (Good)</label>
                  <input
                    type="number"
                    min="0"
                    max={currentPkg?.quantity || 1}
                    value={currentInspection.passed || 0}
                    onChange={(e) => handleInspectionChange('passed', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Failed (Damaged)</label>
                  <input
                    type="number"
                    min="0"
                    max={currentPkg?.quantity || 1}
                    value={currentInspection.failed || 0}
                    onChange={(e) => handleInspectionChange('failed', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Total: {totalForCurrent} of {expectedTotal} items
                </span>
                {!isTotalValid && (
                  <span className="text-red-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Quantity mismatch
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Notes</label>
              <textarea
                value={currentInspection.notes || ''}
                onChange={(e) => handleInspectionChange('notes', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                placeholder="Add any observations or issues found..."
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.preview} alt={photo.name} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-20 flex flex-col items-center justify-center cursor-pointer hover:border-[#E67E22] transition-colors">
                  <Camera className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleAddPhoto} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
              >
                {DISPOSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <textarea
                placeholder="Overall findings..."
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent w-64"
                rows="1"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleInspectionSubmit}
                disabled={submitting || !isTotalValid}
                className={`px-4 py-2 text-sm text-white rounded-lg flex items-center ${
                  submitting || !isTotalValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#E67E22] hover:bg-[#d35400]'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {receipt?.inspection ? 'Update Inspection' : 'Complete Inspection'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState('expected');
  const [expectedShipments, setExpectedShipments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('receive');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  // Details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReceiptDetails, setSelectedReceiptDetails] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    expected: 0,
    received: 0,
    inspected: 0,
    damaged: 0
  });
// পেইজের ভিতরে, useState-এর পরে এই স্টেট যোগ করুন
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [receiptToDelete, setReceiptToDelete] = useState(null);
const [deleting, setDeleting] = useState(false);

// ডিলিট হ্যান্ডলার ফাংশন যোগ করুন
const handleDeleteClick = (receipt) => {
  setReceiptToDelete(receipt);
  setShowDeleteModal(true);
};

const handleConfirmDelete = async () => {
  if (!receiptToDelete) return;
  
  setDeleting(true);
  try {
    const result = await deleteWarehouseReceipt(receiptToDelete._id);
    if (result.success) {
      toast.success(result.message || 'Receipt deleted successfully');
      setShowDeleteModal(false);
      setReceiptToDelete(null);
      loadData(); // Refresh the list
    } else {
      toast.error(result.message || 'Failed to delete receipt');
    }
  } catch (error) {
    console.error('Delete error:', error);
    toast.error(error.message || 'Failed to delete receipt');
  } finally {
    setDeleting(false);
  }
};
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'expected') {
        const result = await getExpectedShipments();
        if (result.success) {
          // Process expected shipments to ensure packages are properly extracted
          const processedShipments = result.data.map(shipment => {
            const packages = extractPackages(shipment);
            return {
              ...shipment,
              _packages: packages, // Store processed packages
              packageCount: packages.length,
              totalItems: packages.reduce((sum, p) => sum + (p.quantity || 1), 0),
              totalWeight: packages.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 1)), 0)
            };
          });
          
          setExpectedShipments(processedShipments);
          setStats(prev => ({ 
            ...prev, 
            expected: processedShipments.length 
          }));
        }
      } else {
        const result = await getWarehouseReceipts({ limit: 50 });
        if (result.success) {
          // Process receipts to ensure packages are properly extracted
          const processedReceipts = result.data.map(receipt => {
            const packages = extractPackages(receipt);
            return {
              ...receipt,
              _packages: packages,
              packageCount: packages.length,
              totalItems: packages.reduce((sum, p) => sum + (p.quantity || 1), 0),
              totalWeight: packages.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 1)), 0)
            };
          });
          
          setReceipts(processedReceipts);
          
          const received = processedReceipts.filter(r => r.status === 'received').length;
          const inspected = processedReceipts.filter(r => r.status === 'inspected').length;
          const damaged = processedReceipts.filter(r => 
            r.inspection?.condition && r.inspection.condition !== 'Good'
          ).length;
          
          setStats({
            expected: stats.expected,
            received,
            inspected,
            damaged
          });
        }
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveClick = (shipment) => {
    setSelectedShipment(shipment);
    setSelectedReceipt(null);
    setModalMode('receive');
    setShowModal(true);
  };

  const handleInspectClick = (receipt) => {
    setSelectedReceipt(receipt);
    setSelectedShipment(null);
    setModalMode('inspect');
    setShowModal(true);
  };

  const handleViewDetails = async (receipt) => {
    try {
      const result = await getReceiptById(receipt._id);
      if (result.success) {
        setSelectedReceiptDetails(result.data);
        setShowDetailsModal(true);
      } else {
        toast.error('Failed to load receipt details');
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      toast.error('Failed to load receipt details');
    }
  };

  const handleDownloadPDF = async (receiptId) => {
    try {
      const result = await generateReceiptPDF(receiptId);
      if (result.success) {
        toast.success('PDF downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleModalComplete = (updatedData) => {
    loadData();
  };

  // Filter data
  const filteredExpected = expectedShipments.filter(s => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      s.trackingNumber?.toLowerCase().includes(searchLower) ||
      s.shipmentNumber?.toLowerCase().includes(searchLower) ||
      s.customerId?.firstName?.toLowerCase().includes(searchLower) ||
      s.customerId?.lastName?.toLowerCase().includes(searchLower) ||
      s.customerId?.companyName?.toLowerCase().includes(searchLower)
    );
  });

  const filteredReceipts = receipts.filter(r => {
    if (filters.status && filters.status !== '') {
      if (filters.status === 'damaged_report') {
        if (!r.inspection || r.inspection.condition === 'Good') return false;
      } else if (r.status !== filters.status) {
        return false;
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        r.receiptNumber?.toLowerCase().includes(searchLower) ||
        r.shipmentId?.trackingNumber?.toLowerCase().includes(searchLower) ||
        r.customerId?.companyName?.toLowerCase().includes(searchLower) ||
        r.customerId?.firstName?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Warehouse className="h-6 w-6 mr-2 text-[#E67E22]" />
            Warehouse Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage expected shipments, receipts, and inspections
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Expected" value={stats.expected} icon={Package} color="blue" />
          <StatCard title="Received" value={stats.received} icon={CheckCircle} color="green" />
          <StatCard title="Inspected" value={stats.inspected} icon={ClipboardList} color="purple" />
          <StatCard title="Damaged" value={stats.damaged} icon={AlertOctagon} color="red" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-4">
          <TabButton active={activeTab === 'expected'} onClick={() => setActiveTab('expected')}>
            <Package className="h-4 w-4 inline mr-1" />
            Expected ({stats.expected})
          </TabButton>
          <TabButton active={activeTab === 'received'} onClick={() => setActiveTab('received')}>
            <CheckCircle className="h-4 w-4 inline mr-1" />
            Received 
            {/* ({stats.received}) */}
          </TabButton>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          total={activeTab === 'expected' ? filteredExpected.length : filteredReceipts.length}
          placeholder={activeTab === 'expected' ? "Search by tracking, shipment..." : "Search by receipt #, tracking..."}
        />

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
          </div>
        ) : activeTab === 'expected' ? (
          // EXPECTED SHIPMENTS
          filteredExpected.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No expected shipments</h3>
              <p className="text-xs text-gray-500 mt-1">All clear! No shipments waiting to be received.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredExpected.map((shipment) => {
                const packages = shipment._packages || extractPackages(shipment);
                const packageTypes = getPackageTypes(shipment);
                const suggested = getSuggestedStorage(shipment, 'Good');
                const zoneColor = getZoneColorClass(suggested.zoneCode);
                const totals = calculateTotals(shipment);
                
                return (
                  <div key={shipment._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 ${zoneColor.bg} rounded-lg`}>
                          <Package className={`h-5 w-5 ${zoneColor.text}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{shipment.trackingNumber || shipment.shipmentNumber}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${zoneColor.bg} ${zoneColor.text}`}>
                              {suggested.zoneCode}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{shipment.shipmentNumber}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>
                    </div>

                    {/* Package Summary */}
                    <div className="bg-blue-50 rounded-lg p-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-blue-700">Packages: {packages.length}</span>
                        <span className="text-blue-600">Total Items: {totals.totalItems}</span>
                        <span className="text-blue-600">Total Weight: {totals.totalWeight.toFixed(1)} kg</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center text-xs text-gray-600">
                        <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {shipment.customerId?.firstName || shipment.customerId?.companyName || 'Unknown'} {shipment.customerId?.lastName || ''}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {formatDate(shipment.createdAt)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {shipment.shipmentDetails?.origin || 'N/A'} → {shipment.shipmentDetails?.destination || 'N/A'}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Layers className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {totals.totalItems} items • {totals.totalWeight.toFixed(1)} kg
                      </div>
                    </div>

                    {/* Package Types */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {packages.map((pkg, idx) => {
                        const storage = PACKAGE_STORAGE_MAP[pkg.packagingType || pkg.packageType] || DEFAULT_STORAGE;
                        const pkgZoneColor = getZoneColorClass(storage.zone);
                        return (
                          <span key={idx} className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${pkgZoneColor.bg} ${pkgZoneColor.text}`}>
                            <Tag className="h-3 w-3 mr-1" />
                            {pkg.packagingType || pkg.packageType || 'carton'} x{pkg.quantity || 1}
                          </span>
                        );
                      })}
                    </div>

                    {/* Suggested Location */}
                    <div className={`p-2 rounded-lg ${zoneColor.bg} bg-opacity-50 flex items-center justify-between`}>
                      <div className="flex items-center text-xs">
                        <Map className={`h-3.5 w-3.5 mr-1.5 ${zoneColor.text}`} />
                        <span className={zoneColor.text}>
                          Suggested: <span className="font-medium">{suggested.zone}</span> • {suggested.location}
                        </span>
                      </div>
                      <button
                        onClick={() => handleReceiveClick(shipment)}
                        className="text-xs bg-[#E67E22] text-white px-4 py-1.5 rounded-lg hover:bg-[#d35400] transition-colors"
                      >
                        Receive Now →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // RECEIVED SHIPMENTS
          filteredReceipts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No receipts found</h3>
              <p className="text-xs text-gray-500 mt-1">
                {filters.search || filters.status ? 'Try adjusting your filters' : 'No shipments have been received yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
{filteredReceipts.map((receipt) => {
  const status = STATUS_COLORS[receipt.status] || STATUS_COLORS.received;
  const ConditionIcon = receipt.inspection?.condition === 'Good' ? CheckCircle : AlertOctagon;
  const packages = receipt._packages || extractPackages(receipt);
  const totalPackages = packages.reduce((sum, p) => sum + (p.quantity || 1), 0);
  const totalWeight = packages.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 1)), 0);

  return (
    <div key={receipt._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${status.bg} rounded-lg`}>
            <Package className={`h-5 w-5 ${status.text}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900">{receipt.receiptNumber}</p>
              <span className={`px-2 py-0.5 text-xs rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-gray-500">{receipt.shipmentId?.trackingNumber || 'No tracking'}</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleViewDetails(receipt)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          {/* ✅ Delete Button - Admin Only */}
          <button
            onClick={() => handleDeleteClick(receipt)}
            className="p-1.5 hover:bg-red-100 rounded-lg"
            title="Delete Receipt"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Package Summary */}
      <div className="bg-blue-50 rounded-lg p-2 mb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-blue-700">Packages: {packages.length}</span>
          <span className="text-blue-600">Items: {totalPackages}</span>
          <span className="text-blue-600">Weight: {totalWeight.toFixed(1)} kg</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center text-xs text-gray-600 mb-2">
        <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
        {receipt.customerId?.companyName || `${receipt.customerId?.firstName || ''} ${receipt.customerId?.lastName || ''}`.trim() || 'Unknown Customer'}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {formatDate(receipt.receivedDate || receipt.createdAt)}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {receipt.storageLocation?.zone ? `Zone ${receipt.storageLocation.zone}` : 'Location N/A'}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center">
          <ConditionIcon className={`h-3.5 w-3.5 mr-1 ${
            receipt.inspection?.condition === 'Good' ? 'text-green-500' : 'text-yellow-500'
          }`} />
          <span className="text-xs text-gray-600">
            {getConditionDisplayText(receipt.inspection?.condition || 'Good')}
          </span>
        </div>
        {!receipt.inspection ? (
          <button
            onClick={() => handleInspectClick(receipt)}
            className="text-xs bg-[#E67E22] text-white px-3 py-1 rounded-lg hover:bg-[#d35400]"
          >
            Inspect
          </button>
        ) : (
          <button
            onClick={() => handleInspectClick(receipt)}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200"
          >
            Re-inspect
          </button>
        )}
      </div>
    </div>
  );
})}
            </div>
          )
        )}
      </div>

      {/* Combined Receive/Inspect Modal */}
      {showModal && (
        <WarehouseModal
          shipment={selectedShipment}
          receipt={selectedReceipt}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onComplete={handleModalComplete}
        />
      )}

      {/* Receipt Details Modal */}
      {showDetailsModal && selectedReceiptDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Receipt Details</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedReceiptDetails.receipt?.receiptNumber || 'N/A'}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Status Badge */}
              {selectedReceiptDetails.receipt?.status && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${
                  STATUS_COLORS[selectedReceiptDetails.receipt.status]?.bg || 'bg-gray-100'
                } ${
                  STATUS_COLORS[selectedReceiptDetails.receipt.status]?.text || 'text-gray-700'
                } text-sm mb-4`}>
                  {STATUS_COLORS[selectedReceiptDetails.receipt.status]?.label || selectedReceiptDetails.receipt.status}
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-3 gap-4">
                {/* Left Column - Main Info */}
                <div className="col-span-2 space-y-4">
                  {/* Shipment Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Shipment Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Tracking Number</p>
                        <p className="text-sm font-medium">{selectedReceiptDetails.receipt?.shipmentId?.trackingNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Shipment Number</p>
                        <p className="text-sm font-medium">{selectedReceiptDetails.receipt?.shipmentId?.shipmentNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Origin</p>
                        <p className="text-sm">{selectedReceiptDetails.receipt?.shipmentId?.shipmentDetails?.origin || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Destination</p>
                        <p className="text-sm">{selectedReceiptDetails.receipt?.shipmentId?.shipmentDetails?.destination || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Company</p>
                        <p className="text-sm font-medium">{selectedReceiptDetails.receipt?.customerId?.companyName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contact Person</p>
                        <p className="text-sm">
                          {selectedReceiptDetails.receipt?.customerId?.firstName || ''} {selectedReceiptDetails.receipt?.customerId?.lastName || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm">{selectedReceiptDetails.receipt?.customerId?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm">{selectedReceiptDetails.receipt?.customerId?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Packages List */}
                  {extractPackages(selectedReceiptDetails.receipt).length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Received Packages</h3>
                      <div className="space-y-2">
                        {extractPackages(selectedReceiptDetails.receipt).map((pkg, idx) => {
                          const conditionColor = pkg.condition === 'Good' ? 'bg-green-100' : 'bg-red-100';
                          return (
                            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">{pkg.description || 'Package'}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${conditionColor}`}>
                                      {pkg.condition || 'Good'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-4 mt-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">Type:</span>
                                      <span className="ml-1 font-medium">{pkg.packagingType || pkg.packageType || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Qty:</span>
                                      <span className="ml-1 font-medium">{pkg.quantity || 1}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Weight:</span>
                                      <span className="ml-1 font-medium">{pkg.weight || 0} kg</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Volume:</span>
                                      <span className="ml-1 font-medium">{pkg.volume || 0} m³</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Storage & Meta */}
                <div className="space-y-4">
                  {/* Storage Location */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Storage Location</h3>
                    {selectedReceiptDetails.receipt?.storageLocation?.zone ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Zone:</span>
                          <span className="font-medium">{selectedReceiptDetails.receipt.storageLocation.zone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Aisle:</span>
                          <span className="font-medium">{selectedReceiptDetails.receipt.storageLocation.aisle}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Rack:</span>
                          <span className="font-medium">{selectedReceiptDetails.receipt.storageLocation.rack}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Bin:</span>
                          <span className="font-medium">{selectedReceiptDetails.receipt.storageLocation.bin}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not assigned</p>
                    )}
                  </div>

                  {/* Inspection Info */}
                  {selectedReceiptDetails.receipt?.inspection?.condition && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Inspection Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Condition:</span>
                          <span className={`font-medium ${
                            selectedReceiptDetails.receipt.inspection.condition === 'Good' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedReceiptDetails.receipt.inspection.condition}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Findings:</span>
                          <p className="mt-1 text-sm">{selectedReceiptDetails.receipt.inspection.findings || 'No issues'}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Inspected By:</span>
                          <span className="font-medium">
                            {selectedReceiptDetails.receipt.inspection.conductedBy?.firstName || 'Staff'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium">
                            {selectedReceiptDetails.receipt.inspection.conductedAt ? formatDate(selectedReceiptDetails.receipt.inspection.conductedAt) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Receipt Info</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Received By:</span>
                        <span className="font-medium">{selectedReceiptDetails.receipt?.receivedBy?.firstName || 'Warehouse'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium">
                          {selectedReceiptDetails.receipt?.receivedDate ? formatDate(selectedReceiptDetails.receipt.receivedDate) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="font-medium">
                          {selectedReceiptDetails.receipt?.createdAt ? formatDate(selectedReceiptDetails.receipt.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedReceiptDetails.receipt?.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                      <p className="text-sm text-gray-600">{selectedReceiptDetails.receipt.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2"> 
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleInspectClick(selectedReceiptDetails.receipt);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      {selectedReceiptDetails.receipt.inspection ? 'Re-inspect' : 'Inspect'}
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
{showDeleteModal && receiptToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full p-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Receipt</h3>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete receipt <strong>{receiptToDelete.receiptNumber}</strong>?
          <br />
          <span className="text-xs text-red-500 mt-1 block">
            This action cannot be undone. All associated data will be permanently removed.
          </span>
        </p>
        
        {/* Receipt Summary */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Tracking:</span>
              <span className="ml-1 font-medium">{receiptToDelete.shipmentId?.trackingNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                receiptToDelete.status === 'inspected' ? 'bg-blue-100 text-blue-700' :
                receiptToDelete.status === 'damaged_report' ? 'bg-red-100 text-red-700' :
                'bg-green-100 text-green-700'
              }`}>
                {receiptToDelete.status || 'received'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Packages:</span>
              <span className="ml-1 font-medium">{receiptToDelete._packages?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="ml-1 font-medium">{formatDate(receiptToDelete.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
              deleting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
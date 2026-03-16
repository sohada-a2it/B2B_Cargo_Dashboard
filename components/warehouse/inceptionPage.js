'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getWarehouseReceipts,
  inspectShipment,
  getReceiptById,
  formatLocation,
  getConditionDisplayText
} from '@/Api/warehouse';
import { formatDate } from '@/Api/booking';
import { 
  Loader2, Package, Search, Calendar, MapPin, User, 
  X, CheckCircle, AlertOctagon, Camera, FileText, Download,
  ArrowLeft, ChevronLeft, ChevronRight, Eye, Filter,
  ClipboardList, ThumbsUp, ThumbsDown, AlertTriangle,
  Save, Upload, Image, Trash2, Plus, Minus
} from 'lucide-react';
import { toast } from 'react-toastify';

// ==================== CONSTANTS ====================

const INSPECTION_STATUS = {
  pending: { label: 'Pending Inspection', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  inspected: { label: 'Inspected', bg: 'bg-green-100', text: 'text-green-700' },
  passed: { label: 'Passed', bg: 'bg-green-100', text: 'text-green-700' },
  failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700' }
};

const CONDITION_OPTIONS = [
  { 
    value: 'Good',           // ✅ model এ 'Good' আছে
    label: '✅ Good - No Issues', 
    color: 'green', 
    icon: ThumbsUp 
  },
  { 
    value: 'Minor Damage',    // ✅ model এ 'Minor Damage' আছে
    label: '⚠️ Minor Damage', 
    color: 'yellow', 
    icon: AlertTriangle 
  },
  { 
    value: 'Major Damage',    // ✅ model এ 'Major Damage' আছে
    label: '❌ Major Damage', 
    color: 'red', 
    icon: ThumbsDown 
  }, 
];

const DISPOSITION_OPTIONS = [
  { value: 'restock', label: 'Restock - Return to Inventory', icon: Package },
  { value: 'scrap', label: 'Scrap - Dispose', icon: Trash2 },
  { value: 'return', label: 'Return to Supplier', icon: X },
  { value: 'rework', label: 'Rework - Repair', icon: FileText },
  { value: 'quarantine', label: 'Quarantine - Hold', icon: AlertOctagon }
];

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

const FilterBar = ({ filters, setFilters, total }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt #..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending Inspection</option>
            <option value="inspected">Inspected</option>
            <option value="damaged">Damaged</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', status: '' })}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Total: {total} items</span>
        </div>
      </div>
    </div>
  );
};

const InspectionCard = ({ receipt, onInspect }) => {
  const status = receipt.inspection?.condition 
    ? INSPECTION_STATUS.inspected 
    : INSPECTION_STATUS.pending;

  const totalPackages = receipt.packages?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${status.bg} rounded-lg`}>
            <Package className={`h-5 w-5 ${status.text}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900">
                {receipt.receiptNumber}
              </p>
              <span className={`px-2 py-0.5 text-xs rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {receipt.shipmentId?.trackingNumber || 'No tracking'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center text-xs text-gray-600 mb-2">
        <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
        {receipt.customerId?.companyName || receipt.customerId?.firstName || 'Unknown Customer'}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {formatDate(receipt.receivedAt || receipt.createdAt)}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {receipt.storageLocation?.zone ? `Zone ${receipt.storageLocation.zone}` : 
           receipt.storageLocation?.fullLocation || 'N/A'}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Package className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {totalPackages} items
        </div>
      </div>

      {receipt.inspection ? (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">Condition:</span>
            <span className={`px-2 py-0.5 rounded-full ${
              receipt.inspection.condition === 'Good' ? 'bg-green-100 text-green-700' : 
              receipt.inspection.condition === 'Minor Damage' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {receipt.inspection.condition}
            </span>
          </div>
          {receipt.inspection.findings && (
            <p className="text-xs text-gray-500 mt-1">{receipt.inspection.findings}</p>
          )}
        </div>
      ) : (
        <div className="mb-3 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending inspection
        </div>
      )}

      <button
        onClick={() => onInspect(receipt)}
        className={`w-full px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
          receipt.inspection 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-[#E67E22] text-white hover:bg-[#d35400]'
        }`}
      >
        <ClipboardList className="h-4 w-4 mr-2" />
        {receipt.inspection ? 'View / Re-inspect' : 'Start Inspection'}
      </button>
    </div>
  );
};

// inspection/page.jsx - InspectionModal এর আপডেটেড ভার্সন
 

const InspectionModal = ({ receipt, onClose, onComplete }) => {
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const [inspections, setInspections] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [findings, setFindings] = useState('');
  const [disposition, setDisposition] = useState('restock');
  const [loading, setLoading] = useState(false);
  const [packageErrors, setPackageErrors] = useState({});

  // 🟢🟢🟢 গুরুত্বপূর্ণ: packages ডাটা চেক করা
  console.log('🟢 Receipt data:', receipt);
  console.log('🟢 Packages from receipt:', receipt?.packages);
  
  // Safely get packages with fallback
  const packages = receipt?.packages || [];
  
  // Log if packages is empty
  useEffect(() => {
    if (packages.length === 0) {
      console.warn('⚠️ No packages found in receipt!');
      console.log('Receipt structure:', receipt);
    }
  }, [receipt]);

  // Initialize inspections from receipt data
  useEffect(() => {
    console.log('📦 Initializing inspections with packages:', packages.length);
    
    if (packages.length > 0) {
      if (receipt.inspection?.details) {
        console.log('📋 Loading existing inspection data');
        setInspections(receipt.inspection.details);
        setFindings(receipt.inspection.findings || '');
        setDisposition(receipt.inspection.disposition || 'restock');
      } else {
        console.log('🆕 Creating new inspection for', packages.length, 'packages');
        const initialInspections = packages.map((pkg, index) => {
          console.log(`Package ${index}:`, pkg);
          return {
            packageIndex: index,
            condition: pkg.condition || 'Good',
            quantity: pkg.quantity || 1,
            passed: pkg.quantity || 1,
            failed: 0,
            notes: ''
          };
        });
        console.log('✅ Initial inspections created:', initialInspections);
        setInspections(initialInspections);
      }
    } else {
      console.warn('❌ Cannot initialize - no packages!');
    }
  }, [receipt]);

  // Handle input changes
  // inspection/page.jsx - handleInspectionChange ফাংশন আপডেট

const handleInspectionChange = (field, value) => {
  console.log('✏️ Changing field:', field, 'to:', value);
  
  if (packages.length === 0) {
    toast.error('No packages to inspect');
    return;
  }

  const currentPkg = packages[currentPackageIndex];
  const maxQuantity = currentPkg?.quantity || 1;
  
  setInspections(prev => {
    const updated = [...prev];
    
    // Initialize if not exists
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

    // Handle condition field specifically
    if (field === 'condition') {
      console.log('🎯 Setting condition to:', value);
      updated[currentPackageIndex] = {
        ...updated[currentPackageIndex],
        condition: value  // ✅ Directly set the condition
      };
    }
    else if (field === 'passed' || field === 'failed') {
      const otherField = field === 'passed' ? 'failed' : 'passed';
      const otherValue = updated[currentPackageIndex]?.[otherField] || 0;
      
      const numValue = parseInt(value) || 0;
      
      if (numValue < 0) {
        toast.warning('Value cannot be negative');
        return prev;
      }
      
      if (numValue + otherValue > maxQuantity) {
        toast.warning(`Total cannot exceed ${maxQuantity} items`);
        return prev;
      }
      
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

  // Clear error for this package
  setPackageErrors(prev => ({
    ...prev,
    [currentPackageIndex]: null
  }));
};

  // ========== নেক্সট বাটনের হ্যান্ডলার ==========
  const handleNext = () => {
    console.log('➡️ Next button clicked - Current index:', currentPackageIndex);
    console.log('Total packages:', packages.length);
    
    // Check if packages exist
    if (packages.length === 0) {
      toast.error('No packages to inspect');
      return;
    }
    
    // Check if current package has inspection data
    if (!inspections[currentPackageIndex]) {
      console.log('⚠️ No inspection data for package', currentPackageIndex);
      toast.error('Please fill inspection for this package first');
      
      // Create default inspection for current package
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

    // Validate current package
    const currentInspection = inspections[currentPackageIndex];
    const total = (currentInspection.passed || 0) + (currentInspection.failed || 0);
    const expectedTotal = packages[currentPackageIndex]?.quantity || 1;
    
    console.log('✅ Validation:', { total, expectedTotal });
    
    if (total !== expectedTotal) {
      const errorMsg = `Package ${currentPackageIndex + 1}: Total (${total}) must equal ${expectedTotal}`;
      setPackageErrors(prev => ({
        ...prev,
        [currentPackageIndex]: errorMsg
      }));
      toast.error(errorMsg);
      return;
    }

    // Clear error for this package
    setPackageErrors(prev => ({
      ...prev,
      [currentPackageIndex]: null
    }));

    // Go to next package
    if (currentPackageIndex < packages.length - 1) {
      const nextIndex = currentPackageIndex + 1;
      console.log('✅ Moving to next package:', nextIndex);
      setCurrentPackageIndex(nextIndex);
    } else {
      console.log('📌 Already at last package');
    }
  };

  // ========== প্রিভিয়াস বাটনের হ্যান্ডলার ==========
  const handlePrevious = () => {
    console.log('⬅️ Previous button clicked - Current index:', currentPackageIndex);
    if (currentPackageIndex > 0) {
      setCurrentPackageIndex(currentPackageIndex - 1);
    }
  };

  // ========== সাবমিট হ্যান্ডলার ==========
  // inspection/page.jsx - handleSubmit ফাংশন আপডেট

const handleSubmit = async () => {
  console.log('📤 Submit button clicked');
  
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
    
    // Find first error and go to that package
    const firstErrorIndex = Object.keys(newErrors)[0];
    if (firstErrorIndex) {
      setCurrentPackageIndex(parseInt(firstErrorIndex));
    }
    
    toast.error('Please fix all package errors');
    return;
  }

  setLoading(true);
  try {
    // Calculate totals
    const totalGood = inspections.reduce((sum, i) => sum + (i?.passed || 0), 0);
    const totalDamaged = inspections.reduce((sum, i) => sum + (i?.failed || 0), 0);
    
    // Determine overall condition - এটা model এর সাথে match করুন
    let overallCondition = 'Good';
    
    // Check if any package has Major Damage or Minor Damage
    const hasMajorDamage = inspections.some(i => i?.condition === 'Major Damage');
    const hasMinorDamage = inspections.some(i => i?.condition === 'Minor Damage');
    const hasGood = inspections.some(i => i?.condition === 'Good');
    
    if (hasMajorDamage) {
      overallCondition = 'Major Damage';
    } else if (hasMinorDamage && !hasGood) {
      overallCondition = 'Minor Damage';
    } else if (hasMinorDamage && hasGood) {
      overallCondition = 'Minor Damage'; // Mixed but some damage
    } else if (totalDamaged > 0) {
      // If quantity mismatch but condition is Good
      overallCondition = 'Minor Damage';
    }
    
    console.log('📊 Overall condition:', overallCondition);

    const inspectionData = {
      condition: overallCondition,  // ✅ 'Major Damage' or 'Minor Damage' or 'Good'
      findings: findings || 'Inspection completed',
      photos: photos.map(p => p.preview || p.url).filter(Boolean),
      disposition: disposition,
      details: inspections.map(insp => ({
        ...insp,
        // Ensure each package's condition is saved
        condition: insp.condition || 'Good'
      })),
      summary: {
        totalPackages: packages.length,
        totalItems: inspections.reduce((sum, i) => sum + (i?.quantity || 1), 0),
        goodItems: totalGood,
        damagedItems: totalDamaged
      }
    };

    console.log('📦 Submitting inspection:', inspectionData);

    const result = await inspectShipment(receipt._id, inspectionData);
    
    if (result.success) {
      toast.success('✅ Inspection completed successfully');
      
      // Show appropriate message based on condition
      if (overallCondition !== 'Good') {
        toast.warning(`⚠️ Shipment marked as ${overallCondition}`, {
          autoClose: 5000
        });
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
    setLoading(false);
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

  // Debug render
  console.log('🎨 Render - Current index:', currentPackageIndex, 'Packages:', packages.length);
  console.log('📊 Inspections:', inspections);

  if (!receipt) {
    console.log('❌ No receipt data');
    return null;
  }

  // If no packages, show error message
  if (packages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertOctagon className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              This receipt has no packages to inspect. Please check the receipt data.
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
            {receipt.inspection ? 'Re-inspect Shipment' : 'Inspect Shipment'}
          </h2>
          <p className="text-sm text-gray-500">
            Receipt: {receipt.receiptNumber} • Package {currentPackageIndex + 1} of {packages.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
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
              <p className="text-sm font-medium">{currentPkg?.packageType || 'N/A'}</p>
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
              {CONDITION_OPTIONS.map((option) => {
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection Notes
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.preview}
                    alt={photo.name}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
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
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddPhoto}
                  className="hidden"
                />
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
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
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
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !isTotalValid}
              className={`px-4 py-2 text-sm text-white rounded-lg flex items-center ${
                loading || !isTotalValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#E67E22] hover:bg-[#d35400]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {receipt.inspection ? 'Update Inspection' : 'Complete Inspection'}
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

// ==================== MAIN COMPONENT ====================

export default function InspectionPage() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [stats, setStats] = useState({
    pending: 0,
    inspected: 0,
    damaged: 0,
    total: 0
  });

  useEffect(() => {
    loadReceipts();
  }, [filters]);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const result = await getWarehouseReceipts({
        status: filters.status || undefined,
        search: filters.search || undefined,
        limit: 50
      });
      
      if (result.success) {
        setReceipts(result.data);
        
        // Calculate stats
        const pending = result.data.filter(r => !r.inspection).length;
        const inspected = result.data.filter(r => r.inspection).length;
        const damaged = result.data.filter(r => 
          r.inspection?.condition && r.inspection.condition !== 'Good'
        ).length;
        
        setStats({
          pending,
          inspected,
          damaged,
          total: result.pagination?.total || result.data.length
        });
      } else {
        toast.error('Failed to load receipts');
      }
    } catch (error) {
      console.error('Load receipts error:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (receipt) => {
    setSelectedReceipt(receipt);
    setShowInspectionModal(true);
  };

  const handleInspectionComplete = () => {
    loadReceipts();
  };

  // Filter receipts based on search and status
  const filteredReceipts = receipts.filter(r => {
    // Status filter
    if (filters.status === 'pending' && r.inspection) return false;
    if (filters.status === 'inspected' && !r.inspection) return false;
    if (filters.status === 'damaged' && (!r.inspection || r.inspection.condition === 'Good')) return false;
    
    // Search filter
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
          <div className="flex items-center space-x-3 mb-4">
            <Link href="/warehouse" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ClipboardList className="h-6 w-6 mr-2 text-[#E67E22]" />
                Inspection Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Inspect received shipments and update inventory
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Pending Inspection"
              value={stats.pending}
              icon={ClipboardList}
              color="yellow"
            />
            <StatCard
              title="Inspected"
              value={stats.inspected}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Damaged"
              value={stats.damaged}
              icon={AlertOctagon}
              color="red"
            />
            <StatCard
              title="Total Receipts"
              value={stats.total}
              icon={Package}
              color="blue"
            />
          </div>

          {/* Filters */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            total={filteredReceipts.length}
          />
        </div>

        {/* Receipts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No items to inspect</h3>
            <p className="text-xs text-gray-500 mt-1">
              {filters.search || filters.status 
                ? 'No receipts match your filters' 
                : 'All shipments have been inspected'}
            </p>
            {(filters.search || filters.status) && (
              <button
                onClick={() => setFilters({ search: '', status: '' })}
                className="mt-3 text-sm text-[#E67E22] hover:text-[#d35400]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReceipts.map((receipt) => (
              <InspectionCard
                key={receipt._id}
                receipt={receipt}
                onInspect={handleInspect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Inspection Modal */}
      {showInspectionModal && selectedReceipt && (
        <InspectionModal
          receipt={selectedReceipt}
          onClose={() => setShowInspectionModal(false)}
          onComplete={handleInspectionComplete}
        />
      )}
    </div>
  );
}
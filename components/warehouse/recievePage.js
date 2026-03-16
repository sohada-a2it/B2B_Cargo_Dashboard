// app/warehouse/received/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getWarehouseReceipts, 
  getReceiptById,
  generateReceiptPDF,
  formatLocation,
  getConditionDisplayText,
  getConditionColor 
} from '@/Api/warehouse';
import { formatDate } from '@/Api/booking';
import { 
  Loader2, Package, Search, Calendar, MapPin, User, 
  X, CheckCircle, FileText, Download, Eye, Filter,
  Warehouse, Layers, Tag, Hash, Weight, Ruler, AlertOctagon,
  RefreshCw, Printer, ArrowLeft, ChevronLeft, ChevronRight,
  Box, Truck, Home, DollarSign, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

// ==================== CONSTANTS ====================

const STATUS_COLORS = {
  'expected': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expected' },
  'received': { bg: 'bg-green-100', text: 'text-green-700', label: 'Received' },
  'inspected': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Inspected' },
  'stored': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Storage' },
  'damaged_report': { bg: 'bg-red-100', text: 'text-red-700', label: 'Damaged' },
  'shortage_report': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Shortage' }
};

const CONDITION_BADGES = {
  'Good': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  'Damaged': { bg: 'bg-red-100', text: 'text-red-700', icon: AlertOctagon },
  'Partial': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertOctagon },
  'Minor Damage': { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertOctagon },
  'Major Damage': { bg: 'bg-red-100', text: 'text-red-700', icon: AlertOctagon }
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

const FilterBar = ({ filters, setFilters, total }) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt #, tracking..."
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
            <option value="received">Received</option>
            <option value="inspected">Inspected</option>
            <option value="stored">In Storage</option>
            <option value="damaged_report">Damaged</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Total: {total} receipts</span>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Zone</label>
            <select
              value={filters.zone}
              onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="">All Zones</option>
              <option value="A">Zone A - General</option>
              <option value="B">Zone B - Bulk</option>
              <option value="T">Zone T - Tires</option>
              <option value="P">Zone P - Pallets</option>
              <option value="DZ">Zone DZ - Damage</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', status: '', dateFrom: '', dateTo: '', zone: '' })}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReceiptCard = ({ receipt, onView, onDownload }) => {
  const status = STATUS_COLORS[receipt.status] || STATUS_COLORS.received;
  const ConditionIcon = CONDITION_BADGES[receipt.inspection?.condition]?.icon || CheckCircle;
  
  // Calculate totals
  const totalPackages = receipt.receivedPackages?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 0;
  const totalWeight = receipt.receivedPackages?.reduce((sum, p) => sum + (p.weight || 0), 0) || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
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
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(receipt)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDownload(receipt._id)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            title="Download PDF"
          >
            <Download className="h-4 w-4 text-gray-600" />
          </button>
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
          {formatDate(receipt.receivedDate)}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {receipt.storageLocation ? 
            `Zone ${receipt.storageLocation.zone}` : 
            'Location N/A'}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Box className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {totalPackages} items
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Weight className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {totalWeight} kg
        </div>
      </div>

      {/* Packages Preview */}
      <div className="flex flex-wrap gap-1 mb-2">
        {receipt.receivedPackages?.slice(0, 3).map((pkg, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
          >
            {pkg.packageType} x{pkg.quantity || 1}
          </span>
        ))}
        {receipt.receivedPackages?.length > 3 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
            +{receipt.receivedPackages.length - 3} more
          </span>
        )}
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
        <span className="text-xs text-gray-400">
          Received by: {receipt.receivedBy?.firstName || 'Warehouse Staff'}
        </span>
      </div>
    </div>
  );
};

// app/warehouse/received/page.jsx - ReceiptDetailsModal কম্পোনেন্ট আপডেট

const ReceiptDetailsModal = ({ receipt, onClose, onDownload }) => {
  if (!receipt) return null;

  // receipt object টি হতে পারে { receipt: {...}, inventory: [...] } অথবা সরাসরি receipt
  const receiptData = receipt.receipt || receipt;
  
  console.log('📦 Rendering modal with data:', receiptData);

  const status = STATUS_COLORS[receiptData.status] || STATUS_COLORS.received;

  // Safe data access with fallbacks
  const shipment = receiptData.shipmentId || {};
  const customer = receiptData.customerId || {};
  const receivedBy = receiptData.receivedBy || {};
  const storageLocation = receiptData.storageLocation || {};
  const inspection = receiptData.inspection || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Receipt Details</h2>
              <p className="text-sm text-gray-500 mt-1">{receiptData.receiptNumber || 'N/A'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Status Badge */}
          {receiptData.status && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full ${status.bg} ${status.text} text-sm mb-4`}>
              {status.label}
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
                    <p className="text-sm font-medium">{shipment.trackingNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipment Number</p>
                    <p className="text-sm font-medium">{shipment.shipmentNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="text-sm">{shipment.shipmentDetails?.origin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="text-sm">{shipment.shipmentDetails?.destination || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium">{customer.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact Person</p>
                    <p className="text-sm">
                      {customer.firstName || ''} {customer.lastName || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm">{customer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm">{customer.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Packages List */}
              {receiptData.receivedPackages?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Received Packages</h3>
                  <div className="space-y-2">
                    {receiptData.receivedPackages.map((pkg, idx) => {
                      const conditionColor = CONDITION_BADGES[pkg.condition]?.bg || 'bg-gray-100';
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
                                  <span className="ml-1 font-medium">{pkg.packageType}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Qty:</span>
                                  <span className="ml-1 font-medium">{pkg.quantity}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Weight:</span>
                                  <span className="ml-1 font-medium">{pkg.weight} kg</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Volume:</span>
                                  <span className="ml-1 font-medium">{pkg.volume} m³</span>
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
                {storageLocation.zone ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Zone:</span>
                      <span className="font-medium">{storageLocation.zone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Aisle:</span>
                      <span className="font-medium">{storageLocation.aisle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rack:</span>
                      <span className="font-medium">{storageLocation.rack}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bin:</span>
                      <span className="font-medium">{storageLocation.bin}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not assigned</p>
                )}
              </div>

              {/* Inspection Info */}
              {inspection.condition && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Inspection Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Condition:</span>
                      <span className={`font-medium ${
                        inspection.condition === 'Good' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inspection.condition}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Findings:</span>
                      <p className="mt-1 text-sm">{inspection.findings || 'No issues'}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Inspected By:</span>
                      <span className="font-medium">
                        {inspection.conductedBy?.firstName || 'Staff'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium">
                        {inspection.conductedAt ? formatDate(inspection.conductedAt) : 'N/A'}
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
                    <span className="font-medium">{receivedBy.firstName || 'Warehouse'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">
                      {receiptData.receivedDate ? formatDate(receiptData.receivedDate) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {receiptData.createdAt ? formatDate(receiptData.createdAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {receiptData.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{receiptData.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => onDownload(receiptData._id)}
                  className="w-full px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={onClose}
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
  );
};
// ==================== MAIN COMPONENT ====================

export default function ReceivedShipmentsPage() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    zone: '',
    page: 1
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    damaged: 0,
    inspected: 0
  });

  useEffect(() => {
    loadReceipts();
  }, [filters.page, filters.status]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (filters.page === 1) {
        loadReceipts();
      } else {
        setFilters(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, filters.dateFrom, filters.dateTo, filters.zone]);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 12,
        status: filters.status || undefined,
        search: filters.search || undefined,
        startDate: filters.dateFrom || undefined,
        endDate: filters.dateTo || undefined,
        zone: filters.zone || undefined
      };

      const result = await getWarehouseReceipts(params);
      
      if (result.success) {
        setReceipts(result.data);
        setPagination(result.pagination);
        
        // Calculate stats
        const today = new Date().toDateString();
        setStats({
          total: result.pagination.total,
          today: result.data.filter(r => 
            new Date(r.receivedDate).toDateString() === today
          ).length,
          damaged: result.data.filter(r => 
            r.status === 'damaged_report' || r.inspection?.condition === 'Damaged'
          ).length,
          inspected: result.data.filter(r => r.status === 'inspected').length
        });
      }
    } catch (error) {
      console.error('Load receipts error:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setFilters(prev => ({ ...prev, page: 1 }));
    loadReceipts();
  };

  // app/warehouse/received/page.jsx - handleViewReceipt function আপডেট করুন

const handleViewReceipt = async (receipt) => {
  try {
    console.log('🔍 ===== VIEW RECEIPT DEBUG =====');
    console.log('1. Receipt from list:', receipt);
    console.log('2. Receipt ID:', receipt._id);
    console.log('3. Shipment ID in receipt:', receipt.shipmentId);
    console.log('4. Customer ID in receipt:', receipt.customerId);
    
    const result = await getReceiptById(receipt._id);
    console.log('5. API Response:', result);
    
    if (result.success) {
      console.log('6. Full receipt data:', result.data);
      console.log('7. Receipt object:', result.data.receipt);
      console.log('8. Shipment data:', result.data.receipt?.shipmentId);
      console.log('9. Customer data:', result.data.receipt?.customerId);
      
      setSelectedReceipt(result.data);
      setShowDetailsModal(true);
    } else {
      toast.error('Failed to load receipt details');
    }
  } catch (error) {
    console.error('❌ Error loading receipt:', error);
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

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Link
              href="/warehouse"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="h-6 w-6 mr-2 text-[#E67E22]" />
                Received Shipments
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage all warehouse receipts
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Receipts"
              value={stats.total}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Received Today"
              value={stats.today}
              icon={Calendar}
              color="green"
            />
            <StatCard
              title="Inspected"
              value={stats.inspected}
              icon={CheckCircle}
              color="purple"
            />
            <StatCard
              title="Damaged"
              value={stats.damaged}
              icon={AlertOctagon}
              color="red"
            />
          </div>

          {/* Filters */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            total={pagination.total}
          />
        </div>

        {/* Receipts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No receipts found</h3>
            <p className="text-xs text-gray-500 mt-1">
              {filters.search || filters.status ? 
                'Try adjusting your filters' : 
                'No shipments have been received yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receipts.map((receipt) => (
                <ReceiptCard
                  key={receipt._id}
                  receipt={receipt}
                  onView={handleViewReceipt}
                  onDownload={handleDownloadPDF}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Showing page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          pagination.page === pageNum
                            ? 'bg-[#E67E22] text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <ReceiptDetailsModal
          receipt={selectedReceipt}
          onClose={() => setShowDetailsModal(false)}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
  );
}
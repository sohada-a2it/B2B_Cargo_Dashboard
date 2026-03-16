// components/allTracking.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  getAllShipments,
  updateShipment,
  formatShipmentDate,
  updateTrackingNumber
} from '@/Api/shipping';

// Icons
import {
  Package, Search, ChevronLeft, ChevronRight,
  Edit2, Save, X, RefreshCw, Loader2,
  ChevronsLeft, ChevronsRight, Hash, 
  User, Calendar, ChevronRight as ChevronRightIcon,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

// ==================== COLOR CONSTANTS ====================
const COLORS = {
  primary: '#E67E22'
};

// ==================== COMPONENTS ====================

// Input Component
const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  className = '',
  autoFocus = false
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
          ${Icon ? 'pl-10' : ''}
          ${className}
        `}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, onClick, active }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${
        active ? 'border-[#E67E22] ring-2 ring-[#E67E22] ring-opacity-20' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Tracking Status Badge
const TrackingBadge = ({ hasTracking }) => {
  if (hasTracking) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Has Tracking
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
      <XCircle className="h-3 w-3 mr-1" />
      No Tracking
    </span>
  );
};

// ==================== MAIN COMPONENT ====================
export default function AllTrackingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 1
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    withTracking: 0,
    withoutTracking: 0
  });

  // Fetch all shipments from DATABASE ONLY
  // allTracking.jsx - fetchShipments ফাংশন আপডেট করুন

const fetchShipments = async (showLoading = true) => {
  if (showLoading) setLoading(true);
  try {
    const response = await getAllShipments({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      _: Date.now()
    });
    
    if (response.success) {
      const shipmentsData = response.data || [];
      
      // 🔴 ডিবাগ: কোন শিপমেন্টের tracking number পরিবর্তন হয়েছে চেক করুন
      const targetId = '69a7acc9ebb43e0a1e0407b0';
      const targetShipment = shipmentsData.find(s => s._id === targetId);
      
      console.log('🔍 Target Shipment from DB:', {
        id: targetId,
        trackingNumber: targetShipment?.trackingNumber,
        fullData: targetShipment
      });
      
      // সব শিপমেন্টের tracking number লিস্ট দেখুন
      console.log('📋 All tracking numbers:', shipmentsData.map(s => ({
        id: s._id?.substring(0, 8),
        tracking: s.trackingNumber
      })));
      
      setShipments(shipmentsData);
      applyFilter(shipmentsData, activeFilter);
      
      setPagination(response.pagination || {
        total: shipmentsData.length,
        page: 1,
        limit: 50,
        pages: Math.ceil(shipmentsData.length / 50)
      });
      
      const withTracking = shipmentsData.filter(s => s.trackingNumber && s.trackingNumber.trim() !== '').length;
      setStats({
        total: shipmentsData.length,
        withTracking,
        withoutTracking: shipmentsData.length - withTracking
      });
    }
  } catch (error) {
    toast.error('Failed to fetch shipments');
  } finally {
    if (showLoading) setLoading(false);
  }
};

  useEffect(() => {
    fetchShipments();
  }, [pagination.page, pagination.limit]);

  // Apply filter
  const applyFilter = (data, filterType) => {
    if (filterType === 'all') {
      setFilteredShipments(data);
    } else if (filterType === 'with') {
      setFilteredShipments(data.filter(s => s.trackingNumber && s.trackingNumber.trim() !== ''));
    } else {
      setFilteredShipments(data.filter(s => !s.trackingNumber || s.trackingNumber.trim() === ''));
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchShipments(false);
    setRefreshing(false);
    toast.success('Data refreshed from database');
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      applyFilter(shipments, activeFilter);
    } else {
      const filtered = shipments.filter(shipment => 
        (shipment.shipmentNumber && shipment.shipmentNumber.toLowerCase().includes(value.toLowerCase())) ||
        (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(value.toLowerCase())) ||
        (shipment.customerId?.companyName && shipment.customerId.companyName.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredShipments(filtered);
    }
  };

  // Handle edit tracking number
  const handleEdit = (shipment) => {
    setEditingId(shipment._id);
    setEditValue(shipment.trackingNumber || '');
  };

  // Handle save tracking number - DATABASE ONLY
// Handle save tracking number - ঠিক করা ভার্সন
const handleSave = async (shipment) => {
  if (!editValue.trim()) {
    toast.warning('Tracking number cannot be empty');
    return;
  }

  setSavingId(shipment._id);
  try {
    console.log('🚀 Sending to API:', {
      shipmentId: shipment._id,
      newTracking: editValue.trim()  // ✅ শুধু string পাঠান
    });
    
    // ✅ শুধু trackingNumber string হিসেবে পাঠান
    const result = await updateTrackingNumber(shipment._id, editValue.trim());

    console.log('📦 API Result:', result);

    if (result.success) {
      toast.success('✅ Tracking number updated successfully');
      
      // লোকাল স্টেট আপডেট
      const updatedShipments = shipments.map(s => 
        s._id === shipment._id ? { ...s, trackingNumber: editValue.trim() } : s
      );
      
      setShipments(updatedShipments);
      applyFilter(updatedShipments, activeFilter);
      
      setEditingId(null);
    } else {
      toast.error(result.message || 'Update failed');
    }
  } catch (error) {
    console.error('💥 Error:', error);
    toast.error('Update failed');
  } finally {
    setSavingId(null);
  }
};

  // Handle cancel edit
  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(e.target.value),
      page: 1 
    }));
  };

  // Filter by tracking status
  const filterByTracking = (type) => {
    setActiveFilter(type);
    applyFilter(shipments, type);
  };

  // Check database connection
  const checkDatabase = async () => {
    if (shipments.length === 0) {
      toast.warning('No shipments to check');
      return;
    }
    
    const testShipment = shipments[0];
    const testTracking = 'TEST-' + Date.now();
    
    try {
      const result = await updateShipment(testShipment._id, {
        trackingNumber: testTracking
      });
      
      if (result.success) {
        toast.success('✅ Database working!');
        await fetchShipments(false);
      } else {
        toast.error('❌ Database failed');
      }
    } catch (error) {
      toast.error('Database connection failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Package className="h-4 w-4 text-[#E67E22]" />
                </div>
                <h1 className="ml-2 text-lg font-semibold text-gray-900">
                  Tracking Numbers (Database Only)
                </h1>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {stats.total} Total
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* <button
                onClick={checkDatabase}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                Check DB
              </button> */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Shipments"
            value={stats.total}
            icon={Package}
            color="bg-blue-50 text-blue-600"
            onClick={() => filterByTracking('all')}
            active={activeFilter === 'all'}
          />
          <StatCard
            title="With Tracking Numbers"
            value={stats.withTracking}
            icon={CheckCircle}
            color="bg-green-50 text-green-600"
            onClick={() => filterByTracking('with')}
            active={activeFilter === 'with'}
          />
          <StatCard
            title="Without Tracking"
            value={stats.withoutTracking}
            icon={AlertCircle}
            color="bg-orange-50 text-orange-600"
            onClick={() => filterByTracking('without')}
            active={activeFilter === 'without'}
          />
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4">
            <Input
              type="text"
              placeholder="Search by shipment number, tracking number, customer..."
              value={searchTerm}
              onChange={handleSearch}
              icon={Search}
            />
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipment #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#E67E22]" />
                        <span className="ml-2 text-sm text-gray-500">Loading from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500">No shipments found in database</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => {
                    const hasTracking = shipment.trackingNumber && shipment.trackingNumber.trim() !== '';
                    
                    return (
                      <tr key={shipment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {shipment.shipmentNumber || shipment._id?.slice(-8).toUpperCase()}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          {editingId === shipment._id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="Enter tracking number"
                                autoFocus
                                className="w-48"
                              />
                              <button
                                onClick={() => handleSave(shipment)}
                                disabled={savingId === shipment._id}
                                className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                title="Save to database"
                              >
                                {savingId === shipment._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center">
                                <Hash className="h-3 w-3 text-gray-400 mr-1" />
                                <span className={`text-sm ${hasTracking ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
                                  {shipment.trackingNumber || 'No tracking number'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleEdit(shipment)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:bg-blue-50 rounded transition-all"
                                title="Edit tracking number"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                        
                        <td className="px-4 py-3">
                          <TrackingBadge hasTracking={hasTracking} />
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {shipment.customerId?.companyName || 
                             `${shipment.customerId?.firstName || ''} ${shipment.customerId?.lastName || ''}`.trim() || 'N/A'}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center text-xs">
                            <span className="text-gray-900">{shipment.shipmentDetails?.origin || 'N/A'}</span>
                            <ChevronRightIcon className="h-3 w-3 mx-1 text-gray-400" />
                            <span className="text-gray-900">{shipment.shipmentDetails?.destination || 'N/A'}</span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500">
                            {formatShipmentDate(shipment.createdAt, 'short')}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(shipment)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit tracking number"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="border-t px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </span>
                  <select
                    value={pagination.limit}
                    onChange={handleLimitChange}
                    className="text-xs border rounded-lg px-2 py-1"
                  >
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <span className="text-sm text-gray-600 px-3">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.pages)}
                    disabled={pagination.page === pagination.pages}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Total: {stats.total} shipments | 
          With Tracking: {stats.withTracking} | 
          Without Tracking: {stats.withoutTracking}
        </div>
      </div>
    </div>
  );
}
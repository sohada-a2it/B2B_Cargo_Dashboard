'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getConsolidationQueue,
  removeFromQueue,
  createConsolidation,
  getMainTypeName,
  getSubTypeName,
  formatContainerType,
  estimateContainerType,
  getConsolidationStatusColor,
  getConsolidationStatusDisplayText,
  formatDestination
} from '@/Api/consolidation';
import { formatDate } from '@/Api/booking';
import { toast } from 'react-toastify';
import {
  Loader2, Package, Search, Calendar, MapPin, User,
  ArrowLeft, ChevronRight, Globe, Weight, Box, Layers,
  Ship, Truck, Eye, Trash2, PlusCircle, Filter,
  ChevronDown, ChevronUp, X, CheckCircle, AlertCircle,
  Anchor, Container, FileText, Download, Printer,
  Plus, Minus, Edit, Save, Clock, Hash, Map,
  Info, AlertTriangle, Check, RefreshCw, Mail, Phone, Building2, UserCircle
} from 'lucide-react';

// ==================== CONSTANTS ====================

const QUEUE_STATUS = {
  pending: { 
    label: 'Pending', 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: Clock
  },
  assigned: { 
    label: 'Assigned', 
    bg: 'bg-blue-100', 
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: CheckCircle
  },
  consolidated: { 
    label: 'Consolidated', 
    bg: 'bg-green-100', 
    text: 'text-green-800',
    border: 'border-green-200',
    icon: Check
  }
};

const CONTAINER_TYPES = [
  { value: '20ft', label: '20ft Standard Container', maxVolume: 28, icon: '📦' },
  { value: '40ft', label: '40ft Standard Container', maxVolume: 58, icon: '📦📦' },
  { value: '40ft HC', label: '40ft High Cube Container', maxVolume: 68, icon: '📦📦⬆️' },
  { value: '45ft', label: '45ft High Cube Container', maxVolume: 78, icon: '📦📦📦' },
  { value: 'LCL', label: 'LCL - Less than Container Load', maxVolume: 999, icon: '📦' }
];

// ==================== HELPER FUNCTIONS ====================

const getStatusInfo = (status) => {
  return QUEUE_STATUS[status] || {
    label: status || 'Unknown',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    icon: Clock
  };
};

const formatWeight = (weight) => {
  if (!weight && weight !== 0) return '0 kg';
  return `${Number(weight).toFixed(2)} kg`;
};

const formatVolume = (volume) => {
  if (!volume && volume !== 0) return '0 m³';
  return `${Number(volume).toFixed(2)} m³`;
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ==================== DEBUG COMPONENT ====================

// const DebugPanel = ({ data }) => {
//   const [isOpen, setIsOpen] = useState(false);
  
//   if (!isOpen) {
//     return (
//       <button
//         onClick={() => setIsOpen(true)}
//         className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg z-50"
//       >
//         <AlertTriangle className="h-5 w-5" />
//       </button>
//     );
//   }
  
//   // return (
//   //   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//   //     <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//   //       <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
//   //         <h2 className="text-lg font-bold">Debug Information</h2>
//   //         <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//   //           <X className="h-5 w-5" />
//   //         </button>
//   //       </div>
//   //       <div className="p-4">
//   //         <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
//   //           {JSON.stringify(data, null, 2)}
//   //         </pre>
//   //       </div>
//   //     </div>
//   //   </div>
//   // );
// };

// ==================== COMPONENTS ====================

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'orange', subtitle }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Package Badge Component
const PackageBadge = ({ type, quantity }) => {
  const getIcon = () => {
    const icons = {
      pallet: '📦',
      carton: '📦',
      crate: '📦',
      box: '📦',
      envelope: '✉️',
      container: '📦',
      default: '📦'
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  return (
    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
      <span className="mr-1">{getIcon()}</span>
      {type || 'Package'} x{quantity || 1}
    </span>
  );
};

// Shipment Details Modal Component
// Shipment Details Modal Component
// Shipment Details Modal Component - UPDATED
const ShipmentDetailsModal = ({ isOpen, onClose, shipment }) => {
  if (!isOpen || !shipment) return null;

  const shipmentData = shipment.shipmentId || {};
  const shipmentDetails = shipmentData.shipmentDetails || {};
  const customer = shipment.customer || {};
  const addedBy = shipment.addedBy || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Shipment Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Tracking Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <Hash className="h-4 w-4 mr-2" />
              Tracking Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Tracking Number</p>
                <p className="font-medium">{shipment.trackingNumber || shipmentData.trackingNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium capitalize">{shipmentData.status}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <UserCircle className="h-4 w-4 mr-2" />
              Customer Information
            </h3>
            <div className="space-y-2">
              <p><span className="text-gray-500">Name:</span> {customer.firstName} {customer.lastName}</p>
              {customer.companyName && <p><span className="text-gray-500">Company:</span> {customer.companyName}</p>}
              <p><span className="text-gray-500">Email:</span> {customer.email}</p>
              <p><span className="text-gray-500">Phone:</span> {customer.phone}</p>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Shipment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Packages</p>
                <p className="font-medium">{shipment.packages || shipmentDetails.totalPackages}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Weight</p>
                <p className="font-medium">{formatWeight(shipment.weight || shipmentDetails.totalWeight)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Volume</p>
                <p className="font-medium">{formatVolume(shipment.volume || shipmentDetails.totalVolume)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Shipping Mode</p>
                <p className="font-medium">{shipmentDetails.shippingMode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Route
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Origin</p>
                <p className="font-medium">{shipmentDetails.origin}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="font-medium">{shipmentDetails.destination}</p>
              </div>
            </div>
          </div>

          {/* Added By */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Added By
            </h3>
            <p>{addedBy.firstName} {addedBy.lastName}</p>
            <p className="text-xs text-gray-500 mt-1">{formatDateTime(shipment.addedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Group Card Component - FIXED VERSION
// Group Card Component - FIXED VERSION for your data structure
const GroupCard = ({ group, onSelectShipments, onRemoveShipment }) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedShipments, setSelectedShipments] = useState({});
  const [selectedShipmentForDetails, setSelectedShipmentForDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  console.log('Group in GroupCard:', group); // Debug log

  // Get shipments array
  const shipments = group.shipments || [];

  const toggleShipment = (shipmentId) => {
    setSelectedShipments(prev => ({
      ...prev,
      [shipmentId]: !prev[shipmentId]
    }));
  };

  const selectAll = () => {
    const allSelected = {};
    shipments.forEach(s => {
      allSelected[s._id] = true;
    });
    setSelectedShipments(allSelected);
  };

  const clearAll = () => {
    setSelectedShipments({});
  };

  const getSelectedCount = () => Object.values(selectedShipments).filter(Boolean).length;
  
  const getSelectedWeight = () => {
    return shipments
      .filter(s => selectedShipments[s._id])
      .reduce((sum, s) => sum + (s.weight || s.shipmentId?.shipmentDetails?.totalWeight || 0), 0);
  };

  const getSelectedVolume = () => {
    return shipments
      .filter(s => selectedShipments[s._id])
      .reduce((sum, s) => sum + (s.volume || s.shipmentId?.shipmentDetails?.totalVolume || 0), 0);
  };

  const handleViewDetails = (shipment) => {
    setSelectedShipmentForDetails(shipment);
    setShowDetailsModal(true);
  };

  const selectedCount = getSelectedCount();
  const selectedWeight = getSelectedWeight();
  const selectedVolume = getSelectedVolume();

  if (!shipments || shipments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-gray-500">No shipments in this group</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 hover:shadow-lg transition-all">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-orange-200 rounded-lg transition-colors"
              >
                {expanded ? 
                  <ChevronUp className="h-5 w-5 text-orange-600" /> : 
                  <ChevronDown className="h-5 w-5 text-orange-600" />
                }
              </button>
              
              <div className="flex-1">
                {/* Group Title */}
                <div className="flex items-center flex-wrap gap-2">
                  <Globe className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {group.displayName || `${group.origin || 'Unknown'} → ${group.destination || 'Unknown'}`}
                  </h2>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                    {group.count || shipments.length} Shipments
                  </span>
                </div>

                {/* Route */}
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {group.origin || 'N/A'} → {group.destination || 'N/A'}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Package className="h-4 w-4 mr-1" />
                    <span>{group.totalPackages || 0} packages</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Weight className="h-4 w-4 mr-1" />
                    <span>{formatWeight(group.totalWeight || 0)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Box className="h-4 w-4 mr-1" />
                    <span>{formatVolume(group.totalVolume || 0)}</span>
                  </div>
                </div>

                {/* Selected Stats */}
                {selectedCount > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-700 font-medium">
                        {selectedCount} selected
                      </span>
                      <span className="text-blue-600">{formatWeight(selectedWeight)}</span>
                      <span className="text-blue-600">{formatVolume(selectedVolume)}</span>
                    </div>
                    <button
                      onClick={clearAll}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-xs bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Select All
              </button>
              <button
                onClick={() => onSelectShipments(group, selectedShipments)}
                disabled={selectedCount === 0}
                className={`px-4 py-1.5 rounded-lg flex items-center text-sm transition-colors ${
                  selectedCount > 0
                    ? 'bg-[#E67E22] text-white hover:bg-[#d35400]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Ship className="h-4 w-4 mr-1" />
                Consolidate ({selectedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        {expanded && (
          <div className="divide-y max-h-96 overflow-y-auto">
            {shipments.map((item) => {
              console.log('Shipment item:', item); // Debug log
              
              // Get shipment details from the nested structure
              const shipmentDetails = item.shipmentId?.shipmentDetails || {};
              const customer = item.customer || {};
              const addedBy = item.addedBy || {};
              
              // Status info
              const statusInfo = getStatusInfo(item.shipmentId?.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedShipments[item._id] || false}
                      onChange={() => toggleShipment(item._id)}
                      className="mt-1 h-4 w-4 text-[#E67E22] rounded border-gray-300 focus:ring-[#E67E22]"
                    />

                    <div className="flex-1">
                      {/* Tracking Number and Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {item.trackingNumber || item.shipmentId?.trackingNumber || 'N/A'}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full flex items-center ${statusInfo.bg} ${statusInfo.text}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDateTime(item.addedAt)}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="mt-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <UserCircle className="h-3 w-3 text-blue-500" />
                          <span className="text-gray-500">Customer:</span>
                          <span className="font-medium">
                            {customer.firstName || ''} {customer.lastName || ''} 
                            {customer.companyName ? ` (${customer.companyName})` : ''}
                          </span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{customer.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Package Info */}
                      <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
                        <div className="flex items-center text-gray-600">
                          <Package className="h-3 w-3 mr-1" />
                          {item.packages || shipmentDetails.totalPackages || 0} pkgs
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Weight className="h-3 w-3 mr-1" />
                          {formatWeight(item.weight || shipmentDetails.totalWeight)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Box className="h-3 w-3 mr-1" />
                          {formatVolume(item.volume || shipmentDetails.totalVolume)}
                        </div>
                      </div>

                      {/* Route and Shipping Mode */}
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <MapPin className="h-3 w-3 mr-1" />
                        {shipmentDetails.origin || group.origin || 'N/A'} → {shipmentDetails.destination || group.destination || 'N/A'}
                        {shipmentDetails.shippingMode && (
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded">
                            {shipmentDetails.shippingMode}
                          </span>
                        )}
                      </div>

                      {/* Added By */}
                      {addedBy.firstName && (
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <User className="h-3 w-3 mr-1" />
                          Added by: {addedBy.firstName} {addedBy.lastName}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => onRemoveShipment(item._id)}
                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedShipmentForDetails(null);
        }}
        shipment={selectedShipmentForDetails}
      />
    </>
  );
};

// Create Consolidation Modal (simplified)
const CreateConsolidationModal = ({ isOpen, onClose, group, selectedShipments, onCreateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [containerType, setContainerType] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!containerType) {
      toast.warning('Please select container type');
      return;
    }
    
    setLoading(true);
    try {
      const selectedIds = Object.keys(selectedShipments).filter(key => selectedShipments[key]);
      
      const result = await createConsolidation({
        groupKey: group?.groupKey,
        selectedShipmentIds: selectedIds,
        containerType: containerType
      });
      
      if (result.success) {
        toast.success('Consolidation created successfully');
        onCreateSuccess();
        onClose();
      }
    } catch (error) {
      toast.error('Failed to create consolidation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Create Consolidation</h2>
          
          <select
            value={containerType}
            onChange={(e) => setContainerType(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
          >
            <option value="">Select Container Type</option>
            {CONTAINER_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:bg-gray-300"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State
const EmptyQueue = ({ onRefresh }) => (
  <div className="text-center py-16 bg-white rounded-xl border">
    <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
      <Package className="h-10 w-10 text-[#E67E22]" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments in queue</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
      Complete inspection of received shipments to add them to the consolidation queue.
    </p>
    <div className="flex items-center justify-center space-x-3">
      <Link
        href="/warehouse/inspection"
        className="inline-flex items-center px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400]"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Go to Inspection
      </Link>
      <button
        onClick={onRefresh}
        className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </button>
    </div>
  </div>
);

// ==================== MAIN PAGE ====================

export default function ConsolidationQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      console.log('Loading queue...');
      const result = await getConsolidationQueue();
      console.log('Queue API Response:', result); // Debug log
      
      if (result.success) {
        console.log('Queue Data:', result.data); // Debug log
        setQueueData(result.data);
        
        // Check if we have data
        if (result.data) {
          console.log('Total groups:', result.data.totalGroups);
          console.log('Total items:', result.data.totalItems);
          console.log('Groups:', result.data.groups);
        }
      } else {
        toast.error(result.message || 'Failed to load queue');
      }
    } catch (error) {
      console.error('Error loading queue:', error);
      toast.error('Failed to load queue: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const handleSelectShipments = (group, selections) => {
    const hasSelections = Object.values(selections).some(Boolean);
    if (!hasSelections) {
      toast.warning('Please select at least one shipment');
      return;
    }
    setSelectedGroup(group);
    setSelectedShipments(selections);
    setShowCreateModal(true);
  };

  const handleRemoveFromQueue = async (queueId) => {
    if (!confirm('Remove this shipment from queue?')) return;
    
    try {
      const result = await removeFromQueue(queueId);
      if (result.success) {
        toast.success('Shipment removed from queue');
        loadQueue();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to remove shipment');
    }
  };

  const handleCreateSuccess = () => {
    loadQueue();
  };

  // Filter groups
  const groups = queueData?.groups || [];
  
  const filteredGroups = searchTerm
    ? groups.filter(group => 
        group.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.destination?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : groups;

  // Calculate stats
  const totalShipments = queueData?.totalItems || 0;
  const totalGroups = queueData?.totalGroups || 0;
  const totalVolume = groups.reduce((sum, g) => sum + (g.totalVolume || 0), 0);
  const totalWeight = groups.reduce((sum, g) => sum + (g.totalWeight || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link href="/warehouse" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="h-6 w-6 mr-2 text-[#E67E22]" />
                  Consolidation Queue
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Shipments grouped by type and destination
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/warehouse/consolidations"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Consolidations
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Shipments" value={totalShipments} icon={Package} color="blue" />
            <StatCard title="Destination Groups" value={totalGroups} icon={Globe} color="green" />
            <StatCard title="Total Volume" value={formatVolume(totalVolume)} icon={Box} color="orange" />
            <StatCard title="Total Weight" value={formatWeight(totalWeight)} icon={Weight} color="purple" />
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
          </div>
        </div>

        {/* Queue Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
            <Loader2 className="h-10 w-10 animate-spin text-[#E67E22] mb-4" />
            <p className="text-sm text-gray-500">Loading consolidation queue...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <EmptyQueue onRefresh={handleRefresh} />
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.groupKey}
                group={group}
                onSelectShipments={handleSelectShipments}
                onRemoveShipment={handleRemoveFromQueue}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateConsolidationModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedGroup(null);
          setSelectedShipments({});
        }}
        group={selectedGroup}
        selectedShipments={selectedShipments}
        onCreateSuccess={handleCreateSuccess}
      />

      {/* Debug Panel */}
      {/* <DebugPanel data={{ queueData, selectedGroup, selectedShipments }} /> */}
    </div>
  );
}
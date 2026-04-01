// warehouse/consolidations/index.js
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Loader2, Package, Search, Calendar, MapPin, User,
  ArrowLeft, ChevronRight, Globe, Weight, Box, Layers,
  Ship, Truck, Eye, Trash2, PlusCircle, Filter,
  ChevronDown, ChevronUp, X, CheckCircle, AlertCircle,
  Anchor, Container, FileText, Download, Printer,
  Plus, Minus, Edit, Save, Clock, Hash, Map,
  Info, AlertTriangle, Check, RefreshCw, Copy,
  BarChart3, TrendingUp, PieChart, DownloadCloud,
  Filter as FilterIcon, SlidersHorizontal, Grid3x3,
  List, LayoutGrid, FolderOpen, Tag, Users,
  Phone, Mail, Building2, CalendarClock, WeightIcon,
  Ruler, PackageOpen, QrCode, Barcode, Shield,
  Sparkles, Settings, MoreVertical, ExternalLink,
  Archive, RotateCcw, Ban, Play, Pause, Send,
  Flag, Award, UserCircle, AtSign, Fingerprint,
  ClipboardList, ClipboardCheck, ScrollText,
  Contact, IdCard, MapPinned, Navigation,
  Plane, Train, Bus, Car, Bike,
  Sun, Moon, Cloud, CloudRain, CloudSnow,
  Wind, Thermometer, Droplets, Gauge,
  Camera, Video, Image, Mic, Speaker,
  Wifi, Bluetooth, Battery, Power,
  Lock, Unlock, Key, ShieldCheck,
  CreditCard, Wallet, DollarSign, Euro,
  PoundSterling, Yen, Bitcoin,
  Gift, Star, Heart, ThumbsUp,
  MessageCircle, MessageSquare, MessageCircleHeart,
  Bell, BellRing, BellOff,
  Volume1, Volume2, VolumeX,
  Maximize, Minimize, Maximize2, Minimize2,
  Move, MoveHorizontal, MoveVertical,
  ZoomIn, ZoomOut, Focus,
  Sunset, Sunrise, MoonStar,
  Sparkle, PartyPopper, GiftIcon,
  Building
} from 'lucide-react';
import { formatDate } from '@/Api/booking';
import {
  getConsolidations,
  getConsolidationById,
  getConsolidationStats,
  getAvailableContainerTypes,
  updateConsolidation,
  updateConsolidationStatus,
  addShipmentsToConsolidation,
  removeShipmentFromConsolidation,
  deleteConsolidation,
  getMainTypeName,
  getSubTypeName,
  formatContainerType,
  estimateContainerType,
  getConsolidationStatusColor,
  getConsolidationStatusDisplayText,
  formatDestination,
  formatVolume,
  formatWeight,
  calculateTotalVolume,
  calculateTotalWeight,
  calculateTotalPackages,
  groupConsolidationsByStatus,
  markAsReadyForDispatch,
  updateShipmentInConsolidation,
  getOnHoldShipments,
  resumeAllOnHoldShipments,
  getCancelledShipmentsFromConsolidation,
  putConsolidationOnHold,
  cancelConsolidation
} from '@/Api/consolidation';
import { progress } from 'framer-motion';
import { trackByNumber } from '@/Api/booking';
// ==================== CONSTANTS ====================

const CONSOLIDATION_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray', icon: FileText },
  { value: 'in_progress', label: 'In Progress', color: 'blue', icon: Play },
  { value: 'consolidated', label: 'Consolidated', color: 'purple', icon: Package },
  { value: 'ready_for_dispatch', label: 'Ready for Dispatch', color: 'orange', icon: Send },
  { value: 'loaded', label: 'Loaded', color: 'indigo', icon: Package },
  { value: 'dispatched', label: 'Dispatched', color: 'amber', icon: Send },
  { value: 'in_transit', label: 'In Transit', color: 'yellow', icon: Truck },
  { value: 'arrived', label: 'Arrived', color: 'green', icon: CheckCircle },
  { value: 'customs_cleared', label: 'Customs Cleared', color: 'emerald', icon: Shield },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'blue', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'emerald', icon: CheckCircle },
  { value: 'completed', label: 'Completed', color: 'green', icon: Award },
  { value: 'on_hold', label: 'On Hold', color: 'orange', icon: Pause },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: Ban },
  { value: 'returned', label: 'Returned', color: 'red', icon: RotateCcw }
];

const CONTAINER_TYPES = [
  { value: '20ft', label: '20ft Standard', maxVolume: 28, icon: '📦' },
  { value: '40ft', label: '40ft Standard', maxVolume: 58, icon: '📦📦' },
  { value: '40ft HC', label: '40ft HC', maxVolume: 68, icon: '📦📦⬆️' },
  { value: '45ft', label: '45ft HC', maxVolume: 78, icon: '📦📦📦' },
  { value: 'LCL', label: 'LCL', maxVolume: 999, icon: '📦' }
];

const MAIN_TYPES = [
  { value: 'sea_freight', label: 'Sea Freight', icon: Ship },
  { value: 'air_freight', label: 'Air Freight', icon: Plane },
  { value: 'inland_trucking', label: 'Trucking', icon: Truck },
  { value: 'multimodal', label: 'Multi-modal', icon: Layers }
];

const VIEW_MODES = {
  grid: { icon: LayoutGrid, label: 'Grid View' },
  list: { icon: List, label: 'List View' },
  table: { icon: Grid3x3, label: 'Table View' }
};

// ==================== HELPER FUNCTIONS ====================

const getStatusBadge = (status) => {
  const statusConfig = CONSOLIDATION_STATUSES.find(s => s.value === status) || CONSOLIDATION_STATUSES[0];
  const colors = {
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[statusConfig.color]}`}>
      <statusConfig.icon className="h-3 w-3 mr-1" />
      {statusConfig.label}
    </span>
  );
};

const getShipmentCount = (consolidation) => {
  if (!consolidation) return 0;
  if (consolidation.totalShipments) return consolidation.totalShipments;
  if (consolidation.shipments?.length) return consolidation.shipments.length;
  if (consolidation.items?.length) return consolidation.items.length;
  return 0;
};

const getTotalPackages = (consolidation) => {
  if (!consolidation) return 0;
  if (consolidation.totalPackages) return consolidation.totalPackages;
  return 0;
};

const getTotalVolume = (consolidation) => {
  if (!consolidation) return 0;
  return consolidation.totalVolume || 0;
};

const getTotalWeight = (consolidation) => {
  if (!consolidation) return 0;
  return consolidation.totalWeight || 0;
};

const getContainerType = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.containerType || 'N/A';
};

const getContainerNumber = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.containerNumber || 'N/A';
};

const getSealNumber = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.sealNumber || 'N/A';
};

const getMainType = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.mainType || 'N/A';
};

const getSubType = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.subType || 'N/A';
};

// ==================== SEARCH FUNCTION ====================

const consolidationMatchesSearch = (consolidation, searchTerm) => {
  if (!searchTerm || !consolidation) return true;
  
  const term = searchTerm.toLowerCase().trim();
  if (!term) return true;

  console.log('Searching for:', term, 'in consolidation:', consolidation.consolidationNumber);

  // Check consolidation number
  if (consolidation.consolidationNumber?.toLowerCase().includes(term)) {
    console.log('Found in consolidation number');
    return true;
  }
  
  // Check container number
  if (consolidation.containerNumber?.toLowerCase().includes(term)) {
    console.log('Found in container number');
    return true;
  }
  
  // Check seal number
  if (consolidation.sealNumber?.toLowerCase().includes(term)) {
    console.log('Found in seal number');
    return true;
  }
  
  // Check origin warehouse
  if (consolidation.originWarehouse?.toLowerCase().includes(term)) {
    console.log('Found in origin warehouse');
    return true;
  }
  
  // Check destination port
  if (consolidation.destinationPort?.toLowerCase().includes(term)) {
    console.log('Found in destination port');
    return true;
  }
  
  // Check ID
  if (consolidation._id?.toLowerCase().includes(term)) {
    console.log('Found in ID');
    return true;
  }

  // Check all shipments
  if (consolidation.shipments && Array.isArray(consolidation.shipments) && consolidation.shipments.length > 0) {
    for (const shipment of consolidation.shipments) {
      // Check tracking number
      if (shipment.trackingNumber?.toLowerCase().includes(term)) {
        console.log('Found in shipment tracking number');
        return true;
      }
      
      // Check shipment ID
      if (shipment._id?.toLowerCase().includes(term)) {
        console.log('Found in shipment ID');
        return true;
      }
      
      // Check status
      if (shipment.status?.toLowerCase().includes(term)) {
        console.log('Found in shipment status');
        return true;
      }
      
      // Check customer ID
      if (shipment.customerId?.toLowerCase().includes(term)) {
        console.log('Found in customer ID');
        return true;
      }
    }
  }

  // Check items array
  if (consolidation.items && Array.isArray(consolidation.items) && consolidation.items.length > 0) {
    for (const item of consolidation.items) {
      if (item.description?.toLowerCase().includes(term)) {
        console.log('Found in item description');
        return true;
      }
      
      if (item.shipmentId?.toLowerCase().includes(term)) {
        console.log('Found in shipment ID in items');
        return true;
      }
      
      if (item.packageType?.toLowerCase().includes(term)) {
        console.log('Found in package type');
        return true;
      }
    }
  }

  return false;
};

// ==================== SHIPMENT CARD (for items array) ====================

const ShipmentItemCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all mb-2">
      {/* Header */}
      <div 
        className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Package className="h-3 w-3 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-medium">
                {item.shipmentId ? `SHP-${item.shipmentId.slice(-6)}` : 'N/A'}
              </span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full">
                {item.quantity || 1} pkg
              </span>
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5">
              {item.description || 'No description'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-[10px] text-gray-600">
            {item.weight || 0} kg • {item.volume || 0} m³
          </div>
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-gray-500" />
          ) : (
            <ChevronDown className="h-3 w-3 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-2 bg-gray-50 border-t">
          <h4 className="text-[10px] font-semibold mb-1.5">Shipment Item Details</h4>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="bg-white p-1.5 rounded">
              <span className="text-gray-500">Package Type:</span>
              <p className="font-medium">{item.packageType || 'N/A'}</p>
            </div>
            <div className="bg-white p-1.5 rounded">
              <span className="text-gray-500">Quantity:</span>
              <p className="font-medium">{item.quantity || 0}</p>
            </div>
            <div className="bg-white p-1.5 rounded">
              <span className="text-gray-500">Weight:</span>
              <p className="font-medium">{item.weight || 0} kg</p>
            </div>
            <div className="bg-white p-1.5 rounded">
              <span className="text-gray-500">Volume:</span>
              <p className="font-medium">{item.volume || 0} m³</p>
            </div>
            <div className="bg-white p-1.5 rounded col-span-2">
              <span className="text-gray-500">Description:</span>
              <p className="font-medium">{item.description || 'N/A'}</p>
            </div>
            <div className="bg-white p-1.5 rounded col-span-2">
              <span className="text-gray-500">Shipment ID:</span>
              <p className="font-mono font-medium">{item.shipmentId || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== SHIPMENT CARD (for shipments array) ====================   

// ShipmentCard component - Add tracking status fetch
// warehouse/consolidations/index.js - ShipmentCard কম্পোনেন্ট আপডেট করুন

const ShipmentCard = ({ shipment, consolidationId, consolidationStatus, onShipmentUpdated }) => {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  
  // ✅ প্রথমে helper functions ডিক্লেয়ার করুন
  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'picked_up_from_warehouse': 'Picked Up',
      'departed_port_of_origin': 'Departed Origin',
      'in_transit': 'In Transit',
      'in_transit_sea_freight': 'In Transit (Sea)',
      'arrived_at_destination_port': 'Arrived at Port',
      'arrived': 'Arrived',
      'customs_cleared': 'Customs Cleared',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'on_hold': 'On Hold',
      'cancelled': 'Cancelled',
      'returned': 'Returned',
      'received_at_warehouse': 'At Warehouse',
      'consolidated': 'Consolidated',
      'ready_for_dispatch': 'Ready for Dispatch',
      'loaded_in_container': 'Loaded',
      'dispatched': 'Dispatched'
    };
    return labels[status] || status?.replace(/_/g, ' ') || 'Pending';
  };

  const getLocationFromStatus = (status, currentLocation) => {
    if (currentLocation) return currentLocation;
    const locations = {
      'arrived_at_destination_port': 'Destination Port',
      'arrived': 'Destination Port',
      'customs_cleared': 'Customs',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'in_transit': 'In Transit',
      'departed_port_of_origin': 'In Transit',
      'picked_up_from_warehouse': 'Warehouse'
    };
    return locations[status] || 'Processing';
  };

  const getProgressFromStatus = (status) => {
    const progressMap = {
      'pending': 10,
      'picked_up_from_warehouse': 20,
      'received_at_warehouse': 25,
      'pending_consolidation': 28,
      'consolidating': 29,
      'consolidated': 30,
      'ready_for_dispatch': 35,
      'loaded_in_container': 38,
      'dispatched': 40,
      'departed_port_of_origin': 45,
      'in_transit': 50,
      'in_transit_sea_freight': 50,
      'arrived_at_destination_port': 70,
      'arrived': 70,
      'customs_cleared': 80,
      'out_for_delivery': 90,
      'delivered': 100,
      'completed': 100,
      'on_hold': 0,
      'cancelled': 0
    };
    return progressMap[status] || 30;
  };

  // ✅ এখন useState ব্যবহার করুন (ফাংশন ডিক্লেয়ার করার পর)
  const [currentStatus, setCurrentStatus] = useState(shipment.status);
  const [currentLocation, setCurrentLocation] = useState(
    shipment.currentLocation || getLocationFromStatus(shipment.status)
  );
  const [currentProgress, setCurrentProgress] = useState(
    getProgressFromStatus(shipment.status)
  );

  // Update local state when shipment prop changes
  useEffect(() => {
    setCurrentStatus(shipment.status);
    setCurrentLocation(shipment.currentLocation || getLocationFromStatus(shipment.status));
    setCurrentProgress(getProgressFromStatus(shipment.status));
  }, [shipment.status, shipment.currentLocation]);

  // Auto-refresh when consolidation status changes
  useEffect(() => {
    console.log('🔄 Consolidation status changed, refreshing tracking:', consolidationStatus);
    if (shipment?.trackingNumber) {
      fetchTrackingStatus();
    }
  }, [consolidationStatus]);

  // Auto-fetch tracking status on mount
  useEffect(() => {
    if (shipment?.trackingNumber) {
      fetchTrackingStatus();
    }
  }, [shipment?.trackingNumber]);

  const fetchTrackingStatus = async () => {
    if (!shipment?.trackingNumber) return;
    
    setTrackingLoading(true);
    try {
      console.log('📡 Fetching tracking for:', shipment.trackingNumber);
      const result = await trackByNumber(shipment.trackingNumber);
      console.log('📡 Tracking API Response:', result);
      
      if (result?.success && result?.data) {
        setTrackingData({
          trackingNumber: result.data.trackingNumber,
          status: result.data.status,
          currentStatus: {
            status: result.data.status,
            label: getStatusLabel(result.data.status),
            location: result.data.currentLocation || getLocationFromStatus(result.data.status),
            timestamp: result.data.lastUpdate || new Date().toISOString(),
            progress: result.data.progress || getProgressFromStatus(result.data.status)
          },
          estimatedDelivery: result.data.estimatedArrival,
          location: result.data.currentLocation || getLocationFromStatus(result.data.status),
          updatedAt: result.data.lastUpdate,
          trackingHistory: result.data.timeline || shipment.milestones || []
        });
        
        // Update local state with tracking data
        setCurrentStatus(result.data.status);
        setCurrentLocation(result.data.currentLocation || getLocationFromStatus(result.data.status));
        setCurrentProgress(result.data.progress || getProgressFromStatus(result.data.status));
      } else {
        // Fallback to shipment data
        setTrackingData({
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          currentStatus: {
            status: shipment.status,
            label: getStatusLabel(shipment.status),
            location: getLocationFromStatus(shipment.status, shipment.currentLocation),
            timestamp: shipment.updatedAt || new Date().toISOString(),
            progress: getProgressFromStatus(shipment.status)
          },
          estimatedDelivery: shipment.estimatedArrivalDate,
          location: getLocationFromStatus(shipment.status, shipment.currentLocation),
          updatedAt: shipment.updatedAt,
          trackingHistory: shipment.milestones || []
        });
      }
    } catch (error) {
      console.error('Tracking API error:', error);
    } finally {
      setTrackingLoading(false);
    }
  };

  const getDisplayStatus = () => {
    if (trackingLoading) {
      return {
        label: 'Loading...',
        color: 'bg-gray-100 text-gray-600',
        icon: Loader2,
        progress: null,
        iconClass: 'text-gray-500'
      };
    }
    
    const status = currentStatus;
    const label = getStatusLabel(status);
    const progress = currentProgress;
    const location = currentLocation;
    
    const statusColors = {
      'delivered': 'bg-green-100 text-green-700 border-green-200',
      'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'in_transit': 'bg-blue-100 text-blue-700 border-blue-200',
      'in_transit_sea_freight': 'bg-blue-100 text-blue-700 border-blue-200',
      'arrived_at_destination_port': 'bg-green-100 text-green-700 border-green-200',
      'arrived': 'bg-green-100 text-green-700 border-green-200',
      'customs_cleared': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'out_for_delivery': 'bg-sky-100 text-sky-700 border-sky-200',
      'dispatched': 'bg-orange-100 text-orange-700 border-orange-200',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'on_hold': 'bg-orange-100 text-orange-700 border-orange-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'ready_for_dispatch': 'bg-purple-100 text-purple-700 border-purple-200',
      'loaded_in_container': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    
    const statusIcons = {
      'delivered': CheckCircle,
      'completed': Award,
      'in_transit': Truck,
      'in_transit_sea_freight': Ship,
      'arrived_at_destination_port': Flag,
      'arrived': Flag,
      'customs_cleared': Shield,
      'out_for_delivery': Truck,
      'dispatched': Send,
      'pending': Clock,
      'on_hold': Pause,
      'cancelled': Ban,
      'ready_for_dispatch': Send,
      'loaded_in_container': Package
    };
    
    return {
      label: label,
      color: statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200',
      icon: statusIcons[status] || Package,
      progress: progress,
      location: location,
      status: status,
      iconClass: 'text-current'
    };
  };

  const display = getDisplayStatus();
  const StatusIcon = display.icon;

  // Check if shipment can be modified
  const canModify = currentStatus !== 'delivered' && 
                     currentStatus !== 'completed' && 
                     currentStatus !== 'cancelled';

 

 // ShipmentCard কম্পোনেন্ট - handleCancel এবং handleOnHold ফাংশন আপডেট করুন

// Handle Cancel - সম্পূর্ণরূপে কনটেইনার থেকে রিমুভ করে
const handleCancel = async () => {
  if (!canModify) {
    toast.warning(`Cannot cancel ${currentStatus} shipment`);
    return;
  }
  
  if (!cancelReason.trim()) {
    toast.warning('Please provide a cancellation reason');
    return;
  }
  
  setUpdating(true);
  try {
    // ✅ Cancel করার সময় সরাসরি removeShipmentFromConsolidation কল করুন
    const result = await removeShipmentFromConsolidation(consolidationId, shipment._id);
    
    if (result.success) {
      setCurrentStatus('cancelled');
      setCurrentProgress(0);
      setCurrentLocation('Cancelled');
      toast.warning(`❌ Shipment ${shipment.trackingNumber} cancelled and removed from container`);
      
      if (onShipmentUpdated) onShipmentUpdated();
      setShowCancelReason(false);
      setCancelReason('');
    } else {
      toast.error(result.message || 'Failed to cancel shipment');
    }
  } catch (error) {
    console.error('Cancel error:', error);
    toast.error(error.message || 'Failed to cancel shipment');
  } finally {
    setUpdating(false);
  }
};

// Handle Hold - শুধুমাত্র status change, কনটেইনার থেকে রিমুভ না
const handleOnHold = async () => {
  if (!canModify) {
    toast.warning(`Cannot put ${currentStatus} shipment on hold`);
    return;
  }
  
  if (!confirm(`Put shipment ${shipment.trackingNumber} on hold?`)) return;
  
  setUpdating(true);
  try {
    const previousStatus = currentStatus;
    
    // ✅ Hold করার সময় updateShipmentInConsolidation ব্যবহার করুন (remove না)
    const result = await updateShipmentInConsolidation(consolidationId, shipment._id, {
      status: 'on_hold',
      holdReason: 'Manual hold by admin',
      notes: 'Shipment placed on hold',
      previousStatus: previousStatus
    });
    
    if (result.success) {
      // ✅ শুধুমাত্র status পরিবর্তন করুন, location পরিবর্তন করবেন না
      setCurrentStatus('on_hold');
      setCurrentProgress(0);
      // ✅ Location পরিবর্তন করবেন না - পুরনো location ই থাকবে
      toast.info(`📦 Shipment ${shipment.trackingNumber} is on hold (still in container)`);
      
      if (trackingData) {
        setTrackingData({
          ...trackingData,
          status: 'on_hold',
          currentStatus: {
            ...trackingData.currentStatus,
            status: 'on_hold',
            label: 'On Hold',
            progress: 0,
            location: trackingData.currentStatus?.location || currentLocation  // Location রাখুন
          }
        });
      }
      
      if (onShipmentUpdated) onShipmentUpdated();
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    console.error('Hold error:', error);
    toast.error('Failed to put shipment on hold');
  } finally {
    setUpdating(false);
  }
};

// Handle Resume - শুধুমাত্র status restore, location ঠিক রাখে
const handleResume = async () => {
  if (currentStatus !== 'on_hold') {
    toast.warning('Only on hold shipments can be resumed');
    return;
  }
  
  setUpdating(true);
  try {
    const previousStatus = shipment.previousStatus || 'in_progress';
    
    const result = await updateShipmentInConsolidation(consolidationId, shipment._id, {
      status: previousStatus,
      notes: 'Resumed from hold'
    });
    
    if (result.success) {
      // ✅ Location পরিবর্তন করবেন না
      setCurrentStatus(previousStatus);
      setCurrentProgress(getProgressFromStatus(previousStatus));
      // ✅ location রাখুন
      toast.success(`✅ Shipment ${shipment.trackingNumber} resumed`);
      
      if (trackingData) {
        setTrackingData({
          ...trackingData,
          status: previousStatus,
          currentStatus: {
            ...trackingData.currentStatus,
            status: previousStatus,
            label: getStatusLabel(previousStatus),
            progress: getProgressFromStatus(previousStatus),
            location: trackingData.currentStatus?.location || currentLocation  // Location রাখুন
          }
        });
      }
      
      if (onShipmentUpdated) onShipmentUpdated();
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    console.error('Resume error:', error);
    toast.error('Failed to resume shipment');
  } finally {
    setUpdating(false);
  }
};
  const showActions = currentStatus !== 'cancelled' && 
                       currentStatus !== 'delivered' && 
                       currentStatus !== 'completed';

  const getCardStyles = () => {
    const status = currentStatus;
    if (status === 'on_hold') return 'border-orange-300 bg-orange-50';
    if (status === 'cancelled') return 'border-red-300 bg-red-50';
    if (status === 'delivered') return 'border-green-300 bg-green-50';
    if (status === 'completed') return 'border-emerald-300 bg-emerald-50';
    if (status === 'in_transit') return 'border-blue-200 bg-blue-50/30';
    if (status === 'arrived_at_destination_port') return 'border-green-200 bg-green-50/30';
    if (status === 'customs_cleared') return 'border-emerald-200 bg-emerald-50/30';
    return 'border-gray-200 bg-white';
  };

  return (
    <div className={`rounded-lg border overflow-hidden hover:shadow-md transition-all ${getCardStyles()}`}>
      {/* Header - same as before */}
      <div 
        className="p-2 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${
            currentStatus === 'on_hold' ? 'bg-orange-100' :
            currentStatus === 'cancelled' ? 'bg-red-100' :
            currentStatus === 'delivered' ? 'bg-green-100' :
            currentStatus === 'completed' ? 'bg-emerald-100' :
            currentStatus === 'in_transit' ? 'bg-blue-100' :
            currentStatus === 'arrived_at_destination_port' ? 'bg-green-100' :
            currentStatus === 'customs_cleared' ? 'bg-emerald-100' :
            'bg-purple-100'
          }`}>
            <StatusIcon className={`h-3 w-3 ${
              currentStatus === 'on_hold' ? 'text-orange-600' :
              currentStatus === 'cancelled' ? 'text-red-600' :
              currentStatus === 'delivered' ? 'text-green-600' :
              currentStatus === 'completed' ? 'text-emerald-600' :
              currentStatus === 'in_transit' ? 'text-blue-600' :
              currentStatus === 'arrived_at_destination_port' ? 'text-green-600' :
              currentStatus === 'customs_cleared' ? 'text-emerald-600' :
              'text-purple-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className="font-mono text-xs font-medium truncate">
                {shipment.trackingNumber || `SHP-${shipment._id?.slice(-6)}`}
              </span>
              
              {/* Status Badge - Using current status */}
              <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] rounded-full border ${display.color}`}>
                <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                {display.label}
              </span>

              {/* Current Location */}
              {currentLocation && currentLocation !== 'Processing' && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] rounded-full bg-gray-100 text-gray-600">
                  <MapPin className="h-2 w-2 mr-0.5" />
                  <span className="truncate max-w-[80px]">{currentLocation}</span>
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5 flex items-center space-x-2">
              <span>{shipment.weight || 0} kg • {shipment.volume || 0} m³</span>
              {trackingData?.estimatedDelivery && (
                <span className="text-green-600 flex items-center">
                  <Calendar className="h-2.5 w-2.5 mr-0.5" />
                  Est: {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Progress bar */}
          {display.progress !== null && display.progress > 0 && (
            <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${display.progress}%` }}
              />
            </div>
          )}
          {trackingLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-gray-500" />
          ) : (
            <ChevronDown className="h-3 w-3 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Details - same as before */}
      {expanded && (
        <div className="p-2 bg-gray-50 border-t">
          {/* Tracking Timeline Section */}
          {trackingData?.trackingHistory && trackingData.trackingHistory.length > 0 && (
            <div className="mb-3">
              <h4 className="text-[10px] font-semibold text-gray-700 mb-2 flex items-center">
                <Clock className="h-3 w-3 mr-1 text-blue-500" />
                Tracking Timeline
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...trackingData.trackingHistory]
                  .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
                  .map((event, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 mt-1 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-medium">
                          {event.status?.replace(/_/g, ' ') || event.label || 'Update'}
                        </p>
                        {event.description && (
                          <p className="text-[9px] text-gray-500">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-[9px] text-gray-400 flex items-center mt-0.5">
                            <MapPin className="h-2 w-2 mr-0.5" />
                            {event.location}
                          </p>
                        )}
                        <p className="text-[8px] text-gray-400">
                          {new Date(event.timestamp || event.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Shipment Details */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-2">
            <div className="bg-white p-1.5 rounded">
              <span className="text-gray-500">Tracking Number:</span>
              <p className="font-mono font-medium text-[10px]">{shipment.trackingNumber || 'N/A'}</p>
            </div>
            <div className="bg-white p-1.5 rounded">
              <span className="text-gray-500">Status:</span>
              <p className="font-medium flex items-center">
                <StatusIcon className="h-3 w-3 mr-1" />
                {display.label}
              </p>
            </div>
            <div className="bg-white p-1.5 rounded">
              <span className="text-gray-500">Progress:</span>
              <div className="flex items-center space-x-1">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${display.progress}%` }}
                  />
                </div>
                <span className="text-[9px] font-medium">{display.progress}%</span>
              </div>
            </div>
            {/* <div className="bg-white p-1.5 rounded">
              <span className="text-gray-500">Last Updated:</span>
              <p className="font-medium text-[10px]">{trackingData?.updatedAt ? new Date(trackingData.updatedAt).toLocaleString() : 'N/A'}</p>
            </div> */}
            <div className="bg-white p-1.5 rounded col-span-2">
              <span className="text-gray-500">Current Location:</span>
              <p className="font-medium text-blue-600 text-[10px]">{currentLocation}</p>
            </div>
          </div>
          
          {/* Package Details */}
          {shipment.packages && shipment.packages.length > 0 && (
            <div className="mb-2">
              <h4 className="text-[10px] font-semibold text-gray-700 mb-1">Packages</h4>
              <div className="space-y-1">
                {shipment.packages.map((pkg, idx) => (
                  <div key={idx} className="bg-white p-1.5 rounded text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{pkg.description || 'Package'}</span>
                      <span className="text-gray-500">Qty: {pkg.quantity}</span>
                    </div>
                    <div className="text-gray-500 text-[9px]">
                      {pkg.weight} kg • {pkg.volume} m³
                      {pkg.dimensions && ` • ${pkg.dimensions.length}x${pkg.dimensions.width}x${pkg.dimensions.height}${pkg.dimensions.unit || 'cm'}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-2 pt-2 border-t">
              {currentStatus === 'on_hold' ? (
                <button
                  onClick={handleResume}
                  disabled={updating}
                  className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  {updating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
                  Resume
                </button>
              ) : (
                <>
                  <button
                    onClick={handleOnHold}
                    disabled={updating}
                    className="flex-1 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 disabled:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    {updating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Pause className="h-3 w-3 mr-1" />}
                    Hold
                  </button>
                  {/* <button
                    onClick={() => setShowCancelReason(true)}
                    disabled={updating}
                    className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <Ban className="h-3 w-3 mr-1" />
                    Cancel
                  </button> */}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cancel Reason Modal */}
      {showCancelReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCancelReason(false)}>
          <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-bold mb-2">Cancel Shipment</h4>
            <p className="text-xs text-gray-600 mb-3">
              Shipment: <span className="font-mono">{shipment.trackingNumber}</span>
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide cancellation reason..."
              rows={3}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 mb-3"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCancelReason(false);
                  setCancelReason('');
                }}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim()}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== STAT CARD ====================

const StatCard = ({ title, value, icon: Icon, color = 'orange', subtitle }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-[10px] text-gray-400">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

// ==================== FILTER BAR ====================

const FilterBar = ({ filters, onFilterChange, onClearFilters, totalCount }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking number, container #, or consolidation #..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
          />
        </div>
        
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="px-2 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22] bg-white min-w-[100px]"
        >
          <option value="">All Status</option>
          {CONSOLIDATION_STATUSES.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-2 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center"
        >
          <SlidersHorizontal className="h-3 w-3 mr-1" />
          Filters
        </button>

        <button onClick={onClearFilters} className="px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900">
          Clear
        </button>

        <div className="text-xs text-gray-500">
          {totalCount} found
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Main Type</label>
            <select
              value={filters.mainType || ''}
              onChange={(e) => onFilterChange('mainType', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            >
              <option value="">All</option>
              {MAIN_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Container</label>
            <select
              value={filters.containerType || ''}
              onChange={(e) => onFilterChange('containerType', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            >
              <option value="">All</option>
              {CONTAINER_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Origin</label>
            <input
              type="text"
              placeholder="e.g., Shanghai"
              value={filters.origin || ''}
              onChange={(e) => onFilterChange('origin', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Destination</label>
            <input
              type="text"
              placeholder="e.g., Hamburg"
              value={filters.destination || ''}
              onChange={(e) => onFilterChange('destination', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== CONSOLIDATION CARD ====================

const ConsolidationCard = ({ 
  consolidation, 
  onView, 
  onEdit, 
  onDelete, 
  onStartConsolidation,
  onCompleteConsolidation,
  onReadyForDispatch, 
  onLoadedClick,
  onDispatch,
  onArrivedClick,
  onCustomsCleared,
  onOutForDelivery,
  onDelivered,
  onComplete,
  onShipmentStatusChange, 
  searchTerm 
}) => {
  const [showShipments, setShowShipments] = useState(false);
  
  if (!consolidation) return null;

  console.log('Rendering ConsolidationCard:', consolidation.consolidationNumber);
  
  // Find which shipments match the search term (for highlighting)
  const matchingShipmentIds = new Set();
  if (searchTerm && consolidation.shipments) {
    const term = searchTerm.toLowerCase();
    consolidation.shipments.forEach(ship => {
      if (ship && ship.trackingNumber?.toLowerCase().includes(term)) {
        matchingShipmentIds.add(ship._id);
      }
    });
  }

  // Find which items match the search term
  const matchingItemIds = new Set();
  if (searchTerm && consolidation.items) {
    const term = searchTerm.toLowerCase();
    consolidation.items.forEach(item => {
      if (item && item.description?.toLowerCase().includes(term)) {
        matchingItemIds.add(item._id || item.shipmentId);
      }
    });
  }
  
  const origin = consolidation.originWarehouse || 'N/A';
  const destination = consolidation.destinationPort || 'N/A';
  const shipmentCount = getShipmentCount(consolidation);
  const totalPackages = getTotalPackages(consolidation);
  const totalVolume = getTotalVolume(consolidation);
  const totalWeight = getTotalWeight(consolidation);
  const containerType = getContainerType(consolidation);
  const mainType = getMainType(consolidation);
  const shipments = consolidation.shipments || [];
  const items = consolidation.items || [];

  const getActionButton = () => {
    switch(consolidation.status) {
      case 'draft':
        return (
          <button
            onClick={() => onStartConsolidation(consolidation)}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center"
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={() => onCompleteConsolidation(consolidation)}
            className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 flex items-center"
          >
            <Package className="h-3 w-3 mr-1" />
            In Progress
          </button>
        );
      case 'consolidated':
        return (
          <button
            onClick={() => onReadyForDispatch(consolidation)}
            className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 flex items-center"
          >
            <Send className="h-3 w-3 mr-1" />
            Ready 
          </button>
        );
      case 'ready_for_dispatch':
        return (
          <button
            onClick={() => onLoadedClick(consolidation)}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center"
          >
            <Package className="h-3 w-3 mr-1" />
            Load
          </button>
        );
      case 'loaded':
        return (
          <button
            onClick={() => onDispatch(consolidation)}
            className="px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 flex items-center"
          >
            <Send className="h-3 w-3 mr-1" />
            Dispatch
          </button>
        );
      case 'in_transit':
        return (
          <button
            onClick={() => onArrivedClick(consolidation)}
            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Arrived
          </button>
        );
      case 'arrived':
        return (
          <button
            onClick={() => onCustomsCleared(consolidation)}
            className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 flex items-center"
          >
            <Shield className="h-3 w-3 mr-1" />
            Customs
          </button>
        );
      case 'customs_cleared':
        return (
          <button
            onClick={() => onOutForDelivery(consolidation)}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center"
          >
            <Truck className="h-3 w-3 mr-1" />
            Out
          </button>
        );
      case 'out_for_delivery':
        return (
          <button
            onClick={() => onDelivered(consolidation)}
            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Deliver
          </button>
        );
      case 'delivered':
        return (
          <button
            onClick={() => onComplete(consolidation)}
            className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 flex items-center"
          >
            <Award className="h-3 w-3 mr-1" />
            Complete
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Container className="h-4 w-4" />
            <span className="font-mono text-xs font-medium">
              {consolidation.consolidationNumber || consolidation._id?.slice(-6)}
            </span>
          </div>
          <div className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
            {getMainTypeName(mainType)}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          <div className="bg-white/10 rounded px-1 py-1 text-center">
            <Ship className="h-2.5 w-2.5 mx-auto mb-0.5 opacity-80" />
            <p className="text-[9px] opacity-80">Ship</p>
            <p className="text-xs font-bold">{shipmentCount}</p>
          </div>
          <div className="bg-white/10 rounded px-1 py-1 text-center">
            <Package className="h-2.5 w-2.5 mx-auto mb-0.5 opacity-80" />
            <p className="text-[9px] opacity-80">Pkg</p>
            <p className="text-xs font-bold">{totalPackages}</p>
          </div>
          <div className="bg-white/10 rounded px-1 py-1 text-center">
            <Weight className="h-2.5 w-2.5 mx-auto mb-0.5 opacity-80" />
            <p className="text-[9px] opacity-80">Wt</p>
            <p className="text-xs font-bold">{formatWeight(totalWeight, true)}</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-3 pt-2">
        {getStatusBadge(consolidation.status)}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Route */}
        <div className="bg-gray-50 p-2 rounded mb-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex-1 truncate">{origin}</div>
            <ChevronRight className="h-3 w-3 text-gray-400 mx-1 flex-shrink-0" />
            <div className="flex-1 truncate text-right">{destination}</div>
          </div>
        </div>

        {/* Container */}
        <div className="bg-purple-50 p-2 rounded mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-700 font-medium">{containerType}</span>
            <span className="font-mono text-purple-600">{consolidation.containerNumber || 'No container'}</span>
          </div>
        </div>

        {/* Volume/Weight Progress */}
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-[9px]">
            <span>Vol: {formatVolume(totalVolume, true)}</span>
            <span>Wt: {formatWeight(totalWeight, true)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${Math.min((totalVolume / 68) * 100, 100)}%` }}></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => onView(consolidation)}
              className="p-1 hover:bg-blue-100 rounded text-blue-600"
              title="View"
            >
              <Eye className="h-3 w-3" />
            </button>
            {(consolidation.status === 'draft' || consolidation.status === 'in_progress') && (
              <>
                <button
                  onClick={() => onEdit(consolidation._id)}
                  className="p-1 hover:bg-green-100 rounded text-green-600"
                  title="Edit"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onDelete(consolidation._id)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
          {getActionButton()}
        </div>

        {/* Shipments Toggle */} 

{/* Shipments Toggle */}
{(items.length > 0 || shipments.length > 0) && (
  <div className="mt-2">
    <button
      onClick={() => setShowShipments(!showShipments)}
      className="w-full flex items-center justify-between text-[10px] text-gray-500 hover:text-gray-700"
    >
      <span>
        {shipments.length} Shipment(s)
        {shipments.filter(s => s.status === 'on_hold').length > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-full">
            {shipments.filter(s => s.status === 'on_hold').length} on hold
          </span>
        )}
        {shipments.filter(s => s.status === 'cancelled').length > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full">
            {shipments.filter(s => s.status === 'cancelled').length} cancelled
          </span>
        )}
      </span>
      {showShipments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
    </button>
    
    {showShipments && (
      <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
        {shipments.map((shipment, idx) => {
          if (!shipment) return null;
          return (
            <ShipmentCard
              key={idx}
              shipment={shipment}
              consolidationId={consolidation._id}
              consolidationStatus={consolidation.status}
              onShipmentUpdated={() => {
                if (typeof onShipmentStatusChange === 'function') {
                  onShipmentStatusChange();
                }
              }}
            />
          );
        })}
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
};

// ==================== DETAILS VIEW MODAL ====================

const ConsolidationDetailsModal = ({ 
  isOpen, 
  onClose, 
  consolidation, 
  onEdit, 
  onDelete, 
  onStartConsolidation,
  onCompleteConsolidation,
  onReadyForDispatch,
  onLoadedClick,
  onDispatch,
  onArrivedClick,
  onCustomsCleared,
  onOutForDelivery,
  onDelivered,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [shipments, setShipments] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (consolidation) {
      console.log('Details Modal - Consolidation:', consolidation);
      if (consolidation.shipments) {
        setShipments(consolidation.shipments);
      }
      if (consolidation.items) {
        setItems(consolidation.items);
      }
    }
  }, [consolidation]);

  if (!isOpen || !consolidation) return null;

  const handleEdit = () => {
    onEdit(consolidation._id);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this consolidation?')) {
      onDelete(consolidation._id);
      onClose();
    }
  };

  const getActionButton = () => {
    switch(consolidation.status) {
      case 'draft':
        return (
          <button
            onClick={() => {
              onStartConsolidation(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center"
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={() => {
              onCompleteConsolidation(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center"
          >
            <Package className="h-3 w-3 mr-1" />
            Complete
          </button>
        );
      case 'consolidated':
        return (
          <button
            onClick={() => {
              onReadyForDispatch(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 flex items-center"
          >
            <Send className="h-3 w-3 mr-1" />
            Ready
          </button>
        );
      case 'ready_for_dispatch':
        return (
          <button
            onClick={() => {
              onLoadedClick(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center"
          >
            <Package className="h-3 w-3 mr-1" />
            Load
          </button>
        );
      case 'loaded':
        return (
          <button
            onClick={() => {
              onDispatch(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 flex items-center"
          >
            <Send className="h-3 w-3 mr-1" />
            Dispatch
          </button>
        );
      case 'in_transit':
        return (
          <button
            onClick={() => {
              onArrivedClick(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Arrived
          </button>
        );
      case 'arrived':
        return (
          <button
            onClick={() => {
              onCustomsCleared(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center"
          >
            <Shield className="h-3 w-3 mr-1" />
            Customs
          </button>
        );
      case 'customs_cleared':
        return (
          <button
            onClick={() => {
              onOutForDelivery(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center"
          >
            <Truck className="h-3 w-3 mr-1" />
            Out
          </button>
        );
      case 'out_for_delivery':
        return (
          <button
            onClick={() => {
              onDelivered(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Deliver
          </button>
        );
      case 'delivered':
        return (
          <button
            onClick={() => {
              onComplete(consolidation);
              onClose();
            }}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center"
          >
            <Award className="h-3 w-3 mr-1" />
            Complete
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center">
              <Container className="h-4 w-4 mr-2 text-[#E67E22]" />
              Consolidation Details
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {consolidation.consolidationNumber}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(consolidation.status)}
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-4">
          <div className="flex space-x-4">
            {['overview', 'shipments', 'documents', 'timeline'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 text-xs font-medium capitalize ${
                  activeTab === tab
                    ? 'border-[#E67E22] text-[#E67E22]'
                    : 'border-transparent text-gray-500'
                }`}
              >
                {tab} {tab === 'shipments' && `(${shipments.length + items.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-500">Consolidation #</p>
                  <p className="text-xs font-mono">{consolidation.consolidationNumber}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-500">Type</p>
                  <p className="text-xs">{getMainTypeName(consolidation.mainType)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded">
                <p className="text-[10px] text-gray-500 mb-1">Route</p>
                <div className="flex items-center text-xs">
                  <span className="truncate">{consolidation.originWarehouse || 'N/A'}</span>
                  <ChevronRight className="h-3 w-3 text-gray-400 mx-2 flex-shrink-0" />
                  <span className="truncate">{consolidation.destinationPort || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-500">Container</p>
                  <p className="text-xs font-medium">{consolidation.containerType || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-500">Number</p>
                  <p className="text-xs font-mono">{consolidation.containerNumber || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-500">Seal</p>
                  <p className="text-xs font-mono">{consolidation.sealNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 p-2 rounded">
                  <Ship className="h-3 w-3 text-blue-600 mb-1" />
                  <p className="text-[10px] text-gray-500">Shipments</p>
                  <p className="text-sm font-bold">{getShipmentCount(consolidation)}</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <Package className="h-3 w-3 text-green-600 mb-1" />
                  <p className="text-[10px] text-gray-500">Packages</p>
                  <p className="text-sm font-bold">{getTotalPackages(consolidation)}</p>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <Box className="h-3 w-3 text-purple-600 mb-1" />
                  <p className="text-[10px] text-gray-500">Volume</p>
                  <p className="text-xs font-bold">{formatVolume(getTotalVolume(consolidation), true)}</p>
                </div>
              </div>

              {consolidation.notes && (
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-500">Notes</p>
                  <p className="text-xs">{consolidation.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="space-y-3">
              {/* Items Section */}
              {items.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2">Items ({items.length})</h4>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <ShipmentItemCard key={idx} item={item} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Shipments Section */}
              {shipments.length > 0 && (
                <div className={items.length > 0 ? 'mt-4' : ''}>
                  <h4 className="text-xs font-semibold mb-2">Shipments ({shipments.length})</h4>
                  <div className="space-y-2">
                    {shipments.map((shipment, idx) => (
                      <ShipmentCard key={idx} shipment={shipment} />
                    ))}
                  </div>
                </div>
              )}

              {items.length === 0 && shipments.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No shipments or items in this consolidation
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-2">
              {consolidation.documents?.length > 0 ? (
                consolidation.documents.map((doc, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium capitalize truncate">{doc.type}</p>
                        <p className="text-[10px] text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {doc.fileData && (
                      <button
                        onClick={() => window.open(doc.fileData)}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No documents uploaded
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-2">
              {consolidation.timeline?.length > 0 ? (
                consolidation.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#E67E22]"></div>
                    <div className="flex-1 bg-gray-50 p-2 rounded">
                      <p className="text-xs font-medium">{event.status}</p>
                      <p className="text-[10px] text-gray-500">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No timeline events
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between items-center">
          <div className="flex space-x-2">
            {(consolidation.status === 'draft' || consolidation.status === 'in_progress') && (
              <>
                <button onClick={handleEdit} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 flex items-center">
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </button>
                <button onClick={handleDelete} className="px-3 py-1.5 text-sm border rounded hover:bg-red-50 text-red-600 flex items-center">
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </button>
              </>
            )}
          </div>
          {getActionButton()}
        </div>
      </div>
    </div>
  );
};

// ==================== TABLE ROW ====================

const TableRow = ({ 
  consolidation, 
  onView, 
  onEdit, 
  onDelete, 
  onStartConsolidation,
  onCompleteConsolidation,
  onReadyForDispatch,
  onLoadedClick,
  onDispatch,
  onArrivedClick,
  onCustomsCleared,
  onOutForDelivery,
  onDelivered,
  onComplete,
  searchTerm
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Check if this row matches search (for highlighting)
  const isMatch = searchTerm ? consolidationMatchesSearch(consolidation, searchTerm) : false;
  
  const origin = consolidation.originWarehouse || 'N/A';
  const destination = consolidation.destinationPort || 'N/A';
  const shipmentCount = getShipmentCount(consolidation);
  const totalVolume = getTotalVolume(consolidation);
  const totalWeight = getTotalWeight(consolidation);
  const containerType = getContainerType(consolidation);
  const mainType = getMainType(consolidation);
  const shipments = consolidation.shipments || [];

  const getActionButtons = () => {
    const buttons = [];
    
    buttons.push(
      <button key="view" onClick={() => onView(consolidation)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="View">
        <Eye className="h-3 w-3" />
      </button>
    );

    if (consolidation.status === 'draft' || consolidation.status === 'in_progress') {
      buttons.push(
        <button key="edit" onClick={() => onEdit(consolidation._id)} className="p-1 hover:bg-green-100 rounded text-green-600" title="Edit">
          <Edit className="h-3 w-3" />
        </button>
      );
    }

    if (consolidation.status === 'draft') {
      buttons.push(
        <button key="start" onClick={() => onStartConsolidation(consolidation)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Start">
          <Play className="h-3 w-3" />
        </button>
      );
    }

    if (consolidation.status === 'in_progress') {
      buttons.push(
        <button key="complete" onClick={() => onCompleteConsolidation(consolidation)} className="p-1 hover:bg-purple-100 rounded text-purple-600" title="Complete">
          <Package className="h-3 w-3" />
        </button>
      );
    }

    if (consolidation.status === 'consolidated') {
      buttons.push(
        <button key="ready" onClick={() => onReadyForDispatch(consolidation)} className="p-1 hover:bg-orange-100 rounded text-orange-600" title="Ready">
          <Send className="h-3 w-3" />
        </button>
      );
    }

    if (consolidation.status === 'draft' || consolidation.status === 'in_progress' || consolidation.status === 'cancelled') {
      buttons.push(
        <button key="delete" onClick={() => onDelete(consolidation._id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete">
          <Trash2 className="h-3 w-3" />
        </button>
      );
    }

    return buttons;
  };

  return (
    <>
      <tr 
        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isMatch ? 'bg-green-50' : ''}`} 
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" className="rounded border-gray-300 text-[#E67E22] focus:ring-[#E67E22] h-3 w-3" />
        </td>
        <td className="px-2 py-2">
          <div className="flex items-center">
            <Container className="h-3 w-3 text-[#E67E22] mr-1" />
            <span className="font-mono text-xs">{consolidation.consolidationNumber?.slice(-8)}</span>
          </div>
        </td>
        <td className="px-2 py-2">{getStatusBadge(consolidation.status)}</td>
        <td className="px-2 py-2 text-xs">{getMainTypeName(mainType)}</td>
        <td className="px-2 py-2 text-xs">{containerType}</td>
        <td className="px-2 py-2 text-xs">
          <div className="truncate max-w-[100px]" title={`${origin} → ${destination}`}>
            {origin} → {destination}
          </div>
        </td>
        <td className="px-2 py-2 text-xs">{shipmentCount}</td>
        <td className="px-2 py-2 text-xs">
          {formatVolume(totalVolume, true)} / {formatWeight(totalWeight, true)}
        </td>
        <td className="px-2 py-2">
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            {getActionButtons()}
          </div>
        </td>
      </tr>
      {expanded && shipments.length > 0 && (
        <tr className="bg-gray-50">
          <td colSpan="9" className="px-2 py-2">
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {shipments.map((shipment, idx) => {
                if (!shipment) return null;
                return (
                  <div key={idx} className="bg-white p-2 rounded text-xs border">
                    <div className="flex items-center justify-between">
                      <span className="font-mono">{shipment.trackingNumber || `SHP-${idx + 1}`}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100">
                        {shipment.status?.replace(/_/g, ' ') || 'pending'}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      ID: {shipment._id?.slice(-8) || 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ==================== LIST ITEM ====================

const ListItem = ({ 
  consolidation, 
  onView, 
  onEdit, 
  onDelete, 
  onStartConsolidation,
  onCompleteConsolidation,
  onReadyForDispatch,
  onLoadedClick,
  onDispatch,
  onArrivedClick,
  onCustomsCleared,
  onOutForDelivery,
  onDelivered,
  onComplete,
  searchTerm
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Check if this item matches search (for highlighting)
  const isMatch = searchTerm ? consolidationMatchesSearch(consolidation, searchTerm) : false;
  
  const origin = consolidation.originWarehouse || 'N/A';
  const destination = consolidation.destinationPort || 'N/A';
  const shipmentCount = getShipmentCount(consolidation);
  const totalVolume = getTotalVolume(consolidation);
  const totalWeight = getTotalWeight(consolidation);
  const containerType = getContainerType(consolidation);
  const mainType = getMainType(consolidation);
  const shipments = consolidation.shipments || [];

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all ${isMatch ? 'ring-2 ring-green-400' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex-shrink-0">
            <Container className="h-4 w-4 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-xs font-medium">
                {consolidation.consolidationNumber || consolidation._id?.slice(-8)}
              </span>
              {getStatusBadge(consolidation.status)}
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded-full">
                {getMainTypeName(mainType)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px]">
              <div>
                <span className="text-gray-500">Container:</span>
                <span className="ml-1 font-medium">{containerType}</span>
              </div>
              <div>
                <span className="text-gray-500">Route:</span>
                <span className="ml-1 truncate">{origin} → {destination}</span>
              </div>
              <div>
                <span className="text-gray-500">Shipments:</span>
                <span className="ml-1 font-medium">{shipmentCount}</span>
              </div>
              <div>
                <span className="text-gray-500">Vol/Wt:</span>
                <span className="ml-1">{formatVolume(totalVolume, true)}/{formatWeight(totalWeight, true)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          <button onClick={() => onView(consolidation)} className="p-1 hover:bg-blue-100 rounded text-blue-600">
            <Eye className="h-3 w-3" />
          </button>
          {(consolidation.status === 'draft' || consolidation.status === 'in_progress') && (
            <button onClick={() => onEdit(consolidation._id)} className="p-1 hover:bg-green-100 rounded text-green-600">
              <Edit className="h-3 w-3" />
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-gray-100 rounded">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {expanded && shipments.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <p className="text-[10px] font-medium text-gray-600 mb-1">Shipments:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {shipments.map((shipment, idx) => {
              if (!shipment) return null;
              return (
                <div key={idx} className="bg-gray-50 p-2 rounded text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono">{shipment.trackingNumber || `SHP-${idx + 1}`}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100">
                      {shipment.status?.replace(/_/g, ' ') || 'pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== EDIT MODAL ====================

const EditConsolidationModal = ({ isOpen, onClose, consolidation, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    containerNumber: '',
    containerType: '',
    sealNumber: '',
    estimatedDeparture: '',
    notes: ''
  });

  useEffect(() => {
    if (consolidation) {
      setFormData({
        containerNumber: getContainerNumber(consolidation),
        containerType: getContainerType(consolidation),
        sealNumber: getSealNumber(consolidation),
        estimatedDeparture: consolidation.estimatedDeparture?.split('T')[0] || '',
        notes: consolidation.notes || ''
      });
    }
  }, [consolidation]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidation(consolidation._id, formData);
      
      if (result.success) {
        toast.success('Consolidation updated');
        onUpdated();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold">Edit Consolidation</h3>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Container Number</label>
            <input
              type="text"
              value={formData.containerNumber}
              onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Container Type</label>
            <select
              value={formData.containerType}
              onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            >
              <option value="">Select</option>
              {CONTAINER_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Seal Number</label>
            <input
              type="text"
              value={formData.sealNumber}
              onChange={(e) => setFormData({ ...formData, sealNumber: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Departure</label>
            <input
              type="date"
              value={formData.estimatedDeparture}
              onChange={(e) => setFormData({ ...formData, estimatedDeparture: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== BULK ACTIONS BAR ====================

const BulkActionsBar = ({ selectedCount, onClear, onBulkAction }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center space-x-2 z-50 text-xs">
      <span className="font-medium px-2">{selectedCount} selected</span>
      <div className="h-3 w-px bg-gray-200" />
      <button onClick={() => onBulkAction('ready')} className="px-2 py-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-100">
        Ready
      </button>
      <button onClick={() => onBulkAction('dispatch')} className="px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">
        Dispatch
      </button>
      <button onClick={() => onBulkAction('delete')} className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">
        Delete
      </button>
      <div className="h-3 w-px bg-gray-200" />
      <button onClick={onClear} className="px-2 py-1 text-gray-500 hover:text-gray-700">
        Clear
      </button>
    </div>
  );
};

// ==================== EXPORT MODAL ====================

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState('csv');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-sm w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold">Export</h3>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {['csv', 'excel', 'pdf'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`p-1.5 border rounded text-xs capitalize ${
                    format === f ? 'bg-[#E67E22] text-white border-[#E67E22]' : 'hover:bg-gray-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onExport({ format })}
            className="px-3 py-1.5 text-sm bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400]"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== START CONSOLIDATION MODAL ====================

const StartConsolidationModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'in_progress',
        notes: `Consolidation started. ${notes}`
      });

      if (result.success) {
        toast.success('✅ Consolidation started successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to start consolidation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Play className="h-4 w-4 mr-2 text-blue-600" />
            Start Consolidation
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any notes about starting this consolidation..."
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="bg-blue-50 p-2 rounded">
            <div className="flex items-start">
              <Info className="h-3 w-3 text-blue-600 mr-1 mt-0.5" />
              <p className="text-[10px] text-blue-700">
                This will move the consolidation from Draft to In Progress.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Starting...
              </>
            ) : (
              'Start'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPLETE CONSOLIDATION MODAL ====================

const CompleteConsolidationModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (consolidation && isOpen) {
      const shipmentCount = consolidation.shipments?.length || consolidation.totalShipments || 0;
      
      const missing = [];
      const warnings = [];

      if (shipmentCount === 0) missing.push('At least one shipment is required');
      if (!consolidation.containerType) missing.push('Container type is required');
      if (!consolidation.containerNumber) missing.push('Container number is required');
      if (!consolidation.originWarehouse) missing.push('Origin warehouse is required');
      if (!consolidation.destinationPort) missing.push('Destination port is required');
      if (!consolidation.totalWeight || consolidation.totalWeight === 0) warnings.push('Total weight is 0 kg');
      if (!consolidation.totalVolume || consolidation.totalVolume === 0) warnings.push('Total volume is 0 CBM');

      setValidationResults({
        ready: missing.length === 0,
        missing,
        warnings
      });
    }
  }, [consolidation, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'consolidated',
        notes: `Consolidation completed. ${notes}`
      });

      if (result.success) {
        toast.success('✅ Consolidation completed');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to complete consolidation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Package className="h-4 w-4 mr-2 text-purple-600" />
            Complete Consolidation
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Validation */}
          {validationResults && (
            <>
              {validationResults.missing.length > 0 && (
                <div className="bg-red-50 p-2 rounded">
                  <p className="text-xs font-medium text-red-800 mb-1">Required:</p>
                  <ul className="list-disc list-inside">
                    {validationResults.missing.map((item, i) => (
                      <li key={i} className="text-[10px] text-red-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResults.warnings.length > 0 && (
                <div className="bg-yellow-50 p-2 rounded">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Warnings:</p>
                  <ul className="list-disc list-inside">
                    {validationResults.warnings.map((item, i) => (
                      <li key={i} className="text-[10px] text-yellow-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (validationResults && !validationResults.ready)}
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
              validationResults && !validationResults.ready
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== LOADED MODAL ====================

const LoadedModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loadedDate: new Date().toISOString().split('T')[0],
    loadedTime: new Date().toTimeString().slice(0, 5),
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (consolidation) {
      setFormData(prev => ({
        ...prev,
        location: consolidation.originWarehouse || 'Warehouse'
      }));
    }
  }, [consolidation]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'loaded',
        notes: `Loaded at ${formData.location} on ${formData.loadedDate} ${formData.loadedTime}. ${formData.notes}`,
        location: formData.location
      });

      if (result.success) {
        toast.success('✅ Container marked as loaded');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Package className="h-4 w-4 mr-2 text-blue-600" />
            Mark as Loaded
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Loaded Date
              </label>
              <input
                type="date"
                value={formData.loadedDate}
                onChange={(e) => setFormData({...formData, loadedDate: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Loaded Time
              </label>
              <input
                type="time"
                value={formData.loadedTime}
                onChange={(e) => setFormData({...formData, loadedTime: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Warehouse A, Dock 3"
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== DISPATCH MODAL ====================

const DispatchModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dispatchDate: new Date().toISOString().split('T')[0],
    dispatchTime: new Date().toTimeString().slice(0, 5),
    carrierName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.carrierName) {
      toast.warning('Please enter carrier name');
      return;
    }

    setLoading(true);
    try {
      const dispatchResult = await updateConsolidationStatus(consolidation._id, {
        status: 'dispatched',
        notes: `Dispatched on ${formData.dispatchDate} at ${formData.dispatchTime} with ${formData.carrierName}. Vehicle: ${formData.vehicleNumber || 'N/A'}, Driver: ${formData.driverName || 'N/A'}. ${formData.notes}`
      });

      if (dispatchResult.success) {
        await updateConsolidation(consolidation._id, {
          actualDeparture: new Date(formData.dispatchDate + 'T' + formData.dispatchTime)
        });

        toast.success('✅ Consolidation dispatched');

        setTimeout(async () => {
          try {
            await updateConsolidationStatus(consolidation._id, {
              status: 'in_transit',
              notes: `In transit with ${formData.carrierName}`
            });
            toast.info('🚚 Now in transit');
            onSuccess();
          } catch (error) {
            console.error('Auto transit update failed:', error);
          }
        }, 2000);

        onClose();
      } else {
        toast.error(dispatchResult.message);
      }
    } catch (error) {
      toast.error('Failed to dispatch');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Send className="h-4 w-4 mr-2 text-amber-600" />
            Dispatch
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dispatch Date
              </label>
              <input
                type="date"
                value={formData.dispatchDate}
                onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dispatch Time
              </label>
              <input
                type="time"
                value={formData.dispatchTime}
                onChange={(e) => setFormData({ ...formData, dispatchTime: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Carrier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.carrierName}
              onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
              placeholder="e.g., Maersk, FedEx"
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              placeholder="e.g., TR-1234"
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Driver name"
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Driver Phone
              </label>
              <input
                type="text"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="Phone"
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.carrierName}
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
              !formData.carrierName
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Dispatching...
              </>
            ) : (
              'Dispatch'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== READY FOR DISPATCH MODAL ====================

const ReadyForDispatchModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (consolidation && isOpen) {
      const missing = [];
      const warnings = [];

      if (consolidation.status !== 'consolidated') missing.push('Status must be "Consolidated"');
      if (!consolidation.containerNumber) missing.push('Container number is required');
      if (!consolidation.containerType) missing.push('Container type is required');
      if (!consolidation.originWarehouse) missing.push('Origin warehouse is required');
      if (!consolidation.destinationPort) missing.push('Destination port is required');
      if ((consolidation.shipments?.length || 0) === 0) missing.push('At least one shipment is required');
      if (!consolidation.totalWeight || consolidation.totalWeight === 0) warnings.push('Weight is 0 kg');
      if (!consolidation.totalVolume || consolidation.totalVolume === 0) warnings.push('Volume is 0 CBM');

      setValidationResults({
        ready: missing.length === 0,
        missing,
        warnings
      });
    }
  }, [consolidation, isOpen]);
 
  const handleMarkAsReady = async () => {
    setLoading(true);
    try {
      const result = await markAsReadyForDispatch(consolidation._id, consolidation);
      
      if (result.success) {
        toast.success('✓ Ready for Dispatch');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as ready');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Send className="h-4 w-4 mr-2 text-orange-600" />
            Ready for Dispatch
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Validation */}
          {validationResults && (
            <>
              {validationResults.missing.length > 0 && (
                <div className="bg-red-50 p-2 rounded">
                  <p className="text-xs font-medium text-red-800 mb-1">Required:</p>
                  <ul className="list-disc list-inside">
                    {validationResults.missing.map((item, i) => (
                      <li key={i} className="text-[10px] text-red-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResults.warnings.length > 0 && (
                <div className="bg-yellow-50 p-2 rounded">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Warnings:</p>
                  <ul className="list-disc list-inside">
                    {validationResults.warnings.map((item, i) => (
                      <li key={i} className="text-[10px] text-yellow-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleMarkAsReady}
            disabled={loading || (validationResults && !validationResults.ready)}
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
              validationResults && !validationResults.ready
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== ARRIVED MODAL ====================

const ArrivedModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    arrivalDate: new Date().toISOString().split('T')[0],
    arrivalTime: new Date().toTimeString().slice(0, 5),
    portName: '',
    vesselName: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && consolidation) {
      setFormData(prev => ({
        ...prev,
        portName: consolidation.destinationPort || 'Destination Port',
        vesselName: consolidation.carrier?.vesselNumber || consolidation.carrier?.flightNumber || 'Not assigned'
      }));
    }
  }, [isOpen, consolidation]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'arrived',
        notes: `Arrived at ${formData.portName} on ${formData.arrivalDate} ${formData.arrivalTime}. Vessel: ${formData.vesselName}. ${formData.notes}`,
        location: formData.portName,
        actualArrival: new Date(formData.arrivalDate + 'T' + formData.arrivalTime)
      });

      if (result.success) {
        toast.success('✅ Arrived at destination');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Ship className="h-4 w-4 mr-2 text-green-600" />
            Mark as Arrived
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Arrival Date
              </label>
              <input
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => setFormData({...formData, arrivalDate: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Arrival Time
              </label>
              <input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Port Name
            </label>
            <input
              type="text"
              value={formData.portName}
              onChange={(e) => setFormData({...formData, portName: e.target.value})}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Vessel/Flight Number
            </label>
            <input
              type="text"
              value={formData.vesselName}
              onChange={(e) => setFormData({...formData, vesselName: e.target.value})}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== CUSTOMS CLEARED MODAL ====================

const CustomsClearedModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clearanceDate: new Date().toISOString().split('T')[0],
    clearanceTime: new Date().toTimeString().slice(0, 5),
    customsReference: '',
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'customs_cleared',
        notes: `Customs cleared on ${formData.clearanceDate} ${formData.clearanceTime}. Reference: ${formData.customsReference}. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Customs clearance completed');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Shield className="h-4 w-4 mr-2 text-emerald-600" />
            Customs Clearance
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Clearance Date
              </label>
              <input
                type="date"
                value={formData.clearanceDate}
                onChange={(e) => setFormData({...formData, clearanceDate: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Clearance Time
              </label>
              <input
                type="time"
                value={formData.clearanceTime}
                onChange={(e) => setFormData({...formData, clearanceTime: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Customs Reference
            </label>
            <input
              type="text"
              value={formData.customsReference}
              onChange={(e) => setFormData({...formData, customsReference: e.target.value})}
              placeholder="e.g., CUS-2025-001"
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              placeholder="Any customs notes..."
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== OUT FOR DELIVERY MODAL ====================

const OutForDeliveryModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: new Date().toTimeString().slice(0, 5),
    carrierName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'out_for_delivery',
        notes: `Out for delivery on ${formData.deliveryDate} ${formData.deliveryTime}. Carrier: ${formData.carrierName}, Vehicle: ${formData.vehicleNumber}, Driver: ${formData.driverName}. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Shipment is out for delivery');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Truck className="h-4 w-4 mr-2 text-blue-600" />
            Out for Delivery
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Delivery Time
              </label>
              <input
                type="time"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Carrier Name
            </label>
            <input
              type="text"
              value={formData.carrierName}
              onChange={(e) => setFormData({...formData, carrierName: e.target.value})}
              placeholder="e.g., DHL, FedEx"
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
              placeholder="e.g., DL-01-AB-1234"
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                placeholder="Driver name"
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Driver Phone
              </label>
              <input
                type="text"
                value={formData.driverPhone}
                onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                placeholder="Phone number"
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              placeholder="Any delivery notes..."
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== DELIVERED MODAL ====================

const DeliveredModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveredDate: new Date().toISOString().split('T')[0],
    deliveredTime: new Date().toTimeString().slice(0, 5),
    receivedBy: '',
    signature: false,
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'delivered',
        notes: `Delivered on ${formData.deliveredDate} ${formData.deliveredTime}. Received by: ${formData.receivedBy}. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Shipment delivered successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Mark as Delivered
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.deliveredDate}
                onChange={(e) => setFormData({...formData, deliveredDate: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Delivery Time
              </label>
              <input
                type="time"
                value={formData.deliveredTime}
                onChange={(e) => setFormData({...formData, deliveredTime: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Received By
            </label>
            <input
              type="text"
              value={formData.receivedBy}
              onChange={(e) => setFormData({...formData, receivedBy: e.target.value})}
              placeholder="Recipient name"
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.signature}
              onChange={(e) => setFormData({...formData, signature: e.target.checked})}
              className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-xs text-gray-700">
              Signature obtained
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Delivery Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              placeholder="Any delivery notes..."
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPLETED MODAL ====================

const CompletedModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    completionDate: new Date().toISOString().split('T')[0],
    completionTime: new Date().toTimeString().slice(0, 5),
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'completed',
        notes: `Completed on ${formData.completionDate} ${formData.completionTime}. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Consolidation completed');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-base font-bold flex items-center">
            <Award className="h-4 w-4 mr-2 text-emerald-600" />
            Mark as Completed
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Completion Date
              </label>
              <input
                type="date"
                value={formData.completionDate}
                onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Completion Time
              </label>
              <input
                type="time"
                value={formData.completionTime}
                onChange={(e) => setFormData({...formData, completionTime: e.target.value})}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================

export default function ConsolidationsPage() {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allConsolidations, setAllConsolidations] = useState([]);
  const [filteredConsolidations, setFilteredConsolidations] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    status: '',
    mainType: '',
    search: '',
    origin: '',
    destination: '',
    containerType: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal states
  const [selectedConsolidation, setSelectedConsolidation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStartConsolidationModal, setShowStartConsolidationModal] = useState(false);
  const [showCompleteConsolidationModal, setShowCompleteConsolidationModal] = useState(false);
  const [showReadyForDispatchModal, setShowReadyForDispatchModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showLoadedModal, setShowLoadedModal] = useState(false);
  const [showArrivedModal, setShowArrivedModal] = useState(false);
  const [showCustomsClearedModal, setShowCustomsClearedModal] = useState(false);
  const [showOutForDeliveryModal, setShowOutForDeliveryModal] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Load data
  useEffect(() => {
    loadConsolidations();
    loadStats();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters, allConsolidations]);

  const loadConsolidations = async () => {
    setLoading(true);
    try {
      console.log('Loading all consolidations...');
      const result = await getConsolidations({ page: 1, limit: 100 });
      console.log('API Response:', result);
      
      if (result.success) {
        setAllConsolidations(result.data || []);
        setPagination(result.pagination);
        
        // Log first consolidation to see structure
        if (result.data && result.data.length > 0) {
          console.log('First consolidation data:', result.data[0]);
          console.log('First shipment:', result.data[0].shipments?.[0]);
          console.log('First item:', result.data[0].items?.[0]);
        }
      } else {
        toast.error(result.message || 'Failed to load consolidations');
      }
    } catch (error) {
      console.error('Error loading consolidations:', error);
      toast.error('Failed to load consolidations');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allConsolidations];
    
    // Apply search filter (client-side)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      console.log('Applying search filter:', searchTerm);
      filtered = filtered.filter(c => {
        const matches = consolidationMatchesSearch(c, searchTerm);
        if (matches) {
          console.log('Match found for:', c.consolidationNumber);
        }
        return matches;
      });
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    // Apply main type filter
    if (filters.mainType) {
      filtered = filtered.filter(c => c.mainType === filters.mainType);
    }
    
    // Apply origin filter
    if (filters.origin) {
      filtered = filtered.filter(c => 
        c.originWarehouse?.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }
    
    // Apply destination filter
    if (filters.destination) {
      filtered = filtered.filter(c => 
        c.destinationPort?.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }
    
    // Apply container type filter
    if (filters.containerType) {
      filtered = filtered.filter(c => c.containerType === filters.containerType);
    }
    
    setFilteredConsolidations(filtered);
    console.log('Filtered count:', filtered.length);
  };

  const loadStats = async () => {
    try {
      const result = await getConsolidationStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConsolidations();
    await loadStats();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleFilterChange = (key, value) => {
    console.log('Filter changed:', key, value);
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 100,
      status: '',
      mainType: '',
      search: '',
      origin: '',
      destination: '',
      containerType: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleViewDetails = (consolidation) => {
    console.log('Viewing details:', consolidation);
    setSelectedConsolidation(consolidation);
    setShowDetailsModal(true);
  };

  const handleEdit = (id) => {
    const consolidation = allConsolidations.find(c => c._id === id);
    setSelectedConsolidation(consolidation);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this consolidation?')) return;
    
    try {
      const result = await deleteConsolidation(id);
      if (result.success) {
        toast.success('Consolidation deleted');
        loadConsolidations();
        loadStats();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Status progression handlers
  const handleStartConsolidation = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowStartConsolidationModal(true);
  };

  const handleCompleteConsolidation = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowCompleteConsolidationModal(true);
  };

  const handleReadyForDispatch = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowReadyForDispatchModal(true);
  };

  const handleLoadedClick = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowLoadedModal(true);
  };

  const handleDispatch = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowDispatchModal(true);
  };

  const handleArrivedClick = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowArrivedModal(true);
  };

  const handleCustomsCleared = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowCustomsClearedModal(true);
  };

  const handleOutForDelivery = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowOutForDeliveryModal(true);
  };

  const handleDelivered = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowDeliveredModal(true);
  };

  const handleComplete = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowCompletedModal(true);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredConsolidations.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      toast.warning('No items selected');
      return;
    }

    switch (action) {
      case 'ready':
        toast.info(`Mark ${selectedIds.length} as ready`);
        break;
      case 'dispatch':
        toast.info(`Dispatch ${selectedIds.length}`);
        break;
      case 'export':
        setShowExportModal(true);
        break;
      case 'delete':
        if (confirm(`Delete ${selectedIds.length} consolidations?`)) {
          toast.success('Bulk delete initiated');
        }
        break;
    }
  };
const handleShipmentStatusChange = async () => {
  // ✅ Reload the specific consolidation or refresh all
  await loadConsolidations();
  await loadStats();
};
  const readyForDispatchCount = allConsolidations.filter(c => c.status === 'consolidated').length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/warehouse" className="p-1.5 hover:bg-white rounded">
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-[#E67E22]" />
                  Shipments In Container
                </h1>
                <p className="text-xs text-gray-500">
                  {filters.search ? `Searching for: "${filters.search}"` : 'Manage freight consolidations'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleRefresh} 
                disabled={refreshing} 
                className="p-1.5 hover:bg-white rounded" 
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button> 
              
              <Link 
                href="/warehouse/consolidation-queue" 
                className="px-2 py-1.5 border bg-white rounded text-xs flex items-center"
              >
                <Package className="h-3 w-3 mr-1" />
                Queue
              </Link> 
            </div>
          </div> 
        </div> 

        {/* Filters */}
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          totalCount={filteredConsolidations.length}
        />

        {/* View Toggle */}
        <div className="flex items-center justify-between mt-3 mb-3">
          <div className="flex items-center space-x-1">
            {Object.entries(VIEW_MODES).map(([mode, { icon: Icon, label }]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-1.5 rounded ${
                  viewMode === mode ? 'bg-[#E67E22] text-white' : 'bg-white border hover:bg-gray-50'
                }`}
                title={label}
              >
                <Icon className="h-3 w-3" />
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Showing {filteredConsolidations.length} of {allConsolidations.length} consolidations
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border">
            <Loader2 className="h-6 w-6 animate-spin text-[#E67E22] mb-2" />
            <p className="text-xs text-gray-500">Loading consolidations...</p>
          </div>
        ) : filteredConsolidations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              {filters.search ? `No results found for "${filters.search}"` : 'No consolidations found'}
            </p>
            {filters.search ? (
              <button
                onClick={handleClearFilters}
                className="text-xs text-[#E67E22] hover:underline"
              >
                Clear Search
              </button>
            ) : (
              <Link href="/warehouse/consolidation-queue" className="text-xs text-[#E67E22] hover:underline">
                Go to Queue
              </Link>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredConsolidations.map(consolidation => (
                  <ConsolidationCard
                    key={consolidation._id}
                    consolidation={consolidation}
                    onView={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStartConsolidation={handleStartConsolidation}
                    onCompleteConsolidation={handleCompleteConsolidation}
                    onReadyForDispatch={handleReadyForDispatch}
                    onLoadedClick={handleLoadedClick}
                    onDispatch={handleDispatch}
                    onArrivedClick={handleArrivedClick}
                    onCustomsCleared={handleCustomsCleared}
                    onOutForDelivery={handleOutForDelivery}
                    onDelivered={handleDelivered}
                    onComplete={handleComplete}
                    onShipmentStatusChange={handleShipmentStatusChange}
                    searchTerm={filters.search}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredConsolidations.map(consolidation => (
                  <ListItem
                    key={consolidation._id}
                    consolidation={consolidation}
                    onView={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStartConsolidation={handleStartConsolidation}
                    onCompleteConsolidation={handleCompleteConsolidation}
                    onReadyForDispatch={handleReadyForDispatch}
                    onLoadedClick={handleLoadedClick}
                    onDispatch={handleDispatch}
                    onArrivedClick={handleArrivedClick}
                    onCustomsCleared={handleCustomsCleared}
                    onOutForDelivery={handleOutForDelivery}
                    onDelivered={handleDelivered}
                    onComplete={handleComplete}
                    searchTerm={filters.search}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white rounded-lg border overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2"><input type="checkbox" onChange={handleSelectAll} className="h-3 w-3" /></th>
                      <th className="px-2 py-2 text-left">ID</th>
                      <th className="px-2 py-2 text-left">Status</th>
                      <th className="px-2 py-2 text-left">Type</th>
                      <th className="px-2 py-2 text-left">Container</th>
                      <th className="px-2 py-2 text-left">Route</th>
                      <th className="px-2 py-2 text-left">Ship</th>
                      <th className="px-2 py-2 text-left">Vol/Wt</th>
                      <th className="px-2 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsolidations.map(consolidation => (
                      <TableRow
                        key={consolidation._id}
                        consolidation={consolidation}
                        onView={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStartConsolidation={handleStartConsolidation}
                        onCompleteConsolidation={handleCompleteConsolidation}
                        onReadyForDispatch={handleReadyForDispatch}
                        onLoadedClick={handleLoadedClick}
                        onDispatch={handleDispatch}
                        onArrivedClick={handleArrivedClick}
                        onCustomsCleared={handleCustomsCleared}
                        onOutForDelivery={handleOutForDelivery}
                        onDelivered={handleDelivered}
                        onComplete={handleComplete}
                        searchTerm={filters.search}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ConsolidationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStartConsolidation={handleStartConsolidation}
        onCompleteConsolidation={handleCompleteConsolidation}
        onReadyForDispatch={handleReadyForDispatch}
        onLoadedClick={handleLoadedClick}
        onDispatch={handleDispatch}
        onArrivedClick={handleArrivedClick}
        onCustomsCleared={handleCustomsCleared}
        onOutForDelivery={handleOutForDelivery}
        onDelivered={handleDelivered}
        onComplete={handleComplete}
      />

      <EditConsolidationModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onUpdated={() => { loadConsolidations(); loadStats(); }}
      />

      <StartConsolidationModal
        isOpen={showStartConsolidationModal}
        onClose={() => { setShowStartConsolidationModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <CompleteConsolidationModal
        isOpen={showCompleteConsolidationModal}
        onClose={() => { setShowCompleteConsolidationModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <ReadyForDispatchModal
        isOpen={showReadyForDispatchModal}
        onClose={() => { setShowReadyForDispatchModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <LoadedModal
        isOpen={showLoadedModal}
        onClose={() => { setShowLoadedModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <DispatchModal
        isOpen={showDispatchModal}
        onClose={() => { setShowDispatchModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <ArrivedModal
        isOpen={showArrivedModal}
        onClose={() => { setShowArrivedModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <CustomsClearedModal
        isOpen={showCustomsClearedModal}
        onClose={() => { setShowCustomsClearedModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <OutForDeliveryModal
        isOpen={showOutForDeliveryModal}
        onClose={() => { setShowOutForDeliveryModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <DeliveredModal
        isOpen={showDeliveredModal}
        onClose={() => { setShowDeliveredModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <CompletedModal
        isOpen={showCompletedModal}
        onClose={() => { setShowCompletedModal(false); setSelectedConsolidation(null); }}
        consolidation={selectedConsolidation}
        onSuccess={() => { loadConsolidations(); loadStats(); }}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={(options) => {
          toast.success(`Exporting as ${options.format}...`);
          setShowExportModal(false);
        }}
      />

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
}
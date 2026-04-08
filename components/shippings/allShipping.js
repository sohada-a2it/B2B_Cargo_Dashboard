// components/shipments/AllShipments.jsx - সম্পূর্ণ আপডেটেড (Return Request সহ)

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  // Main APIs
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
  assignShipment,
  addTrackingUpdate,
  getShipmentTimeline,
  updateTransportDetails,
  addShipmentDocument,
  addInternalNote,
  addCustomerNote,
  cancelShipment,
  addShipmentCost,
  getShipmentCosts,
  updateShipmentCost,
  deleteShipmentCost,
  getPendingWarehouseShipments,
  receiveAtWarehouse,
  processWarehouse,
  getShipmentStatistics,
  trackShipmentByNumber,

  // Helper functions
  getShipmentStatusColor,
  getShipmentStatusDisplayText,
  getShipmentModeDisplay,
  getShipmentProgress,
  isShipmentActive,
  formatShipmentDate,
  formatShipmentCurrency,
  formatWeight,
  formatVolume,
  calculateTotalWeight,
  calculateTotalVolume,
  isOnTrack,
  getDaysInTransit,
  getShipmentSummary,
  groupShipmentsByStatus,
  groupShipmentsByMode,
  getTopRoutes,
  exportShipmentsToCSV,
  
  // Return Request APIs
  getAllReturnRequests,
  approveReturnRequest,
  rejectReturnRequest, 
  customerConfirmReturn,
  customerRejectReturn,
  getReturnReasonText,
  getReturnStatusText,
  getReturnStatusColor,
  formatReturnCost
} from '@/Api/shipping';

// Icons
import {
  Package, Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Edit, Download, Plus, Calendar, MapPin, User,
  Truck, Ship, Plane, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Loader2, MoreVertical,
  ArrowUpDown, Download as ExportIcon, Filter as FilterIcon,
  X, Globe, Hash, DollarSign,
  ChevronsLeft, ChevronsRight, Trash2, Check,
  Phone, Mail, BarChart3, Activity, FileText,
  Home, Briefcase, Tag, Calendar as CalendarIcon,
  Save, Printer, Share2, Link, Copy, Star,
  MessageSquare, Paperclip, Camera, Upload,
  Users, Box, Map, TrendingUp, PieChart,
  Sun, Moon, Settings, Bell, HelpCircle,
  Maximize2, Minimize2, Grid, List,
  AlertTriangle, Info, CheckCircle as CheckCircleSolid,
  XCircle as XCircleSolid, Clock as ClockSolid,
  Receipt, FileSpreadsheet, CreditCard, Weight,
  Navigation, Anchor, Train, Wind, Sun as SunIcon,
  Cloud, CloudRain, CloudSnow, CloudLightning,
  Thermometer, Eye as EyeIcon, Shield, FileCheck,
  UserCog, Building2, Briefcase as BriefcaseIcon,
  FolderOpen, FileText as FileTextIcon, HardDrive,
  Send, Flag, Award, Pause, RotateCcw, Layers, 
  Undo2, ThumbsUp, ThumbsDown, DollarSign as DollarSignIcon,
  Receipt as ReceiptIcon, RefreshCw as RefreshIcon
} from 'lucide-react';

// ==================== COLOR CONSTANTS ====================
const COLORS = {
  primary: '#E67E22',
  secondary: '#3C719D',
  primaryLight: '#fef2e6',
  secondaryLight: '#e8edf3',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  orange: '#f97316',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  emerald: '#10b981'
};

// ==================== STATUS CONFIGURATION ====================
const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: FileText,
    progress: 5,
    editable: true,
    cancellable: true,
    nextStatus: ['pending']
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
    progress: 10,
    editable: true,
    cancellable: true,
    nextStatus: ['received_at_warehouse', 'cancelled']
  },
  received_at_warehouse: {
    label: 'Received at Warehouse',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Package,
    progress: 20,
    editable: true,
    cancellable: false,
    nextStatus: ['consolidation_in_progress']
  },
  picked_up_from_warehouse: {
    label: 'Picked Up',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Truck,
    progress: 15,
    editable: true,
    cancellable: false
  },
  inspected: {
    label: 'Inspected',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    progress: 22,
    editable: true,
    cancellable: false
  },
  consolidating: {
    label: 'Consolidating',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Layers,
    progress: 25,
    editable: true,
    cancellable: false
  },
  consolidated: {
    label: 'Consolidated',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Layers,
    progress: 30,
    editable: true,
    cancellable: false
  },
  ready_for_dispatch: {
    label: 'Ready for Dispatch',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: CheckCircle,
    progress: 35,
    editable: true,
    cancellable: false
  },
  loaded_in_container: {
    label: 'Loaded in Container',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Package,
    progress: 40,
    editable: true,
    cancellable: false
  },
  dispatched: {
    label: 'Dispatched',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: Send,
    progress: 45,
    editable: true,
    cancellable: false
  },
  departed_port_of_origin: {
    label: 'Departed Origin Port',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Ship,
    progress: 50,
    editable: false,
    cancellable: false
  },
  in_transit_sea_freight: {
    label: 'In Transit (Sea)',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Ship,
    progress: 55,
    editable: false,
    cancellable: false
  },
  consolidation_in_progress: {
    label: 'Consolidation in Progress',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Box,
    progress: 35,
    editable: true,
    cancellable: false,
    nextStatus: ['ready_for_shipping']
  },
  ready_for_shipping: {
    label: 'Ready for Shipping',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: CheckCircle,
    progress: 45,
    editable: true,
    cancellable: false,
    nextStatus: ['in_transit']
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Truck,
    progress: 60,
    editable: false,
    cancellable: false,
    nextStatus: ['arrived_at_destination']
  },
  arrived_at_destination_port: {
    label: 'Arrived at Port',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Flag,
    progress: 70,
    editable: false,
    cancellable: false
  },
  arrived_at_destination: {
    label: 'Arrived at Destination',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: MapPin,
    progress: 75,
    editable: false,
    cancellable: false,
    nextStatus: ['customs_clearance']
  },
  customs_cleared: {
    label: 'Customs Cleared',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Shield,
    progress: 80,
    editable: false,
    cancellable: false
  },
  customs_clearance: {
    label: 'Customs Clearance',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: FileCheck,
    progress: 85,
    editable: false,
    cancellable: false,
    nextStatus: ['out_for_delivery']
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: Navigation,
    progress: 90,
    editable: false,
    cancellable: false,
    nextStatus: ['delivered']
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircleSolid,
    progress: 100,
    editable: false,
    cancellable: false,
    nextStatus: []
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-600 text-white border-emerald-600',
    icon: Award,
    progress: 100,
    editable: false,
    cancellable: false
  },
  damage_reported: {
    label: 'Damage Reported',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle,
    progress: 0,
    editable: false,
    cancellable: false
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Pause,
    progress: 0,
    editable: false,
    cancellable: false
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleSolid,
    progress: 0,
    editable: false,
    cancellable: false,
    nextStatus: []
  },
  returned: {
    label: 'Returned',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: RotateCcw,
    progress: 0,
    editable: false,
    cancellable: false
  },
  return_requested: {
    label: 'Return Requested',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Undo2,
    progress: 0,
    editable: false,
    cancellable: false
  },
  return_approved: {
    label: 'Return Approved',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ThumbsUp,
    progress: 0,
    editable: false,
    cancellable: false
  },
  return_rejected: {
    label: 'Return Rejected',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: ThumbsDown,
    progress: 0,
    editable: false,
    cancellable: false
  },
  return_completed: {
    label: 'Return Completed',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircleSolid,
    progress: 0,
    editable: false,
    cancellable: false
  }
};

// ==================== TRACKING STATUS CONFIGURATION ====================
const TRACKING_STATUS_CONFIG = {
  pending: {
    label: 'Pending Pickup',
    color: 'bg-gray-100 text-gray-600',
    icon: Clock
  },
  picked_up: {
    label: 'Picked Up',
    color: 'bg-blue-100 text-blue-600',
    icon: Package
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-cyan-100 text-cyan-600',
    icon: Truck
  },
  arrived_at_facility: {
    label: 'Arrived at Facility',
    color: 'bg-purple-100 text-purple-600',
    icon: Building2
  },
  arrived_at_destination_port: {
    label: 'Arrived at Port',
    color: 'bg-teal-100 text-teal-600',
    icon: Flag
  },
  customs_cleared: {
    label: 'Customs Cleared',
    color: 'bg-emerald-100 text-emerald-600',
    icon: Shield
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-orange-100 text-orange-600',
    icon: Navigation
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-600',
    icon: CheckCircleSolid
  },
  exception: {
    label: 'Exception',
    color: 'bg-red-100 text-red-600',
    icon: AlertTriangle
  }
};

// ==================== SHIPMENT MODE ICONS ====================
const SHIPMENT_MODE_ICONS = {
  air_freight: Plane,
  sea_freight: Ship,
  road_freight: Truck,
  rail_freight: Train,
  express_courier: Package
};

const SHIPMENT_MODE_COLORS = {
  air_freight: COLORS.info,
  sea_freight: COLORS.secondary,
  road_freight: COLORS.success,
  rail_freight: COLORS.purple,
  express_courier: COLORS.orange
};

// ==================== RETURN REQUEST STATUS CONFIGURATION ====================
const RETURN_STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    bgColor: 'bg-yellow-50'
  },
  approved: {
    label: 'Approved - Awaiting Customer',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: ThumbsUp,
    bgColor: 'bg-blue-50'
  },
  customer_confirmed: {
    label: 'Customer Confirmed - Ready to Complete',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: CheckCircle,
    bgColor: 'bg-purple-50'
  },
  rejected_by_admin: {
    label: 'Rejected by Admin',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: ThumbsDown,
    bgColor: 'bg-red-50'
  },
  rejected_by_customer: {
    label: 'Cancelled by Customer',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: XCircle,
    bgColor: 'bg-orange-50'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircleSolid,
    bgColor: 'bg-green-50'
  }
};

// ==================== COMPONENTS ====================

// Button Component
// AllShipments.jsx - Button কম্পোনেন্ট আপডেট করুন

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon = null,
  iconPosition = 'left',
  fullWidth = false
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-sm',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
    light: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${fullWidth ? 'w-full' : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center">
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </div>
      )}
    </button>
  );
};

// Input Component
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Select Component
const Select = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select option',
  label,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-lg shadow-sm appearance-none
            focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
            ${Icon ? 'pl-10' : 'pl-3'}
            pr-10
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${className}
          `}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// TextArea Component
const TextArea = ({
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  rows = 3,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, onClick, clickable = false, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: getShipmentStatusDisplayText(status),
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Clock
  };
  
  const Icon = config.icon;
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizes[size]} ${clickable ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
      {config.label}
    </span>
  );
};

// Tracking Status Badge Component
const TrackingStatusBadge = ({ trackingStatus }) => {
  const config = TRACKING_STATUS_CONFIG[trackingStatus] || TRACKING_STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

// Shipment Mode Badge
const ShipmentModeBadge = ({ mode }) => {
  const Icon = SHIPMENT_MODE_ICONS[mode] || Package;
  const color = SHIPMENT_MODE_COLORS[mode] || COLORS.secondary;
  
  return (
    <span 
      className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color: color }}
    >
      <Icon className="h-3.5 w-3.5 mr-1" />
      {getShipmentModeDisplay(mode)}
    </span>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress, height = 'h-2', showLabel = false }) => {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium" style={{ color: COLORS.primary }}>{progress}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div 
          className="rounded-full transition-all duration-500"
          style={{ 
            width: `${progress}%`, 
            backgroundColor: progress === 100 ? COLORS.success : COLORS.primary,
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

// Action Menu Component
const ActionMenu = ({ shipment, onAction }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!shipment) return null;

  const hasReturnRequest = shipment.returnRequest && shipment.returnRequest.status !== 'none';

  const actions = [
    { 
      label: 'View Details', 
      icon: Eye, 
      action: 'view', 
      color: 'text-blue-600',
      show: true
    },  
    { 
      label: 'Cancel Shipment', 
      icon: XCircle, 
      action: 'cancel', 
      color: 'text-red-600',
      show: shipment.status !== 'cancelled' && shipment.status !== 'delivered'
    },
  ];

  if (hasReturnRequest) {
    const returnStatus = shipment.returnRequest.status;
    let returnLabel = 'Return Request';
    let returnColor = 'text-purple-600';
    if (returnStatus === 'pending') returnLabel = 'Return Pending';
    else if (returnStatus === 'approved') returnLabel = 'Return Approved';
    else if (returnStatus === 'customer_confirmed') returnLabel = 'Return Confirmed';
    else if (returnStatus === 'rejected_by_admin') returnLabel = 'Return Rejected';
    else if (returnStatus === 'rejected_by_customer') returnLabel = 'Return Cancelled';
    else if (returnStatus === 'completed') returnLabel = 'Return Completed';
    
    actions.push({
      label: returnLabel,
      icon: Undo2,
      action: 'viewReturn',
      color: returnColor,
      show: true
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-1">
          {actions.filter(a => a.show).map((action) => (
            <button
              key={action.action}
              onClick={() => {
                onAction(action.action, shipment);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
              <span className="text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, onClick, active }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all
        hover:shadow-md hover:border-[${COLORS.primary}]/30
        ${active ? `border-[${COLORS.primary}] ring-2 ring-[${COLORS.primary}]/20` : 'border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizes[size]} w-full`}>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== RETURN REQUESTS LIST MODAL (Admin) ====================
const ReturnRequestsModal = ({ isOpen, onClose, onRefresh }) => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [summary, setSummary] = useState([]);

  const fetchReturnRequests = async () => {
    setLoading(true);
    try {
      const result = await getAllReturnRequests({ 
        status: statusFilter === 'all' ? '' : statusFilter,
        page: pagination.page,
        limit: 20
      });
      if (result.success) {
        setReturnRequests(result.data || []);
        setPagination(result.pagination || { total: 0, page: 1, pages: 1 });
        setSummary(result.summary || []);
      }
    } catch (error) {
      toast.error('Failed to fetch return requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReturnRequests();
    }
  }, [isOpen, statusFilter, pagination.page]);

  const handleApprove = async (id, data) => {
    const result = await approveReturnRequest(id, data);
    if (result.success) {
      toast.success(result.message || 'Return request approved!');
      fetchReturnRequests();
      onRefresh?.();
      setShowReviewModal(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleReject = async (id, reason) => {
    const result = await rejectReturnRequest(id, reason);
    if (result.success) {
      toast.success(result.message || 'Return request rejected');
      fetchReturnRequests();
      onRefresh?.();
      setShowReviewModal(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleComplete = async (id, data) => {
    const result = await completeReturn(id, data);
    if (result.success) {
      toast.success(result.message || 'Return completed successfully!');
      fetchReturnRequests();
      onRefresh?.();
      setShowReviewModal(false);
    } else {
      toast.error(result.message);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'customer_confirmed', label: 'Customer Confirmed' },
    { value: 'rejected_by_admin', label: 'Rejected by Admin' },
    { value: 'rejected_by_customer', label: 'Cancelled by Customer' },
    { value: 'completed', label: 'Completed' }
  ];

  const getSummaryCount = (status) => {
    const item = summary.find(s => s._id === status);
    return item?.count || 0;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Return Requests Management" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {statusOptions.map(opt => (
              <div 
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`p-2 rounded-lg text-center cursor-pointer transition-all ${
                  statusFilter === opt.value 
                    ? 'bg-[#E67E22] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <p className="text-xs font-medium">{opt.label}</p>
                <p className="text-lg font-bold">{getSummaryCount(opt.value)}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="light" size="sm" onClick={fetchReturnRequests} icon={<RefreshIcon className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
            </div>
          ) : returnRequests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No return requests found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Request Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Shipment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Return Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returnRequests.map((req) => {
                    const statusConfig = RETURN_STATUS_CONFIG[req.status] || RETURN_STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    const isFree = req.isFreeReturn || req.returnCost === 0;
                    
                    return (
                      <tr key={req._id || req.shipmentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {formatShipmentDate(req.requestedAt, 'short')}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">#{req.shipmentNumber}</p>
                            {req.trackingNumber && <p className="text-xs text-gray-500">{req.trackingNumber}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{req.customerName || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{getReturnReasonText(req.reason)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${isFree ? 'text-green-600' : 'text-orange-600'}`}>
                            {isFree ? 'FREE' : `$${req.returnCost || 0} ${req.returnCostCurrency || 'USD'}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button size="xs" variant="light" onClick={() => { setSelectedReturn(req); setShowReviewModal(true); }} icon={<Eye className="h-3 w-3" />}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <span className="text-xs text-gray-500">Total: {pagination.total} requests</span>
              <div className="flex items-center space-x-2">
                <Button size="xs" variant="ghost" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} icon={<ChevronLeft className="h-4 w-4" />} />
                <span className="text-sm">Page {pagination.page} of {pagination.pages}</span>
                <Button size="xs" variant="ghost" disabled={pagination.page === pagination.pages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} icon={<ChevronRight className="h-4 w-4" />} />
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ReturnRequestReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        returnRequest={selectedReturn}
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
        onRefresh={fetchReturnRequests}
      />
    </>
  );
};

// ==================== RETURN REQUEST REVIEW MODAL (Admin) ====================
const ReturnRequestReviewModal = ({ isOpen, onClose, returnRequest, onApprove, onReject, onComplete, onRefresh }) => {
  const [action, setAction] = useState('approve');
  const [formData, setFormData] = useState({
    returnTrackingNumber: '',
    notes: '',
    rejectionReason: '',
    refundAmount: '',
    refundCurrency: 'USD',
    refundReference: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (returnRequest) {
      setFormData({
        returnTrackingNumber: returnRequest.returnTrackingNumber || '',
        notes: returnRequest.returnNotes || '',
        rejectionReason: returnRequest.rejectionReason || '',
        refundAmount: returnRequest.refundAmount || '',
        refundCurrency: returnRequest.refundCurrency || 'USD',
        refundReference: returnRequest.refundReference || ''
      });
    }
  }, [returnRequest]);

  if (!isOpen || !returnRequest) return null;

  const statusConfig = RETURN_STATUS_CONFIG[returnRequest.status] || RETURN_STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const isFree = returnRequest.isFreeReturn || returnRequest.returnCost === 0;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (action === 'approve') {
        await onApprove(returnRequest.shipmentId || returnRequest._id, {
          returnTrackingNumber: formData.returnTrackingNumber,
          notes: formData.notes,
          adjustCost: null
        });
      } else if (action === 'reject') {
        if (!formData.rejectionReason) {
          toast.warning('Please provide a rejection reason');
          setLoading(false);
          return;
        }
        await onReject(returnRequest.shipmentId || returnRequest._id, formData.rejectionReason);
      } else if (action === 'complete') {
        await onComplete(returnRequest.shipmentId || returnRequest._id, {
          notes: formData.notes,
          refundAmount: formData.refundAmount,
          refundCurrency: formData.refundCurrency,
          refundReference: formData.refundReference
        });
      }
      onClose();
    } catch (error) {} finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return Request Review" size="lg">
      <div className="space-y-5">
        <div className={`p-4 rounded-lg border ${statusConfig.bgColor}`}>
          <div className="flex items-center space-x-3">
            <StatusIcon className="h-5 w-5" />
            <div>
              <p className="font-semibold">Status: {statusConfig.label}</p>
              <p className="text-xs opacity-75">Requested: {formatShipmentDate(returnRequest.requestedAt, 'long')}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h5 className="text-sm font-medium mb-3">Return Request Details</h5>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Shipment</p><p className="text-sm font-medium">#{returnRequest.shipmentNumber}</p></div>
              <div><p className="text-xs text-gray-500">Tracking</p><p className="text-sm">{returnRequest.trackingNumber || 'N/A'}</p></div>
            </div>
            <div><p className="text-xs text-gray-500">Customer</p><p className="text-sm font-medium">{returnRequest.customerName || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500">Reason</p><p className="text-sm">{getReturnReasonText(returnRequest.reason)}</p></div>
            <div><p className="text-xs text-gray-500">Description</p><p className="text-sm text-gray-600">{returnRequest.description}</p></div>
            <div><p className="text-xs text-gray-500">Return Cost</p><p className={`text-sm font-semibold ${isFree ? 'text-green-600' : 'text-orange-600'}`}>{isFree ? 'FREE' : `$${returnRequest.returnCost || 0} ${returnRequest.returnCostCurrency || 'USD'}`}</p></div>
          </div>
        </div>

        {returnRequest.status === 'pending' && (
          <div className="space-y-4">
            <div className="flex space-x-4 border-b pb-3">
              <button onClick={() => setAction('approve')} className={`px-4 py-2 rounded-lg text-sm font-medium ${action === 'approve' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600'}`}>Approve Return</button>
              <button onClick={() => setAction('reject')} className={`px-4 py-2 rounded-lg text-sm font-medium ${action === 'reject' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-600'}`}>Reject Return</button>
            </div>
            {action === 'approve' && (
              <div className="space-y-4">
                <Input label="Return Tracking Number" value={formData.returnTrackingNumber} onChange={(e) => setFormData({ ...formData, returnTrackingNumber: e.target.value })} placeholder="Enter return tracking number" icon={Hash} />
                <TextArea label="Admin Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add any notes about this approval..." rows={3} />
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-blue-700"><Info className="h-4 w-4 inline mr-1" />Customer will be notified and asked to confirm the return.</p></div>
              </div>
            )}
            {action === 'reject' && (
              <TextArea label="Rejection Reason" value={formData.rejectionReason} onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })} placeholder="Please provide a reason for rejection..." rows={3} required />
            )}
          </div>
        )}

        {returnRequest.status === 'customer_confirmed' && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-3 rounded-lg"><p className="text-sm text-purple-700"><CheckCircle className="h-4 w-4 inline mr-1" />Customer has confirmed this return. Please complete the return process.</p></div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Refund Amount" type="number" step="0.01" value={formData.refundAmount} onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })} placeholder="0.00" icon={DollarSignIcon} />
              <Select label="Refund Currency" value={formData.refundCurrency} onChange={(e) => setFormData({ ...formData, refundCurrency: e.target.value })} options={[{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GBP', label: 'GBP' }, { value: 'BDT', label: 'BDT' }]} />
            </div>
            <Input label="Refund Reference" value={formData.refundReference} onChange={(e) => setFormData({ ...formData, refundReference: e.target.value })} placeholder="Transaction ID / Reference number" icon={ReceiptIcon} />
            <TextArea label="Completion Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Notes about the return completion..." rows={3} />
          </div>
        )}

        {returnRequest.status === 'approved' && (
          <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-sm text-yellow-700"><Clock className="h-4 w-4 inline mr-1" />Waiting for customer confirmation.</p></div>
        )}

        {returnRequest.status === 'completed' && (
          <div className="bg-green-50 p-3 rounded-lg"><p className="text-sm text-green-700"><CheckCircleSolid className="h-4 w-4 inline mr-1" />Return completed.{returnRequest.refundAmount > 0 && ` Refund: $${returnRequest.refundAmount} ${returnRequest.refundCurrency}`}</p></div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {returnRequest.status === 'pending' && <Button variant={action === 'approve' ? 'success' : 'danger'} onClick={handleSubmit} isLoading={loading}>{action === 'approve' ? 'Approve Return' : 'Reject Return'}</Button>}
          {returnRequest.status === 'customer_confirmed' && <Button variant="primary" onClick={handleSubmit} isLoading={loading}>Complete Return</Button>}
        </div>
      </div>
    </Modal>
  );
};

// Status Update Modal
const StatusUpdateModal = ({ isOpen, onClose, shipment, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: '',
    location: '',
    description: '',
    timestamp: new Date().toISOString().slice(0, 16)
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shipment) setFormData({ status: shipment.status || '', location: '', description: '', timestamp: new Date().toISOString().slice(0, 16) });
  }, [shipment]);

  if (!isOpen || !shipment) return null;

  const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({ value, label: config.label }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.status) { toast.warning('Please select a status'); return; }
    setLoading(true);
    try {
      await onUpdate(shipment._id, { status: formData.status, location: formData.location, description: formData.description, timestamp: formData.timestamp });
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Shipment Status" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="New Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={statusOptions} placeholder="Select status" required icon={Activity} />
        <Input label="Current Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Dhaka Warehouse" icon={MapPin} />
        <TextArea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional details..." rows={3} />
        <Input type="datetime-local" label="Timestamp" value={formData.timestamp} onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })} icon={Calendar} />
        <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" isLoading={loading}>Update Status</Button></div>
      </form>
    </Modal>
  );
};

// Tracking Update Modal
const TrackingUpdateModal = ({ isOpen, onClose, shipment, onAdd }) => {
  const [formData, setFormData] = useState({ status: 'in_transit', location: '', description: '', timestamp: new Date().toISOString().slice(0, 16), coordinates: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (shipment) setFormData({ status: 'in_transit', location: '', description: '', timestamp: new Date().toISOString().slice(0, 16), coordinates: '' }); }, [shipment]);
  if (!isOpen || !shipment) return null;

  const trackingStatusOptions = [{ value: 'pending', label: 'Pending Pickup' }, { value: 'picked_up', label: 'Picked Up' }, { value: 'in_transit', label: 'In Transit' }, { value: 'arrived_at_facility', label: 'Arrived at Facility' }, { value: 'arrived_at_destination_port', label: 'Arrived at Port' }, { value: 'customs_cleared', label: 'Customs Cleared' }, { value: 'out_for_delivery', label: 'Out for Delivery' }, { value: 'delivered', label: 'Delivered' }, { value: 'exception', label: 'Exception' }];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location) { toast.warning('Location is required'); return; }
    setLoading(true);
    try { await onAdd(shipment._id, formData); onClose(); } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Tracking Update" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Tracking Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={trackingStatusOptions} placeholder="Select status" required icon={Navigation} />
        <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Current location" required icon={MapPin} />
        <TextArea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tracking details..." rows={3} />
        <Input type="datetime-local" label="Timestamp" value={formData.timestamp} onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })} icon={Calendar} />
        <Input label="GPS Coordinates (Optional)" value={formData.coordinates} onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })} placeholder="e.g., 23.8103° N, 90.4125° E" icon={Globe} />
        <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" isLoading={loading}>Add Tracking</Button></div>
      </form>
    </Modal>
  );
};

// Assign Staff Modal
const AssignModal = ({ isOpen, onClose, shipment, onAssign }) => {
  const [formData, setFormData] = useState({ staffId: '', role: 'operations', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (shipment) setFormData({ staffId: '', role: 'operations', notes: '' }); }, [shipment]);
  if (!isOpen || !shipment) return null;

  const staffOptions = [{ value: 'staff1', label: 'John Doe (Operations)' }, { value: 'staff2', label: 'Jane Smith (Warehouse)' }, { value: 'staff3', label: 'Mike Johnson (Driver)' }, { value: 'staff4', label: 'Sarah Wilson (Customer Service)' }, { value: 'staff5', label: 'David Brown (Customs Broker)' }];
  const roleOptions = [{ value: 'operations', label: 'Operations' }, { value: 'warehouse', label: 'Warehouse' }, { value: 'driver', label: 'Driver' }, { value: 'customs', label: 'Customs Broker' }, { value: 'customer_service', label: 'Customer Service' }];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId || !formData.role) { toast.warning('Staff and role are required'); return; }
    setLoading(true);
    try { await onAssign(shipment._id, formData); onClose(); } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Staff to Shipment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Staff Member" value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} options={staffOptions} placeholder="Select staff" required icon={UserCog} />
        <Select label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} options={roleOptions} placeholder="Select role" required icon={BriefcaseIcon} />
        <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional instructions..." rows={3} />
        <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" isLoading={loading}>Assign Staff</Button></div>
      </form>
    </Modal>
  );
};

// Add Cost Modal
const CostModal = ({ isOpen, onClose, shipment, onAdd }) => {
  const [formData, setFormData] = useState({ type: 'transport', description: '', amount: '', currency: 'USD', paidBy: 'customer', paidStatus: 'pending', dueDate: '', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (shipment) setFormData({ type: 'transport', description: '', amount: '', currency: 'USD', paidBy: 'customer', paidStatus: 'pending', dueDate: '', notes: '' }); }, [shipment]);
  if (!isOpen || !shipment) return null;

  const typeOptions = [{ value: 'transport', label: 'Transport' }, { value: 'warehouse', label: 'Warehouse' }, { value: 'customs', label: 'Customs' }, { value: 'insurance', label: 'Insurance' }, { value: 'documentation', label: 'Documentation' }, { value: 'fuel_surcharge', label: 'Fuel Surcharge' }, { value: 'handling', label: 'Handling' }, { value: 'other', label: 'Other' }];
  const currencyOptions = [{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GBP', label: 'GBP' }, { value: 'BDT', label: 'BDT' }, { value: 'INR', label: 'INR' }, { value: 'CNY', label: 'CNY' }];
  const paidByOptions = [{ value: 'customer', label: 'Customer' }, { value: 'company', label: 'Company' }, { value: 'other', label: 'Other' }];
  const paidStatusOptions = [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }, { value: 'waived', label: 'Waived' }];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.amount) { toast.warning('Type and amount are required'); return; }
    setLoading(true);
    try { await onAdd(shipment._id, formData); onClose(); } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Shipment Cost" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4"><Select label="Cost Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} options={typeOptions} placeholder="Select type" required icon={Tag} /><Select label="Currency" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} options={currencyOptions} placeholder="Select currency" required icon={DollarSign} /></div>
        <Input label="Amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" required icon={DollarSign} />
        <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="e.g., Ocean freight charges" icon={FileText} />
        <div className="grid grid-cols-2 gap-4"><Select label="Paid By" value={formData.paidBy} onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })} options={paidByOptions} placeholder="Select payer" icon={User} /><Select label="Payment Status" value={formData.paidStatus} onChange={(e) => setFormData({ ...formData, paidStatus: e.target.value })} options={paidStatusOptions} placeholder="Select status" icon={CheckCircle} /></div>
        <Input type="date" label="Due Date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} icon={Calendar} />
        <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." rows={3} />
        <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" isLoading={loading}>Add Cost</Button></div>
      </form>
    </Modal>
  );
};

// Document Upload Modal
const DocumentModal = ({ isOpen, onClose, shipment, onUpload }) => {
  const [formData, setFormData] = useState({ type: 'commercial_invoice', title: '', file: null, notes: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => { if (shipment) setFormData({ type: 'commercial_invoice', title: '', file: null, notes: '' }); }, [shipment]);
  if (!isOpen || !shipment) return null;

  const documentTypeOptions = [{ value: 'commercial_invoice', label: 'Commercial Invoice' }, { value: 'packing_list', label: 'Packing List' }, { value: 'bill_of_lading', label: 'Bill of Lading' }, { value: 'air_waybill', label: 'Air Waybill' }, { value: 'certificate_of_origin', label: 'Certificate of Origin' }, { value: 'insurance_certificate', label: 'Insurance Certificate' }, { value: 'customs_declaration', label: 'Customs Declaration' }, { value: 'delivery_receipt', label: 'Delivery Receipt' }, { value: 'other', label: 'Other' }];

  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) setFormData({ ...formData, file, title: formData.title || file.name }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.title || !formData.file) { toast.warning('Type, title and file are required'); return; }
    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('type', formData.type); uploadData.append('title', formData.title); uploadData.append('file', formData.file); uploadData.append('notes', formData.notes);
      await onUpload(shipment._id, uploadData); onClose();
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Document Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} options={documentTypeOptions} placeholder="Select type" required icon={FileText} />
        <Input label="Document Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Commercial Invoice - Shipment #123" required icon={Tag} />
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">File <span className="text-red-500">*</span></label><div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#E67E22] transition-colors" onClick={() => fileInputRef.current?.click()}><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" /><Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-600">{formData.file ? formData.file.name : 'Click to upload or drag and drop'}</p><p className="text-xs text-gray-500 mt-1">PDF, Images, Excel, Word (Max 10MB)</p></div></div>
        <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes about this document..." rows={3} />
        <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" isLoading={loading}>Upload Document</Button></div>
      </form>
    </Modal>
  );
};

// Add Note Modal
const NoteModal = ({ isOpen, onClose, shipment, onAdd }) => {
  const [formData, setFormData] = useState({ type: 'internal', note: '', priority: 'normal' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (shipment) setFormData({ type: 'internal', note: '', priority: 'normal' }); }, [shipment]);
  if (!isOpen || !shipment) return null;

  const typeOptions = [{ value: 'internal', label: 'Internal Note' }, { value: 'customer', label: 'Customer Note' }];
  const priorityOptions = [{ value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.note) { toast.warning('Note is required'); return; }
    setLoading(true);
    try {
      if (formData.type === 'internal') await onAdd.internalNote(shipment._id, formData);
      else await onAdd.customerNote(shipment._id, formData);
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Note" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4"><Select label="Note Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} options={typeOptions} placeholder="Select type" required icon={MessageSquare} /><Select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} options={priorityOptions} placeholder="Select priority" required icon={AlertCircle} /></div>
        <TextArea label="Note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Write your note here..." rows={4} required />
        <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" isLoading={loading}>Add Note</Button></div>
      </form>
    </Modal>
  );
};

// Warehouse Actions Modal
const WarehouseModal = ({ isOpen, onClose, shipment, onAction }) => {
  const [formData, setFormData] = useState({ action: 'receive', location: '', receivedBy: '', verifiedBy: '', condition: 'good', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (shipment) setFormData({ action: 'receive', location: '', receivedBy: '', verifiedBy: '', condition: 'good', notes: '' }); }, [shipment]);
  if (!isOpen || !shipment) return null;

  const actionOptions = [{ value: 'receive', label: 'Receive at Warehouse' }, { value: 'process', label: 'Process/Consolidate' }, { value: 'load', label: 'Load for Shipping' }];
  const conditionOptions = [{ value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'damaged', label: 'Damaged' }, { value: 'with_exception', label: 'With Exception' }];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.action === 'receive' && (!formData.location || !formData.receivedBy)) { toast.warning('Location and receiver are required'); return; }
    setLoading(true);
    try {
      if (formData.action === 'receive') await onAction.receive(shipment._id, formData);
      else if (formData.action === 'process') await onAction.process(shipment._id, formData);
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Warehouse Operations" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Action" value={formData.action} onChange={(e) => setFormData({ ...formData, action: e.target.value })} options={actionOptions} placeholder="Select action" required icon={Building2} />
        {formData.action === 'receive' && (<><Input label="Warehouse Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Dhaka Main Warehouse" required icon={MapPin} /><Input label="Received By" value={formData.receivedBy} onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })} placeholder="Name of warehouse staff" required icon={User} /><Input label="Verified By" value={formData.verifiedBy} onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })} placeholder="Name of verifying officer" icon={UserCog} /></>)}
        <Select label="Condition" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} options={conditionOptions} placeholder="Select condition" icon={Shield} />
        <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." rows={3} />
        <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" isLoading={loading}>Process</Button></div>
      </form>
    </Modal>
  );
};

// Cancel Shipment Modal
const CancelModal = ({ isOpen, onClose, shipment, onCancel }) => {
  const [formData, setFormData] = useState({ reason: '', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (shipment) setFormData({ reason: '', notes: '' }); }, [shipment]);
  if (!isOpen || !shipment) return null;

  const reasonOptions = [{ value: 'customer_request', label: 'Customer Request' }, { value: 'operational_issues', label: 'Operational Issues' }, { value: 'payment_issues', label: 'Payment Issues' }, { value: 'duplicate', label: 'Duplicate Shipment' }, { value: 'incorrect_details', label: 'Incorrect Details' }, { value: 'delay_unacceptable', label: 'Delay Unacceptable' }, { value: 'other', label: 'Other' }];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason) { toast.warning('Please select a cancellation reason'); return; }
    setLoading(true);
    try { await onCancel(shipment._id, formData); onClose(); } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Shipment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg"><div className="flex items-start"><AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-yellow-800">Are you sure you want to cancel this shipment?</p><p className="text-xs text-yellow-700 mt-1">This action cannot be undone. The shipment status will be changed to cancelled.</p></div></div></div>
        <Select label="Cancellation Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} options={reasonOptions} placeholder="Select reason" required icon={XCircle} />
        <TextArea label="Additional Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Provide additional details..." rows={3} />
        <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onClose}>No, Keep Shipment</Button><Button type="submit" variant="danger" isLoading={loading}>Yes, Cancel Shipment</Button></div>
      </form>
    </Modal>
  );
};

// Shipment Details Modal
const ShipmentDetailsModal = ({ isOpen, onClose, shipment }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [costs, setCosts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => { if (isOpen && shipment) { fetchShipmentData(); fetchTrackingData(); } }, [isOpen, shipment]);
  const fetchTrackingData = async () => { if (!shipment?.trackingNumber) return; setTrackingLoading(true); try { const result = await trackShipmentByNumber(shipment.trackingNumber); if (result.success) setTrackingData(result.data); } catch (error) { console.error('Tracking fetch error:', error); } finally { setTrackingLoading(false); } };
  const fetchShipmentData = async () => { setLoading(true); try { const [costsRes, timelineRes] = await Promise.all([getShipmentCosts(shipment._id), getShipmentTimeline(shipment._id)]); if (costsRes.success) setCosts(costsRes.data || []); if (timelineRes.success) setTimeline(timelineRes.data || []); } catch (error) { toast.error('Failed to fetch shipment details'); } finally { setLoading(false); } };

  if (!isOpen || !shipment) return null;

  const totalWeight = calculateTotalWeight(shipment.packages);
  const totalVolume = calculateTotalVolume(shipment.packages);
  const daysInTransit = getDaysInTransit(shipment.transport?.actualDeparture || shipment.transport?.estimatedDeparture);
  const onTrack = isOnTrack(shipment.transport?.estimatedArrival, shipment.actualDeliveryDate, shipment.status);
  const progress = trackingData?.progress || getShipmentProgress(shipment.status);
  const currentLocation = trackingData?.currentLocation || 'In Transit';
  const tabs = [{ id: 'details', label: 'Details', icon: Package }, { id: 'packages', label: 'Packages', icon: Box }, { id: 'transport', label: 'Transport', icon: Truck },  { id: 'timeline', label: 'Timeline', icon: Activity }];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shipment Details" size="xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h4 className="text-lg font-semibold text-gray-900">#{shipment.shipmentNumber || shipment._id?.slice(-8).toUpperCase()}</h4>{shipment.trackingNumber && <p className="text-sm text-gray-500">Tracking: {shipment.trackingNumber}</p>}</div><StatusBadge status={shipment.status} size="lg" /></div>
        <div className="bg-gray-50 p-4 rounded-lg"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700">Current Status</span><span className="text-xs text-gray-500">Last updated: {trackingData?.lastUpdate ? formatShipmentDate(trackingData.lastUpdate, 'short') : formatShipmentDate(shipment.updatedAt, 'short')}</span></div><div className="flex items-center space-x-2 mb-3"><MapPin className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{currentLocation}</span></div><ProgressBar progress={progress} showLabel /></div>
        <div className="border-b border-gray-200"><nav className="flex space-x-4 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === tab.id ? `border-[${COLORS.primary}] text-[${COLORS.primary}]` : 'border-transparent text-gray-500 hover:text-gray-700'}`}><tab.icon className="h-4 w-4 mr-2" />{tab.label}</button>))}</nav></div>
        <div className="min-h-[300px]">
          {loading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} /><span className="ml-2 text-sm text-gray-500">Loading details...</span></div> : (
            <>
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4"><h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center"><User className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />Customer Information</h5><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Company Name</p><p className="text-sm font-medium">{shipment.customerId?.companyName || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Contact Person</p><p className="text-sm font-medium">{shipment.customerId?.firstName} {shipment.customerId?.lastName}</p></div><div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{shipment.customerId?.email || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium">{shipment.customerId?.phone || 'N/A'}</p></div></div></div>
                  <div className="border rounded-lg p-4"><h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center"><Package className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />Shipment Details</h5><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Origin</p><p className="text-sm font-medium">{shipment.shipmentDetails?.origin || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Destination</p><p className="text-sm font-medium">{shipment.shipmentDetails?.destination || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Mode</p><ShipmentModeBadge mode={shipment.shipmentDetails?.shipmentType} /></div><div><p className="text-xs text-gray-500">Payment Terms</p><p className="text-sm font-medium">{shipment.paymentTerms || 'N/A'}</p></div></div>{shipment.specialInstructions && <div className="mt-3"><p className="text-xs text-gray-500 mb-1">Special Instructions</p><p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{shipment.specialInstructions}</p></div>}</div>
                  {shipment.customsInfo && <div className="border rounded-lg p-4"><h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center"><Shield className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />Customs Information</h5><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Broker Name</p><p className="text-sm font-medium">{shipment.customsInfo.brokerName || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Broker Contact</p><p className="text-sm font-medium">{shipment.customsInfo.brokerContact || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Duties</p><p className="text-sm font-medium">{shipment.customsInfo.dutiesPaid ? 'Prepaid' : 'To be paid'}</p></div></div></div>}
                </div>
              )}
              {activeTab === 'packages' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4"><div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-xs text-gray-500">Total Packages</p><p className="text-2xl font-semibold" style={{ color: COLORS.primary }}>{shipment.packages?.length || 0}</p></div><div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-xs text-gray-500">Total Weight</p><p className="text-2xl font-semibold" style={{ color: COLORS.secondary }}>{formatWeight(totalWeight)}</p></div><div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-xs text-gray-500">Total Volume</p><p className="text-2xl font-semibold" style={{ color: COLORS.success }}>{formatVolume(totalVolume)}</p></div></div>
                  {shipment.packages && shipment.packages.length > 0 ? <div className="border rounded-lg overflow-hidden"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Weight</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Volume</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Dimensions</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th></tr></thead><tbody className="divide-y divide-gray-200">{shipment.packages.map((pkg, index) => (<tr key={index}><td className="px-4 py-2 text-sm">{pkg.packageType}</td><td className="px-4 py-2 text-sm">{pkg.quantity}</td><td className="px-4 py-2 text-sm">{formatWeight(pkg.weight)}</td><td className="px-4 py-2 text-sm">{formatVolume(pkg.volume)}</td><td className="px-4 py-2 text-sm">{pkg.length && pkg.width && pkg.height ? `${pkg.length}×${pkg.width}×${pkg.height} cm` : 'N/A'}</td><td className="px-4 py-2 text-sm text-gray-500">{pkg.description || '-'}</td></tr>))}</tbody></table></div> : <p className="text-sm text-gray-500 text-center py-4">No package details available</p>}
                </div>
              )}
              {activeTab === 'transport' && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4"><h5 className="text-sm font-medium text-gray-700 mb-3">Transport Details</h5><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Carrier Name</p><p className="text-sm font-medium">{shipment.transport?.carrierName || 'Not assigned'}</p></div><div><p className="text-xs text-gray-500">Route</p><p className="text-sm font-medium">{shipment.transport?.route || 'Direct'}</p></div><div><p className="text-xs text-gray-500">Vessel/Flight No.</p><p className="text-sm font-medium">{shipment.transport?.vesselName || shipment.transport?.flightNumber || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Container/Seal No.</p><p className="text-sm font-medium">{shipment.transport?.containerNumber || 'N/A'} / {shipment.transport?.sealNumber || 'N/A'}</p></div></div></div>
                  <div className="border rounded-lg p-4"><h5 className="text-sm font-medium text-gray-700 mb-3">Schedule</h5><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Estimated Departure</p><p className="text-sm font-medium">{shipment.transport?.estimatedDeparture ? formatShipmentDate(shipment.transport.estimatedDeparture, 'short') : 'Not set'}</p></div><div><p className="text-xs text-gray-500">Estimated Arrival</p><p className="text-sm font-medium">{shipment.transport?.estimatedArrival ? formatShipmentDate(shipment.transport.estimatedArrival, 'short') : 'Not set'}</p></div><div><p className="text-xs text-gray-500">Actual Departure</p><p className="text-sm font-medium">{shipment.transport?.actualDeparture ? formatShipmentDate(shipment.transport.actualDeparture, 'short') : 'Not departed'}</p></div><div><p className="text-xs text-gray-500">Actual Arrival</p><p className="text-sm font-medium">{shipment.actualDeliveryDate ? formatShipmentDate(shipment.actualDeliveryDate, 'short') : 'Not arrived'}</p></div></div>{shipment.transport?.estimatedArrival && !shipment.actualDeliveryDate && (<div className="mt-4 bg-gray-50 rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-xs text-gray-600">Days in Transit:</span><span className="text-sm font-medium">{daysInTransit} days</span></div><div className="flex items-center justify-between mt-2"><span className="text-xs text-gray-600">On Track:</span><span className={`text-sm font-medium ${onTrack ? 'text-green-600' : 'text-red-600'}`}>{onTrack ? 'Yes' : 'Delayed'}</span></div></div>)}</div>
                </div>
              )}
              {/* {activeTab === 'costs' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-green-600 mb-1">Total Shipment Cost</p><p className="text-2xl font-bold" style={{ color: COLORS.success }}>{formatShipmentCurrency(shipment.totalCost)}</p></div></div></div>
                  {costs.length > 0 ? <div className="border rounded-lg overflow-hidden"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Paid By</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th></tr></thead><tbody className="divide-y divide-gray-200">{costs.map((cost, index) => (<tr key={index}><td className="px-4 py-2 text-sm capitalize">{cost.type}</td><td className="px-4 py-2 text-sm">{cost.description || '-'}</td><td className="px-4 py-2 text-sm font-medium">{formatShipmentCurrency(cost.amount, cost.currency)}</td><td className="px-4 py-2 text-sm capitalize">{cost.paidBy}</td><td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${cost.paidStatus === 'paid' ? 'bg-green-100 text-green-700' : cost.paidStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{cost.paidStatus}</span></td></tr>))}</tbody></table></div> : <p className="text-sm text-gray-500 text-center py-4">No costs added yet</p>}
                  {shipment.insurance?.required && <div className="border rounded-lg p-4"><h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center"><Shield className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />Insurance</h5><p className="text-sm">Coverage: {formatShipmentCurrency(shipment.insurance.coverageAmount, shipment.insurance.currency)}</p></div>}
                </div>
              )} */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {trackingLoading || loading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} /></div> : (trackingData?.timeline?.length > 0 || timeline.length > 0) ? <div className="relative">{(trackingData?.timeline || timeline).map((event, index) => (<div key={index} className="flex items-start space-x-3 mb-4"><div className="flex-shrink-0"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.status === 'delivered' || event.status === 'completed' ? 'bg-green-100' : event.status === 'arrived_at_destination_port' ? 'bg-teal-100' : event.status === 'customs_cleared' ? 'bg-emerald-100' : event.status === 'out_for_delivery' ? 'bg-pink-100' : event.status === 'in_transit' ? 'bg-cyan-100' : event.type === 'status' ? 'bg-blue-100' : event.type === 'tracking' ? 'bg-green-100' : event.type === 'note' ? 'bg-purple-100' : event.type === 'cost' ? 'bg-yellow-100' : 'bg-gray-100'}`}>{event.status === 'delivered' && <CheckCircleSolid className="h-4 w-4 text-green-600" />}{event.status === 'arrived_at_destination_port' && <Flag className="h-4 w-4 text-teal-600" />}{event.status === 'customs_cleared' && <Shield className="h-4 w-4 text-emerald-600" />}{event.status === 'out_for_delivery' && <Truck className="h-4 w-4 text-pink-600" />}{event.status === 'in_transit' && <Truck className="h-4 w-4 text-cyan-600" />}{event.type === 'status' && <Activity className="h-4 w-4 text-blue-600" />}{event.type === 'tracking' && <MapPin className="h-4 w-4 text-green-600" />}{event.type === 'note' && <MessageSquare className="h-4 w-4 text-purple-600" />}{event.type === 'cost' && <DollarSign className="h-4 w-4 text-yellow-600" />}{event.type === 'document' && <FileText className="h-4 w-4 text-gray-600" />}</div></div><div className="flex-1 bg-gray-50 rounded-lg p-3"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-gray-900">{event.statusLabel || getShipmentStatusDisplayText(event.status) || event.title || 'Update'}</p>{event.description && <p className="text-xs text-gray-600 mt-1">{event.description}</p>}{event.location && <p className="text-xs text-gray-500 mt-1 flex items-center"><MapPin className="h-3 w-3 mr-1" />{event.location}</p>}</div><p className="text-xs text-gray-400">{formatShipmentDate(event.timestamp || event.date || event.createdAt, 'long')}</p></div>{event.updatedBy && <p className="text-xs text-gray-400 mt-2">By: {event.updatedBy}</p>}</div></div>))}</div> : <p className="text-sm text-gray-500 text-center py-4">No timeline events yet</p>}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end pt-4"><Button type="button" variant="primary" onClick={onClose}>Close</Button></div>
      </div>
    </Modal>
  );
};

// Timeline Modal
const TimelineModal = ({ isOpen, onClose, shipmentId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isOpen && shipmentId) fetchTimeline(); }, [isOpen, shipmentId]);
  const fetchTimeline = async () => { setLoading(true); try { const result = await getShipmentTimeline(shipmentId); if (result.success) setTimeline(result.data || []); else toast.error(result.message); } catch (error) { toast.error('Failed to fetch timeline'); } finally { setLoading(false); } };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shipment Timeline" size="lg">
      {loading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} /><span className="ml-2 text-sm text-gray-500">Loading timeline...</span></div> : timeline.length > 0 ? <div className="space-y-4">{timeline.map((event, index) => (<div key={index} className="flex items-start space-x-3"><div className="flex-shrink-0"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.type === 'status' ? 'bg-blue-100' : event.type === 'tracking' ? 'bg-green-100' : event.type === 'note' ? 'bg-purple-100' : 'bg-gray-100'}`}>{event.type === 'status' && <Activity className="h-4 w-4 text-blue-600" />}{event.type === 'tracking' && <MapPin className="h-4 w-4 text-green-600" />}{event.type === 'note' && <MessageSquare className="h-4 w-4 text-purple-600" />}</div></div><div className="flex-1"><p className="text-sm font-medium text-gray-900">{event.title}</p><p className="text-xs text-gray-500">{event.description}</p><p className="text-xs text-gray-400 mt-1">{formatShipmentDate(event.createdAt, 'long')}</p></div></div>))}</div> : <p className="text-sm text-gray-500 text-center py-4">No timeline events found</p>}
    </Modal>
  );
};

// ==================== MAIN COMPONENT ====================
export default function ShipmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [showReturnRequestsModal, setShowReturnRequestsModal] = useState(false);

  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', startDate: '', endDate: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [activeStat, setActiveStat] = useState('all');

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [stats, setStats] = useState({ total: 0, active: 0, delivered: 0, cancelled: 0, pending: 0, inTransit: 0 });
  const [topRoutes, setTopRoutes] = useState([]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await getAllShipments(filters);
      if (response.success) {
        setShipments(response.data || []);
        setFilteredShipments(response.data || []);
        setPagination(response.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
        const summary = getShipmentSummary(response.data || []);
        setStats(summary);
        const routes = getTopRoutes(response.data || [], 5);
        setTopRoutes(routes);
      } else { toast.error(response.message); }
    } catch (error) { toast.error(error.message || 'Failed to fetch shipments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShipments(); }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder]);

  const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value, page: 1 })); if (name === 'status' && value) setActiveStat('all'); };
  const handleSearch = (e) => { const searchValue = e.target.value; setFilters(prev => ({ ...prev, search: searchValue, page: 1 })); if (searchValue.trim() === '') setFilteredShipments(shipments); else setFilteredShipments(shipments.filter(s => (s.shipmentNumber && s.shipmentNumber.toLowerCase().includes(searchValue.toLowerCase())) || (s._id && s._id.toLowerCase().includes(searchValue.toLowerCase())))); };
  const handleSort = (field) => { const sortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc'; setFilters(prev => ({ ...prev, sortBy: field, sortOrder })); };
  const clearFilters = () => { setFilters({ page: 1, limit: 20, search: '', startDate: '', endDate: '', sortBy: 'createdAt', sortOrder: 'desc' }); setSelectedShipments([]); setActiveStat('all'); toast.info('Filters cleared'); };

  const handleAction = async (action, shipment) => {
    setSelectedShipment(shipment);
    switch (action) {
      case 'view': setShowDetailsModal(true); break;
      case 'timeline': setShowTimelineModal(true); break;
      case 'status': setShowStatusModal(true); break;
      case 'tracking': setShowTrackingModal(true); break;
      case 'assign': setShowAssignModal(true); break;
      case 'cost': setShowCostModal(true); break;
      case 'document': setShowDocumentModal(true); break;
      case 'note': setShowNoteModal(true); break;
      case 'warehouse': setShowWarehouseModal(true); break;
      case 'cancel': setShowCancelModal(true); break;
      case 'download': if (shipment.documents && shipment.documents.length > 0) toast.info('Download feature coming soon'); else toast.info('No documents to download'); break;
      case 'share': if (shipment.trackingNumber) { navigator.clipboard.writeText(`${window.location.origin}/track/${shipment.trackingNumber}`); toast.success('Tracking link copied!'); } else toast.warning('No tracking number available'); break;
      default: break;
    }
  };

  const handleUpdateStatus = async (shipmentId, statusData) => { try { const result = await updateShipmentStatus(shipmentId, statusData); if (result.success) { toast.success('Status updated!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to update status'); } };
  const handleAddTracking = async (shipmentId, trackingData) => { try { const result = await addTrackingUpdate(shipmentId, trackingData); if (result.success) { toast.success('Tracking added!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to add tracking'); } };
  const handleAssignStaff = async (shipmentId, assignData) => { try { const result = await assignShipment(shipmentId, assignData); if (result.success) { toast.success('Staff assigned!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to assign staff'); } };
  const handleAddCost = async (shipmentId, costData) => { try { const result = await addShipmentCost(shipmentId, costData); if (result.success) { toast.success('Cost added!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to add cost'); } };
  const handleUploadDocument = async (shipmentId, formData) => { try { const result = await addShipmentDocument(shipmentId, formData); if (result.success) { toast.success('Document uploaded!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to upload document'); } };
  const handleAddNote = { internalNote: async (shipmentId, noteData) => { try { const result = await addInternalNote(shipmentId, noteData); if (result.success) { toast.success('Internal note added!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to add note'); } }, customerNote: async (shipmentId, noteData) => { try { const result = await addCustomerNote(shipmentId, noteData); if (result.success) { toast.success('Customer note added!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to add note'); } } };
  const handleWarehouseAction = { receive: async (shipmentId, data) => { try { const result = await receiveAtWarehouse(shipmentId, data); if (result.success) { toast.success('Shipment received!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to receive'); } }, process: async (shipmentId, data) => { try { const result = await processWarehouse(shipmentId, data); if (result.success) { toast.success('Warehouse processing completed!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to process'); } } };
  const handleCancelShipment = async (shipmentId, cancelData) => { try { const result = await cancelShipment(shipmentId, cancelData); if (result.success) { toast.success('Shipment cancelled!'); fetchShipments(); } else toast.error(result.message); } catch (error) { toast.error('Failed to cancel'); } };
  const handleExport = () => { if (shipments.length === 0) toast.warning('No shipments to export'); else { exportShipmentsToCSV(shipments); toast.success(`${shipments.length} shipments exported!`); } };
  const handleSelectAll = () => { if (selectedShipments.length === filteredShipments.length) setSelectedShipments([]); else setSelectedShipments(filteredShipments.map(s => s._id)); };
  const filterByStatus = (status) => { setActiveStat(status); if (status === 'all') setFilteredShipments(shipments); else setFilteredShipments(shipments.filter(s => s.status === status)); if (status !== 'all') setFilters(prev => ({ ...prev, page: 1 })); };

  const visibleStats = [{ key: 'all', label: 'All', value: stats.total, icon: Package, color: 'bg-gray-100 text-gray-600' }, { key: 'active', label: 'Active', value: stats.active, icon: Activity, color: 'bg-blue-100 text-blue-600' }, { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, icon: XCircleSolid, color: 'bg-red-100 text-red-600' }];
  const getTrackingStatus = (shipment) => { if (shipment.trackingUpdates && shipment.trackingUpdates.length > 0) return shipment.trackingUpdates[shipment.trackingUpdates.length - 1].status; if (shipment.status === 'delivered') return 'delivered'; if (shipment.status === 'in_transit') return 'in_transit'; if (shipment.status === 'out_for_delivery') return 'out_for_delivery'; if (shipment.status === 'arrived_at_destination_port') return 'arrived_at_destination_port'; if (shipment.status === 'customs_cleared') return 'customs_cleared'; if (shipment.status === 'cancelled') return 'exception'; return 'pending'; };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}><Package className="h-4 w-4" style={{ color: COLORS.primary }} /></div><h1 className="ml-2 text-lg font-semibold text-gray-900">Shipments Management</h1></div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{stats.total} Total</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="light" size="sm" onClick={() => setShowReturnRequestsModal(true)} icon={<Undo2 className="h-4 w-4" />}>Return Requests</Button>
               
              <Button variant="light" size="sm" onClick={fetchShipments} icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {visibleStats.map(stat => (<StatCard key={stat.key} title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} active={activeStat === stat.key} onClick={() => filterByStatus(stat.key)} />))}
        </div>

        {topRoutes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {topRoutes.map((route, index) => (<div key={index} className="bg-white rounded-xl border border-gray-200 p-3"><div className="flex items-center justify-between"><div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-gray-400" /><span className="text-xs text-gray-500">Route {index + 1}</span></div><span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">{route.count} shipments</span></div><p className="text-sm font-medium mt-2">{route.route}</p></div>))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1"><Input type="text" placeholder="Search by shipment number..." value={filters.search} onChange={handleSearch} icon={Search} /></div>
              <Button variant={showFilters ? 'primary' : 'light'} size="md" onClick={() => setShowFilters(!showFilters)} icon={<FilterIcon className="h-4 w-4" />}>Filters{(filters.startDate || filters.endDate) && (<span className="ml-2 bg-white text-[${COLORS.primary}] rounded-full px-2 py-0.5 text-xs">{Object.values(filters).filter(v => v && v !== '' && v !== 20 && v !== 1).length}</span>)}</Button>
              {(filters.search || filters.startDate || filters.endDate || activeStat !== 'all') && (<Button variant="light" size="md" onClick={clearFilters} icon={<X className="h-4 w-4" />}>Clear</Button>)}
            </div>
          </div>
        </div>

        {selectedShipments.length > 0 && (<div className="bg-indigo-50 border border-indigo-200 rounded-xl mb-4 p-3"><div className="flex items-center justify-between"><div className="flex items-center"><span className="text-sm font-medium text-indigo-700">{selectedShipments.length} shipment(s) selected</span></div><div className="flex items-center space-x-2"><Button size="sm" variant="ghost" onClick={() => setSelectedShipments([])} icon={<X className="h-4 w-4" />} /></div></div></div>)}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr><th className="w-10 px-4 py-3"></th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('shipmentNumber')}>Shipment Info<ArrowUpDown className="h-4 w-4 ml-1" /></div></th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('customer')}>Customer<ArrowUpDown className="h-4 w-4 ml-1" /></div></th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('createdAt')}>Created<ArrowUpDown className="h-4 w-4 ml-1" /></div></th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packages</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (<tr><td colSpan="9" className="px-4 py-8 text-center"><div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} /><span className="ml-2 text-sm text-gray-500">Loading shipments...</span></div></td></tr>) : filteredShipments.length === 0 ? (<tr><td colSpan="9" className="px-4 py-8 text-center"><div className="flex flex-col items-center"><Package className="h-12 w-12 text-gray-400 mb-3" /><p className="text-sm text-gray-500">No shipments found</p></div></td></tr>) : (filteredShipments.map((shipment) => { const totalWeight = calculateTotalWeight(shipment.packages); const progress = getShipmentProgress(shipment.status); const trackingStatus = getTrackingStatus(shipment); return (<tr key={shipment._id} className="hover:bg-gray-50 transition-colors group"><td className="px-4 py-3"></td><td className="px-4 py-3"><div><div className="text-sm font-medium cursor-pointer hover:underline" style={{ color: COLORS.primary }} onClick={() => { setSelectedShipment(shipment); setShowDetailsModal(true); }}>{shipment.shipmentNumber || shipment._id?.slice(-8).toUpperCase()}</div>{shipment.trackingNumber && (<div className="text-xs text-gray-500 flex items-center mt-1"><Hash className="h-3 w-3 mr-1" />{shipment.trackingNumber}</div>)}</div></td><td className="px-4 py-3"><div className="text-sm font-medium text-gray-900">{shipment.customerId?.companyName || `${shipment.customerId?.firstName || ''} ${shipment.customerId?.lastName || ''}`.trim() || 'N/A'}</div>{shipment.customerId?.email && <div className="text-xs text-gray-500">{shipment.customerId.email}</div>}</td><td className="px-4 py-3"><div className="flex items-center text-xs"><span className="font-medium text-gray-900">{shipment.shipmentDetails?.origin || 'N/A'}</span><ChevronRight className="h-3 w-3 mx-1 text-gray-400" /><span className="font-medium text-gray-900">{shipment.shipmentDetails?.destination || 'N/A'}</span></div></td><td className="px-4 py-3"><div className="text-xs text-gray-500">{formatShipmentDate(shipment.createdAt, 'short')}</div></td><td className="px-4 py-3"><div className="text-xs"><div className="text-gray-900">{shipment.packages?.length || 0} pkgs</div><div className="text-gray-500">{formatWeight(totalWeight)}</div></div></td><td className="px-4 py-3"><div className="flex flex-col space-y-1"><StatusBadge status={shipment.status} size="sm" /><div className="w-24"><ProgressBar progress={progress} /></div></div></td><td className="px-4 py-3"><ActionMenu shipment={shipment} onAction={handleAction} /></td></tr>); }))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (<div className="border-t px-4 py-3 bg-gray-50"><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><span className="text-xs text-gray-600">Showing {(pagination.page - 1) * filters.limit + 1} to {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total} results</span><Select name="limit" value={filters.limit} onChange={handleFilterChange} options={[{ value: 10, label: '10 / page' }, { value: 20, label: '20 / page' }, { value: 50, label: '50 / page' }, { value: 100, label: '100 / page' }]} className="w-24" /></div><div className="flex items-center space-x-1"><Button size="xs" variant="ghost" onClick={() => setFilters(prev => ({ ...prev, page: 1 }))} disabled={filters.page === 1} icon={<ChevronsLeft className="h-4 w-4" />} /><Button size="xs" variant="ghost" onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))} disabled={filters.page === 1} icon={<ChevronLeft className="h-4 w-4" />} /><span className="text-sm text-gray-600 px-3">Page {filters.page} of {pagination.pages}</span><Button size="xs" variant="ghost" onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} disabled={filters.page === pagination.pages} icon={<ChevronRight className="h-4 w-4" />} /><Button size="xs" variant="ghost" onClick={() => setFilters(prev => ({ ...prev, page: pagination.pages }))} disabled={filters.page === pagination.pages} icon={<ChevronsRight className="h-4 w-4" />} /></div></div></div>)}
        </div>
      </div>

      <ShipmentDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} shipment={selectedShipment} />
      <TimelineModal isOpen={showTimelineModal} onClose={() => setShowTimelineModal(false)} shipmentId={selectedShipment?._id} />
      <StatusUpdateModal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} shipment={selectedShipment} onUpdate={handleUpdateStatus} />
      <TrackingUpdateModal isOpen={showTrackingModal} onClose={() => setShowTrackingModal(false)} shipment={selectedShipment} onAdd={handleAddTracking} />
      <AssignModal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} shipment={selectedShipment} onAssign={handleAssignStaff} />
      <CostModal isOpen={showCostModal} onClose={() => setShowCostModal(false)} shipment={selectedShipment} onAdd={handleAddCost} />
      <DocumentModal isOpen={showDocumentModal} onClose={() => setShowDocumentModal(false)} shipment={selectedShipment} onUpload={handleUploadDocument} />
      <NoteModal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} shipment={selectedShipment} onAdd={handleAddNote} />
      <WarehouseModal isOpen={showWarehouseModal} onClose={() => setShowWarehouseModal(false)} shipment={selectedShipment} onAction={handleWarehouseAction} />
      <CancelModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} shipment={selectedShipment} onCancel={handleCancelShipment} />
      <ReturnRequestsModal isOpen={showReturnRequestsModal} onClose={() => setShowReturnRequestsModal(false)} onRefresh={fetchShipments} />
    </div>
  );
}
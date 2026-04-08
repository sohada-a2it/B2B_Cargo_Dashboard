// components/shipments/AllShipments.jsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Lock } from "lucide-react"; // ✅ correct
import { 
  getAllNewShipments,
  updateShipmentStatus  
} from '@/Api/newShipping';

// ==================== ICONS ====================
import {
  Package, Search, ChevronDown, ChevronLeft, ChevronRight,
  Eye, MoreVertical, ArrowUpDown, Download as ExportIcon,
  X, Hash, Activity, CheckCircle as CheckCircleSolid,
  XCircle as XCircleSolid, Clock, Truck, MapPin, User,
  ChevronsLeft, ChevronsRight, Loader2, RefreshCw,
  Box, Ship, Plane, Train, Building2, DollarSign,
  Calendar, AlertCircle, FileText, Send, Flag, Edit3,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';

// ==================== COLOR CONSTANTS ====================
const COLORS = {
  primary: '#E67E22',
  primaryDark: '#d35400',
  primaryLight: '#fef2e6',
  secondary: '#3C719D',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6'
};

// ==================== STATUS CONFIGURATION ====================
const STATUS_CONFIG = {
  booking_requested: {
    label: 'Booking Requested',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    progress: 5
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
    progress: 10
  },
  received_at_warehouse: {
    label: 'Received at Warehouse',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Building2,
    progress: 20
  },
  picked_up_from_warehouse: {
    label: 'Picked Up',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: Truck,
    progress: 30
  },
  departed_port_of_origin: {
    label: 'Departed Origin',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Ship,
    progress: 50
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Truck,
    progress: 60
  },
  arrived_at_destination_port: {
    label: 'Arrived at Port',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: Flag,
    progress: 70
  },
  customs_clearance: {
    label: 'Customs Clearance',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: FileText,
    progress: 80
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: Truck,
    progress: 90
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircleSolid,
    progress: 100
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleSolid,
    progress: 0
  }
};

// All statuses in sequence
const ALL_STATUSES = [
  { value: 'booking_requested', label: 'Booking Requested', order: 1 },
  { value: 'pending', label: 'Pending', order: 2 },
  { value: 'received_at_warehouse', label: 'Received at Warehouse', order: 3 },
  { value: 'picked_up_from_warehouse', label: 'Picked Up', order: 4 },
  { value: 'departed_port_of_origin', label: 'Departed Origin', order: 5 },
  { value: 'in_transit', label: 'In Transit', order: 6 },

  // ✅ NEW
  { value: 'on_hold', label: 'On Hold', order: 7 },

  { value: 'arrived_at_destination_port', label: 'Arrived at Port', order: 8 },

  // ✅ NEW
  { value: 'under_customs_cleared', label: 'Under Customs Clearance', order: 9 },

  { value: 'customs_clearance', label: 'Customs Clearance', order: 10 },
  { value: 'out_for_delivery', label: 'Out for Delivery', order: 11 },
  { value: 'delivered', label: 'Delivered', order: 12 },
  { value: 'cancelled', label: 'Cancelled', order: 13 }
];

// ==================== SHIPMENT MODE CONFIG ====================
const getShipmentModeIcon = (mainType) => {
  const icons = {
    air_freight: Plane,
    sea_freight: Ship,
    road_freight: Truck,
    multimodal: Package,
    inland_trucking: Truck
  };
  return icons[mainType] || Package;
};

const getShipmentModeLabel = (mainType) => {
  const labels = {
    air_freight: 'Air Freight',
    sea_freight: 'Sea Freight',
    road_freight: 'Road Freight',
    multimodal: 'Multimodal',
    inland_trucking: 'Inland Trucking'
  };
  return labels[mainType] || mainType || 'Standard';
};

// ==================== HELPER FUNCTIONS ====================
const getShipmentProgress = (status) => STATUS_CONFIG[status]?.progress || 0;
const getShipmentStatusDisplayText = (status) => STATUS_CONFIG[status]?.label || status?.replace(/_/g, ' ') || 'Unknown';
const getStatusOrder = (status) => {
  const found = ALL_STATUSES.find(s => s.value === status);
  return found ? found.order : 0;
};

// ==================== UI COMPONENTS ====================

const Button = ({ children, type = 'button', variant = 'primary', size = 'md', isLoading = false, disabled = false, onClick, className = '', icon = null, iconPosition = 'left' }) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white hover:bg-[${COLORS.primaryDark}] focus:ring-[${COLORS.primary}] shadow-sm`,
    secondary: `bg-[${COLORS.secondary}] text-white hover:bg-[#2c5a8c] focus:ring-[${COLORS.secondary}]`,
    light: `bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`,
    success: `bg-[${COLORS.success}] text-white hover:bg-[#0d9488] focus:ring-[${COLORS.success}]`,
    danger: `bg-[${COLORS.danger}] text-white hover:bg-[#dc2626] focus:ring-[${COLORS.danger}]`,
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
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
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

const Input = ({ type = 'text', name, value, onChange, placeholder, label, icon: Icon, required = false, disabled = false, className = '' }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>}
      <div className="relative">
        {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-4 w-4 text-gray-400" /></div>}
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
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${className}
          `}
        />
      </div>
    </div>
  );
};

const TextArea = ({ name, value, onChange, placeholder, label, rows = 3 }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
      />
    </div>
  );
};

const Select = ({ name, value, onChange, options, placeholder = 'Select option', label }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent pr-10"
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: getShipmentStatusDisplayText(status),
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Clock
  };
  const Icon = config.icon;
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs', lg: 'px-3 py-1.5 text-sm' };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizes[size]}`}>
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
      {config.label}
    </span>
  );
};

const ShipmentModeBadge = ({ classification }) => {
  const mainType = classification?.mainType || 'standard';
  const Icon = getShipmentModeIcon(mainType);
  const label = getShipmentModeLabel(mainType);
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </span>
  );
};

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-24">
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="rounded-full transition-all duration-500 h-1.5"
          style={{ width: `${progress}%`, backgroundColor: progress === 100 ? COLORS.success : COLORS.primary }}
        />
      </div>
    </div>
  );
};

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

  const actions = [
    { label: 'View Details', icon: Eye, action: 'view', color: 'text-blue-600', show: true },
    { label: 'Update Status', icon: Edit3, action: 'updateStatus', color: 'text-green-600', show: shipment.shipmentStatus !== 'delivered' && shipment.shipmentStatus !== 'cancelled' }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-1">
          {actions.filter(a => a.show).map((action) => (
            <button
              key={action.action}
              onClick={() => { onAction(action.action, shipment); setShowMenu(false); }}
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

const StatCard = ({ title, value, icon: Icon, color, onClick, active }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all duration-200
        hover:shadow-md hover:border-[${COLORS.primary}]/30
        ${active ? `border-[${COLORS.primary}] ring-2 ring-[${COLORS.primary}]/20 bg-[${COLORS.primaryLight}]` : 'border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

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
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
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

// ==================== UPDATE STATUS MODAL ==================== 

// ==================== UPDATE STATUS MODAL ==================== 

const UpdateStatusModal = ({
  isOpen,
  onClose,
  shipment,
  currentStatus,
  onStatusUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updateDate, setUpdateDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [updateTime, setUpdateTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [remarks, setRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentOrder = getStatusOrder(currentStatus);

  // Get all statuses based on current status
  const getAvailableStatuses = () => {
    if (currentStatus === 'on_hold') {
      // When on hold, only show Resume (previous active status) and Cancel
      const previousActiveStatus = shipment?.lastActiveStatus || 'in_transit';
      return [
        { value: previousActiveStatus, label: `Resume (${getShipmentStatusDisplayText(previousActiveStatus)})`, order: getStatusOrder(previousActiveStatus), isResume: true },
        { value: 'cancelled', label: 'Cancelled', order: 99, isCancelled: true }
      ];
    }
    
    // Normal flow - show all statuses
    return ALL_STATUSES;
  };

  const availableStatuses = getAvailableStatuses();

  // Get immediate next status for normal flow
  const getImmediateNextStatus = () => {
    if (currentStatus === 'on_hold') return null;
    const next = ALL_STATUSES.find((s) => s.order === currentOrder + 1);
    return next?.value || null;
  };

  const immediateNextStatus = getImmediateNextStatus();

  // Check if status is selectable
  const isStatusSelectable = (statusValue, statusItem) => {
    // If on hold, only resume and cancel are selectable
    if (currentStatus === 'on_hold') {
      return statusItem.isResume || statusItem.isCancelled;
    }

    // Normal flow rules
    if (statusValue === 'on_hold') return true;
    if (statusValue === 'cancelled') return true;
    return statusValue === immediateNextStatus;
  };

  // Check if status is past (completed)
  const isPast = (order) => {
    if (currentStatus === 'on_hold') return false;
    return order < currentOrder;
  };

  // Check if status is current
  const isCurrent = (order, value) => {
    if (currentStatus === 'on_hold') return false;
    return order === currentOrder && value === currentStatus;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsUpdating(true);
    try {
      const updateDateTime = `${updateDate}T${updateTime}:00`;

      const payload = {
        status: selectedStatus,
        notes: remarks,
        updatedBy: "admin",
        updateDateTime,
      };

      // If resuming from on_hold, send the status to resume to
      if (currentStatus === 'on_hold' && selectedStatus !== 'cancelled') {
        payload.resumeTo = selectedStatus;
      }

      const response = await updateShipmentStatus(shipment._id, payload);

      if (response.success) {
        toast.success(
          currentStatus === 'on_hold' && selectedStatus !== 'cancelled'
            ? `Resumed to ${getShipmentStatusDisplayText(selectedStatus)}`
            : `Updated → ${getShipmentStatusDisplayText(selectedStatus)}`
        );
        onStatusUpdate(selectedStatus);
        onClose();
      } else {
        toast.error(response.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
      setShowConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Update Shipment Status" size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CURRENT STATUS */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Current Status</p>
            <StatusBadge status={currentStatus} />
            {currentStatus === 'on_hold' && (
              <p className="text-xs text-orange-600 mt-2">
                ⚠️ Shipment is on hold. You can resume or cancel.
              </p>
            )}
          </div>

          {/* INFO BOX */}
          {currentStatus !== 'on_hold' && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-700">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Only next step, On Hold, or Cancel allowed
            </div>
          )}

          {/* STATUS LIST */}
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
            {availableStatuses.map((status) => {
              const statusValue = status.value || status;
              const statusLabel = status.label || getShipmentStatusDisplayText(statusValue);
              const isResumeItem = status.isResume;
              const isCancelledItem = status.isCancelled;
              
              const selectable = isStatusSelectable(statusValue, status);
              const disabled = !selectable;

              const past = isPast(status.order);
              const current = isCurrent(status.order, statusValue);
              const next = statusValue === immediateNextStatus && currentStatus !== 'on_hold';
              const isOnHold = statusValue === 'on_hold' && currentStatus !== 'on_hold';

              // Special styling for on_hold status in normal flow
              if (isOnHold && !disabled) {
                return (
                  <label
                    key={statusValue}
                    className={`
                      flex items-center p-3 rounded-lg border-2 border-dashed
                      ${selectedStatus === statusValue ? "border-orange-500 bg-orange-50" : "border-yellow-400 bg-yellow-50"}
                      hover:bg-yellow-100 cursor-pointer transition-all
                    `}
                  >
                    <input
                      type="radio"
                      disabled={disabled}
                      value={statusValue}
                      checked={selectedStatus === statusValue}
                      onChange={(e) => {
                        if (selectable) setSelectedStatus(e.target.value);
                      }}
                    />
                    <div className="ml-3 flex-1 flex justify-between items-center">
                      <span className="text-sm font-medium text-yellow-700">
                        ⏸️ {statusLabel}
                      </span>
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 rounded-full">
                        Pause Shipment
                      </span>
                    </div>
                  </label>
                );
              }

              // Resume item styling
              if (isResumeItem) {
                return (
                  <label
                    key={statusValue}
                    className={`
                      flex items-center p-3 rounded-lg border-2 border-green-500 bg-green-50
                      ${selectedStatus === statusValue ? "border-green-700 bg-green-100" : ""}
                      hover:bg-green-100 cursor-pointer transition-all
                    `}
                  >
                    <input
                      type="radio"
                      disabled={disabled}
                      value={statusValue}
                      checked={selectedStatus === statusValue}
                      onChange={(e) => {
                        if (selectable) setSelectedStatus(e.target.value);
                      }}
                    />
                    <div className="ml-3 flex-1 flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">
                        ▶️ {statusLabel}
                      </span>
                      <span className="text-xs bg-green-200 text-green-800 px-2 rounded-full">
                        Resume
                      </span>
                    </div>
                  </label>
                );
              }

              // Normal status styling
              return (
                <label
                  key={statusValue}
                  className={`
                    flex items-center p-3 rounded-lg border
                    ${current ? "border-blue-400 bg-blue-50" : ""}
                    ${selectedStatus === statusValue ? "border-orange-500 bg-orange-50" : ""}
                    ${disabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}
                  `}
                >
                  <input
                    type="radio"
                    disabled={disabled}
                    value={statusValue}
                    checked={selectedStatus === statusValue}
                    onChange={(e) => {
                      if (selectable) setSelectedStatus(e.target.value);
                    }}
                  />

                  <div className="ml-3 flex-1 flex justify-between items-center flex-wrap gap-2">
                    <span className={`text-sm font-medium ${isCancelledItem ? "text-red-600" : ""}`}>
                      {statusLabel}
                    </span>

                    <div className="flex gap-2 flex-wrap">
                      {next && !isCancelledItem && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 rounded">
                          Next Step
                        </span>
                      )}

                      {current && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 rounded">
                          Current
                        </span>
                      )}

                      {past && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 rounded">
                          Completed
                        </span>
                      )}

                      {disabled && !isCancelledItem && !isOnHold && !isResumeItem && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 rounded flex items-center">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </span>
                      )}

                      {isCancelledItem && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 rounded">
                          Cancel Shipment
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* DATE AND TIME */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Date
              </label>
              <input
                type="date"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Time
              </label>
              <input
                type="time"
                value={updateTime}
                onChange={(e) => setUpdateTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* REMARKS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks / Notes
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={
                currentStatus === 'on_hold'
                  ? "Reason for resuming or cancelling..."
                  : "Reason for status change..."
              }
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!selectedStatus}>
              Continue
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM MODAL */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Status Update" size="sm">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
          <div>
            <p className="text-sm text-gray-600">Change status from</p>
            <p className="text-lg font-semibold text-gray-900 my-1">
              {getShipmentStatusDisplayText(currentStatus)}
            </p>
            <p className="text-sm text-gray-600">→</p>
            <p className="text-lg font-semibold text-orange-600 my-1">
              {selectedStatus === 'on_hold' 
                ? 'On Hold (Paused)' 
                : currentStatus === 'on_hold' && selectedStatus !== 'cancelled'
                ? `Resume to ${getShipmentStatusDisplayText(selectedStatus)}`
                : getShipmentStatusDisplayText(selectedStatus)}
            </p>
          </div>
          {remarks && (
            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p className="text-xs text-gray-500 mb-1">Remarks:</p>
              <p className="text-sm text-gray-700">{remarks}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="light" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleConfirm} isLoading={isUpdating}>
              Confirm Update
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ==================== SHIPMENT DETAILS MODAL ====================
const ShipmentDetailsModal = ({ isOpen, onClose, shipment, onStatusUpdated }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentShipmentStatus, setCurrentShipmentStatus] = useState(shipment?.shipmentStatus || shipment?.status);

  useEffect(() => {
    if (shipment) {
      setCurrentShipmentStatus(shipment.shipmentStatus || shipment.status);
    }
  }, [shipment]);

  if (!isOpen || !shipment) return null;

  const progress = getShipmentProgress(currentShipmentStatus);
  const totalWeight = shipment.shipmentDetails?.totalWeight || 0;
  const totalPackages = shipment.shipmentDetails?.totalPackages || 0;

  const handleStatusUpdate = (newStatus) => {
    setCurrentShipmentStatus(newStatus);
    if (onStatusUpdated) {
      onStatusUpdated();
    }
  };

  const handleUpdateStatusClick = () => {
    setShowUpdateModal(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Shipment Details" size="lg">
        <div className="space-y-5">
          {/* Header with Status Update Button */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">#{shipment.shipmentNumber}</h4>
              {shipment.trackingNumber && (
                <p className="text-sm text-gray-500">Tracking: {shipment.trackingNumber}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={currentShipmentStatus} size="lg" />
              {currentShipmentStatus !== 'delivered' && currentShipmentStatus !== 'cancelled' && (
                <Button size="sm" variant="light" onClick={handleUpdateStatusClick} icon={<Edit3 className="h-4 w-4" />}>
                  Update Status
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Shipment Progress</span>
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>

          {/* Status Timeline Visualization */}
          {/* Status Timeline Visualization - WITHOUT On Hold */}
<div className="border rounded-lg p-4">
  <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
    <Activity className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
    Status Timeline
  </h5>
  <div className="flex flex-wrap gap-2">
    {ALL_STATUSES.filter(s => s.value !== 'cancelled' && s.value !== 'on_hold').map((status) => {
      const statusOrder = status.order;
      const currentOrder = getStatusOrder(currentShipmentStatus);
      const isCompleted = statusOrder < currentOrder;
      const isCurrent = status.value === currentShipmentStatus;
      
      // Adjust order for display (skip on_hold in counting)
      let displayOrder = statusOrder;
      if (statusOrder > getStatusOrder('on_hold') && getStatusOrder('on_hold') !== 0) {
        displayOrder = statusOrder - 1;
      }
      
      return (
        <div key={status.value} className="flex items-center">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
            ${isCompleted ? 'bg-green-100 text-green-700' : ''}
            ${isCurrent ? 'bg-orange-100 text-orange-700 border border-orange-300' : ''}
            ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-500' : ''}
          `}>
            {status.label}
          </div>
          {displayOrder < 11 && (
            <ChevronRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
          )}
        </div>
      );
    })}
  </div>
</div>

          {/* Rest of the modal content remains the same */}
          {/* Customer Info */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              Customer Information
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium">{shipment.customerInfo?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-sm font-medium">{shipment.customerInfo?.companyName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{shipment.customerInfo?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{shipment.customerInfo?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              Shipment Details
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Origin</p>
                <p className="text-sm font-medium">{shipment.shipmentDetails?.origin || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm font-medium">{shipment.shipmentDetails?.destination || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mode</p>
                <ShipmentModeBadge classification={shipment.shipmentClassification} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Shipping Mode</p>
                <p className="text-sm font-medium">{shipment.shipmentDetails?.shippingMode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Packages</p>
                <p className="text-sm font-medium">{totalPackages}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Weight</p>
                <p className="text-sm font-medium">{totalWeight} kg</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              Schedule
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Created Date</p>
                <p className="text-sm font-medium">
                  {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {shipment.lastStatusUpdate && (
                <div>
                  <p className="text-xs text-gray-500">Last Status Update</p>
                  <p className="text-sm font-medium">
                    {new Date(shipment.lastStatusUpdate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              Pricing
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Quoted Amount</p>
                <p className="text-sm font-medium">{shipment.quotedPrice?.amount} {shipment.quotedPrice?.currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <p className="text-sm font-medium capitalize">{shipment.payment?.status || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Timeline Events */}
          {shipment.timeline && shipment.timeline.length > 0 && (
            <div className="border rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                Activity Timeline
              </h5>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {shipment.timeline.slice().reverse().map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 mt-2 rounded-full" style={{ backgroundColor: COLORS.primary }}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {event.status?.replace(/_/g, ' ')}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500">{event.description}</p>
                      )}
                      {event.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="button" variant="primary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        shipment={shipment}
        currentStatus={currentShipmentStatus}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

// ==================== MAIN COMPONENT ====================
export default function AllShipments() {
  const router = useRouter(); 
  useEffect(() => {  // ← এই পুরো useEffect যোগ করুন
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, []);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [summary, setSummary] = useState({ total: 0, active: 0, delivered: 0, cancelled: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStat, setActiveStat] = useState('all');
  const [filters, setFilters] = useState({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };
      
      if (searchTerm) params.search = searchTerm;

      const response = await getAllNewShipments(params);
      
      if (response.success) {
        setShipments(response.data || []);
        setPagination(response.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
        setSummary(response.summary || { total: 0, active: 0, delivered: 0, cancelled: 0 });
      } else {
        toast.error(response.message || 'Failed to fetch shipments');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, searchTerm]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchShipments();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSort = (field) => {
    const sortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortBy: field, sortOrder }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveStat('all');
    setFilters({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
    toast.info('Filters cleared');
  };

  const handleAction = (action, shipment) => {
    setSelectedShipment(shipment);
    if (action === 'view') {
      setShowDetailsModal(true);
    } else if (action === 'updateStatus') {
      setShowDetailsModal(true);
    }
  };

  const handleStatusUpdated = () => {
    fetchShipments();
  };

  const filterByStatus = (status) => {
    setActiveStat(status);
    if (status === 'all') {
      fetchShipments();
    }
  };

  const handleExport = () => {
    if (shipments.length === 0) {
      toast.warning('No shipments to export');
      return;
    } 
    toast.success(`${shipments.length} shipments exported!`);
  };

  const visibleStats = [
    { key: 'all', label: 'All Shipments', value: summary.total, icon: Package, color: 'bg-gray-100 text-gray-600' },
    { key: 'active', label: 'Active', value: summary.active, icon: Activity, color: 'bg-blue-100 text-blue-600' },
    { key: 'delivered', label: 'Delivered', value: summary.delivered, icon: CheckCircleSolid, color: 'bg-green-100 text-green-600' },
    { key: 'cancelled', label: 'Cancelled', value: summary.cancelled, icon: XCircleSolid, color: 'bg-red-100 text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                  <Package className="h-4 w-4" style={{ color: COLORS.primary }} />
                </div>
                <h1 className="ml-2 text-lg font-semibold text-gray-900">Shipments Management</h1>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {summary.total} Total
              </span>
            </div> 
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {visibleStats.map(stat => (
            <StatCard 
              key={stat.key}
              title={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              active={activeStat === stat.key}
              onClick={() => filterByStatus(stat.key)}
            />
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4">
            <Input 
              type="text" 
              placeholder="Search by shipment number, tracking number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                    <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('shipmentNumber')}>
                      Shipment Info
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('createdAt')}>
                      Created
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packages</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
                        <span className="ml-2 text-sm text-gray-500">Loading shipments...</span>
                      </div>
                    </td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500">No shipments found</p>
                        {(searchTerm) && (
                          <Button variant="light" size="sm" onClick={clearFilters} className="mt-3">
                            Clear search
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  shipments.map((shipment) => {
                    const displayNumber = shipment.shipmentNumber || shipment._id?.slice(-8).toUpperCase();
                    const progress = getShipmentProgress(shipment.shipmentStatus || shipment.status);
                    const totalPackages = shipment.shipmentDetails?.totalPackages || 
                      (shipment.shipmentDetails?.packageDetails?.length || 0);
                    
                    return (
                      <tr key={shipment._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3">
                          <div>
                            <button
                              onClick={() => { setSelectedShipment(shipment); setShowDetailsModal(true); }}
                              className="text-sm font-medium hover:underline text-left"
                              style={{ color: COLORS.primary }}
                            >
                              {displayNumber}
                            </button>
                            {shipment.trackingNumber && (
                              <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                <Hash className="h-3 w-3 mr-1" />
                                {shipment.trackingNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {shipment.customerInfo?.name || 
                             shipment.customerInfo?.companyName || 
                             'N/A'}
                          </div>
                          {shipment.customerInfo?.email && (
                            <div className="text-xs text-gray-500 truncate max-w-[180px]">
                              {shipment.customerInfo.email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-xs">
                            <span className="font-medium text-gray-900 max-w-[100px] truncate">
                              {shipment.shipmentDetails?.origin || 'N/A'}
                            </span>
                            <ChevronRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-900 max-w-[100px] truncate">
                              {shipment.shipmentDetails?.destination || 'N/A'}
                            </span>
                          </div>
                          <div className="mt-1">
                            <ShipmentModeBadge classification={shipment.shipmentClassification} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <div className="text-gray-900">{totalPackages} pkgs</div>
                            {shipment.shipmentDetails?.totalWeight > 0 && (
                              <div className="text-gray-500">{shipment.shipmentDetails.totalWeight} kg</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            <StatusBadge status={shipment.shipmentStatus || shipment.status} size="sm" />
                            <ProgressBar progress={progress} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ActionMenu shipment={shipment} onAction={handleAction} />
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-600">
                    Showing {(pagination.page - 1) * filters.limit + 1} to {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total} results
                  </span>
                  <Select 
                    name="limit" 
                    value={filters.limit} 
                    onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))} 
                    options={[
                      { value: 10, label: '10 / page' }, 
                      { value: 20, label: '20 / page' }, 
                      { value: 50, label: '50 / page' }
                    ]} 
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setFilters(prev => ({ ...prev, page: 1 }))} 
                    disabled={filters.page === 1} 
                    icon={<ChevronsLeft className="h-4 w-4" />} 
                  />
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))} 
                    disabled={filters.page === 1} 
                    icon={<ChevronLeft className="h-4 w-4" />} 
                  />
                  <span className="text-sm text-gray-600 px-3">
                    Page {filters.page} of {pagination.pages}
                  </span>
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} 
                    disabled={filters.page === pagination.pages} 
                    icon={<ChevronRight className="h-4 w-4" />} 
                  />
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setFilters(prev => ({ ...prev, page: pagination.pages }))} 
                    disabled={filters.page === pagination.pages} 
                    icon={<ChevronsRight className="h-4 w-4" />} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        shipment={selectedShipment}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
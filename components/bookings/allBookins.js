// components/bookings/allBookings.js
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  getAllBookings,
  getBookingById,
  updatePriceQuote,
  acceptQuote,
  rejectQuote,
  cancelBooking,
  getMyBookings,
  getMyBookingById,
  getMyBookingTimeline,
  getMyBookingInvoice,
  getMyBookingQuote,
  getMyBookingsSummary,
  downloadBookingDocument,
  trackByNumber,
  getStatusColor,
  getPricingStatusColor,
  getStatusDisplayText,
  getPricingStatusDisplayText,
  getShipmentTypeDisplay,
  getCourierCompanyDisplay,
  getSenderName,
  getReceiverName,
  formatAddress,
  formatDate,
  formatCurrency,
  isQuoteValid,
  getQuoteDaysRemaining,
  canCancelBooking,
  canQuoteBooking,
  canRespondToQuote,
  calculatePackageTotals,
  formatPackageDetails,
  exportBookingsToCSV,
  useBooking,
  useCustomerBookings
} from '@/Api/booking';

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
  Receipt, FileSpreadsheet, CreditCard, UserPlus, Building, Ruler,
  Scale, ChevronUp
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
  indigo: '#6366f1'
};

// ==================== STATUS CONFIGURATION ====================
const STATUS_CONFIG = {
  booking_requested: {
    label: 'Booking Requested',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    progress: 10,
    editable: true,
    cancellable: true,
    nextStatus: ['price_quoted', 'cancelled']
  },
  price_quoted: {
    label: 'Price Quoted',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Tag,
    progress: 30,
    editable: true,
    cancellable: true,
    nextStatus: ['booking_confirmed', 'rejected', 'cancelled']
  },
  booking_confirmed: {
    label: 'Booking Confirmed',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: CheckCircle,
    progress: 40,
    editable: true,
    cancellable: false,
    nextStatus: ['pending']
  },
  pending: {
    label: 'Pending',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Clock,
    progress: 45,
    editable: true,
    cancellable: false,
    nextStatus: ['received_at_warehouse']
  },
  received_at_warehouse: {
    label: 'Received at Warehouse',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Package,
    progress: 60,
    editable: false,
    cancellable: false,
    nextStatus: ['consolidation_in_progress']
  },
  consolidation_in_progress: {
    label: 'Consolidation',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Box,
    progress: 70,
    editable: false,
    cancellable: false,
    nextStatus: ['loaded_in_container']
  },
  loaded_in_container: {
    label: 'Loaded',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Ship,
    progress: 75,
    editable: false,
    cancellable: false,
    nextStatus: ['in_transit']
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Truck,
    progress: 80,
    editable: false,
    cancellable: false,
    nextStatus: ['arrived_at_destination']
  },
  arrived_at_destination: {
    label: 'Arrived',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: MapPin,
    progress: 85,
    editable: false,
    cancellable: false,
    nextStatus: ['customs_clearance']
  },
  customs_clearance: {
    label: 'Customs',
    color: 'bg-lime-50 text-lime-700 border-lime-200',
    icon: FileText,
    progress: 90,
    editable: false,
    cancellable: false,
    nextStatus: ['out_for_delivery']
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Truck,
    progress: 95,
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
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleSolid,
    progress: 0,
    editable: false,
    cancellable: false,
    nextStatus: []
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle,
    progress: 0,
    editable: false,
    cancellable: false,
    nextStatus: []
  }
};

// ==================== SHIPMENT TYPE ICONS ====================
const SHIPMENT_TYPE_ICONS = {
  air_freight: Plane,
  sea_freight: Ship,
  express_courier: Truck
};

const SHIPMENT_TYPE_COLORS = {
  air_freight: COLORS.primary,
  sea_freight: COLORS.secondary,
  express_courier: COLORS.success
};

// ==================== COMPONENTS ====================

// Button Component
const Button = ({ children, type = 'button', variant = 'primary', size = 'md', isLoading = false, disabled = false, onClick, className = '', icon = null, iconPosition = 'left', fullWidth = false }) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white hover:bg-[#d35400] focus:ring-[${COLORS.primary}] shadow-sm`,
    secondary: `bg-[${COLORS.secondary}] text-white hover:bg-[#2c5a8c] focus:ring-[${COLORS.secondary}]`,
    outline: `border-2 border-[${COLORS.primary}] text-[${COLORS.primary}] hover:bg-[${COLORS.primaryLight}] focus:ring-[${COLORS.primary}]`,
    light: `bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`,
    success: `bg-[${COLORS.success}] text-white hover:bg-[#0d9488] focus:ring-[${COLORS.success}]`,
    danger: `bg-[${COLORS.danger}] text-white hover:bg-[#dc2626] focus:ring-[${COLORS.danger}]`,
    warning: `bg-[${COLORS.warning}] text-white hover:bg-[#d97706] focus:ring-[${COLORS.warning}]`,
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
const Input = ({ type = 'text', name, value, onChange, placeholder, label, error, icon: Icon, required = false, disabled = false, className = '', ...props }) => {
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
const Select = ({ name, value, onChange, options, placeholder = 'Select option', label, error, icon: Icon, required = false, disabled = false, className = '' }) => {
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
const TextArea = ({ name, value, onChange, placeholder, label, error, rows = 3, required = false, disabled = false, className = '' }) => {
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
    label: getStatusDisplayText(status),
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

// Pricing Status Badge
const PricingStatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-gray-50 text-gray-700 border-gray-200',
    quoted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    expired: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${colors[status] || colors.pending}`}>
      {getPricingStatusDisplayText(status)}
    </span>
  );
};

// Shipment Type Badge
const ShipmentTypeBadge = ({ type }) => {
  const Icon = SHIPMENT_TYPE_ICONS[type] || Package;
  const color = SHIPMENT_TYPE_COLORS[type] || COLORS.secondary;
  
  return (
    <span 
      className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color: color }}
    >
      <Icon className="h-3.5 w-3.5 mr-1" />
      {getShipmentTypeDisplay(type)}
    </span>
  );
};

// Courier Badge
const CourierBadge = ({ company, serviceType }) => {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
      <Truck className="h-3.5 w-3.5 mr-1" />
      {company} {serviceType && `(${serviceType})`}
    </span>
  );
};

// Action Menu Component - FIXED: Added z-index and proper positioning to prevent cutting
// ActionMenu কম্পোনেন্ট আপডেট করুন
const ActionMenu = ({ booking, onAction }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!booking) return null;

  // ✅ রিয়েল-টাইম validity চেক
  const quoteValid = (() => {
    if (!booking.quotedPrice || !booking.quotedPrice.validUntil) return false;
    const now = new Date();
    const validUntil = new Date(booking.quotedPrice.validUntil);
    return now <= validUntil;
  })();
  
  const actualPricingStatus = (() => {
    if (!booking.quotedPrice) return booking.pricingStatus;
    if (booking.pricingStatus === 'quoted') {
      return quoteValid ? 'quoted' : 'expired';
    }
    return booking.pricingStatus;
  })();

  const actions = [
    { 
      label: 'View Details', 
      icon: Eye, 
      action: 'view', 
      color: 'text-blue-600',
      show: true
    }, 
    { 
      label: 'Update Price Quote', 
      icon: DollarSign, 
      action: 'price-quote', 
      color: `text-[${COLORS.primary}]`,
      show: true // Always show - can update quote anytime
    },
  ];

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-[100] py-1">
          {actions.filter(a => a.show).map((action) => (
            <button
              key={action.action}
              onClick={() => {
                onAction(action.action, booking);
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
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Price Quote Modal
// Price Quote Modal - আপডেটেড ভার্সন (Destination অনুযায়ী Auto Currency)
const PriceQuoteModal = ({ isOpen, onClose, booking, onSave }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    validUntil: '',
    notes: '',
    breakdown: {
      baseRate: 0,
      weightCharge: 0,
      fuelSurcharge: 0,
      residentialSurcharge: 0,
      insurance: 0,
      tax: 0,
      otherCharges: 0
    }
  });
  const [loading, setLoading] = useState(false);

  // Destination অনুযায়ী Currency এবং Symbol
  const getCurrencyByDestination = (destination) => {
    const currencyMap = {
      'USA': { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
      'UK': { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
      'Canada': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' }, 
    };
    
    // Destination থেকে দেশের নাম বের করুন
    let country = destination;
    if (destination?.includes('USA') || destination?.includes('United States')) country = 'USA';
    if (destination?.includes('UK') || destination?.includes('United Kingdom')) country = 'UK';
    if (destination?.includes('Canada')) country = 'Canada';
    if (destination?.includes('UAE') || destination?.includes('Dubai')) country = 'UAE';
    if (destination?.includes('Australia')) country = 'Australia';
    if (destination?.includes('Europe') || destination?.includes('Germany') || destination?.includes('France')) country = 'EU';
    if (destination?.includes('China')) country = 'China';
    if (destination?.includes('India')) country = 'India';
    if (destination?.includes('Bangladesh')) country = 'Bangladesh';
    if (destination?.includes('Thailand')) country = 'Thailand';
    
    return currencyMap[country] || { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' };
  };

  // Get destination from booking
  const destination = booking?.shipmentDetails?.destination || booking?.destination || 'USA';
  const defaultCurrency = getCurrencyByDestination(destination);

  // Update currency when destination changes
  useEffect(() => {
    if (booking) {
      const dest = booking.shipmentDetails?.destination || booking?.destination || 'USA';
      const currencyInfo = getCurrencyByDestination(dest);
      
      // Set default currency based on destination
      setFormData(prev => ({
        ...prev,
        currency: currencyInfo.code
      }));
    }
  }, [booking]);

  useEffect(() => {
    if (booking) {
      const defaultValidUntil = new Date();
      defaultValidUntil.setDate(defaultValidUntil.getDate() + 7);
      
      setFormData({
        amount: booking.quotedPrice?.amount || '',
        currency: booking.quotedPrice?.currency || getCurrencyByDestination(booking.shipmentDetails?.destination || 'USA').code,
        validUntil: booking.quotedPrice?.validUntil 
          ? new Date(booking.quotedPrice.validUntil).toISOString().split('T')[0]
          : defaultValidUntil.toISOString().split('T')[0],
        notes: booking.quotedPrice?.notes || '',
        breakdown: booking.quotedPrice?.breakdown || {
          baseRate: 0,
          weightCharge: 0,
          fuelSurcharge: 0,
          residentialSurcharge: 0,
          insurance: 0,
          tax: 0,
          otherCharges: 0
        }
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBreakdownChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      breakdown: {
        ...prev.breakdown,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleCurrencyChange = (currencyCode) => {
    setFormData(prev => ({ ...prev, currency: currencyCode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.validUntil) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const quoteData = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        validUntil: new Date(formData.validUntil).toISOString(),
        notes: formData.notes,
        breakdown: {
          baseRate: parseFloat(formData.breakdown.baseRate) || 0,
          weightCharge: parseFloat(formData.breakdown.weightCharge) || 0,
          fuelSurcharge: parseFloat(formData.breakdown.fuelSurcharge) || 0,
          residentialSurcharge: parseFloat(formData.breakdown.residentialSurcharge) || 0,
          insurance: parseFloat(formData.breakdown.insurance) || 0,
          tax: parseFloat(formData.breakdown.tax) || 0,
          otherCharges: parseFloat(formData.breakdown.otherCharges) || 0
        }
      };
      
      await onSave(booking._id, quoteData);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  // Available currencies with symbols
  const availableCurrencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' }, 
  ];

  const currentCurrency = availableCurrencies.find(c => c.code === formData.currency) || availableCurrencies[0];
  const destinationCurrency = getCurrencyByDestination(destination);
  const isDestinationCurrency = formData.currency === destinationCurrency.code;

  if (!isOpen || !booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Price Quote" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destination Info with Currency Suggestion */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Destination: {destination}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800">
                {destinationCurrency.flag} {destinationCurrency.name}
              </span>
              {!isDestinationCurrency && (
                <button
                  type="button"
                  onClick={() => handleCurrencyChange(destinationCurrency.code)}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Use {destinationCurrency.symbol}{destinationCurrency.code}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Amount Section with Currency Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg font-medium">{currentCurrency.symbol}</span>
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full pl-12 pr-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <div className="relative">
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent bg-white appearance-none pr-8"
              >
                {availableCurrencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              Currency: {currentCurrency.name} ({currentCurrency.symbol})
            </p>
            {!isDestinationCurrency && (
              <p className="text-xs text-amber-600">
                ⚠️ Destination uses {destinationCurrency.symbol}{destinationCurrency.code}
              </p>
            )}
          </div>
        </div>

        {/* Valid Until */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valid Until <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="validUntil"
            value={formData.validUntil}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            required
          />
        </div>

        {/* Price Breakdown */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-[#E67E22]" />
            Price Breakdown ({currentCurrency.symbol})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Base Rate</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">{currentCurrency.symbol}</span>
                </div>
                <input
                  type="number"
                  value={formData.breakdown.baseRate}
                  onChange={(e) => handleBreakdownChange('baseRate', e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-sm border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weight Charge</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">{currentCurrency.symbol}</span>
                </div>
                <input
                  type="number"
                  value={formData.breakdown.weightCharge}
                  onChange={(e) => handleBreakdownChange('weightCharge', e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-sm border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fuel Surcharge</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">{currentCurrency.symbol}</span>
                </div>
                <input
                  type="number"
                  value={formData.breakdown.fuelSurcharge}
                  onChange={(e) => handleBreakdownChange('fuelSurcharge', e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-sm border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Residential Surcharge</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">{currentCurrency.symbol}</span>
                </div>
                <input
                  type="number"
                  value={formData.breakdown.residentialSurcharge}
                  onChange={(e) => handleBreakdownChange('residentialSurcharge', e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-sm border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Insurance</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">{currentCurrency.symbol}</span>
                </div>
                <input
                  type="number"
                  value={formData.breakdown.insurance}
                  onChange={(e) => handleBreakdownChange('insurance', e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-sm border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tax</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">{currentCurrency.symbol}</span>
                </div>
                <input
                  type="number"
                  value={formData.breakdown.tax}
                  onChange={(e) => handleBreakdownChange('tax', e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-sm border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Other Charges</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">{currentCurrency.symbol}</span>
                </div>
                <input
                  type="number"
                  value={formData.breakdown.otherCharges}
                  onChange={(e) => handleBreakdownChange('otherCharges', e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-sm border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Add any notes about this quote..."
            className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
          />
        </div>

        {/* Total Preview */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Quote Amount:</span>
            <span className="text-xl font-bold text-[#E67E22]">
              {currentCurrency.symbol}{parseFloat(formData.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">In {currentCurrency.code} ({currentCurrency.name})</span>
            {!isDestinationCurrency && (
              <span className="text-xs text-amber-600">
                ≈ {destinationCurrency.symbol}{(parseFloat(formData.amount || 0) * 1).toLocaleString()} {destinationCurrency.code}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#E67E22] rounded-lg hover:bg-[#d35400] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E67E22] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Quote
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Accept/Reject Quote Modal
const QuoteResponseModal = ({ isOpen, onClose, booking, type, onRespond }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const quoteAmount = booking.quotedPrice?.amount;
  const quoteCurrency = booking.quotedPrice?.currency || 'USD';
  const quoteValidUntil = booking.quotedPrice?.validUntil;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (type === 'reject' && !notes.trim()) {
      toast.warning('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    try {
      await onRespond(booking._id, notes);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={type === 'accept' ? 'Accept Quote' : 'Reject Quote'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`p-4 rounded-lg ${type === 'accept' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-start">
            {type === 'accept' ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${type === 'accept' ? 'text-green-800' : 'text-red-800'}`}>
                {type === 'accept' 
                  ? 'Are you sure you want to accept this quote?' 
                  : 'Are you sure you want to reject this quote?'}
              </p>
              {quoteAmount && (
                <p className="text-xs text-gray-600 mt-1">
                  Amount: {formatCurrency(quoteAmount, quoteCurrency)}
                  {quoteValidUntil && ` • Valid until: ${formatDate(quoteValidUntil)}`}
                </p>
              )}
            </div>
          </div>
        </div>

        <TextArea
          label={type === 'accept' ? 'Notes (Optional)' : 'Reason for rejection'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={type === 'accept' ? 'Add any notes...' : 'Please provide a reason for rejection...'}
          rows={3}
          required={type === 'reject'}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={type === 'accept' ? 'success' : 'danger'}
            isLoading={loading}
            icon={type === 'accept' ? <Check className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          >
            {type === 'accept' ? 'Yes, Accept' : 'Yes, Reject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Cancel Booking Modal
const CancelModal = ({ isOpen, onClose, booking, onCancel }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.warning('Please provide a cancellation reason');
      return;
    }
    setLoading(true);
    try {
      await onCancel(booking._id, reason);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Booking" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Are you sure you want to cancel this booking?
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This action cannot be undone. The booking status will be changed to cancelled.
              </p>
            </div>
          </div>
        </div>

        <TextArea
          label="Cancellation Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for cancellation..."
          rows={3}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            No, Keep Booking
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={loading}
            icon={<XCircle className="h-4 w-4" />}
          >
            Yes, Cancel Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Booking Details Modal
const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  const [activeTab, setActiveTab] = useState('details');
  
  if (!isOpen || !booking) return null;

  const packageTotals = calculatePackageTotals(booking.shipmentDetails?.packageDetails || []);
  const quoteValid = booking.quotedPrice ? isQuoteValid(booking.quotedPrice) : false;
  const daysRemaining = booking.quotedPrice ? getQuoteDaysRemaining(booking.quotedPrice.validUntil) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              #{booking.bookingNumber || booking._id?.slice(-8).toUpperCase()}
            </h4>
            <p className="text-sm text-gray-500">
              Created on {formatDate(booking.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={booking.status} size="lg" />
            <PricingStatusBadge status={booking.pricingStatus} />
          </div>
        </div>

        {booking.courier && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center">
              <Truck className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-700">
                {booking.courier.company} - {booking.courier.serviceType}
              </span>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            {[
              { id: 'details', label: 'Details', icon: Package },
              { id: 'package', label: 'Package', icon: Box },
              { id: 'pricing', label: 'Pricing', icon: DollarSign },
              { id: 'tracking', label: 'Tracking', icon: Hash }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${
                  activeTab === tab.id
                    ? `border-[${COLORS.primary}] text-[${COLORS.primary}]`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                  Sender Information
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{getSenderName(booking.sender)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium">{booking.sender?.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{booking.sender?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{booking.sender?.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium">{formatAddress(booking.sender?.address)}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                  Receiver Information
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{getReceiverName(booking.receiver)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium">{booking.receiver?.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{booking.receiver?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{booking.receiver?.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium">{formatAddress(booking.receiver?.address)}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                  Shipment Details
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Shipment Type</p>
                    <ShipmentTypeBadge type={booking.shipmentDetails?.shipmentType} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipping Mode</p>
                    <p className="text-sm font-medium">{booking.shipmentDetails?.shippingMode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="text-sm font-medium">{booking.shipmentDetails?.origin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="text-sm font-medium">{booking.shipmentDetails?.destination || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                  Important Dates
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Booking Date</p>
                    <p className="text-sm font-medium">{formatDate(booking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Confirmed Date</p>
                    <p className="text-sm font-medium">{booking.confirmedAt ? formatDate(booking.confirmedAt) : 'Not Confirmed'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Departure</p>
                    <p className="text-sm font-medium">
                      {booking.estimatedDepartureDate ? formatDate(booking.estimatedDepartureDate) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Arrival</p>
                    <p className="text-sm font-medium">
                      {booking.estimatedArrivalDate ? formatDate(booking.estimatedArrivalDate) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'package' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Total Packages</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.primary }}>
                    {packageTotals.totalPackages}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Total Weight (kg)</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.secondary }}>
                    {packageTotals.totalWeight.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Total Volume (cbm)</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.success }}>
                    {packageTotals.totalVolume.toFixed(2)}
                  </p>
                </div>
              </div>

              {booking.shipmentDetails?.packageDetails && booking.shipmentDetails.packageDetails.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Weight/Unit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Dimensions</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {booking.shipmentDetails.packageDetails.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">{item.weight} kg</td>
                          <td className="px-4 py-2 text-sm">
                            {item.dimensions?.length && item.dimensions?.width && item.dimensions?.height ? (
                              `${item.dimensions.length}x${item.dimensions.width}x${item.dimensions.height} cm`
                            ) : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm">{item.volume} cbm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No package details available</p>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              {booking.quotedPrice ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 mb-1">Quoted Amount</p>
                        <p className="text-2xl font-bold" style={{ color: COLORS.success }}>
                          {formatCurrency(booking.quotedPrice.amount, booking.quotedPrice.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600 mb-1">Valid Until</p>
                        <p className="text-sm font-medium">{formatDate(booking.quotedPrice.validUntil)}</p>
                        {booking.quotedPrice.validUntil && (
                          <p className="text-xs text-green-600 mt-1">
                            {quoteValid 
                              ? `${daysRemaining} days remaining` 
                              : 'Quote expired'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {booking.quotedPrice.breakdown && (
                    <div className="border rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Breakdown</h5>
                      <div className="space-y-2">
                        {Object.entries(booking.quotedPrice.breakdown).map(([key, value]) => (
                          value > 0 && (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="font-medium">{formatCurrency(value, booking.quotedPrice.currency)}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No price quote available</p>
              )}
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-4">
              {booking.trackingNumber ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-600 mb-1">Tracking Number</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-blue-700">{booking.trackingNumber}</p>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(booking.trackingNumber);
                          toast.success('Tracking number copied!');
                        }}
                        icon={<Copy className="h-3 w-3" />}
                      >
                        Copy
                      </Button>
                    </div>
                  </div> 

                  {booking.currentLocation && (
                    <div className="border rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Current Location</p>
                      <p className="text-sm font-medium">{booking.currentLocation.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {formatDate(booking.currentLocation.timestamp)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No tracking number assigned yet</p>
              )}
            </div>
          )}
        </div>

        {booking.shipmentDetails?.specialInstructions && (
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Special Instructions</h5>
            <p className="text-sm text-gray-600">{booking.shipmentDetails.specialInstructions}</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Timeline Modal
const TimelineModal = ({ isOpen, onClose, bookingId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchTimeline();
    }
  }, [isOpen, bookingId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const result = await getMyBookingTimeline(bookingId);
      if (result.success) {
        setTimeline(result.data?.timeline || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Timeline" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
          <span className="ml-2 text-sm text-gray-500">Loading timeline...</span>
        </div>
      ) : timeline.length > 0 ? (
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{event.status}</p>
                <p className="text-xs text-gray-500">{event.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(event.timestamp, 'long')} by {event.updatedBy?.firstName} {event.updatedBy?.lastName}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No timeline events found</p>
      )}
    </Modal>
  );
};

// Invoice Modal
const InvoiceModal = ({ isOpen, onClose, bookingId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchInvoice();
    }
  }, [isOpen, bookingId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const result = await getMyBookingInvoice(bookingId);
      if (result.success) {
        setInvoice(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      await downloadBookingDocument(bookingId, documentId);
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
          <span className="ml-2 text-sm text-gray-500">Loading invoice...</span>
        </div>
      ) : invoice ? (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">Invoice #{invoice.invoiceNumber}</p>
                <p className="text-xs text-gray-500">Date: {formatDate(invoice.createdAt)}</p>
              </div>
              <PricingStatusBadge status={invoice.paymentStatus} />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-green-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </p>
          </div>

          {invoice.charges && invoice.charges.length > 0 && (
            <div className="border rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Charges</h5>
              <div className="space-y-2">
                {invoice.charges.map((charge, index) => (
                  <div key={index} className="flex justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                    <div>
                      <span className="text-gray-600">{charge.description}</span>
                      <span className="text-xs text-gray-400 ml-2">({charge.type})</span>
                    </div>
                    <span className="font-medium">{formatCurrency(charge.amount, charge.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invoice._id && (
            <div className="flex justify-end">
              <Button
                variant="light"
                size="sm"
                onClick={() => handleDownload(invoice._id)}
                icon={<Download className="h-4 w-4" />}
              >
                Download Invoice
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No invoice found</p>
      )}
    </Modal>
  );
};

// Quote Details Modal
const QuoteDetailsModal = ({ isOpen, onClose, bookingId }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchQuote();
    }
  }, [isOpen, bookingId]);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const result = await getMyBookingQuote(bookingId);
      if (result.success) {
        setQuote(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch quote details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quote Details" size="md">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
          <span className="ml-2 text-sm text-gray-500">Loading quote...</span>
        </div>
      ) : quote ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-xs text-green-600 mb-1">Quote Amount</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
              {formatCurrency(quote.quotedPrice?.amount, quote.quotedPrice?.currency)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Valid Until</p>
              <p className="text-sm font-medium">{formatDate(quote.quotedPrice?.validUntil)}</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <PricingStatusBadge status={quote.pricingStatus} />
            </div>
          </div>

          {quote.quotedPrice?.notes && (
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm">{quote.quotedPrice.notes}</p>
            </div>
          )}

          {quote.quotedPrice?.breakdown && (
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-2">Breakdown</p>
              <div className="space-y-2">
                {Object.entries(quote.quotedPrice.breakdown).map(([key, value]) => (
                  value > 0 && (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium">{formatCurrency(value, quote.quotedPrice.currency)}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No quote details found</p>
      )}
    </Modal>
  );
};

// Collapsible Booking Card Component - FIXED: Added booking number and sender name, improved layout
// Collapsible Booking Card Component - FIXED: Proper overflow handling for action menu
const CollapsibleBookingCard = ({ booking, selectedBookings, setSelectedBookings, onViewDetails, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const packageTotals = calculatePackageTotals(booking.shipmentDetails?.packageDetails || []);
  
  // ✅ রিয়েল-টাইম quote validity চেক (API থেকে আসা ডেটা ওভাররাইড করে)
  const quoteValid = (() => {
    if (!booking.quotedPrice || !booking.quotedPrice.validUntil) return false;
    const now = new Date();
    const validUntil = new Date(booking.quotedPrice.validUntil);
    return now <= validUntil;
  })();
  
  // ✅ রিয়েল-টাইম pricing status (API থেকে আসা status ওভাররাইড করে)
  const actualPricingStatus = (() => {
    if (!booking.quotedPrice) return booking.pricingStatus;
    if (booking.pricingStatus === 'quoted') {
      return quoteValid ? 'quoted' : 'expired';
    }
    return booking.pricingStatus;
  })();
  
  const senderName = getSenderName(booking.sender);
  const bookingId = booking.bookingNumber || booking._id?.slice(-8).toUpperCase() || 'N/A';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Card Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div 
              className="text-sm font-semibold cursor-pointer hover:underline text-[#E67E22] whitespace-nowrap"
              onClick={() => onViewDetails(booking)}
              title={`Booking #${bookingId}`}
            >
              {bookingId}
            </div>
            <div className="hidden sm:block text-sm text-gray-600 truncate max-w-[200px]">
              {senderName}
            </div>
            <StatusBadge status={booking.status} size="sm" />
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={() => onViewDetails(booking)}
              className="p-1.5 text-gray-400 hover:text-[#E67E22] rounded-lg hover:bg-white transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <ActionMenu booking={booking} onAction={onAction} />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-[#E67E22] rounded-lg hover:bg-white transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {/* Mobile sender name */}
        <div className="sm:hidden mt-1 text-xs text-gray-500 truncate">
          {senderName}
        </div>
        
        {booking.trackingNumber && (
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <Hash className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{booking.trackingNumber}</span>
          </div>
        )}
      </div>

      {/* Compact View */}
      <div className="px-4 py-2 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
              <span className="text-gray-600 truncate max-w-[100px]">{booking.shipmentDetails?.origin || 'N/A'}</span>
            </div>
            <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <div className="flex items-center">
              <span className="text-gray-600 truncate max-w-[100px]">{booking.shipmentDetails?.destination || 'N/A'}</span>
            </div>
            <div className="hidden sm:flex items-center">
              <Package className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-gray-600">{packageTotals.totalPackages} pkg</span>
            </div>
            <div className="hidden sm:flex items-center">
              <Scale className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-gray-600">{packageTotals.totalWeight.toFixed(1)} kg</span>
            </div>
          </div>
          {/* ✅ এখানে actualPricingStatus ব্যবহার করুন */}
          <PricingStatusBadge status={actualPricingStatus} />
        </div>
        <div className="sm:hidden flex items-center space-x-2 mt-1 text-xs text-gray-500">
          <span>{packageTotals.totalPackages} pkg</span>
          <span>•</span>
          <span>{packageTotals.totalWeight.toFixed(1)} kg</span>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          {/* Sender & Receiver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 flex items-center">
                <User className="h-3 w-3 mr-1" /> Sender
              </p>
              <p className="text-sm font-medium text-gray-900">{senderName}</p>
              {booking.sender?.email && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Mail className="h-3 w-3 mr-1" /> {booking.sender.email}
                </p>
              )}
              {booking.sender?.phone && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Phone className="h-3 w-3 mr-1" /> {booking.sender.phone}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 flex items-center">
                <UserPlus className="h-3 w-3 mr-1" /> Receiver
              </p>
              <p className="text-sm font-medium text-gray-900">{getReceiverName(booking.receiver)}</p>
              {booking.receiver?.email && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Mail className="h-3 w-3 mr-1" /> {booking.receiver.email}
                </p>
              )}
              {booking.receiver?.phone && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Phone className="h-3 w-3 mr-1" /> {booking.receiver.phone}
                </p>
              )}
            </div>
          </div>

          {/* Shipment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Shipment Type</p>
              <ShipmentTypeBadge type={booking.shipmentDetails?.shipmentType} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Created</p>
              <p className="text-sm text-gray-900">{formatDate(booking.createdAt, 'short')}</p>
            </div>
          </div>

          {/* Courier Info */}
          {booking.courier && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Courier</p>
              <CourierBadge company={booking.courier.company} serviceType={booking.courier.serviceType} />
            </div>
          )}

          {/* ✅ Quote Info - এখানে actualPricingStatus ব্যবহার করুন */}
          {(actualPricingStatus === 'quoted' || actualPricingStatus === 'expired') && booking.quotedPrice && (
            <div className={`rounded-lg p-3 ${actualPricingStatus === 'quoted' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${actualPricingStatus === 'quoted' ? 'text-green-600' : 'text-red-600'}`}>
                    {actualPricingStatus === 'quoted' ? 'Quoted Amount' : 'Expired Quote'}
                  </p>
                  <p className={`text-sm font-semibold ${actualPricingStatus === 'quoted' ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(booking.quotedPrice.amount, booking.quotedPrice.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${actualPricingStatus === 'quoted' ? 'text-green-600' : 'text-red-600'}`}>
                    Valid Until
                  </p>
                  <p className="text-xs text-gray-700">
                    {formatDate(booking.quotedPrice.validUntil)}
                  </p>
                  {actualPricingStatus === 'quoted' && (
                    <p className="text-xs text-green-600 mt-1">
                      {getQuoteDaysRemaining(booking.quotedPrice.validUntil)} days left
                    </p>
                  )}
                  {actualPricingStatus === 'expired' && (
                    <p className="text-xs text-red-600 mt-1">Expired</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {booking.shipmentDetails?.specialInstructions && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Special Instructions</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                {booking.shipmentDetails.specialInstructions}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10, // Fixed to 10 per page
    pages: 1
  });

  // Filter State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10, // Fixed to 10 per page
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [activeStat, setActiveStat] = useState('all');

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPriceQuoteModal, setShowPriceQuoteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Stats - FIXED: Initialize with all statuses set to 0
  const [stats, setStats] = useState({
    total: 0,
    booking_requested: 0,
    price_quoted: 0,
    booking_confirmed: 0,
    pending: 0,
    received_at_warehouse: 0,
    consolidation_in_progress: 0,
    loaded_in_container: 0,
    in_transit: 0,
    arrived_at_destination: 0,
    customs_clearance: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    rejected: 0
  });

  // Options
  const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label
  }));

  // Fetch Bookings
  // fetchBookings ফাংশনটি এইভাবে আপডেট করুন
const fetchBookings = useCallback(async () => {
  setLoading(true);
  try {
    const queryParams = {
      page: filters.page,
      limit: 10,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    };
    
    if (filters.status) queryParams.status = filters.status;
    if (filters.search) queryParams.search = filters.search;
    if (filters.startDate) queryParams.startDate = filters.startDate;
    if (filters.endDate) queryParams.endDate = filters.endDate;
    
    const response = await getAllBookings(queryParams);
    if (response.success) {
      let bookingsData = response.data || [];
      
      // ✅ গুরুত্বপূর্ণ: প্রতিটি booking এর quote validity রিয়েল-টাইম চেক করুন
      const updatedBookings = bookingsData.map(booking => {
        // যদি quote থাকে এবং pricingStatus 'quoted' হয়
        if (booking.quotedPrice && booking.quotedPrice.validUntil && booking.pricingStatus === 'quoted') {
          const now = new Date();
          const validUntil = new Date(booking.quotedPrice.validUntil);
          const isValid = now <= validUntil;
          
          // যদি expired হয়, তাহলে pricingStatus পরিবর্তন করুন
          if (!isValid) {
            console.log(`Booking ${booking.bookingNumber}: Quote expired on ${validUntil}`);
            return {
              ...booking,
              pricingStatus: 'expired'
            };
          }
        }
        return booking;
      });
      
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      setPagination(response.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 1
      });
      
      // Calculate stats - with updated pricingStatus
      const newStats = {
        total: response.pagination?.total || updatedBookings.length || 0,
        booking_requested: 0,
        price_quoted: 0,
        booking_confirmed: 0,
        pending: 0,
        received_at_warehouse: 0,
        consolidation_in_progress: 0,
        loaded_in_container: 0,
        in_transit: 0,
        arrived_at_destination: 0,
        customs_clearance: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0,
        rejected: 0
      };
      
      if (updatedBookings.length > 0) {
        updatedBookings.forEach(booking => {
          // Use actual pricing status
          let status = booking.status;
          if (newStats.hasOwnProperty(status)) {
            newStats[status]++;
          }
        });
      }
      
      setStats(newStats);
    } else {
      toast.error(response.message);
    }
  } catch (error) {
    toast.error(error.message || 'Failed to fetch bookings');
  } finally {
    setLoading(false);
  }
}, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle Filter Change
  const handleFilterChange = (name, value) => {
    console.log(`Filter changed: ${name} = ${value}`); // Debug log
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value, page: 1 };
      console.log('New filters:', newFilters); // Debug log
      return newFilters;
    });
    
    if (name === 'status' && value) {
      setActiveStat('all');
    }
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleFilterChange(name, value);
  };

  // Handle Sort
  const handleSort = (field) => {
    const sortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    handleFilterChange('sortBy', field);
    handleFilterChange('sortOrder', sortOrder);
  };

  // Clear Filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      search: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSelectedBookings([]);
    setActiveStat('all');
    toast.info('Filters cleared');
  };

  // Handle Actions
  const handleAction = async (action, booking) => {
    setSelectedBooking(booking);
    
    switch (action) {
      case 'view':
        setShowDetailsModal(true);
        break;
      case 'timeline':
        setShowTimelineModal(true);
        break;
      case 'invoice':
        setShowInvoiceModal(true);
        break;
      case 'quote':
        setShowQuoteModal(true);
        break;
      case 'price-quote':
        setShowPriceQuoteModal(true);
        break;
      case 'accept':
        setShowAcceptModal(true);
        break;
      case 'reject':
        setShowRejectModal(true);
        break;
      case 'cancel':
        setShowCancelModal(true);
        break;
      case 'download':
        try {
          if (booking.documents && booking.documents.length > 0) {
            for (const doc of booking.documents) {
              await downloadBookingDocument(booking._id, doc._id);
            }
            toast.success('Documents downloaded successfully');
          } else {
            toast.info('No documents to download');
          }
        } catch (error) {
          toast.error('Failed to download documents');
        }
        break;
      case 'share':
        if (booking.trackingNumber) {
          const trackingLink = `${window.location.origin}/track/${booking.trackingNumber}`;
          navigator.clipboard.writeText(trackingLink);
          toast.success('Tracking link copied to clipboard!');
        } else {
          toast.warning('No tracking number available');
        }
        break;
      default:
        break;
    }
  };

  // Handle View Details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Handle Save Price Quote
  // Handle Save Price Quote
const handleSavePriceQuote = async (bookingId, quoteData) => {
  try {
    const result = await updatePriceQuote(bookingId, quoteData);
    if (result.success) {
      toast.success('Price quote updated successfully!');
      // ✅ গুরুত্বপূর্ণ: আপডেটের পর ডেটা রিফ্রেশ করুন
      await fetchBookings();
      // মোডাল বন্ধ করুন
      setShowPriceQuoteModal(false);
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    toast.error('Failed to update price quote');
  }
};

  // Handle Accept Quote
  const handleAcceptQuote = async (bookingId, notes) => {
    try {
      const result = await acceptQuote(bookingId, notes);
      if (result.success) {
        toast.success('Quote accepted successfully!');
        fetchBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to accept quote');
    }
  };

  // Handle Reject Quote
  const handleRejectQuote = async (bookingId, reason) => {
    try {
      const result = await rejectQuote(bookingId, reason);
      if (result.success) {
        toast.success('Quote rejected successfully!');
        fetchBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to reject quote');
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId, reason) => {
    try {
      const result = await cancelBooking(bookingId, reason);
      if (result.success) {
        toast.success('Booking cancelled successfully!');
        fetchBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  // Handle Export
  const handleExport = () => {
    if (bookings.length === 0) {
      toast.warning('No bookings to export');
      return;
    }
    exportBookingsToCSV(bookings);
    toast.success(`${bookings.length} bookings exported successfully!`);
  };

  // REMOVED: handleSelectAll function (no longer needed)

  // Filter by status
  const filterByStatus = (status) => {
    setActiveStat(status);
    handleFilterChange('status', status === 'all' ? '' : status);
  };

  // Get visible stats - FIXED: All statuses now show correct counts
  const visibleStats = [
    { key: 'all', label: 'All', count: stats.total, icon: Package, color: 'bg-gray-100 text-gray-600' },
    { key: 'booking_requested', label: 'Requested', count: stats.booking_requested, icon: Clock, color: 'bg-blue-100 text-blue-600' },
    { key: 'price_quoted', label: 'Price Quoted', count: stats.price_quoted, icon: Tag, color: 'bg-yellow-100 text-yellow-600' },
    { key: 'booking_confirmed', label: 'Confirmed', count: stats.booking_confirmed, icon: CheckCircle, color: 'bg-indigo-100 text-indigo-600' },
    // { key: 'pending', label: 'Pending', count: stats.pending, icon: Clock, color: 'bg-gray-100 text-gray-600' },
    // { key: 'received_at_warehouse', label: 'At Warehouse', count: stats.received_at_warehouse, icon: Package, color: 'bg-orange-100 text-orange-600' },
    // { key: 'consolidation_in_progress', label: 'Consolidation', count: stats.consolidation_in_progress, icon: Box, color: 'bg-amber-100 text-amber-600' },
    // { key: 'loaded_in_container', label: 'Loaded', count: stats.loaded_in_container, icon: Ship, color: 'bg-emerald-100 text-emerald-600' },
    // { key: 'in_transit', label: 'In Transit', count: stats.in_transit, icon: Truck, color: 'bg-cyan-100 text-cyan-600' },
    // { key: 'arrived_at_destination', label: 'Arrived', count: stats.arrived_at_destination, icon: MapPin, color: 'bg-teal-100 text-teal-600' },
    // { key: 'customs_clearance', label: 'Customs', count: stats.customs_clearance, icon: FileText, color: 'bg-lime-100 text-lime-600' },
    // { key: 'out_for_delivery', label: 'Out for Delivery', count: stats.out_for_delivery, icon: Truck, color: 'bg-yellow-100 text-yellow-600' },
    // { key: 'delivered', label: 'Delivered', count: stats.delivered, icon: CheckCircleSolid, color: 'bg-green-100 text-green-600' },
    // { key: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: XCircleSolid, color: 'bg-red-100 text-red-600' },
    // { key: 'rejected', label: 'Rejected', count: stats.rejected, icon: AlertTriangle, color: 'bg-rose-100 text-rose-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: COLORS.primaryLight }}
                >
                  <Package className="h-4 w-4" style={{ color: COLORS.primary }} />
                </div>
                <h1 className="ml-2 text-lg font-semibold text-gray-900">Bookings Management</h1>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {stats.total} Total
              </span>
            </div>
            
            <div className="flex items-center space-x-2"> 
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/Bookings/create_bookings')}
                icon={<Plus className="h-4 w-4" />}
              >
                New Booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards - FIXED: Now showing all statuses with correct counts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          {visibleStats.map((stat) => (
            <StatCard
              key={stat.key}
              title={stat.label}
              value={stat.count}
              icon={stat.icon}
              color={stat.color}
              active={activeStat === stat.key}
              onClick={() => filterByStatus(stat.key)}
            />
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  name="search"
                  placeholder="Search by booking number, customer name, tracking number..."
                  value={filters.search}
                  onChange={handleInputChange}
                  icon={Search}
                />
              </div>
              <Button
                variant={showFilters ? 'primary' : 'light'}
                size="md"
                onClick={() => setShowFilters(!showFilters)}
                icon={<FilterIcon className="h-4 w-4" />}
              >
                Filters
                {(filters.status || filters.startDate || filters.endDate) && (
                  <span className="ml-2 bg-white text-[#E67E22] rounded-full px-2 py-0.5 text-xs">
                    {Object.values(filters).filter(v => v && v !== '' && v !== 10 && v !== 1).length}
                  </span>
                )}
              </Button>
              {(filters.search || filters.status || filters.startDate || filters.endDate || activeStat !== 'all') && (
                <Button
                  variant="light"
                  size="md"
                  onClick={clearFilters}
                  icon={<X className="h-4 w-4" />}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="light"
                size="md"
                onClick={fetchBookings}
                icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
              />
            </div>
 
          </div>
        </div>

        {/* Bulk Actions - REMOVED: Select all option */}
        {selectedBookings.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl mb-4 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-indigo-700">
                  {selectedBookings.length} booking(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedBookings([])}
                  icon={<X className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bookings Grid */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
              <p className="mt-4 text-sm text-gray-500">Loading bookings...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first booking</p>
              <Button
                variant="primary"
                onClick={() => router.push('/create-booking')}
                className="mt-4"
                icon={<Plus className="h-4 w-4" />}
              >
                Create New Booking
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <CollapsibleBookingCard
                key={booking._id}
                booking={booking}
                selectedBookings={selectedBookings}
                setSelectedBookings={setSelectedBookings}
                onViewDetails={handleViewDetails}
                onAction={handleAction}
              />
            ))}
          </div>
        )}

        {/* Pagination - FIXED: Removed per page selector, just simple pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * 10 + 1} -{' '}
                {Math.min(pagination.page * 10, pagination.total)} of{' '}
                {pagination.total} results
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                  disabled={filters.page === 1}
                  className="p-2 text-gray-400 hover:text-[#E67E22] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={filters.page === 1}
                  className="p-2 text-gray-400 hover:text-[#E67E22] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <span className="text-sm text-gray-600 px-3">
                  Page {filters.page} of {pagination.pages}
                </span>

                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={filters.page === pagination.pages}
                  className="p-2 text-gray-400 hover:text-[#E67E22] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.pages }))}
                  disabled={filters.page === pagination.pages}
                  className="p-2 text-gray-400 hover:text-[#E67E22] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PriceQuoteModal
        isOpen={showPriceQuoteModal}
        onClose={() => setShowPriceQuoteModal(false)}
        booking={selectedBooking}
        onSave={handleSavePriceQuote}
      />

      <QuoteResponseModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        booking={selectedBooking}
        type="accept"
        onRespond={handleAcceptQuote}
      />

      <QuoteResponseModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        booking={selectedBooking}
        type="reject"
        onRespond={handleRejectQuote}
      />

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={selectedBooking}
        onCancel={handleCancelBooking}
      />

      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        booking={selectedBooking}
      />

      <TimelineModal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        bookingId={selectedBooking?._id}
      />

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        bookingId={selectedBooking?._id}
      />

      <QuoteDetailsModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        bookingId={selectedBooking?._id}
      />
    </div>
  );
}
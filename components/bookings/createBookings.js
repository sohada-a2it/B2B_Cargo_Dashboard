// app/admin/create-booking/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { createBooking } from '@/Api/booking';
import { getAllUsers } from '@/Api/Authentication';

// Location functions
import { getStates, fetchCitiesByState, getPostalCodes } from '@/Api/location';

// Icons
import {
  Package, MapPin, Calendar, Weight, Box, FileText, ArrowLeft,
  Plus, Trash2, Send, AlertCircle, CheckCircle, ChevronRight,
  ChevronLeft, Truck, Ship, Plane, Phone, Mail, 
  DollarSign, Edit3, Building, Home, Clock,
  Globe, Hash, Tag, Briefcase, Loader2, X, 
  User, Save, Info, Ruler, Users, UserPlus, Search,
  CreditCard, Wallet, Repeat, Anchor, Train, DoorOpen, TruckIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================

const SHIPMENT_MAIN_TYPES = [
  { value: 'sea_freight', label: 'Sea Freight', icon: Ship },
  { value: 'air_freight', label: 'Air Freight', icon: Plane },
  { value: 'inland_trucking', label: 'Inland Trucking', icon: Truck },
  { value: 'multimodal', label: 'Multimodal', icon: Repeat }
];

const SHIPMENT_SUB_TYPES = {
  sea_freight: [
    { value: 'sea_freight_fcl', label: 'FCL - Full Container Load' },
    { value: 'sea_freight_lcl', label: 'LCL - Less than Container Load' }
  ],
  air_freight: [
    { value: 'air_freight', label: 'Air Freight' }
  ],
  inland_trucking: [
    { value: 'inland_transport', label: 'Inland Transport' }
  ],
  multimodal: [
    { value: 'door_to_door', label: 'Door to Door' }
  ]
};

const SHIPPING_MODES = [
  { value: 'DDP', label: 'DDP (Delivered Duty Paid)' },
  { value: 'DDU', label: 'DDU (Delivered Duty Unpaid)' },
  { value: 'FOB', label: 'FOB (Free on Board)' },
  { value: 'CIF', label: 'CIF (Cost, Insurance & Freight)' }
];

const PAYMENT_MODES = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'cash', label: 'Cash', icon: Wallet },
  { value: 'wire_transfer', label: 'Wire Transfer', icon: CreditCard }
];

const SERVICE_TYPES = [
  { value: 'standard', label: 'Standard Delivery (3-5 Days)' },
  { value: 'express', label: 'Express Delivery (1-2 Days)' },
  { value: 'overnight', label: 'Overnight Delivery' },
  { value: 'economy', label: 'Economy Delivery (5-7 Days)' }
];

const ORIGINS = [
  { value: 'China Warehouse', label: 'China - Main Warehouse' },
  { value: 'Thailand Warehouse', label: 'Thailand - Regional Hub' }
];

const DESTINATIONS = [
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' }
];

// ==================== CURRENCY CONSTANTS ====================
const CURRENCY_BY_COUNTRY = {
    'USA': 'USD',
    'UK': 'GBP',
    'Canada': 'CAD'
};

const CURRENCY_SYMBOLS = {
    'USD': '$',
    'GBP': '£',
    'CAD': 'C$'
};

const PRODUCT_CATEGORIES = [
  'Electronics', 'Furniture', 'Clothing', 'Machinery', 
  'Automotive', 'Pharmaceuticals', 'Food', 'Documents', 'Tires', 'Chemicals', 'Others'
];

const CURRENCIES = ['USD', 'GBP', 'CAD', 'THB', 'CNY', 'EUR', 'BDT'];

const PACKAGING_TYPES = [
  { value: 'pallet', label: 'Pallet' },
  { value: 'carton', label: 'Carton' },
  { value: 'crate', label: 'Crate' },
  { value: 'wooden_box', label: 'Wooden Box' },
  { value: 'container', label: 'Container' },
  { value: 'envelope', label: 'Envelope' },
  { value: 'loose_cargo', label: 'Loose Cargo' },
  { value: 'loose_tires', label: 'Loose Tires' },
  { value: '20ft_container', label: '20FT Container' },
  { value: '40ft_container', label: '40FT Container' }
];

// ==================== COMPONENTS ====================

const Button = ({ children, type = 'button', variant = 'primary', size = 'md', isLoading = false, disabled = false, onClick, className = '', icon: Icon, iconPosition = 'left' }) => {
  const baseClasses = 'rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus:ring-[#2563eb] shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-300',
    outline: 'border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 focus:ring-[#2563eb]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          <span>Please wait...</span>
        </div>
      ) : (
        <div className="flex items-center">
          {Icon && iconPosition === 'left' && <Icon className="h-3.5 w-3.5 mr-1.5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="h-3.5 w-3.5 ml-1.5" />}
        </div>
      )}
    </button>
  );
};

const Input = ({ label, type = 'text', name, value, onChange, onBlur, placeholder, error, required = false, disabled = false, icon: Icon, className = '', ...props }) => {
  const [touched, setTouched] = useState(false);
  const showError = (touched || error) && error;
  
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Icon className="h-3.5 w-3.5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={(e) => { setTouched(true); onBlur?.(e); }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-md shadow-sm
            focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
            ${showError ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${Icon ? 'pl-8' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {showError && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

const Select = ({ label, name, value, onChange, options, error, required = false, icon: Icon, placeholder = 'Select...', disabled = false, loading = false }) => {
  const [touched, setTouched] = useState(false);
  const showError = (touched || error) && error;
  
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Icon className="h-3.5 w-3.5 text-gray-400" />
          </div>
        )}
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          disabled={disabled || loading}
          className={`
            w-full px-3 py-2 text-sm border rounded-md shadow-sm appearance-none
            focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
            ${showError ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${Icon ? 'pl-8' : ''}
            ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        >
          <option value="">
            {loading ? 'Loading...' : placeholder}
          </option>
          {!loading && options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
          </div>
        )}
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 transform rotate-90" />
        </div>
      </div>
      {showError && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

const TextArea = ({ label, name, value, onChange, placeholder, error, required = false, rows = 3 }) => {
  const [touched, setTouched] = useState(false);
  const showError = (touched || error) && error;
  
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full px-3 py-2 text-sm border rounded-md shadow-sm
          focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
          ${showError ? 'border-red-300 bg-red-50' : 'border-gray-300'}
        `}
      />
      {showError && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

const StepIndicator = ({ step, currentStep, title }) => {
  const isActive = step <= currentStep;
  const isCurrent = step === currentStep;
  
  return (
    <div className="flex items-center">
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all
        ${isCurrent ? 'bg-[#2563eb] text-white ring-2 ring-blue-200' : 
          isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
      `}>
        {isActive && step < currentStep ? <CheckCircle className="h-3 w-3" /> : step}
      </div>
      <span className={`ml-1.5 text-xs ${isCurrent ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  );
};

const CustomerSearchModal = ({ isOpen, onClose, onSelect, customers, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!isOpen) return null;
  
  const filteredCustomers = customers.filter(customer => 
    customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900">Select Customer</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, company, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-md"
          />
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map(customer => (
              <div
                key={customer._id}
                onClick={() => {
                  onSelect(customer);
                  onClose();
                }}
                className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">
                      {customer.firstName} {customer.lastName}
                      {customer.companyName && (
                        <span className="ml-2 text-xs text-gray-500">({customer.companyName})</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="inline-flex items-center mr-3">
                        <Mail className="h-3 w-3 mr-1" /> {customer.email}
                      </span>
                      <span className="inline-flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> {customer.phone || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    {customer.customerStatus || 'Active'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500 py-4">No customers found</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function CreateBooking() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [availableSubTypes, setAvailableSubTypes] = useState([]);
  const [isReviewConfirmed, setIsReviewConfirmed] = useState(false);
  const [pickupRequired, setPickupRequired] = useState(false);
  
  // Location States
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [postalCodes, setPostalCodes] = useState([]);

  // ===== Form Data State =====
  const [formData, setFormData] = useState({
    customer: '',
    
    shipmentClassification: {
      mainType: '',
      subType: ''
    },
    
    shipmentDetails: {
      origin: 'China Warehouse',
      destination: 'USA',
      shippingMode: 'DDU',
      packageDetails: [{
        description: '',
        packagingType: 'carton',
        quantity: 1,
        weight: 0,
        volume: 0,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          unit: 'cm'
        },
        productCategory: '',
        hsCode: '',
        value: { 
          amount: 0, 
          currency: 'USD' 
        },
        hazardous: false,
        temperatureControlled: {
          required: false,
          minTemp: null,
          maxTemp: null
        }
      }],
      totalPackages: 0,
      totalWeight: 0,
      totalVolume: 0,
      specialInstructions: '',
      referenceNumber: ''
    },
    
    dates: {
      estimatedDeparture: '',
      estimatedArrival: ''
    },
    
    payment: {
      mode: 'bank_transfer',
      currency: 'USD',
      amount: 0
    },
    
    serviceType: 'standard',
    
    sender: {
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      pickupDate: '',
      pickupInstructions: ''
    },
    
    receiver: {
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      deliveryInstructions: '',
      isResidential: false
    },
    
    courier: {
      company: 'Cargo Logistics Group',
      serviceType: 'standard'
    },
    
    customerReference: '',
    
    status: 'booking_requested',
    pricingStatus: 'pending'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ==================== LOAD CUSTOMERS ====================
  useEffect(() => {
    const loadInitialData = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setAdminUser(user);
      await loadCustomers();
    };
    loadInitialData();
  }, []);

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await getAllUsers({ 
        role: 'customer',
        status: 'active',
        limit: 100 
      });
      
      if (response.success) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // ==================== LOCATION FUNCTIONS ====================
  
  const loadStates = useCallback((country) => {
    if (!country) return;
    
    setLoadingLocation(true);
    try {
      const statesData = getStates(country);
      if (statesData && statesData.length > 0) {
        const stateNames = statesData.map(s => s.name);
        setStates(stateNames);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      setStates([]);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const loadCities = useCallback((country, state) => {
    if (!country || !state) return;
    
    setLoadingLocation(true);
    try {
      const citiesData = fetchCitiesByState(country, state);
      if (citiesData && citiesData.length > 0) {
        const cityNames = citiesData.map(c => c.name);
        setCities(cityNames);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    } finally {
      setLoadingLocation(false);
    }
  }, []); 

  // ==================== VALIDATION FUNCTIONS ====================
  
  const validateField = useCallback((name, value) => {
    let error = '';
    
    // Step 1 validations
    if (name === 'shipmentClassification.mainType') {
      if (!value) error = 'Shipment type is required';
    } else if (name === 'shipmentClassification.subType') {
      if (!value) error = 'Shipment sub-type is required';
    } else if (name === 'payment.mode') {
      if (!value) error = 'Payment mode is required';
    } else if (name === 'dates.estimatedDeparture') {
      if (!value) error = 'Departure date is required';
    } else if (name === 'dates.estimatedArrival') {
      if (!value) error = 'Arrival date is required';
    }
    
    // Step 2 validations
    else if (name.includes('packageDetails')) {
      const match = name.match(/packageDetails\[(\d+)\]\.(.+)/);
      if (match) {
        const [, index, field] = match;
        if (field === 'description' && !value) {
          error = 'Description is required';
        } else if (field === 'quantity' && (!value || value < 1)) {
          error = 'Minimum 1 item required';
        } else if (field === 'weight' && (!value || value <= 0)) {
          error = 'Weight is required';
        }
      }
    }
    
    // Step 3 validations
    else if (name === 'sender.name') {
      if (!value) error = 'Sender name is required';
    } else if (name === 'sender.email') {
      if (!value) error = 'Sender email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
    } else if (name === 'sender.phone') {
      if (!value) error = 'Sender phone is required';
    } else if (name === 'receiver.name') {
      if (!value) error = 'Receiver name is required';
    } else if (name === 'receiver.email') {
      if (!value) error = 'Receiver email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
    } else if (name === 'receiver.phone') {
      if (!value) error = 'Receiver phone is required';
    } else if (name === 'receiver.address.addressLine1') {
      if (!value) error = 'Receiver address is required';
    } else if (name === 'receiver.address.city') {
      if (!value) error = 'City is required';
    } else if (name === 'receiver.address.country') {
      if (!value) error = 'Country is required';
    } else if (name === 'receiver.address.state') {
      if (!value) error = 'State is required';
    } else if (name === 'sender.pickupDate' && pickupRequired) {
      if (!value) error = 'Pickup date is required';
    }
    
    return error;
  }, [pickupRequired]);

  const validateOnChange = useCallback((name, value) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, [validateField]);

  const validateStep = useCallback((step) => {
    const newErrors = {};
    let isValid = true;
    
    if (step === 1) {
      if (!selectedCustomer) {
        newErrors.customer = 'Please select a customer';
        isValid = false;
      }
      if (!formData.shipmentClassification.mainType) {
        newErrors['shipmentClassification.mainType'] = 'Shipment type is required';
        isValid = false;
      }
      if (!formData.shipmentClassification.subType) {
        newErrors['shipmentClassification.subType'] = 'Shipment sub-type is required';
        isValid = false;
      }
      if (!formData.payment.mode) {
        newErrors['payment.mode'] = 'Payment mode is required';
        isValid = false;
      }
      if (!formData.dates.estimatedDeparture) {
        newErrors['dates.estimatedDeparture'] = 'Departure date is required';
        isValid = false;
      }
      if (!formData.dates.estimatedArrival) {
        newErrors['dates.estimatedArrival'] = 'Arrival date is required';
        isValid = false;
      }
    }
    
    else if (step === 2) {
      formData.shipmentDetails.packageDetails.forEach((item, index) => {
        if (!item.description) {
          newErrors[`package_desc_${index}`] = 'Description is required';
          isValid = false;
        }
        if (!item.quantity || item.quantity < 1) {
          newErrors[`package_qty_${index}`] = 'Minimum 1 item required';
          isValid = false;
        }
        if (!item.weight || item.weight <= 0) {
          newErrors[`package_weight_${index}`] = 'Weight is required';
          isValid = false;
        }
      });
    }
    
    else if (step === 3) {
      if (!formData.sender.name) {
        newErrors['sender.name'] = 'Sender name is required';
        isValid = false;
      }
      if (!formData.sender.email) {
        newErrors['sender.email'] = 'Sender email is required';
        isValid = false;
      }
      if (!formData.sender.phone) {
        newErrors['sender.phone'] = 'Sender phone is required';
        isValid = false;
      }
      if (!formData.receiver.name) {
        newErrors['receiver.name'] = 'Receiver name is required';
        isValid = false;
      }
      if (!formData.receiver.email) {
        newErrors['receiver.email'] = 'Receiver email is required';
        isValid = false;
      }
      if (!formData.receiver.phone) {
        newErrors['receiver.phone'] = 'Receiver phone is required';
        isValid = false;
      }
      if (!formData.receiver.address.addressLine1) {
        newErrors['receiver.address.addressLine1'] = 'Receiver address is required';
        isValid = false;
      }
      if (!formData.receiver.address.city) {
        newErrors['receiver.address.city'] = 'City is required';
        isValid = false;
      }
      if (!formData.receiver.address.country) {
        newErrors['receiver.address.country'] = 'Country is required';
        isValid = false;
      }
      if (!formData.receiver.address.state) {
        newErrors['receiver.address.state'] = 'State is required';
        isValid = false;
      }
      if (pickupRequired && !formData.sender.pickupDate) {
        newErrors['sender.pickupDate'] = 'Pickup date is required';
        isValid = false;
      }
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  }, [formData, selectedCustomer, pickupRequired]);

  // ==================== HANDLERS ====================
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const keys = name.split('.');
      const newFormData = JSON.parse(JSON.stringify(prev));
      let current = newFormData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = finalValue;
      return newFormData;
    });
    
    validateOnChange(name, finalValue);
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Updated Destination Change Handler with Currency
  const handleDestinationChange = (e) => {
    const { value } = e.target;
    handleInputChange(e);
    
    if (value) {
      setStates([]);
      setCities([]);
      setPostalCodes([]);
      loadStates(value);
      
      // Get currency for selected country
      const currencyCode = CURRENCY_BY_COUNTRY[value] || 'USD';
      
      setFormData(prev => ({
        ...prev,
        receiver: {
          ...prev.receiver,
          address: {
            ...prev.receiver.address,
            country: value,
            city: '',
            state: '',
            postalCode: ''
          }
        },
        payment: {
          ...prev.payment,
          currency: currencyCode
        }
      }));
      
      toast.success(`${value} selected - Currency: ${currencyCode} (${CURRENCY_SYMBOLS[currencyCode]})`);
    }
  };

  const handleStateChange = (e) => {
    const { value } = e.target;
    handleInputChange(e);
    
    if (value && formData.receiver.address.country) {
      setCities([]);
      setPostalCodes([]);
      loadCities(formData.receiver.address.country, value);
      
      setFormData(prev => ({
        ...prev,
        receiver: {
          ...prev.receiver,
          address: {
            ...prev.receiver.address,
            state: value,
            city: '',
            postalCode: ''
          }
        }
      }));
    }
  };

  const handleCityChange = (e) => {
    const { value } = e.target;
    handleInputChange(e);
    
    if (value && formData.receiver.address.country) {
      loadPostalCodes(formData.receiver.address.country, value);
      
      setFormData(prev => ({
        ...prev,
        receiver: {
          ...prev.receiver,
          address: {
            ...prev.receiver.address,
            city: value,
            postalCode: ''
          }
        }
      }));
    }
  };

  const handlePackageChange = (index, field, value) => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!newData.shipmentDetails.packageDetails[index][parent]) {
          newData.shipmentDetails.packageDetails[index][parent] = {};
        }
        newData.shipmentDetails.packageDetails[index][parent][child] = value;
      } else {
        newData.shipmentDetails.packageDetails[index][field] = value;
      }
      
      const item = newData.shipmentDetails.packageDetails[index];
      if (item.dimensions.length && item.dimensions.width && item.dimensions.height) {
        const volume = (item.dimensions.length * item.dimensions.width * item.dimensions.height) / 1000000;
        newData.shipmentDetails.packageDetails[index].volume = parseFloat(volume.toFixed(3));
      }
      
      return newData;
    });
    
    const errorKey = `package_${field}_${index}`;
    let error = '';
    if (field === 'description' && !value) error = 'Description is required';
    if (field === 'quantity' && (!value || value < 1)) error = 'Minimum 1 item required';
    if (field === 'weight' && (!value || value <= 0)) error = 'Weight is required';
    
    setErrors(prev => ({ ...prev, [errorKey]: error }));
  };

  const addPackageItem = () => {
    setFormData(prev => ({
      ...prev,
      shipmentDetails: {
        ...prev.shipmentDetails,
        packageDetails: [
          ...prev.shipmentDetails.packageDetails,
          {
            description: '',
            packagingType: 'carton',
            quantity: 1,
            weight: 0,
            volume: 0,
            dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
            productCategory: '',
            hsCode: '',
            value: { amount: 0, currency: formData.payment.currency || 'USD' },
            hazardous: false,
            temperatureControlled: { required: false, minTemp: null, maxTemp: null }
          }
        ]
      }
    }));
  };

  const removePackageItem = (index) => {
    if (formData.shipmentDetails.packageDetails.length > 1) {
      setFormData(prev => ({
        ...prev,
        shipmentDetails: {
          ...prev.shipmentDetails,
          packageDetails: prev.shipmentDetails.packageDetails.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    
    setFormData(prev => ({
      ...prev,
      customer: customer._id,
      sender: {
        ...prev.sender,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        companyName: customer.companyName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: {
          ...prev.sender.address,
          addressLine1: customer.companyAddress || '',
          country: customer.destinationMarkets?.[0] || ''
        }
      }
    }));
    
    toast.success(`Customer ${customer.firstName} ${customer.lastName} selected`);
  };

  // Calculate totals from package details
  useEffect(() => {
    if (formData.shipmentDetails.packageDetails.length > 0) {
      const totals = formData.shipmentDetails.packageDetails.reduce(
        (acc, item) => ({
          totalPackages: acc.totalPackages + (Number(item.quantity) || 0),
          totalWeight: acc.totalWeight + ((Number(item.weight) || 0) * (Number(item.quantity) || 0)),
          totalVolume: acc.totalVolume + ((Number(item.volume) || 0) * (Number(item.quantity) || 0))
        }),
        { totalPackages: 0, totalWeight: 0, totalVolume: 0 }
      );

      setFormData(prev => ({
        ...prev,
        shipmentDetails: { ...prev.shipmentDetails, ...totals }
      }));
    }
  }, [formData.shipmentDetails.packageDetails]);

  // Update sub types when main type changes
  useEffect(() => {
    if (formData.shipmentClassification.mainType) {
      setAvailableSubTypes(SHIPMENT_SUB_TYPES[formData.shipmentClassification.mainType] || []);
    }
  }, [formData.shipmentClassification.mainType]);

  // ==================== STEP NAVIGATION ====================
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      if (currentStep + 1 === 4) {
        setIsReviewConfirmed(false);
      }
    } else {
      toast.error('Please fill all required fields correctly');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ==================== REVIEW CONFIRMATION ====================
  
  const handleConfirmReview = () => {
    if (validateStep(3) && validateStep(2) && validateStep(1)) {
      setIsReviewConfirmed(true);
      toast.success('Details confirmed! You can now submit the booking.');
    } else {
      toast.error('Please complete all required fields before confirming');
    }
  };

  // ==================== SUBMIT HANDLER ====================
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep !== 4) {
      toast.info('Please complete all steps first');
      return;
    }
    
    if (!isReviewConfirmed) {
      toast.warning('⚠️ Please review all details and click "Confirm Details" before creating booking');
      return;
    }
    
    // ========== CHECK ALL REQUIRED FIELDS ==========
    
    if (!selectedCustomer || !formData.customer) {
      toast.error('❌ Please select a customer first');
      setCurrentStep(1);
      return;
    }
    
    if (!formData.shipmentClassification.mainType) {
      toast.error('❌ Please select shipment type');
      setCurrentStep(1);
      return;
    }
    if (!formData.shipmentClassification.subType) {
      toast.error('❌ Please select shipment sub-type');
      setCurrentStep(1);
      return;
    }
    
    if (!formData.payment.mode) {
      toast.error('❌ Please select payment mode');
      setCurrentStep(1);
      return;
    }
    
    if (!formData.dates.estimatedDeparture) {
      toast.error('📅 Please select departure date');
      setCurrentStep(1);
      return;
    }
    if (!formData.dates.estimatedArrival) {
      toast.error('📅 Please select arrival date');
      setCurrentStep(1);
      return;
    }
    
    if (formData.shipmentDetails.packageDetails.length === 0) {
      toast.error('📦 Please add at least one package');
      setCurrentStep(2);
      return;
    }
    
    let packageError = false;
    for (let idx = 0; idx < formData.shipmentDetails.packageDetails.length; idx++) {
      const pkg = formData.shipmentDetails.packageDetails[idx];
      if (!pkg.description) {
        toast.error(`📦 Package ${idx + 1}: Description is required`);
        setCurrentStep(2);
        packageError = true;
        break;
      }
      if (!pkg.quantity || pkg.quantity < 1) {
        toast.error(`📦 Package ${idx + 1}: Quantity must be at least 1`);
        setCurrentStep(2);
        packageError = true;
        break;
      }
      if (!pkg.weight || pkg.weight <= 0) {
        toast.error(`⚖️ Package ${idx + 1}: Weight is required`);
        setCurrentStep(2);
        packageError = true;
        break;
      }
    }
    if (packageError) return;
    
    if (!formData.sender.name) {
      toast.error('👤 Sender name is required');
      setCurrentStep(3);
      return;
    }
    if (!formData.sender.email) {
      toast.error('📧 Sender email is required');
      setCurrentStep(3);
      return;
    }
    if (!formData.sender.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('📧 Please enter a valid sender email address');
      setCurrentStep(3);
      return;
    }
    if (!formData.sender.phone) {
      toast.error('📞 Sender phone number is required');
      setCurrentStep(3);
      return;
    }
    
    if (!formData.receiver.name) {
      toast.error('👤 Receiver name is required');
      setCurrentStep(3);
      return;
    }
    if (!formData.receiver.email) {
      toast.error('📧 Receiver email is required');
      setCurrentStep(3);
      return;
    }
    if (!formData.receiver.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('📧 Please enter a valid receiver email address');
      setCurrentStep(3);
      return;
    }
    if (!formData.receiver.phone) {
      toast.error('📞 Receiver phone number is required');
      setCurrentStep(3);
      return;
    }
    if (!formData.receiver.address.addressLine1) {
      toast.error('📍 Receiver address is required');
      setCurrentStep(3);
      return;
    }
    if (!formData.receiver.address.city) {
      toast.error('🏙️ Receiver city is required');
      setCurrentStep(3);
      return;
    }
    if (!formData.receiver.address.country) {
      toast.error('🌍 Receiver country is required');
      setCurrentStep(3);
      return;
    }
    if (!formData.receiver.address.state) {
      toast.error('🗺️ Receiver state is required');
      setCurrentStep(3);
      return;
    }
    
    if (pickupRequired && !formData.sender.pickupDate) {
      toast.error('🚚 Pickup date is required (Pickup Required is checked)');
      setCurrentStep(3);
      return;
    }
    
    // ========== PREPARE AND SEND DATA ==========
    const loadingToast = toast.loading('Creating booking... Please wait');
    
    setIsSubmitting(true);
    setServerErrors([]);

    try {
      const bookingData = {
        customer: formData.customer,
        createdBy: adminUser?._id,
        
        shipmentClassification: {
          mainType: formData.shipmentClassification.mainType,
          subType: formData.shipmentClassification.subType
        },
        
        serviceType: formData.serviceType,
        
        shipmentDetails: {
          origin: formData.shipmentDetails.origin,
          destination: formData.shipmentDetails.destination,
          shippingMode: formData.shipmentDetails.shippingMode,
          packageDetails: formData.shipmentDetails.packageDetails.map(pkg => ({
            description: pkg.description,
            packagingType: pkg.packagingType,
            quantity: Number(pkg.quantity),
            weight: Number(pkg.weight),
            volume: Number(pkg.volume),
            dimensions: {
              length: Number(pkg.dimensions.length) || 0,
              width: Number(pkg.dimensions.width) || 0,
              height: Number(pkg.dimensions.height) || 0,
              unit: 'cm'
            },
            productCategory: pkg.productCategory || '',
            hsCode: pkg.hsCode || '',
            value: {
              amount: Number(pkg.value.amount) || 0,
              currency: formData.payment.currency || 'USD'
            },
            hazardous: pkg.hazardous || false
          })),
          specialInstructions: formData.shipmentDetails.specialInstructions || '',
          referenceNumber: formData.customerReference || ''
        },
        
        dates: {
          estimatedDeparture: formData.dates.estimatedDeparture,
          estimatedArrival: formData.dates.estimatedArrival
        },
        
        payment: {
          mode: formData.payment.mode,
          currency: formData.payment.currency || 'USD'
        },
        
        sender: {
          name: formData.sender.name,
          companyName: formData.sender.companyName || '',
          email: formData.sender.email,
          phone: formData.sender.phone,
          address: {
            addressLine1: formData.sender.address.addressLine1 || '',
            addressLine2: formData.sender.address.addressLine2 || '',
            city: formData.sender.address.city || '',
            state: formData.sender.address.state || '',
            country: formData.sender.address.country || '',
            postalCode: formData.sender.address.postalCode || ''
          },
          pickupDate: pickupRequired ? formData.sender.pickupDate : null,
          pickupInstructions: pickupRequired ? formData.sender.pickupInstructions || '' : ''
        },
        
        receiver: {
          name: formData.receiver.name,
          companyName: formData.receiver.companyName || '',
          email: formData.receiver.email,
          phone: formData.receiver.phone,
          address: {
            addressLine1: formData.receiver.address.addressLine1,
            addressLine2: formData.receiver.address.addressLine2 || '',
            city: formData.receiver.address.city,
            state: formData.receiver.address.state,
            country: formData.receiver.address.country,
            postalCode: formData.receiver.address.postalCode || ''
          },
          deliveryInstructions: formData.receiver.deliveryInstructions || '',
          isResidential: formData.receiver.isResidential || false
        },
        
        courier: {
          company: 'Cargo Logistics Group',
          serviceType: formData.serviceType
        },
        
        status: 'booking_requested',
        pricingStatus: 'pending',
        
        timeline: [{
          status: 'booking_requested',
          description: 'Booking created by admin',
          updatedBy: adminUser?._id,
          timestamp: new Date()
        }]
      };

      console.log('📤 Sending booking data:', JSON.stringify(bookingData, null, 2));

      const response = await createBooking(bookingData);
      
      toast.dismiss(loadingToast);
      
      if (response.success) {
        toast.success('🎉 Booking created successfully! Redirecting...');
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/Bookings/all_bookings');
        }, 2000);
      } else {
        const errorMsg = response.message || 'Failed to create booking';
        toast.error(`❌ ${errorMsg}`);
        setServerErrors([{ msg: errorMsg }]);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      
      console.error('❌ ERROR DETAILS:', error);
      
      let errorMessage = 'Failed to create booking';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.toLowerCase().includes('customer')) {
        toast.error('👤 Customer information is invalid. Please reselect customer.');
      } else if (errorMessage.toLowerCase().includes('package')) {
        toast.error('📦 Package details are incomplete. Please check all package fields.');
      } else if (errorMessage.toLowerCase().includes('date')) {
        toast.error('📅 Date information is invalid. Please check departure and arrival dates.');
      } else if (errorMessage.toLowerCase().includes('address')) {
        toast.error('📍 Address information is incomplete. Please check receiver address.');
      } else if (errorMessage.toLowerCase().includes('email')) {
        toast.error('📧 Email address is invalid. Please check sender and receiver emails.');
      } else if (errorMessage.toLowerCase().includes('state') || errorMessage.toLowerCase().includes('city')) {
        toast.error('🗺️ Location information is incomplete. Please select state and city.');
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
      
      setServerErrors([{ msg: errorMessage }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Link 
                href="/bookings"
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-base font-semibold text-gray-900 flex items-center">
                  <Package className="h-4 w-4 mr-1.5 text-[#2563eb]" />
                  Create New Booking - Admin
                </h1>
                <p className="text-xs text-gray-500">Cargo Logistics Group</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">
                Step {currentStep}/4
              </span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1 w-6 rounded-full transition-colors ${
                      step <= currentStep ? 'bg-[#2563eb]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {serverErrors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="ml-2 flex-1">
                <p className="text-xs font-medium text-red-800">Error creating booking</p>
                {serverErrors.map((error, index) => (
                  <p key={index} className="text-xs text-red-600">{error.msg}</p>
                ))}
              </div>
              <button onClick={() => setServerErrors([])} className="flex-shrink-0">
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Search Modal */}
      <CustomerSearchModal
        isOpen={showCustomerSearch}
        onClose={() => setShowCustomerSearch(false)}
        onSelect={selectCustomer}
        customers={customers}
        loading={loadingCustomers}
      />

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 animate-fadeIn">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Success!</h3>
              <p className="text-sm text-gray-500 mb-4">Booking created successfully</p>
              <p className="text-xs text-gray-400">Redirecting to bookings...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm">
          {/* Step Indicators */}
          <div className="border-b px-4 py-2 bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <StepIndicator step={1} currentStep={currentStep} title="Customer & Shipment" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={2} currentStep={currentStep} title="Package" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={3} currentStep={currentStep} title="Sender/Receiver" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={4} currentStep={currentStep} title="Review" />
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4">
            {/* Step 1: Customer & Shipment Info */}
            {currentStep === 1 && (
              <div className="space-y-3 animate-fadeIn">
                {/* Customer Selection */}
                <div className="border rounded-md p-3 bg-gray-50">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedCustomer.email} | {selectedCustomer.phone}
                          {selectedCustomer.companyName && ` | ${selectedCustomer.companyName}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setFormData(prev => ({ 
                            ...prev, 
                            customer: '',
                            sender: {
                              ...prev.sender,
                              name: '',
                              companyName: '',
                              email: '',
                              phone: ''
                            }
                          }));
                        }}
                        icon={X}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomerSearch(true)}
                      icon={Users}
                      className="w-full"
                    >
                      Search & Select Customer
                    </Button>
                  )}
                  {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer}</p>}
                </div>

                {/* Shipment Classification */}
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Shipment Type"
                    name="shipmentClassification.mainType"
                    value={formData.shipmentClassification.mainType}
                    onChange={handleInputChange}
                    options={SHIPMENT_MAIN_TYPES}
                    required
                    icon={Package}
                    error={errors['shipmentClassification.mainType']}
                  />
                  
                  <Select
                    label="Shipment Sub-Type"
                    name="shipmentClassification.subType"
                    value={formData.shipmentClassification.subType}
                    onChange={handleInputChange}
                    options={availableSubTypes}
                    required
                    icon={Tag}
                    error={errors['shipmentClassification.subType']}
                    disabled={!formData.shipmentClassification.mainType}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Shipping Mode"
                    name="shipmentDetails.shippingMode"
                    value={formData.shipmentDetails.shippingMode}
                    onChange={handleInputChange}
                    options={SHIPPING_MODES}
                    icon={Briefcase}
                  />
                  
                  {/* Payment Mode & Currency Display */}
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      label="Payment Mode"
                      name="payment.mode"
                      value={formData.payment.mode}
                      onChange={handleInputChange}
                      options={PAYMENT_MODES}
                      required
                      icon={CreditCard}
                      error={errors['payment.mode']}
                    />
                    
                    {/* Currency Display - NEW */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Currency
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={`${formData.payment.currency} (${CURRENCY_SYMBOLS[formData.payment.currency] || '$'})`}
                          disabled
                          className="w-full px-3 py-2 pl-8 text-sm border rounded-md bg-gray-100 text-gray-700"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on destination: {formData.shipmentDetails.destination}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Origin"
                    name="shipmentDetails.origin"
                    value={formData.shipmentDetails.origin}
                    onChange={handleInputChange}
                    options={ORIGINS}
                    required
                    icon={MapPin}
                    error={errors['shipmentDetails.origin']}
                  />
                  
                  <Select
                    label="Destination"
                    name="shipmentDetails.destination"
                    value={formData.shipmentDetails.destination}
                    onChange={handleDestinationChange}
                    options={DESTINATIONS}
                    required
                    icon={Globe}
                    error={errors['shipmentDetails.destination']}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Departure Date"
                    type="date"
                    name="dates.estimatedDeparture"
                    value={formData.dates.estimatedDeparture}
                    onChange={handleInputChange}
                    required
                    icon={Calendar}
                    error={errors['dates.estimatedDeparture']}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  
                  <Input
                    label="Arrival Date"
                    type="date"
                    name="dates.estimatedArrival"
                    value={formData.dates.estimatedArrival}
                    onChange={handleInputChange}
                    required
                    icon={Calendar}
                    error={errors['dates.estimatedArrival']}
                    min={formData.dates.estimatedDeparture || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Reference No"
                    name="customerReference"
                    value={formData.customerReference}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    icon={Hash}
                  />
                  
                  <Select
                    label="Service Type"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    options={SERVICE_TYPES}
                    icon={Truck}
                  />
                </div>

                <div className="bg-blue-50 rounded-md p-2 mt-2">
                  <div className="flex items-start">
                    <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      Creating booking for: {selectedCustomer ? 
                        `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 
                        'No customer selected'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Package Details */}
            {currentStep === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-700">Package Details</h3>
                  <span className="text-xs text-gray-500">
                    {formData.shipmentDetails.packageDetails.length} package(s)
                  </span>
                </div>

                {formData.shipmentDetails.packageDetails.map((item, index) => (
                  <div key={index} className="border rounded-md p-3 bg-gray-50 relative">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePackageItem(index)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-0.5 hover:bg-red-200 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <Input
                          label="Description"
                          value={item.description}
                          onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                          placeholder="Product description"
                          required
                          icon={Package}
                          error={errors[`package_desc_${index}`]}
                        />
                      </div>

                      <Select
                        label="Packaging Type"
                        value={item.packagingType}
                        onChange={(e) => handlePackageChange(index, 'packagingType', e.target.value)}
                        options={PACKAGING_TYPES}
                        icon={Box}
                      />

                      <Select
                        label="Category"
                        value={item.productCategory}
                        onChange={(e) => handlePackageChange(index, 'productCategory', e.target.value)}
                        options={PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                        icon={Tag}
                      />

                      <Input
                        label="HS Code"
                        value={item.hsCode}
                        onChange={(e) => handlePackageChange(index, 'hsCode', e.target.value)}
                        placeholder="Optional"
                        icon={Hash}
                      />

                      <Input
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handlePackageChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                        icon={Box}
                        error={errors[`package_qty_${index}`]}
                      />

                      <Input
                        label="Weight (kg)"
                        type="number"
                        value={item.weight}
                        onChange={(e) => handlePackageChange(index, 'weight', parseFloat(e.target.value) || 0)}
                        min="0.1"
                        step="0.1"
                        required
                        icon={Weight}
                        error={errors[`package_weight_${index}`]}
                      />

                      {/* Dimensions */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Dimensions (cm)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Length"
                            type="number"
                            value={item.dimensions.length}
                            onChange={(e) => handlePackageChange(index, 'dimensions.length', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            icon={Ruler}
                          />
                          <Input
                            placeholder="Width"
                            type="number"
                            value={item.dimensions.width}
                            onChange={(e) => handlePackageChange(index, 'dimensions.width', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            icon={Ruler}
                          />
                          <Input
                            placeholder="Height"
                            type="number"
                            value={item.dimensions.height}
                            onChange={(e) => handlePackageChange(index, 'dimensions.height', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            icon={Ruler}
                          />
                        </div>
                      </div>

                      <Input
                        label="Volume (CBM)"
                        type="number"
                        value={item.volume}
                        onChange={(e) => handlePackageChange(index, 'volume', parseFloat(e.target.value) || 0)}
                        min="0.001"
                        step="0.001"
                        required
                        icon={Box}
                        error={errors[`package_volume_${index}`]}
                      />

                      <div className="col-span-2 grid grid-cols-2 gap-2">
                        <Input
                          label="Value"
                          type="number"
                          value={item.value.amount}
                          onChange={(e) => handlePackageChange(index, 'value.amount', parseFloat(e.target.value) || 0)}
                          icon={DollarSign}
                          min="0"
                          step="0.01"
                          placeholder="Enter value"
                        />

                        {/* Currency Display - Readonly based on destination */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Currency
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={`${formData.payment.currency} (${CURRENCY_SYMBOLS[formData.payment.currency] || '$'})`}
                              disabled
                              className="w-full px-3 py-2 pl-8 text-sm border rounded-md bg-gray-100 text-gray-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Hazardous & Temperature Control */}
                      <div className="col-span-2 flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.hazardous}
                            onChange={(e) => handlePackageChange(index, 'hazardous', e.target.checked)}
                            className="h-3.5 w-3.5 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-600">Hazardous Material</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.temperatureControlled?.required}
                            onChange={(e) => handlePackageChange(index, 'temperatureControlled.required', e.target.checked)}
                            className="h-3.5 w-3.5 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-600">Temperature Controlled</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPackageItem}
                  icon={Plus}
                  className="w-full"
                >
                  Add Another Package
                </Button>

                {formData.shipmentDetails.packageDetails.length > 0 && (
                  <div className="bg-blue-50 rounded-md p-3 mt-2">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Total Packages</div>
                        <div className="text-sm font-semibold text-[#2563eb]">
                          {formData.shipmentDetails.totalPackages}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Weight</div>
                        <div className="text-sm font-semibold text-[#2563eb]">
                          {formData.shipmentDetails.totalWeight.toFixed(1)} kg
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Volume</div>
                        <div className="text-sm font-semibold text-[#2563eb]">
                          {formData.shipmentDetails.totalVolume.toFixed(3)} CBM
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Sender & Receiver */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Sender Information */}
                <div className="border rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <User className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Sender Information
                    {selectedCustomer && (
                      <span className="ml-2 text-xs text-green-600">(Auto-filled from customer)</span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Full Name"
                      name="sender.name"
                      value={formData.sender.name}
                      onChange={handleInputChange}
                      required
                      icon={User}
                      error={errors['sender.name']}
                    />

                    <Input
                      label="Company Name"
                      name="sender.companyName"
                      value={formData.sender.companyName}
                      onChange={handleInputChange}
                      icon={Building}
                    />

                    <Input
                      label="Email"
                      type="email"
                      name="sender.email"
                      value={formData.sender.email}
                      onChange={handleInputChange}
                      required
                      icon={Mail}
                      error={errors['sender.email']}
                    />

                    <Input
                      label="Phone"
                      name="sender.phone"
                      value={formData.sender.phone}
                      onChange={handleInputChange}
                      required
                      icon={Phone}
                      error={errors['sender.phone']}
                    />

                    <div className="col-span-2">
                      <Input
                        label="Address Line 1"
                        name="sender.address.addressLine1"
                        value={formData.sender.address.addressLine1}
                        onChange={handleInputChange}
                        icon={MapPin}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        label="Address Line 2"
                        name="sender.address.addressLine2"
                        value={formData.sender.address.addressLine2}
                        onChange={handleInputChange}
                        icon={MapPin}
                      />
                    </div>

                    <Input
                      label="City"
                      name="sender.address.city"
                      value={formData.sender.address.city}
                      onChange={handleInputChange}
                    />

                    <Input
                      label="State"
                      name="sender.address.state"
                      value={formData.sender.address.state}
                      onChange={handleInputChange}
                    />

                    <Input
                      label="Country"
                      name="sender.address.country"
                      value={formData.sender.address.country}
                      onChange={handleInputChange}
                    /> 

                    {/* Pickup Required Checkbox */}
                    <div className="col-span-2 mt-2 pt-2 border-t">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pickupRequired}
                          onChange={(e) => setPickupRequired(e.target.checked)}
                          className="h-4 w-4 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          <TruckIcon className="h-4 w-4 inline mr-1 text-[#2563eb]" />
                          Pickup Required?
                        </span>
                        <span className="ml-2 text-xs text-gray-500">(Arrange pickup from sender location)</span>
                      </label>
                    </div>

                    {pickupRequired && (
                      <>
                        <Input
                          label="Pickup Date"
                          type="date"
                          name="sender.pickupDate"
                          value={formData.sender.pickupDate}
                          onChange={handleInputChange}
                          required
                          icon={Calendar}
                          min={new Date().toISOString().split('T')[0]}
                          error={errors['sender.pickupDate']}
                        />

                        <TextArea
                          label="Pickup Instructions"
                          name="sender.pickupInstructions"
                          value={formData.sender.pickupInstructions}
                          onChange={handleInputChange}
                          placeholder="Special instructions for pickup"
                          rows={2}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Receiver Information */}
                <div className="border rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <UserPlus className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Receiver Information
                    <span className="ml-2 text-xs text-blue-600">(Will receive email notification)</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Full Name"
                      name="receiver.name"
                      value={formData.receiver.name}
                      onChange={handleInputChange}
                      required
                      icon={User}
                      error={errors['receiver.name']}
                    />

                    <Input
                      label="Company Name"
                      name="receiver.companyName"
                      value={formData.receiver.companyName}
                      onChange={handleInputChange}
                      icon={Building}
                    />

                    <Input
                      label="Email"
                      type="email"
                      name="receiver.email"
                      value={formData.receiver.email}
                      onChange={handleInputChange}
                      required
                      icon={Mail}
                      error={errors['receiver.email']}
                    />

                    <Input
                      label="Phone"
                      name="receiver.phone"
                      value={formData.receiver.phone}
                      onChange={handleInputChange}
                      required
                      icon={Phone}
                      error={errors['receiver.phone']}
                    />

                    <div className="col-span-2">
                      <Input
                        label="Address Line 1"
                        name="receiver.address.addressLine1"
                        value={formData.receiver.address.addressLine1}
                        onChange={handleInputChange}
                        required
                        icon={MapPin}
                        error={errors['receiver.address.addressLine1']}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        label="Address Line 2"
                        name="receiver.address.addressLine2"
                        value={formData.receiver.address.addressLine2}
                        onChange={handleInputChange}
                        icon={MapPin}
                      />
                    </div>

                    {/* Country Dropdown */}
                    <Select
                      label="Country"
                      name="receiver.address.country"
                      value={formData.receiver.address.country}
                      onChange={handleDestinationChange}
                      options={DESTINATIONS}
                      required
                      icon={Globe}
                      error={errors['receiver.address.country']}
                    />

                    {/* State Dropdown */}
                    <Select
                      label="State"
                      name="receiver.address.state"
                      value={formData.receiver.address.state}
                      onChange={handleStateChange}
                      options={states.map(state => ({ value: state, label: state }))}
                      required
                      icon={MapPin}
                      error={errors['receiver.address.state']}
                      disabled={!formData.receiver.address.country || loadingLocation}
                      loading={loadingLocation}
                      placeholder={loadingLocation ? 'Loading states...' : 'Select state'}
                    />

                    {/* City Dropdown */}
                    <Select
                      label="City"
                      name="receiver.address.city"
                      value={formData.receiver.address.city}
                      onChange={handleCityChange}
                      options={cities.map(city => ({ value: city, label: city }))}
                      required
                      icon={MapPin}
                      error={errors['receiver.address.city']}
                      disabled={!formData.receiver.address.state || loadingLocation}
                      loading={loadingLocation}
                      placeholder={loadingLocation ? 'Loading cities...' : 'Select city'}
                    /> 

                    <div className="col-span-2">
                      <TextArea
                        label="Delivery Instructions"
                        name="receiver.deliveryInstructions"
                        value={formData.receiver.deliveryInstructions}
                        onChange={handleInputChange}
                        placeholder="Special instructions for delivery"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="receiver.isResidential"
                          checked={formData.receiver.isResidential}
                          onChange={handleInputChange}
                          className="h-3.5 w-3.5 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                        />
                        <span className="ml-2 text-xs text-gray-600">This is a residential address</span>
                      </label>
                    </div>
                  </div>

                  {/* Loading indicator */}
                  {loadingLocation && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-md flex items-center">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 mr-2" />
                      <span className="text-xs text-blue-600">Loading location data...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {currentStep === 4 && (
              <div className="space-y-3 animate-fadeIn">
                {/* Confirmation Required Banner */}
                {!isReviewConfirmed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="ml-2 flex-1">
                        <p className="text-xs font-medium text-yellow-800">Review Required</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Please review all details below. Once confirmed, click "Confirm Details" before submitting.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isReviewConfirmed && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="ml-2 flex-1">
                        <p className="text-xs font-medium text-green-800">Details Confirmed</p>
                        <p className="text-xs text-green-700 mt-1">
                          You can now submit the booking.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <Package className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Shipment Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Customer:</span>{' '}
                      <span className="font-medium">
                        {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>{' '}
                      <span className="font-medium">
                        {formData.shipmentClassification.mainType} - {formData.shipmentClassification.subType}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Mode:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.shippingMode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment:</span>{' '}
                      <span className="font-medium">{formData.payment.mode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Origin:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.origin}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Destination:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.destination}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Currency:</span>{' '}
                      <span className="font-medium">
                        {formData.payment.currency} ({CURRENCY_SYMBOLS[formData.payment.currency]})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>{' '}
                      <span className="font-medium">{formData.serviceType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Departure:</span>{' '}
                      <span className="font-medium">{new Date(formData.dates.estimatedDeparture).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Arrival:</span>{' '}
                      <span className="font-medium">{new Date(formData.dates.estimatedArrival).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pickup Required:</span>{' '}
                      <span className="font-medium">{pickupRequired ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <Box className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Package Summary
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.shipmentDetails.packageDetails.map((item, index) => (
                      <div key={index} className="text-xs border-b last:border-0 pb-1 last:pb-0">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-gray-500 flex justify-between">
                          <span>
                            {item.quantity} pcs | {item.weight} kg | {item.volume} CBM
                            {item.hazardous && ' ⚠️ Hazardous'}
                          </span>
                          {item.value.amount > 0 && (
                            <span className="font-medium">{formData.payment.currency} {item.value.amount.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Total Packages:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.totalPackages}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Weight:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.totalWeight.toFixed(1)} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Volume:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.totalVolume.toFixed(3)} CBM</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-md p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                      <User className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                      Sender
                    </h3>
                    <div className="text-xs">
                      <p className="font-medium">{formData.sender.name}</p>
                      {formData.sender.companyName && <p>{formData.sender.companyName}</p>}
                      <p className="text-gray-600 mt-1">📞 {formData.sender.phone}</p>
                      <p className="text-gray-600">✉️ {formData.sender.email}</p>
                      <p className="text-gray-600 mt-1">
                        {formData.sender.address.city}, {formData.sender.address.state}, {formData.sender.address.country}
                      </p>
                      {pickupRequired && formData.sender.pickupDate && (
                        <p className="text-blue-600 mt-1">📅 Pickup: {new Date(formData.sender.pickupDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-md p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                      <UserPlus className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                      Receiver
                    </h3>
                    <div className="text-xs">
                      <p className="font-medium">{formData.receiver.name}</p>
                      {formData.receiver.companyName && <p>{formData.receiver.companyName}</p>}
                      <p className="text-gray-600">{formData.receiver.address.addressLine1}</p>
                      <p className="text-gray-600">
                        {formData.receiver.address.city}, {formData.receiver.address.state} {formData.receiver.address.postalCode}
                      </p>
                      <p className="text-gray-600">{formData.receiver.address.country}</p>
                      <p className="text-gray-600 mt-1">📞 {formData.receiver.phone}</p>
                      <p className="text-gray-600">✉️ {formData.receiver.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-md p-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    <p className="text-xs text-green-700">
                      Booking will be created for {selectedCustomer?.firstName} {selectedCustomer?.lastName}. 
                      Confirmation email will be sent to receiver.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={prevStep}
                  icon={ChevronLeft}
                >
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={nextStep}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Next Step
                </Button>
              ) : (
                <div className="flex space-x-3">
                  {!isReviewConfirmed ? (
                    <Button
                      type="button"
                      variant="success"
                      size="sm"
                      onClick={handleConfirmReview}
                      icon={CheckCircle}
                    >
                      Confirm Details
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="success"
                      size="sm"
                      isLoading={isSubmitting}
                      icon={Save}
                    >
                      Create Booking
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Progress Summary */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {currentStep === 1 && "📦 Select customer, shipment type and destination country"}
            {currentStep === 2 && "📦 Add package details with packaging type"}
            {currentStep === 3 && "📦 Enter sender and receiver information"}
            {currentStep === 4 && "📦 Review and confirm booking - Click 'Confirm Details' then 'Create Booking'"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
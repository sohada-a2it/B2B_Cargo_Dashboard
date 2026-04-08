// app/admin/create-booking/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { createShipment } from '@/Api/shipping';
import { registerWithoutOTP } from '@/Api/Authentication'; // Make sure this import exists

// Location functions
import { getStates  ,fetchCitiesByState   } from '@/Api/location';

// Icons
import {
  Package, MapPin, Calendar, Weight, Box, FileText, ArrowLeft,
  Plus, Trash2, AlertCircle, CheckCircle, ChevronRight,
  ChevronLeft, Truck, Ship, Plane, Phone, Mail, 
  DollarSign, Building, Globe, Hash, Tag, Briefcase, Loader2, X, 
  User, Save, Info, Ruler, UserPlus, 
  CreditCard, Repeat, Anchor, History,
  Receipt, Clock, Flag, Check
} from 'lucide-react';
import { getAuthToken } from '@/helper/SessionHelper';

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
  { value: 'cash', label: 'Cash', icon: DollarSign },
  { value: 'wire_transfer', label: 'Wire Transfer', icon: CreditCard }
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

const CURRENCIES = ['USD', 'GBP', 'CAD'];
const CURRENCY_SYMBOLS = { 'USD': '$', 'GBP': '£', 'CAD': 'C$' };
const CURRENCY_BY_COUNTRY = { 'USA': 'USD', 'UK': 'GBP', 'Canada': 'CAD' };

const PRODUCT_CATEGORIES = [
  'Electronics', 'Furniture', 'Clothing', 'Machinery', 
  'Automotive', 'Pharmaceuticals', 'Food', 'Documents', 
  'Tires', 'Chemicals', 'Others'
];

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

const BOOKING_STATUSES = [
  { value: 'booking_requested', label: 'Booking Requested', color: 'blue', icon: Clock },
  { value: 'price_quoted', label: 'Price Quoted', color: 'purple', icon: DollarSign },
  { value: 'booking_confirmed', label: 'Booking Confirmed', color: 'green', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: X },
  { value: 'rejected', label: 'Rejected', color: 'red', icon: AlertCircle }
];

const SHIPMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'gray', icon: Clock },
  { value: 'picked_up_from_warehouse', label: 'Picked Up from Warehouse', color: 'blue', icon: Truck },
  { value: 'departed_port_of_origin', label: 'Departed Port of Origin', color: 'cyan', icon: Ship },
  { value: 'in_transit_sea_freight', label: 'In Transit (Sea Freight)', color: 'blue', icon: Ship },
  { value: 'arrived_at_destination_port', label: 'Arrived at Destination Port', color: 'cyan', icon: Anchor },
  { value: 'under_customs_cleared', label: 'Under Customs Cleared', color: 'green', icon: Flag },
  { value: 'customs_cleared', label: 'Customs Cleared', color: 'green', icon: Flag },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'orange', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'green', icon: CheckCircle },
  { value: 'on_hold', label: 'On Hold', color: 'yellow', icon: AlertCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: X },
  { value: 'returned', label: 'Returned', color: 'purple', icon: Repeat }
];

const SERVICE_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'overnight', label: 'Overnight' },
  { value: 'economy', label: 'Economy' }
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

const Input = ({ label, type = 'text', name, value, onChange, placeholder, error, required = false, disabled = false, icon: Icon }) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
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
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-md shadow-sm
            focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${Icon ? 'pl-8' : ''}
          `}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

const Select = ({ label, name, value, onChange, options, error, required = false, icon: Icon, placeholder = 'Select...', disabled = false }) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
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
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-md shadow-sm
            focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${Icon ? 'pl-8' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

const TextArea = ({ label, name, value, onChange, placeholder, error, rows = 3 }) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full px-3 py-2 text-sm border rounded-md shadow-sm
          focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
        `}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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

// ==================== MAIN COMPONENT ====================
export default function CreateBooking() {
    const router = useRouter();
  useEffect(() => {  // ← এই পুরো useEffect যোগ করুন
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, []); 
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [availableSubTypes, setAvailableSubTypes] = useState([]);
  const [isReviewConfirmed, setIsReviewConfirmed] = useState(false);
  
  // Location States
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Tracking Timeline State
  const [trackingTimeline, setTrackingTimeline] = useState([]);
  const [newTrackingStep, setNewTrackingStep] = useState({
    status: '',
    date: '',
    description: '',
    location: ''
  });

  // ===== FORM DATA STATE =====
  const [formData, setFormData] = useState({
    shipmentClassification: { mainType: '', subType: '' },
    serviceType: 'standard',
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
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
        productCategory: 'Others',
        hsCode: '',
        value: { amount: 0, currency: 'USD' },
        hazardous: false,
        temperatureControlled: { required: false }
      }],
      specialInstructions: '',
      referenceNumber: ''
    },
    dates: { estimatedDeparture: '', estimatedArrival: '' },
    quotedPrice: {
      amount: 0,
      currency: 'USD',
      breakdown: { baseRate: 0, weightCharge: 0, fuelSurcharge: 0, residentialSurcharge: 0, insurance: 0, tax: 0, otherCharges: 0 },
      notes: ''
    },
    payment: { mode: 'bank_transfer', currency: 'USD' },
    sender: {
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: { addressLine1: '', addressLine2: '', city: '', state: '', country: '', postalCode: '' },
      pickupDate: '',
      pickupInstructions: ''
    },
    receiver: {
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: { addressLine1: '', addressLine2: '', city: '', state: '', country: '', postalCode: '' },
      deliveryInstructions: '',
      isResidential: false
    },
    courier: { company: 'Cargo Logistics Group', serviceType: 'standard' },
    trackingNumber: '',
    status: 'booking_requested',
    pricingStatus: 'quoted',
    shipmentStatus: 'pending'
  });

  const [errors, setErrors] = useState({});

  // ==================== LOAD ADMIN USER ====================
  useEffect(() => {
    const loadInitialData = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setAdminUser(user);
      
      const initialTimeline = [{
        status: 'booking_requested',
        description: 'Booking created by admin',
        updatedBy: user?._id,
        timestamp: new Date()
      }];
      setTrackingTimeline(initialTimeline);
    };
    loadInitialData();
  }, []);

  // ==================== LOCATION FUNCTIONS ====================
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

  const loadPostalCodes = useCallback((country, city) => {
    if (!country || !city) return;
    
    setLoadingLocation(true);
    try {
      const postalData = getPostalCodes(country, city);
      if (postalData && postalData.length > 0) {
        setPostalCodes(postalData);
      } else {
        setPostalCodes([]);
      }
    } catch (error) {
      console.error('Error loading postal codes:', error);
      setPostalCodes([]);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

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
  };

  const handleDestinationChange = (e) => {
    const { value } = e.target;
    handleInputChange(e);
    
    if (value) {
      setStates([]);
      setCities([]);
      loadStates(value);
      
      const currencyCode = CURRENCY_BY_COUNTRY[value] || 'USD';
      
      setFormData(prev => ({
        ...prev,
        receiver: { ...prev.receiver, address: { ...prev.receiver.address, country: value, city: '', state: '' } },
        quotedPrice: { ...prev.quotedPrice, currency: currencyCode },
        payment: { ...prev.payment, currency: currencyCode }
      }));
      
      toast.success(`${value} selected - Currency: ${currencyCode} (${CURRENCY_SYMBOLS[currencyCode]})`);
    }
  };

  const handleStateChange = (e) => {
    const { value } = e.target;
    handleInputChange(e);
    
    if (value && formData.receiver.address.country) {
      setCities([]);
      loadCities(formData.receiver.address.country, value);
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
        item.volume = parseFloat(volume.toFixed(3));
      }
      
      return newData;
    });
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
            productCategory: 'Others',
            hsCode: '',
            value: { amount: 0, currency: prev.quotedPrice.currency || 'USD' },
            hazardous: false,
            temperatureControlled: { required: false }
          }
        ]
      }
    }));
    toast.success('New package added');
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
      toast.info('Package removed');
    }
  };

  // Calculate totals
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

  // Update sub types
  useEffect(() => {
    if (formData.shipmentClassification.mainType) {
      setAvailableSubTypes(SHIPMENT_SUB_TYPES[formData.shipmentClassification.mainType] || []);
    }
  }, [formData.shipmentClassification.mainType]);

  // Generate tracking number
 const generateTrackingNumber = () => {
    const prefix = 'CLG-';
    
    // Remove confusing characters (I, O, 0, 1)
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 24 letters (no I, O)
    const numbers = '23456789'; // 8 numbers (no 0, 1)
    
    let randomPart = '';
    
    // Add 2 random letters
    for (let i = 0; i < 2; i++) {
        randomPart += letters[Math.floor(Math.random() * letters.length)];
    }
    
    // Add 4 random numbers
    for (let i = 0; i < 4; i++) {
        randomPart += numbers[Math.floor(Math.random() * numbers.length)];
    }
    
    // Add 2 random letters
    for (let i = 0; i < 2; i++) {
        randomPart += letters[Math.floor(Math.random() * letters.length)];
    }
    
    const trackingNum = `${prefix}${randomPart}`;
    setFormData(prev => ({ ...prev, trackingNumber: trackingNum }));
    toast.success(`Tracking number generated: ${trackingNum}`);
};

  // ==================== TRACKING TIMELINE HANDLERS ====================
  const addTrackingStep = () => {
    if (!newTrackingStep.status) {
      toast.error('Please select a status');
      return;
    }
    if (!newTrackingStep.date) {
      toast.error('Please select a date and time');
      return;
    }

    const statusInfo = SHIPMENT_STATUSES.find(s => s.value === newTrackingStep.status) || 
                       BOOKING_STATUSES.find(s => s.value === newTrackingStep.status);
    
    const newStep = {
      status: newTrackingStep.status,
      description: newTrackingStep.description || statusInfo?.label || newTrackingStep.status,
      location: newTrackingStep.location,
      updatedBy: adminUser?._id,
      timestamp: new Date(newTrackingStep.date),
      metadata: { location: newTrackingStep.location }
    };

    const updatedTimeline = [...trackingTimeline, newStep];
    setTrackingTimeline(updatedTimeline);
    
    if (SHIPMENT_STATUSES.find(s => s.value === newTrackingStep.status)) {
      setFormData(prev => ({ ...prev, shipmentStatus: newTrackingStep.status }));
    }
    if (BOOKING_STATUSES.find(s => s.value === newTrackingStep.status)) {
      setFormData(prev => ({ ...prev, status: newTrackingStep.status }));
    }
    
    setNewTrackingStep({ status: '', date: '', description: '', location: '' });
    toast.success(`Status "${statusInfo?.label}" added to timeline`);
  };

  const removeTrackingStep = (index) => {
    if (index === 0) {
      toast.warning('Cannot remove the initial status');
      return;
    }
    const updatedTimeline = trackingTimeline.filter((_, i) => i !== index);
    setTrackingTimeline(updatedTimeline);
    toast.success('Status removed');
  };

  // ==================== CUSTOMER CREATION (UNCOMMENTED AND FIXED) ====================
  // In your create-booking/page.js - update createCustomerFromSender

const createCustomerFromSender = async (senderData) => {
  try {
    console.log("📝 Creating customer for:", senderData.email);
    
    const nameParts = senderData.name.trim().split(" ");
    const firstName = nameParts[0] || senderData.name;
    const lastName = nameParts.slice(1).join(" ") || "";
    
    // Generate a random password for the customer
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    
    const customerData = {
      firstName,
      lastName,
      email: senderData.email.toLowerCase(),
      password: randomPassword,
      phone: senderData.phone || "",
      role: "customer",
      companyName: senderData.companyName || "",
      companyAddress: senderData.address?.addressLine1 || "",
      businessType: "Trader",
      originCountries: ["China", "Thailand"],
      destinationMarkets: [formData.shipmentDetails.destination],
      provider: "local",
      isVerified: true,
      status: "active",
      isActive: true,
      emailVerified: true
    };

    console.log("📤 Sending customer data:", customerData);
    
    const response = await registerWithoutOTP(customerData);
    console.log("📥 Customer creation response:", response);
    
    // Extract customer ID from response
    let customerId = null;
    if (response && response.success) {
      customerId = response.data?._id || response.data?.id || response._id || response.id;
    }
    
    if (customerId) {
      toast.success(`✅ Customer created: ${senderData.email}`);
      return customerId;
    } else if (response && response.exists) {
      // User already exists
      toast.info(`ℹ️ Customer already exists: ${senderData.email}`);
      return response.data?._id || response.user?._id;
    } else {
      console.warn("⚠️ No customer ID in response");
      return null;
    }
    
  } catch (error) {
    console.error("❌ Error creating customer:", error);
    
    // Check if user already exists
    const errorMsg = error.response?.data?.message || error.message;
    if (errorMsg?.includes('duplicate') || errorMsg?.includes('already exists')) {
      toast.info(`ℹ️ Customer already exists: ${senderData.email}`);
      // Try to find existing customer
      try {
        // You may need to add a findCustomerByEmail API call here
        return null;
      } catch (e) {
        return null;
      }
    } else {
      toast.error(`❌ Customer creation failed: ${errorMsg}`);
    }
    return null;
  }
};

  // ==================== VALIDATION ====================
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;
    
    if (step === 1) {
      if (!formData.shipmentClassification.mainType) {
        newErrors.mainType = 'Shipment type required';
        isValid = false;
      }
      if (!formData.shipmentClassification.subType) {
        newErrors.subType = 'Sub-type required';
        isValid = false;
      }
      if (!formData.dates.estimatedDeparture) {
        newErrors.estimatedDeparture = 'Departure date required';
        isValid = false;
      }
      if (!formData.dates.estimatedArrival) {
        newErrors.estimatedArrival = 'Arrival date required';
        isValid = false;
      }
    }
    else if (step === 2) {
      formData.shipmentDetails.packageDetails.forEach((item, index) => {
        if (!item.description) {
          newErrors[`package_desc_${index}`] = 'Description required';
          isValid = false;
        }
        if (!item.quantity || item.quantity < 1) {
          newErrors[`package_qty_${index}`] = 'Valid quantity required';
          isValid = false;
        }
        if (!item.weight || item.weight <= 0) {
          newErrors[`package_weight_${index}`] = 'Weight required';
          isValid = false;
        }
      });
    }
    else if (step === 3) {
      if (!formData.sender.name) {
        newErrors.senderName = 'Sender name required';
        isValid = false;
      }
      if (!formData.sender.email) {
        newErrors.senderEmail = 'Sender email required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender.email)) {
        newErrors.senderEmail = 'Invalid email format';
        isValid = false;
      }
      if (!formData.sender.phone) {
        newErrors.senderPhone = 'Sender phone required';
        isValid = false;
      }
      if (!formData.receiver.name) {
        newErrors.receiverName = 'Receiver name required';
        isValid = false;
      }
      if (!formData.receiver.email) {
        newErrors.receiverEmail = 'Receiver email required';
        isValid = false;
      }
      if (!formData.receiver.phone) {
        newErrors.receiverPhone = 'Receiver phone required';
        isValid = false;
      }
      if (!formData.receiver.address.addressLine1) {
        newErrors.receiverAddress = 'Receiver address required';
        isValid = false;
      }
      if (!formData.receiver.address.city) {
        newErrors.receiverCity = 'City required';
        isValid = false;
      }
      if (!formData.receiver.address.state) {
        newErrors.receiverState = 'State required';
        isValid = false;
      }
      if (!formData.receiver.address.country) {
        newErrors.receiverCountry = 'Country required';
        isValid = false;
      }
      if (!formData.quotedPrice.amount || formData.quotedPrice.amount <= 0) {
        newErrors.priceAmount = 'Valid price amount required';
        isValid = false;
      }
    }
    else if (step === 4) {
      if (!formData.trackingNumber) {
        newErrors.trackingNumber = 'Tracking number required';
        isValid = false;
      }
      if (trackingTimeline.length === 0) {
        newErrors.timeline = 'At least one status update required';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    
    if (!isValid) {
      toast.error('Please fill all required fields');
    }
    
    return isValid;
  };

  // ==================== STEP NAVIGATION ====================
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      if (currentStep + 1 === 5) {
        setIsReviewConfirmed(false);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleConfirmReview = () => {
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    const step4Valid = validateStep(4);
    
    if (step1Valid && step2Valid && step3Valid && step4Valid) {
      setIsReviewConfirmed(true);
      toast.success('All details confirmed! You can now submit.');
    } else {
      toast.error('Please complete all required fields');
    }
  };

  // ==================== SUBMIT HANDLER ====================
 // লাইন 807 এর কাছাকাছি - handleSubmit ফাংশন আপডেট করুন

const handleSubmit = async (e) => {
  e.preventDefault();

  if (currentStep !== 5) {
    toast.info('Please complete all steps first');
    return;
  }

  if (!isReviewConfirmed) {
    toast.warning('Please review and confirm details before submitting');
    return;
  }

  // Auto-generate tracking number if empty
  if (!formData.trackingNumber) {
    generateTrackingNumber();
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (!formData.trackingNumber) {
    toast.error('Please generate a tracking number');
    return;
  }

  // ========== 🔥 CREATE CUSTOMER FROM SENDER ==========
  let customerId = null;
  if (formData.sender.email) {
    customerId = await createCustomerFromSender(formData.sender);
    if (!customerId) {
      toast.warning('Could not create/find customer. Shipment will be created without customer link.');
    }
  }

  const loadingToast = toast.loading('Creating shipment...');
  setIsSubmitting(true);
  setServerErrors([]);

  try {
    // Build timeline entries
    const timelineEntries = trackingTimeline.map(entry => ({
      status: entry.status,
      description: entry.description || '',
      updatedBy: adminUser?._id,
      timestamp: entry.timestamp || new Date(),
      metadata: entry.metadata || {}
    }));

    if (timelineEntries.length === 0) {
      timelineEntries.push({
        status: formData.status || 'booking_requested',
        description: 'Shipment created',
        updatedBy: adminUser?._id,
        timestamp: new Date()
      });
    }

    // Build shipment payload with customerId
    const shipmentData = {
      createdBy: adminUser?._id,
      customer: customerId,  // ← Add customer ID here
      serviceType: formData.serviceType,
      shipmentClassification: {
        mainType: formData.shipmentClassification.mainType,
        subType: formData.shipmentClassification.subType
      },
      shipmentDetails: {
        origin: formData.shipmentDetails.origin,
        destination: formData.shipmentDetails.destination,
        shippingMode: formData.shipmentDetails.shippingMode,
        packageDetails: formData.shipmentDetails.packageDetails.map(pkg => ({
          description: pkg.description,
          packagingType: pkg.packagingType || 'carton',
          quantity: Number(pkg.quantity) || 1,
          weight: Number(pkg.weight) || 0,
          volume: Number(pkg.volume) || 0,
          dimensions: pkg.dimensions || {},
          productCategory: pkg.productCategory || 'Others',
          hsCode: pkg.hsCode || '',
          value: { 
            amount: Number(pkg.value?.amount) || 0, 
            currency: pkg.value?.currency || formData.quotedPrice.currency 
          },
          hazardous: pkg.hazardous || false,
          temperatureControlled: pkg.temperatureControlled || { required: false }
        })),
        specialInstructions: formData.shipmentDetails.specialInstructions || '',
        referenceNumber: formData.shipmentDetails.referenceNumber || ''
      },
      dates: {
        estimatedDeparture: formData.dates.estimatedDeparture,
        estimatedArrival: formData.dates.estimatedArrival
      },
      quotedPrice: {
        amount: Number(formData.quotedPrice.amount),
        currency: formData.quotedPrice.currency,
        breakdown: formData.quotedPrice.breakdown || {},
        notes: formData.quotedPrice.notes || '',
        quotedBy: adminUser?._id,
        quotedAt: new Date()
      },
      pricingStatus: formData.pricingStatus,
      payment: {
        mode: formData.payment.mode,
        currency: formData.payment.currency,
        amount: Number(formData.quotedPrice.amount)
      },
      sender: formData.sender,
      receiver: formData.receiver,
      courier: {
        company: formData.courier.company,
        serviceType: formData.serviceType
      },
      trackingNumber: formData.trackingNumber,
      status: formData.status,
      shipmentStatus: formData.shipmentStatus,
      timeline: timelineEntries
    };

    console.log('📤 Submitting shipment data:', shipmentData);
    console.log('👤 Customer ID:', customerId);
    
    const response = await createShipment(shipmentData);
    
    console.log('📥 Response from createShipment:', response);
    toast.dismiss(loadingToast);

    if (response && response.success === true) {
      toast.success(`✅ Shipment created successfully!`);
      toast.success(`Tracking Number: ${formData.trackingNumber}`);
      if (customerId) {
        toast.success(`✅ Customer linked: ${formData.sender.email}`);
      }
      setShowSuccess(true);
      
      setTimeout(() => {
        router.push('/shippings/manual-shipping');
      }, 2000);
    } else {
      const errorMsg = response?.message || 'Failed to create shipment';
      console.error('❌ Shipment creation failed:', errorMsg);
      toast.error(errorMsg);
      setServerErrors([{ msg: errorMsg }]);
    }

  } catch (error) {
    console.error('❌ Submit error:', error);
    toast.dismiss(loadingToast);
    
    const errorMessage = error.response?.data?.message || error.message || 'Shipment creation failed';
    toast.error(errorMessage);
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
              <Link href="/bookings" className="p-1.5 hover:bg-gray-100 rounded-md">
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-base font-semibold text-gray-900 flex items-center">
                  <Package className="h-4 w-4 mr-1.5 text-[#2563eb]" />
                  Create New Booking
                </h1>
                <p className="text-xs text-gray-500">Customer auto-created from sender email | Add tracking status updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">Step {currentStep}/5</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className={`h-1 w-5 rounded-full ${step <= currentStep ? 'bg-[#2563eb]' : 'bg-gray-200'}`} />
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
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="ml-2 flex-1">
                <p className="text-xs font-medium text-red-800">Error creating booking</p>
                {serverErrors.map((error, index) => (
                  <p key={index} className="text-xs text-red-600">{error.msg}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
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
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <StepIndicator step={1} currentStep={currentStep} title="Shipment Type" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={2} currentStep={currentStep} title="Package" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={3} currentStep={currentStep} title="Parties & Price" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={4} currentStep={currentStep} title="Status & Tracking" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={5} currentStep={currentStep} title="Review" />
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4">
            {/* Step 1: Shipment Info */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-md p-2 mb-2">
                  <div className="flex items-start">
                    <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-1.5" />
                    <p className="text-xs text-blue-700">
                      Customer will be automatically created from sender email. No password needed - Google login supported.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Shipment Type"
                    name="shipmentClassification.mainType"
                    value={formData.shipmentClassification.mainType}
                    onChange={handleInputChange}
                    options={SHIPMENT_MAIN_TYPES}
                    required
                    icon={Package}
                    error={errors.mainType}
                  />
                  
                  <Select
                    label="Shipment Sub-Type"
                    name="shipmentClassification.subType"
                    value={formData.shipmentClassification.subType}
                    onChange={handleInputChange}
                    options={availableSubTypes}
                    required
                    icon={Tag}
                    error={errors.subType}
                    disabled={!formData.shipmentClassification.mainType}
                  />
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
                  />
                  
                  <Select
                    label="Destination"
                    name="shipmentDetails.destination"
                    value={formData.shipmentDetails.destination}
                    onChange={handleDestinationChange}
                    options={DESTINATIONS}
                    required
                    icon={Globe}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Departure Date"
                    type="date"
                    name="dates.estimatedDeparture"
                    value={formData.dates.estimatedDeparture}
                    onChange={handleInputChange}
                    required
                    icon={Calendar}
                    error={errors.estimatedDeparture}
                  />
                  
                  <Input
                    label="Arrival Date"
                    type="date"
                    name="dates.estimatedArrival"
                    value={formData.dates.estimatedArrival}
                    onChange={handleInputChange}
                    required
                    icon={Calendar}
                    error={errors.estimatedArrival}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Shipping Mode (Incoterm)"
                    name="shipmentDetails.shippingMode"
                    value={formData.shipmentDetails.shippingMode}
                    onChange={handleInputChange}
                    options={SHIPPING_MODES}
                    icon={Briefcase}
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
              </div>
            )}

            {/* Step 2: Package Details */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-medium text-gray-700">Package Details</h3>
                  <span className="text-xs text-gray-500">{formData.shipmentDetails.packageDetails.length} package(s)</span>
                </div>

                {formData.shipmentDetails.packageDetails.map((item, index) => (
                  <div key={index} className="border rounded-md p-3 bg-gray-50 relative">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePackageItem(index)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-0.5 hover:bg-red-200"
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

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Dimensions (cm)</label>
                        <div className="grid grid-cols-3 gap-2">
                          <Input placeholder="Length" type="number" value={item.dimensions.length}
                            onChange={(e) => handlePackageChange(index, 'dimensions.length', parseFloat(e.target.value) || 0)} />
                          <Input placeholder="Width" type="number" value={item.dimensions.width}
                            onChange={(e) => handlePackageChange(index, 'dimensions.width', parseFloat(e.target.value) || 0)} />
                          <Input placeholder="Height" type="number" value={item.dimensions.height}
                            onChange={(e) => handlePackageChange(index, 'dimensions.height', parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input type="checkbox" checked={item.hazardous}
                            onChange={(e) => handlePackageChange(index, 'hazardous', e.target.checked)}
                            className="h-3.5 w-3.5 text-[#2563eb] rounded" />
                          <span className="ml-2 text-xs text-gray-600">Hazardous Material</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={addPackageItem} icon={Plus} className="w-full">
                  Add Another Package
                </Button>

                {formData.shipmentDetails.packageDetails.length > 0 && (
                  <div className="bg-blue-50 rounded-md p-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Total Packages</div>
                        <div className="text-sm font-semibold text-[#2563eb]">{formData.shipmentDetails.totalPackages}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Weight</div>
                        <div className="text-sm font-semibold text-[#2563eb]">{formData.shipmentDetails.totalWeight?.toFixed(1) || 0} kg</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Volume</div>
                        <div className="text-sm font-semibold text-[#2563eb]">{formData.shipmentDetails.totalVolume?.toFixed(3) || 0} CBM</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Sender, Receiver & PRICE */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Sender Information */}
                <div className="border rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <User className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Sender Information <span className="ml-2 text-xs text-green-600">(Auto-created as customer - Google Auth ready)</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Full Name" name="sender.name" value={formData.sender.name} onChange={handleInputChange} required icon={User} error={errors.senderName} />
                    <Input label="Company Name" name="sender.companyName" value={formData.sender.companyName} onChange={handleInputChange} icon={Building} />
                    <Input label="Email" type="email" name="sender.email" value={formData.sender.email} onChange={handleInputChange} required icon={Mail} error={errors.senderEmail} />
                    <Input label="Phone" name="sender.phone" value={formData.sender.phone} onChange={handleInputChange} required icon={Phone} error={errors.senderPhone} />
                    <div className="col-span-2">
                      <Input label="Address Line 1" name="sender.address.addressLine1" value={formData.sender.address.addressLine1} onChange={handleInputChange} icon={MapPin} />
                    </div>
                    <div className="col-span-2">
                      <Input label="Address Line 2" name="sender.address.addressLine2" value={formData.sender.address.addressLine2} onChange={handleInputChange} icon={MapPin} />
                    </div>
                    <Input label="City" name="sender.address.city" value={formData.sender.address.city} onChange={handleInputChange} />
                    <Input label="State" name="sender.address.state" value={formData.sender.address.state} onChange={handleInputChange} />
                    <Input label="Country" name="sender.address.country" value={formData.sender.address.country} onChange={handleInputChange} />
                    <Input label="Postal Code" name="sender.address.postalCode" value={formData.sender.address.postalCode} onChange={handleInputChange} />
                    <Input label="Pickup Date" type="date" name="sender.pickupDate" value={formData.sender.pickupDate} onChange={handleInputChange} icon={Calendar} />
                    <div className="col-span-2">
                      <TextArea label="Pickup Instructions" name="sender.pickupInstructions" value={formData.sender.pickupInstructions} onChange={handleInputChange} placeholder="Special instructions for pickup" rows={2} />
                    </div>
                  </div>
                </div>

                {/* Receiver Information */}
                <div className="border rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <UserPlus className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Receiver Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Full Name" name="receiver.name" value={formData.receiver.name} onChange={handleInputChange} required icon={User} error={errors.receiverName} />
                    <Input label="Company Name" name="receiver.companyName" value={formData.receiver.companyName} onChange={handleInputChange} icon={Building} />
                    <Input label="Email" type="email" name="receiver.email" value={formData.receiver.email} onChange={handleInputChange} required icon={Mail} error={errors.receiverEmail} />
                    <Input label="Phone" name="receiver.phone" value={formData.receiver.phone} onChange={handleInputChange} required icon={Phone} error={errors.receiverPhone} />
                    <div className="col-span-2">
                      <Input label="Address Line 1" name="receiver.address.addressLine1" value={formData.receiver.address.addressLine1} onChange={handleInputChange} required icon={MapPin} error={errors.receiverAddress} />
                    </div>
                    <div className="col-span-2">
                      <Input label="Address Line 2" name="receiver.address.addressLine2" value={formData.receiver.address.addressLine2} onChange={handleInputChange} icon={MapPin} />
                    </div>
                    <Select label="Country" name="receiver.address.country" value={formData.receiver.address.country} onChange={handleDestinationChange} options={DESTINATIONS} required error={errors.receiverCountry} />
                    <Select label="State" name="receiver.address.state" value={formData.receiver.address.state} onChange={handleStateChange} options={states.map(s => ({ value: s, label: s }))} required error={errors.receiverState} disabled={!formData.receiver.address.country} />
                    <Select label="City" name="receiver.address.city" value={formData.receiver.address.city} onChange={handleInputChange} options={cities.map(c => ({ value: c, label: c }))} required error={errors.receiverCity} disabled={!formData.receiver.address.state} />
                    <Input label="Postal Code" name="receiver.address.postalCode" value={formData.receiver.address.postalCode} onChange={handleInputChange} />
                    <div className="col-span-2">
                      <TextArea label="Delivery Instructions" name="receiver.deliveryInstructions" value={formData.receiver.deliveryInstructions} onChange={handleInputChange} placeholder="Special instructions for delivery" rows={2} />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="receiver.isResidential" checked={formData.receiver.isResidential} onChange={handleInputChange} className="h-3.5 w-3.5 text-[#2563eb] rounded" />
                        <span className="ml-2 text-xs text-gray-600">This is a residential address</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* PRICE INPUT FIELD */}
                <div className="border rounded-md p-3 bg-yellow-50 border-yellow-200">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <Receipt className="h-3.5 w-3.5 mr-1 text-green-600" />
                    Booking Price
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Price Amount"
                      type="number"
                      name="quotedPrice.amount"
                      value={formData.quotedPrice.amount}
                      onChange={handleInputChange}
                      required
                      icon={DollarSign}
                      error={errors.priceAmount}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={`${formData.quotedPrice.currency} (${CURRENCY_SYMBOLS[formData.quotedPrice.currency] || '$'})`}
                          disabled
                          className="w-full px-3 py-2 pl-8 text-sm border rounded-md bg-gray-100 text-gray-700"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Based on destination country</p>
                    </div>
                  </div>
                  <TextArea label="Price Notes" name="quotedPrice.notes" value={formData.quotedPrice.notes} onChange={handleInputChange} placeholder="Any notes about pricing (optional)" rows={2} />
                </div>

                <Select
                  label="Payment Mode"
                  name="payment.mode"
                  value={formData.payment.mode}
                  onChange={handleInputChange}
                  options={PAYMENT_MODES}
                  icon={CreditCard}
                />
              </div>
            )}

            {/* Step 4: Status & Tracking */}
            {currentStep === 4 && (
              <div className="space-y-3">
                {/* Tracking Number */}
                <div className="border rounded-md p-3 bg-gray-50">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <Hash className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Tracking Number
                  </h3>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        label="Tracking Number"
                        name="trackingNumber"
                        value={formData.trackingNumber}
                        onChange={handleInputChange}
                        placeholder="Enter or generate tracking number"
                        required
                        icon={Hash}
                        error={errors.trackingNumber}
                      />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={generateTrackingNumber} icon={Plus} className="mb-3">
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Status Timeline - Add New Status */}
                <div className="border rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-3 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Add Status Update
                  </h3>
                  
                  <div className="bg-blue-50 rounded-md p-3 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Select Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newTrackingStep.status}
                          onChange={(e) => setNewTrackingStep(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        >
                          <option value="">Select a status...</option>
                          <optgroup label="Booking Statuses">
                            {BOOKING_STATUSES.map(status => (
                              <option key={status.value} value={status.value}>
                                📋 {status.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Shipment Statuses">
                            {SHIPMENT_STATUSES.map(status => (
                              <option key={status.value} value={status.value}>
                                🚚 {status.label}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      <Input
                        label="Date & Time"
                        type="datetime-local"
                        value={newTrackingStep.date}
                        onChange={(e) => setNewTrackingStep(prev => ({ ...prev, date: e.target.value }))}
                        required
                        icon={Calendar}
                      />
                      <Input
                        label="Location (Optional)"
                        placeholder="e.g., Shanghai Port, Customs Office"
                        value={newTrackingStep.location}
                        onChange={(e) => setNewTrackingStep(prev => ({ ...prev, location: e.target.value }))}
                        icon={MapPin}
                      />
                      <div className="col-span-2">
                        <TextArea
                          label="Description (Optional)"
                          placeholder="Additional details about this status update"
                          value={newTrackingStep.description}
                          onChange={(e) => setNewTrackingStep(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button type="button" variant="primary" size="sm" onClick={addTrackingStep} icon={Plus} className="w-full mt-2">
                      Add to Timeline
                    </Button>
                  </div>

                  {/* Timeline Display */}
                  <div className="mt-4">
                    <h3 className="text-xs font-medium text-gray-700 mb-3 flex items-center">
                      <History className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                      Status Timeline
                    </h3>
                    
                    {trackingTimeline.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No status updates yet. Add your first status above.</p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {trackingTimeline.map((step, index) => {
                          const isBookingStatus = BOOKING_STATUSES.find(s => s.value === step.status);
                          const isShipmentStatus = SHIPMENT_STATUSES.find(s => s.value === step.status);
                          const statusInfo = isBookingStatus || isShipmentStatus;
                          
                          let colorClass = 'bg-blue-500';
                          if (step.status === 'cancelled') colorClass = 'bg-red-500';
                          else if (step.status === 'delivered') colorClass = 'bg-green-500';
                          else if (step.status === 'booking_confirmed') colorClass = 'bg-green-500';
                          else if (step.status === 'on_hold') colorClass = 'bg-yellow-500';
                          
                          return (
                            <div key={index} className="relative pl-6 pb-3 border-l border-gray-200 ml-2">
                              <div className={`absolute left-[-6px] top-0 w-3 h-3 rounded-full ${colorClass}`}></div>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-medium text-gray-900">
                                      {statusInfo?.label || step.status}
                                    </p>
                                    {isBookingStatus && (
                                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">Booking</span>
                                    )}
                                    {isShipmentStatus && (
                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Shipment</span>
                                    )}
                                  </div>
                                  {step.description && (
                                    <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
                                  )}
                                  {step.location && (
                                    <p className="text-xs text-gray-400 mt-0.5">📍 {step.location}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {new Date(step.timestamp).toLocaleString()}
                                  </span>
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => removeTrackingStep(index)}
                                      className="text-red-400 hover:text-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {errors.timeline && (
                      <p className="mt-2 text-xs text-red-500">{errors.timeline}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-3">
                {!isReviewConfirmed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="ml-2">
                        <p className="text-xs font-medium text-yellow-800">Review Required</p>
                        <p className="text-xs text-yellow-700">Please review all details below, then click "Confirm Details"</p>
                      </div>
                    </div>
                  </div>
                )}

                {isReviewConfirmed && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="ml-2">
                        <p className="text-xs font-medium text-green-800">Details Confirmed</p>
                        <p className="text-xs text-green-700">You can now submit the booking.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Shipment Overview</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Type:</span> {formData.shipmentClassification.mainType} - {formData.shipmentClassification.subType}</div>
                    <div><span className="text-gray-500">Origin → Destination:</span> {formData.shipmentDetails.origin} → {formData.shipmentDetails.destination}</div>
                    <div><span className="text-gray-500">Departure:</span> {formData.dates.estimatedDeparture}</div>
                    <div><span className="text-gray-500">Arrival:</span> {formData.dates.estimatedArrival}</div>
                    <div><span className="text-gray-500">Shipping Mode:</span> {formData.shipmentDetails.shippingMode}</div>
                    <div><span className="text-gray-500">Service Type:</span> {formData.serviceType}</div>
                    <div className="col-span-2"><span className="text-gray-500">Price:</span> <span className="font-bold text-green-600">{formData.quotedPrice.currency} {formData.quotedPrice.amount.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Tracking:</span> <span className="font-mono">{formData.trackingNumber}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Package Summary</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {formData.shipmentDetails.packageDetails.map((item, index) => (
                      <div key={index} className="text-xs border-b pb-1">
                        <span className="font-medium">{item.description}</span> - {item.quantity} pcs, {item.weight} kg
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-2 text-xs">
                    <div>Total: {formData.shipmentDetails.totalPackages} pcs</div>
                    <div>Weight: {formData.shipmentDetails.totalWeight?.toFixed(1) || 0} kg</div>
                    <div>Volume: {formData.shipmentDetails.totalVolume?.toFixed(3) || 0} CBM</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-md p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-1">Sender</h3>
                    <p className="text-xs">{formData.sender.name}</p>
                    <p className="text-xs text-gray-500">{formData.sender.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-1">Receiver</h3>
                    <p className="text-xs">{formData.receiver.name}</p>
                    <p className="text-xs text-gray-500">{formData.receiver.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Status Timeline</h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {trackingTimeline.map((step, index) => (
                      <div key={index} className="text-xs flex justify-between border-b pb-1">
                        <span className="font-medium">{step.status}</span>
                        <span className="text-gray-500">{new Date(step.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-md p-2">
                  <p className="text-xs text-blue-700 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Customer will be auto-created from sender email. Status timeline will track shipment progress.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t">
              {currentStep > 1 && (
                <Button type="button" variant="secondary" size="sm" onClick={prevStep} icon={ChevronLeft}>
                  Back
                </Button>
              )}
              {currentStep < 5 ? (
                <div className="flex-1 flex justify-end">
                  <Button type="button" variant="primary" size="sm" onClick={nextStep} icon={ChevronRight} iconPosition="right">
                    Next
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex justify-end space-x-3">
                  {!isReviewConfirmed ? (
                    <Button type="button" variant="success" size="sm" onClick={handleConfirmReview} icon={CheckCircle}>
                      Confirm Details
                    </Button>
                  ) : (
                    <Button type="submit" variant="success" size="sm" isLoading={isSubmitting} icon={Save}>
                      Create Booking
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
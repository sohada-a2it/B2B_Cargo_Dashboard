// app/admin/users/[id]/edit/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getUserById, updateUser, isAdmin } from '@/Api/Authentication';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiPackage,
  FiTruck,
  FiBriefcase,
  FiMapPin,
  FiGlobe,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiKey,
  FiEdit3,
  FiBell
} from 'react-icons/fi';
import {
  FaBuilding,
  FaWarehouse,
  FaRegBuilding,
  FaIndustry,
  FaVat
} from 'react-icons/fa';
import { MdBusiness, MdSecurity, MdVerified } from 'react-icons/md';
import { BsPersonBadge, BsShop, BsCurrencyDollar } from 'react-icons/bs';

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      router.push('/dashboard');
      toast.error('Unauthorized access');
      return;
    }

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await getUserById(userId);
      if (response?.success) {
        setUser(response.data);
        initializeFormData(response.data);
      } else {
        toast.error('Failed to fetch user details');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error(error?.message || 'Failed to fetch user details');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (userData) => {
    setFormData({
      // Common fields
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      photo: userData.photo || '',
      
      // Customer fields
      companyName: userData.companyName || '',
      companyAddress: userData.companyAddress || '',
      companyVAT: userData.companyVAT || '',
      businessType: userData.businessType || 'Trader',
      industry: userData.industry || '',
      originCountries: userData.originCountries || [],
      destinationMarkets: userData.destinationMarkets || [],
      
      // Staff fields
      employeeId: userData.employeeId || '',
      department: userData.department || '',
      designation: userData.designation || '',
      employmentDate: userData.employmentDate ? new Date(userData.employmentDate).toISOString().split('T')[0] : '',
      
      // Warehouse fields
      warehouseLocation: userData.warehouseLocation || '',
      warehouseAccess: userData.warehouseAccess || [],
      
      // Admin fields
      adminLevel: userData.adminLevel || 'admin',
      accessLevel: userData.accessLevel || 'full',
      canCreateStaff: userData.canCreateStaff ?? true,
      canApprovePayments: userData.canApprovePayments ?? true,
      
      // Status
      status: userData.status || 'active',
      
      // Preferences
      timezone: userData.timezone || 'UTC',
      preferredCurrency: userData.preferredCurrency || 'USD',
      language: userData.language || 'en',
      
      // Notification preferences
      notificationPreferences: {
        emailNotifications: userData.notificationPreferences?.emailNotifications ?? true,
        shipmentUpdates: userData.notificationPreferences?.shipmentUpdates ?? true,
        invoiceNotifications: userData.notificationPreferences?.invoiceNotifications ?? true,
        marketingEmails: userData.notificationPreferences?.marketingEmails ?? false
      },
      
      // Admin notes
      adminNotes: userData.adminNotes || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      // Handle nested objects (e.g., notificationPreferences.emailNotifications)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayInput = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await updateUser(userId, formData);
      if (response?.success) {
        toast.success('User updated successfully!', {
          icon: '✅',
          position: "top-right",
          autoClose: 3000
        });
        router.push(`/users/${userId}`);
      } else {
        toast.error(response?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <FiShield className="w-5 h-5" />;
      case 'operations': return <FiPackage className="w-5 h-5" />;
      case 'warehouse': return <FiTruck className="w-5 h-5" />;
      default: return <FiUser className="w-5 h-5" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-red-500';
      case 'operations': return 'bg-blue-500';
      case 'warehouse': return 'bg-purple-500';
      default: return 'bg-green-500';
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FiUser },
    { id: 'role-specific', label: `${user?.role === 'customer' ? 'Business' : 'Professional'} Details`, icon: user?.role === 'customer' ? FaBuilding : FiBriefcase },
    { id: 'preferences', label: 'Preferences', icon: FiGlobe },
    { id: 'security', label: 'Security & Status', icon: FiShield }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#E67E22] mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiEdit3 className="w-6 h-6 text-[#E67E22] animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading user data...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're trying to edit doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-6 py-3 bg-[#E67E22] text-white rounded-xl hover:bg-[#d35400] transition-colors inline-flex items-center font-medium shadow-lg shadow-orange-200"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
                <p className="text-xs text-gray-500">Editing {user.firstName} {user.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/users/${userId}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-[#E67E22] text-white rounded-xl hover:bg-[#d35400] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center shadow-lg shadow-orange-200"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className={`h-20  relative`}></div>
          <div className="px-6 pb-6">
            <div className="flex items-center -mt-8">
              <div className={`w-16 h-16 rounded-xl bg-white p-1 shadow-xl`}>
                <div className={`w-full h-full rounded-lg ${getRoleColor()} flex items-center justify-center text-white text-xl font-bold`}>
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {getRoleIcon()}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <nav className="flex px-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'border-[#E67E22] text-[#E67E22] bg-orange-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-[#E67E22]' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiUser className="w-5 h-5 mr-2 text-[#E67E22]" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'role-specific' && (
            <div className="space-y-6">
              {user.role === 'customer' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaBuilding className="w-5 h-5 mr-2 text-[#E67E22]" />
                    Business Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VAT Number
                      </label>
                      <input
                        type="text"
                        name="companyVAT"
                        value={formData.companyVAT}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        placeholder="Enter VAT number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                      >
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="Trader">Trader</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Retailer">Retailer</option>
                        <option value="Importer">Importer</option>
                        <option value="Exporter">Exporter</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        placeholder="Enter industry"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Address
                    </label>
                    <textarea
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                      placeholder="Enter company address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origin Countries (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.originCountries.join(', ')}
                        onChange={(e) => handleArrayInput('originCountries', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        placeholder="e.g., China, Thailand, Vietnam"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Markets (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.destinationMarkets.join(', ')}
                        onChange={(e) => handleArrayInput('destinationMarkets', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        placeholder="e.g., USA, UK, Canada"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBriefcase className="w-5 h-5 mr-2 text-[#E67E22]" />
                    Professional Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        placeholder="Enter employee ID"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        placeholder="Enter department"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        placeholder="Enter designation"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Date
                      </label>
                      <input
                        type="date"
                        name="employmentDate"
                        value={formData.employmentDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  {user.role === 'warehouse' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warehouse Location
                        </label>
                        <input
                          type="text"
                          name="warehouseLocation"
                          value={formData.warehouseLocation}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                          placeholder="Enter warehouse location"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warehouse Access (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formData.warehouseAccess.join(', ')}
                          onChange={(e) => handleArrayInput('warehouseAccess', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                          placeholder="e.g., China_Warehouse, USA_Warehouse"
                        />
                      </div>
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Level
                        </label>
                        <select
                          name="adminLevel"
                          value={formData.adminLevel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Access Level
                        </label>
                        <select
                          name="accessLevel"
                          value={formData.accessLevel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                        >
                          <option value="full">Full Access</option>
                          <option value="limited">Limited Access</option>
                          <option value="financial_only">Financial Only</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="canCreateStaff"
                            checked={formData.canCreateStaff}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                          />
                          <span className="text-sm text-gray-700">Can Create Staff</span>
                        </label>
                        
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="canApprovePayments"
                            checked={formData.canApprovePayments}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                          />
                          <span className="text-sm text-gray-700">Can Approve Payments</span>
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiGlobe className="w-5 h-5 mr-2 text-[#E67E22]" />
                Regional Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Dhaka">Dhaka</option>
                    <option value="Asia/Singapore">Singapore</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Currency
                  </label>
                  <select
                    name="preferredCurrency"
                    value={formData.preferredCurrency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="THB">THB (฿)</option>
                    <option value="CNY">CNY (¥)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                  >
                    <option value="en">English</option>
                    <option value="th">ไทย (Thai)</option>
                    <option value="zh">中文 (Chinese)</option>
                    <option value="fr">Français (French)</option>
                    <option value="es">Español (Spanish)</option>
                  </select>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8 flex items-center">
                <FiBell className="w-5 h-5 mr-2 text-[#E67E22]" />
                Notification Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-[#E67E22] transition-all">
                  <span className="text-sm text-gray-700">Email Notifications</span>
                  <input
                    type="checkbox"
                    name="notificationPreferences.emailNotifications"
                    checked={formData.notificationPreferences?.emailNotifications}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-[#E67E22] transition-all">
                  <span className="text-sm text-gray-700">Shipment Updates</span>
                  <input
                    type="checkbox"
                    name="notificationPreferences.shipmentUpdates"
                    checked={formData.notificationPreferences?.shipmentUpdates}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-[#E67E22] transition-all">
                  <span className="text-sm text-gray-700">Invoice Notifications</span>
                  <input
                    type="checkbox"
                    name="notificationPreferences.invoiceNotifications"
                    checked={formData.notificationPreferences?.invoiceNotifications}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-[#E67E22] transition-all">
                  <span className="text-sm text-gray-700">Marketing Emails</span>
                  <input
                    type="checkbox"
                    name="notificationPreferences.marketingEmails"
                    checked={formData.notificationPreferences?.marketingEmails}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiShield className="w-5 h-5 mr-2 text-[#E67E22]" />
                Account Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-300">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  name="adminNotes"
                  value={formData.adminNotes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
                  placeholder="Add private notes about this user (visible only to admins)"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <FiShield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Password Management</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      To reset this user's password, they need to use the "Forgot Password" option on the login page.
                      Passwords cannot be changed directly by admins for security reasons.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;
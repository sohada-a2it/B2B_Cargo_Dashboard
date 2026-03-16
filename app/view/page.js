// app/users/[id]/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getUserById, isAdmin } from '@/Api/Authentication';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiPhone,
  FiCalendar,
  FiShield,
  FiPackage,
  FiTruck,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiGlobe,
  FiMapPin,
  FiKey,
  FiBell,
  FiUsers,
  FiHome,
  FiBriefcase,
  FiStar,
  FiDownload,
  FiMessageSquare,
  FiMoreVertical
} from 'react-icons/fi';
import {
  FaBuilding,
  FaWarehouse,
  FaRegBuilding,
  FaRegClock,
  FaRegCheckCircle,
  FaRegUser,
  FaRegEnvelope,
  FaRegPhoneAlt
} from 'react-icons/fa';
import { MdBusiness, MdVerified, MdSecurity } from 'react-icons/md';
import { BsPersonBadge, BsPersonWorkspace, BsShop } from 'react-icons/bs';

const AdminUserDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'operations': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'warehouse': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusBadge = () => {
    if (!user) return null;
    
    const config = {
      active: { 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
        icon: FiCheckCircle, 
        label: 'Active' 
      },
      inactive: { 
        color: 'bg-gray-100 text-gray-700 border-gray-200', 
        icon: FiXCircle, 
        label: 'Inactive' 
      },
      suspended: { 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: FiAlertCircle, 
        label: 'Suspended' 
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: FiClock, 
        label: 'Pending' 
      }
    };
    
    const status = user.status || 'active';
    const { color, icon: Icon, label } = config[status] || config.active;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {label}
      </span>
    );
  };

  const getVerificationBadge = () => {
    if (!user?.isVerified) return null;
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
        <MdVerified className="w-3.5 h-3.5 mr-1.5" />
        Verified
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#E67E22] mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-[#E67E22] animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading user profile...</p>
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
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been removed.</p>
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'details', label: user.role === 'customer' ? 'Business Details' : 'Professional Details', icon: user.role === 'customer' ? FaBuilding : FiBriefcase },
    { id: 'permissions', label: 'Permissions', icon: FiKey },
    { id: 'activity', label: 'Activity', icon: FiClock }
  ];

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
                <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
                <p className="text-xs text-gray-500">View detailed user information</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                <FiMessageSquare className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                <FiMoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className={`h-36 bg-gradient-to-r from-[#122652] to-[#E67E22] relative`}>
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
            </div>
            
            {/* Avatar */}
            <div className={`absolute -bottom-12 left-8 w-28 h-28 rounded-2xl bg-white p-1.5 shadow-2xl`}>
              <div className={`w-full h-full rounded-xl ${getRoleColor()} flex items-center justify-center text-white text-3xl font-bold shadow-inner`}>
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
            </div>
          </div>

          <div className="pt-16 px-8 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <div className="flex items-center flex-wrap gap-3 mb-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  {getStatusBadge()}
                  {getVerificationBadge()}
                </div>
                
                <div className="flex items-center flex-wrap gap-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border ${getRoleBadgeColor()}`}>
                    {getRoleIcon()}
                    <span className="ml-2 capitalize font-semibold">{user.role}</span>
                  </span>
                  
                  {user.role === 'admin' && user.adminLevel && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      <MdSecurity className="w-3.5 h-3.5 mr-1.5" />
                      {user.adminLevel.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  href={`/users/${user._id}/edit`}
                  className="inline-flex items-center px-5 py-2.5 bg-[#122652] text-white rounded-xl hover:bg-[#0a1a3a] transition-all shadow-lg shadow-blue-900/20"
                >
                  <FiEdit2 className="w-4 h-4 mr-2" />
                  Edit User
                </Link>
                <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                  <FiDownload className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiMail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiPhone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-semibold text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Last Login</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
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

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiUser className="w-5 h-5 mr-2 text-[#E67E22]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">First Name</p>
                    <p className="font-semibold text-gray-900">{user.firstName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Last Name</p>
                    <p className="font-semibold text-gray-900">{user.lastName}</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiShield className="w-5 h-5 mr-2 text-[#E67E22]" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <p className="font-semibold text-gray-900 capitalize flex items-center">
                      {getRoleIcon()}
                      <span className="ml-2">{user.role}</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <div className="flex items-center">
                      {getStatusBadge()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Verification</p>
                    <p className="font-semibold text-gray-900">
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiGlobe className="w-5 h-5 mr-2 text-[#E67E22]" />
                  Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Timezone</p>
                    <p className="font-semibold text-gray-900">{user.timezone || 'UTC'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Currency</p>
                    <p className="font-semibold text-gray-900">{user.preferredCurrency || 'USD'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Language</p>
                    <p className="font-semibold text-gray-900">{(user.language || 'en').toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              {user.notificationPreferences && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBell className="w-5 h-5 mr-2 text-[#E67E22]" />
                    Notification Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(user.notificationPreferences).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {value ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {user.adminNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                    <FiAlertCircle className="w-4 h-4 mr-1.5" />
                    Admin Notes
                  </h3>
                  <p className="text-sm text-amber-700">{user.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {user.role === 'customer' ? (
                <>
                  {/* Business Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaBuilding className="w-5 h-5 mr-2 text-[#E67E22]" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Company Name</p>
                        <p className="font-semibold text-gray-900">{user.companyName || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">VAT Number</p>
                        <p className="font-semibold text-gray-900">{user.companyVAT || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Business Type</p>
                        <p className="font-semibold text-gray-900">{user.businessType || 'Not specified'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Industry</p>
                        <p className="font-semibold text-gray-900">{user.industry || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Company Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiMapPin className="w-5 h-5 mr-2 text-[#E67E22]" />
                      Company Address
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-gray-900">{user.companyAddress || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiGlobe className="w-5 h-5 mr-2 text-[#E67E22]" />
                      Shipping Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Origin Countries</p>
                        <div className="flex flex-wrap gap-1.5">
                          {user.originCountries?.length > 0 ? (
                            user.originCountries.map((c, i) => (
                              <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-600">Not specified</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Destination Markets</p>
                        <div className="flex flex-wrap gap-1.5">
                          {user.destinationMarkets?.length > 0 ? (
                            user.destinationMarkets.map((m, i) => (
                              <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium border border-green-200">
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-600">Not specified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Employment Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiBriefcase className="w-5 h-5 mr-2 text-[#E67E22]" />
                      Employment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                        <p className="font-semibold text-gray-900">{user.employeeId || 'Not assigned'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Department</p>
                        <p className="font-semibold text-gray-900">{user.department || 'Not specified'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Designation</p>
                        <p className="font-semibold text-gray-900">{user.designation || 'Not specified'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Employment Date</p>
                        <p className="font-semibold text-gray-900">
                          {user.employmentDate ? new Date(user.employmentDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific details */}
                  {user.role === 'warehouse' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaWarehouse className="w-5 h-5 mr-2 text-[#E67E22]" />
                        Warehouse Details
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <p className="font-semibold text-gray-900">{user.warehouseLocation || 'Not specified'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">Warehouse Access</p>
                          <div className="flex flex-wrap gap-1.5">
                            {user.warehouseAccess?.length > 0 ? (
                              user.warehouseAccess.map((a, i) => (
                                <span key={i} className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium border border-purple-200">
                                  {a}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-600">No access specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {user.role === 'operations' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUsers className="w-5 h-5 mr-2 text-[#E67E22]" />
                        Operations Details
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Assigned Customers</p>
                        <p className="font-semibold text-gray-900">{user.assignedCustomers?.length || 0} customers</p>
                      </div>
                    </div>
                  )}

                  {user.role === 'admin' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiShield className="w-5 h-5 mr-2 text-[#E67E22]" />
                        Admin Privileges
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Admin Level</p>
                          <p className="font-semibold text-gray-900 capitalize">{user.adminLevel || 'admin'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Access Level</p>
                          <p className="font-semibold text-gray-900 capitalize">{user.accessLevel || 'full'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Can Create Staff</p>
                          <p className="font-semibold text-gray-900">{user.canCreateStaff ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Can Approve Payments</p>
                          <p className="font-semibold text-gray-900">{user.canApprovePayments ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiKey className="w-5 h-5 mr-2 text-[#E67E22]" />
                User Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {user.permissions?.length > 0 ? (
                  user.permissions.map((permission, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-[#E67E22] hover:shadow-md transition-all group">
                      <div className="flex items-center">
                        <FiCheckCircle className="w-4 h-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-gray-700 capitalize">{permission.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <FiKey className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No permissions assigned</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Login History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiClock className="w-5 h-5 mr-2 text-[#E67E22]" />
                  Login History
                </h3>
                <div className="space-y-2">
                  {user.loginHistory?.length > 0 ? (
                    user.loginHistory.map((login, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FiClock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(login.timestamp).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">{login.device || 'Unknown device'}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600">
                            {login.ipAddress}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                      <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No login history available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
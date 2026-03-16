"use client"
import React, { useState } from 'react';
import { 
  FaUserShield, 
  FaUserPlus, 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaPhone, 
  FaIdBadge, 
  FaLock, 
  FaBriefcase,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaUserCircle,
  FaBuilding,
  FaKey,
  FaShieldAlt,
  FaUsers,
  FaSpinner,
  FaMapMarkerAlt,
  FaTruck,
  FaBox,
  FaBoxOpen,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaDownload
} from 'react-icons/fa';
import { MdAdminPanelSettings, MdWork, MdEmail, MdPhone } from 'react-icons/md';
import { BsPersonBadge, BsPersonCheck, BsPersonPlus } from 'react-icons/bs';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { IoMdContact } from 'react-icons/io';
import { RiLockPasswordLine, RiUserSettingsLine } from 'react-icons/ri';
import { GiCheckMark } from 'react-icons/gi';
import { createAdmin, createStaff } from '@/Api/Authentication'; 

const CreateUserPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    
    // Account Details
    username: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    permissions: [],
    
    // Staff Specific Fields
    employeeId: '',
    warehouseLocation: 'China Warehouse',
    warehouseAccess: ['China_Warehouse', 'Thailand_Warehouse'],
    assignedCustomers: []
  });

  const [errors, setErrors] = useState({});

  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Support',
    'IT',
    'Research & Development',
    'Legal'
  ];

  const permissions = [
    { id: 'confirm_bookings', label: 'Confirm Bookings', icon: <FaCheckCircle />, roles: ['operations', 'admin'] },
    { id: 'update_shipment_milestones', label: 'Update Shipments', icon: <FaIdBadge />, roles: ['operations', 'warehouse', 'admin'] },
    { id: 'upload_shipment_docs', label: 'Upload Docs', icon: <FaSave />, roles: ['operations', 'warehouse', 'admin'] },
    { id: 'assign_to_container', label: 'Assign to Container', icon: <FaBuilding />, roles: ['operations', 'warehouse', 'admin'] },
    { id: 'generate_tracking_numbers', label: 'Generate Tracking', icon: <FaKey />, roles: ['operations', 'admin'] },
    { id: 'view_customer_shipments', label: 'View Customer Shipments', icon: <FaEye />, roles: ['operations', 'admin'] },
    { id: 'create_shipment_quotes', label: 'Create Quotes', icon: <MdWork />, roles: ['operations', 'admin'] },
    { id: 'receive_cargo', label: 'Receive Cargo', icon: <FaBuilding />, roles: ['warehouse'] },
    { id: 'assign_warehouse_location', label: 'Assign Location', icon: <FaMapMarkerAlt />, roles: ['warehouse'] },
    { id: 'group_shipments', label: 'Group Shipments', icon: <HiOutlineUserGroup />, roles: ['warehouse', 'operations'] },
    { id: 'update_container_loading', label: 'Update Loading', icon: <FaTruck />, roles: ['warehouse'] },
    { id: 'view_warehouse_inventory', label: 'View Inventory', icon: <FaBox />, roles: ['warehouse', 'admin'] },
    { id: 'manage_packages', label: 'Manage Packages', icon: <FaBoxOpen />, roles: ['warehouse'] },
    { id: 'view_all_shipments', label: 'View All Shipments', icon: <FaUsers />, roles: ['admin'] },
    { id: 'edit_shipments', label: 'Edit Shipments', icon: <FaEdit />, roles: ['admin'] },
    { id: 'delete_shipments', label: 'Delete Shipments', icon: <FaTrash />, roles: ['admin'] },
    { id: 'manage_users', label: 'Manage Users', icon: <FaUserShield />, roles: ['admin'] },
    { id: 'view_reports', label: 'View Reports', icon: <FaChartBar />, roles: ['admin', 'operations'] },
    { id: 'export_reports', label: 'Export Reports', icon: <FaDownload />, roles: ['admin', 'operations'] }
  ];

  const steps = [
    { title: 'User Type', icon: <HiOutlineUserGroup /> },
    { title: 'Personal Info', icon: <IoMdContact /> },
    { title: 'Account Details', icon: <RiLockPasswordLine /> },
    { title: 'Review', icon: <FaCheckCircle /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
      if (!formData.department) newErrors.department = 'Department is required';
    }
    
    if (activeStep === 2) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

 // পুরো ফাইল না দিয়ে শুধু যেখানে পরিবর্তন দরকার সেটা দিচ্ছি

const handleSubmit = async () => {
  setLoading(true);
  try {
    // Validate role for staff
    if (userType === 'staff' && (!formData.role || formData.role === 'staff')) {
      setSnackbar({
        show: true,
        message: 'Please select a staff role (Operations or Warehouse)',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    // Prepare user data based on type
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      username: formData.username,
      // For staff, use the selected role (operations/warehouse)
      // For admin, role will be 'admin'
      role: userType === 'admin' ? 'admin' : formData.role,
      department: formData.department,
      designation: formData.designation,
      permissions: formData.permissions
    };

    // Add role-specific fields
    if (formData.role === 'warehouse') {
      userData.warehouseLocation = formData.warehouseLocation || 'China Warehouse';
      userData.warehouseAccess = formData.warehouseAccess || ['China_Warehouse', 'Thailand_Warehouse'];
    }

    console.log('Submitting user data:', userData);

    let response;
    if (userType === 'admin') {
      // Call createAdmin API for admin creation
      response = await createAdmin(userData);
    } else {
      // Call createStaff API for staff creation (operations/warehouse)
      response = await createStaff(userData);
    }

    console.log('API Response:', response);

    setSnackbar({
      show: true,
      message: `${userType === 'admin' ? 'Admin' : formData.role} created successfully!`,
      type: 'success'
    });
    
    // Reset form after successful creation
    setTimeout(() => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        department: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'staff', // Reset to default
        permissions: [],
        employeeId: '',
        warehouseLocation: 'China Warehouse',
        warehouseAccess: ['China_Warehouse', 'Thailand_Warehouse'],
        assignedCustomers: []
      });
      setActiveStep(0);
      setUserType('staff');
    }, 2000);

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Show specific error message from API
    let errorMessage = error.message || `Failed to create ${userType}`;
    
    // Handle validation errors
    if (error.message?.includes('Invalid role')) {
      errorMessage = 'Please select a valid staff role (Operations or Warehouse)';
    }
    
    setSnackbar({
      show: true,
      message: errorMessage,
      type: 'error'
    });
  } finally {
    setLoading(false);
  }
};

// Review section এ role দেখানোর সময়
<div className="flex items-start gap-3">
  <div className={`p-2 rounded-lg ${userType === 'admin' ? 'bg-blue-100' : 'bg-orange-100'}`}>
    <FaBriefcase className={`text-xl ${userType === 'admin' ? 'text-blue-600' : 'text-orange-600'}`} />
  </div>
  <div>
    <p className="text-sm text-gray-500">Role</p>
    <p className="font-semibold text-gray-800 capitalize">
      {userType === 'admin' ? 'Administrator' : formData.role}
    </p>
  </div>
</div>

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
      permissions: [],
      employeeId: '',
      warehouseLocation: 'China Warehouse',
      warehouseAccess: ['China_Warehouse', 'Thailand_Warehouse'],
      assignedCustomers: []
    });
    setActiveStep(0);
    setErrors({});
    setUserType('staff');
  };

  // Filter permissions based on selected role
  const getAvailablePermissions = () => {
    if (userType === 'admin') {
      return permissions.filter(p => p.roles.includes('admin'));
    } else if (userType === 'operations') {
      return permissions.filter(p => p.roles.includes('operations'));
    } else if (userType === 'warehouse') {
      return permissions.filter(p => p.roles.includes('warehouse'));
    }
    return [];
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Staff Card */}
              <div 
                onClick={() => setUserType('staff')}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  userType === 'staff' ? 'ring-4 ring-orange-500' : ''
                }`}
              >
                <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                  userType === 'staff' ? 'border-4 border-orange-500' : 'border-2 border-transparent'
                }`}>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                    <div className="flex justify-center">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <FaUserPlus className="text-5xl text-orange-500" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Create Staff</h3>
                    <p className="text-gray-600">
                      Add new staff members (Operations or Warehouse) to your organization
                    </p>
                    {userType === 'staff' && (
                      <div className="mt-4 inline-flex items-center gap-2 text-orange-500 font-semibold">
                        <FaCheckCircle className="text-xl" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Card */}
              <div 
                onClick={() => setUserType('admin')}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  userType === 'admin' ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                  userType === 'admin' ? 'border-4 border-blue-500' : 'border-2 border-transparent'
                }`}>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <div className="flex justify-center">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <MdAdminPanelSettings className="text-5xl text-blue-500" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Create Admin</h3>
                    <p className="text-gray-600">
                      Set up administrators with full system access and management capabilities
                    </p>
                    {userType === 'admin' && (
                      <div className="mt-4 inline-flex items-center gap-2 text-blue-500 font-semibold">
                        <FaCheckCircle className="text-xl" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection for Staff */}
            {userType === 'staff' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Staff Role
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'operations' }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      formData.role === 'operations'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <FaUsers className={`text-2xl mx-auto mb-2 ${
                      formData.role === 'operations' ? 'text-orange-500' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      formData.role === 'operations' ? 'text-orange-700' : 'text-gray-600'
                    }`}>Operations</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'warehouse' }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      formData.role === 'warehouse'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <FaBuilding className={`text-2xl mx-auto mb-2 ${
                      formData.role === 'warehouse' ? 'text-orange-500' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      formData.role === 'warehouse' ? 'text-orange-700' : 'text-gray-600'
                    }`}>Warehouse</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserCircle className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserCircle className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdEmail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBriefcase className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.designation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter designation"
                  />
                </div>
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-500">{errors.designation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500">{errors.department}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdBadge className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter username"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Warehouse specific fields */}
              {formData.role === 'warehouse' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Location
                  </label>
                  <select
                    name="warehouseLocation"
                    value={formData.warehouseLocation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="China Warehouse">China Warehouse</option>
                    <option value="Thailand Warehouse">Thailand Warehouse</option>
                  </select>
                </div>
              )}

              {/* Permissions Section */}
              <div className="md:col-span-2 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getAvailablePermissions().map((permission) => (
                    <button
                      key={permission.id}
                      type="button"
                      onClick={() => handlePermissionChange(permission.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        formData.permissions.includes(permission.id)
                          ? userType === 'admin'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-orange-50 border-orange-500 text-orange-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className={formData.permissions.includes(permission.id) ? 'text-current' : 'text-gray-400'}>
                        {permission.icon}
                      </span>
                      <span className="text-sm font-medium">{permission.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="mt-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-inner">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaCheckCircle className={`text-2xl ${userType === 'admin' ? 'text-blue-500' : 'text-orange-500'}`} />
                Review Your Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${userType === 'admin' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <BsPersonBadge className={`text-xl ${userType === 'admin' ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-800">{formData.firstName} {formData.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${userType === 'admin' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <MdEmail className={`text-xl ${userType === 'admin' ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800">{formData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${userType === 'admin' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <MdPhone className={`text-xl ${userType === 'admin' ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-800">{formData.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${userType === 'admin' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <FaBriefcase className={`text-xl ${userType === 'admin' ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-semibold text-gray-800 capitalize">{formData.role}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${userType === 'admin' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <FaBuilding className={`text-xl ${userType === 'admin' ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-semibold text-gray-800">{formData.department}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${userType === 'admin' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <FaIdBadge className={`text-xl ${userType === 'admin' ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-semibold text-gray-800">{formData.username}</p>
                    </div>
                  </div>
                </div>
              </div>

              {formData.permissions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">Selected Permissions ({formData.permissions.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.permissions.map(permId => {
                      const perm = permissions.find(p => p.id === permId);
                      return (
                        <span
                          key={permId}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            userType === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {perm?.icon}
                          {perm?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4 shadow-xl">
            {userType === 'admin' ? (
              <MdAdminPanelSettings className="text-4xl" />
            ) : (
              <FaUserPlus className="text-4xl" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Create {userType === 'admin' ? 'Administrator' : 'Staff Member'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {userType === 'admin' 
              ? 'Set up a new administrator with full system access and management capabilities'
              : `Add a new ${formData.role || 'staff'} member to your organization with specific roles and permissions`
            }
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <React.Fragment key={step.title}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                      index <= activeStep
                        ? userType === 'admin'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                          : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.icon}
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-600">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded ${
                      index < activeStep
                        ? userType === 'admin'
                          ? 'bg-blue-500'
                          : 'bg-orange-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {getStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeStep === 0 || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaArrowLeft />
                Back
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes />
                  Reset
                </button>

                {activeStep === steps.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      userType === 'admin'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-200'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-200'
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Create {userType === 'admin' ? 'Admin' : 'Staff'}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      userType === 'admin'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-200'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-200'
                    }`}
                  >
                    Next
                    <FaArrowRight />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Snackbar Notification */}
        {snackbar.show && (
          <div className="fixed bottom-4 right-4 animate-slide-up z-50">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl ${
              snackbar.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
            }`}>
              <div className={`p-2 rounded-full ${
                snackbar.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}>
                {snackbar.type === 'success' ? <FaCheckCircle /> : <FaTimes />}
              </div>
              <p className={`font-medium ${
                snackbar.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {snackbar.message}
              </p>
              <button
                onClick={() => setSnackbar({ ...snackbar, show: false })}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CreateUserPage;
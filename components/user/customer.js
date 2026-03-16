"use client"
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiXCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiMail,
  FiPhone,
  FiCalendar,
  FiBriefcase,
  FiMapPin,
  FiTag,
  FiClock,
  FiUser,
  FiShield,
  FiShoppingBag,
  FiHome,
  FiDollarSign,
  FiGlobe,
  FiStar,
  FiBell
} from 'react-icons/fi';
import { 
  FaUserTie, 
  FaUserCog, 
  FaUser, 
  FaBuilding, 
  FaIdCard, 
  FaRegBuilding,
  FaRegClock,
  FaRegCheckCircle,
  FaRegTimesCircle
} from 'react-icons/fa';
import { MdAdminPanelSettings, MdSecurity, MdVerified, MdEmail, MdPhone } from 'react-icons/md';
import { getAllUsers, getUserById, updateUser, deleteUser, getUsersByRole } from '@/Api/Authentication';

const CustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    status: '',
    companyName: '',
    companyAddress: '',
    companyVAT: '',
    businessType: '',
    employeeId: '',
    department: '',
    designation: '',
    warehouseLocation: '',
    isVerified: false,
    preferredCurrency: 'USD',
    language: 'en',
    timezone: 'UTC'
  });

  // Colors
  const colors = {
    primary: '#2563eb', // Blue
    secondary: '#7c3aed', // Purple
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      console.log('API Response:', response);
      
      // Extract users data properly
      let usersData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          usersData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        usersData = response;
      }

      // Format users data
      const formattedUsers = usersData.map(user => ({
        _id: user._id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        role: user.role || 'customer',
        status: user.status || 'active',
        isVerified: user.isVerified || false,
        companyName: user.companyName || 'N/A',
        companyAddress: user.companyAddress || '',
        companyVAT: user.companyVAT || '',
        businessType: user.businessType || '',
        employeeId: user.employeeId || '',
        department: user.department || '',
        designation: user.designation || '',
        warehouseLocation: user.warehouseLocation || '',
        warehouseAccess: user.warehouseAccess || [],
        assignedCustomers: user.assignedCustomers || [],
        permissions: user.permissions || [],
        adminLevel: user.adminLevel || '',
        accessLevel: user.accessLevel || '',
        canCreateStaff: user.canCreateStaff || false,
        canApprovePayments: user.canApprovePayments || false,
        lastLogin: user.lastLogin || null,
        createdAt: user.createdAt || user.createDate || new Date().toISOString(),
        updatedAt: user.updatedAt || user.updateDate || new Date().toISOString(),
        preferredCurrency: user.preferredCurrency || 'USD',
        language: user.language || 'en',
        timezone: user.timezone || 'UTC',
        notificationPreferences: user.notificationPreferences || {
          emailNotifications: true,
          shipmentUpdates: true,
          invoiceNotifications: true,
          marketingEmails: false
        }
      }));

      setUsers(formattedUsers);
      toast.success(`${formattedUsers.length} users loaded`);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users by role
  const fetchUsersByRole = async (role) => {
    if (role === 'all') {
      fetchAllUsers();
      return;
    }
    
    setLoading(true);
    try {
      const response = await getUsersByRole(role);
      
      let usersData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          usersData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        usersData = response;
      }

      const formattedUsers = usersData.map(user => ({
        _id: user._id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        role: user.role || role,
        status: user.status || 'active',
        isVerified: user.isVerified || false,
        companyName: user.companyName || 'N/A',
        companyAddress: user.companyAddress || '',
        companyVAT: user.companyVAT || '',
        businessType: user.businessType || '',
        employeeId: user.employeeId || '',
        department: user.department || '',
        designation: user.designation || '',
        warehouseLocation: user.warehouseLocation || '',
        createdAt: user.createdAt || user.createDate || new Date().toISOString()
      }));

      setUsers(formattedUsers);
      toast.info(`Showing ${formattedUsers.length} ${role} users`);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersByRole(filterRole);
  }, [filterRole]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter users
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle view user
  const handleViewUser = async (userId) => {
    try {
      const response = await getUserById(userId);
      console.log('View User Response:', response);
      
      let userData = response?.data;
      if (response?.data?.data) {
        userData = response.data.data;
      }

      setSelectedUser({
        _id: userData._id || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'N/A',
        email: userData.email || 'N/A',
        phone: userData.phone || 'N/A',
        role: userData.role || 'customer',
        status: userData.status || 'active',
        isVerified: userData.isVerified || false,
        companyName: userData.companyName || '',
        companyAddress: userData.companyAddress || '',
        companyVAT: userData.companyVAT || '',
        businessType: userData.businessType || '',
        industry: userData.industry || '',
        originCountries: userData.originCountries || [],
        destinationMarkets: userData.destinationMarkets || [],
        customerStatus: userData.customerStatus || 'Active',
        customerSince: userData.customerSince || userData.createdAt,
        accountManager: userData.accountManager || null,
        employeeId: userData.employeeId || '',
        department: userData.department || '',
        designation: userData.designation || '',
        employmentDate: userData.employmentDate || '',
        assignedCustomers: userData.assignedCustomers || [],
        warehouseLocation: userData.warehouseLocation || '',
        warehouseAccess: userData.warehouseAccess || [],
        adminLevel: userData.adminLevel || '',
        accessLevel: userData.accessLevel || '',
        canCreateStaff: userData.canCreateStaff || false,
        canApprovePayments: userData.canApprovePayments || false,
        permissions: userData.permissions || [],
        lastLogin: userData.lastLogin || null,
        createdAt: userData.createdAt || userData.createDate || new Date().toISOString(),
        updatedAt: userData.updatedAt || userData.updateDate || new Date().toISOString(),
        preferredCurrency: userData.preferredCurrency || 'USD',
        language: userData.language || 'en',
        timezone: userData.timezone || 'UTC',
        notificationPreferences: userData.notificationPreferences || {
          emailNotifications: true,
          shipmentUpdates: true,
          invoiceNotifications: true,
          marketingEmails: false
        },
        adminNotes: userData.adminNotes || ''
      });
      
      setShowViewModal(true);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch user details');
    }
  };

  // Handle edit user
  const handleEditUser = async (userId) => {
    try {
      const response = await getUserById(userId);
      console.log('Edit User Response:', response);
      
      let userData = response?.data;
      if (response?.data?.data) {
        userData = response.data.data;
      }

      setSelectedUser(userData);
      setEditFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'customer',
        status: userData.status || 'active',
        companyName: userData.companyName || '',
        companyAddress: userData.companyAddress || '',
        companyVAT: userData.companyVAT || '',
        businessType: userData.businessType || '',
        employeeId: userData.employeeId || '',
        department: userData.department || '',
        designation: userData.designation || '',
        warehouseLocation: userData.warehouseLocation || '',
        isVerified: userData.isVerified || false,
        preferredCurrency: userData.preferredCurrency || 'USD',
        language: userData.language || 'en',
        timezone: userData.timezone || 'UTC'
      });
      
      setShowEditModal(true);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch user details');
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    try {
      await updateUser(selectedUser._id, editFormData);
      toast.success('User updated successfully!', {
        onClose: () => fetchUsersByRole(filterRole)
      });
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  // Handle delete user
  const handleDeleteUser = (userId) => {
    toast.warning(
      <div className="p-4">
        <p className="text-gray-700 mb-4">Are you sure you want to delete this user?</p>
        <div className="flex gap-2 justify-end">
          <button 
            className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={async () => {
              try {
                await deleteUser(userId);
                toast.dismiss();
                toast.success('User deleted successfully!', {
                  onClose: () => fetchUsersByRole(filterRole)
                });
              } catch (error) {
                toast.dismiss();
                toast.error(error.message || 'Failed to delete user');
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false
      }
    );
  };

  // Get role badge style
  const getRoleBadge = (role) => {
    const styles = {
      admin: { bg: '#fee2e2', text: '#991b1b', icon: <MdAdminPanelSettings size={14} /> },
      operations: { bg: '#dbeafe', text: '#1e40af', icon: <FiBriefcase size={14} /> },
      warehouse: { bg: '#fef3c7', text: '#92400e', icon: <FiShoppingBag size={14} /> },
      customer: { bg: '#dcfce7', text: '#166534', icon: <FaUser size={14} /> }
    };
    return styles[role?.toLowerCase()] || styles.customer;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: '#dcfce7', text: '#166534', dot: 'bg-green-500' },
      inactive: { bg: '#f3f4f6', text: '#4b5563', dot: 'bg-gray-400' },
      suspended: { bg: '#fee2e2', text: '#991b1b', dot: 'bg-red-500' },
      pending: { bg: '#fef3c7', text: '#92400e', dot: 'bg-yellow-500' }
    };
    return styles[status?.toLowerCase()] || styles.inactive;
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage all users, staff and customers</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={fetchAllUsers}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={20} />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export"
              >
                <FiDownload size={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUsers className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Admins</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <MdAdminPanelSettings className="text-red-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Staff</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {users.filter(u => ['operations', 'warehouse'].includes(u.role)).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiBriefcase className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {users.filter(u => u.role === 'customer').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaUser className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, role, company..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiXCircle size={18} />
                </button>
              )}
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]"
            >
              <option value="all">All Users</option>
              <option value="admin">Admin</option>
              <option value="operations">Operations</option>
              <option value="warehouse">Warehouse</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-gray-600">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-gray-600">No users found</p>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => {
                    const roleStyle = getRoleBadge(user.role);
                    const statusStyle = getStatusBadge(user.status);
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                              style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                            >
                              {user.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                              <p className="text-xs text-gray-500">ID: {user._id?.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center text-gray-900">
                              <FiMail className="mr-1 text-gray-400" size={14} />
                              {user.email}
                            </div>
                            <div className="flex items-center text-gray-600 mt-1">
                              <FiPhone className="mr-1 text-gray-400" size={14} />
                              {user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                          >
                            <span className="mr-1">{roleStyle.icon}</span>
                            <span className="capitalize">{user.role}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaBuilding className="mr-1 text-gray-400" size={14} />
                            {user.companyName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${statusStyle.dot}`}></span>
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                            >
                              {user.status}
                            </span>
                            {user.isVerified && (
                              <MdVerified className="ml-1 text-blue-500" size={14} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1 text-gray-400" size={14} />
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleViewUser(user._id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <FiEye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditUser(user._id)}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="Edit User"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete User"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredUsers.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* User Profile */}
              <div className="flex items-center mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: getRoleBadge(selectedUser.role).bg, color: getRoleBadge(selectedUser.role).text }}
                >
                  {selectedUser.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: getRoleBadge(selectedUser.role).bg, color: getRoleBadge(selectedUser.role).text }}
                    >
                      {getRoleBadge(selectedUser.role).icon}
                      <span className="ml-1 capitalize">{selectedUser.role}</span>
                    </span>
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: getStatusBadge(selectedUser.status).bg, color: getStatusBadge(selectedUser.status).text }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getStatusBadge(selectedUser.status).dot}`}></span>
                      {selectedUser.status}
                    </span>
                    {selectedUser.isVerified && (
                      <span className="flex items-center text-blue-600 text-xs">
                        <MdVerified className="mr-1" size={14} />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="col-span-1 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FaUser className="mr-2 text-blue-600" size={16} />
                    Personal Info
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedUser.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Language</p>
                      <p className="font-medium text-gray-900 uppercase">{selectedUser.language}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Timezone</p>
                      <p className="font-medium text-gray-900">{selectedUser.timezone}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="col-span-1 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiShield className="mr-2 text-purple-600" size={16} />
                    Account Info
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">User ID</p>
                      <p className="font-medium text-gray-900 text-xs break-all">{selectedUser._id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Joined Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Login</p>
                      <p className="font-medium text-gray-900">
                        {selectedUser.lastLogin 
                          ? new Date(selectedUser.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Preferred Currency</p>
                      <p className="font-medium text-gray-900">{selectedUser.preferredCurrency}</p>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="col-span-1 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiStar className="mr-2 text-yellow-600" size={16} />
                    Permissions
                  </h4>
                  <div className="space-y-1">
                    {selectedUser.permissions?.slice(0, 5).map((perm, idx) => (
                      <div key={idx} className="text-xs bg-white px-2 py-1 rounded flex items-center">
                        <FiCheckCircle className="text-green-500 mr-1" size={12} />
                        {perm.replace(/_/g, ' ')}
                      </div>
                    ))}
                    {selectedUser.permissions?.length > 5 && (
                      <p className="text-xs text-gray-500 mt-1">+{selectedUser.permissions.length - 5} more</p>
                    )}
                  </div>
                </div>

                {/* Customer Specific Fields */}
                {selectedUser.role === 'customer' && (
                  <>
                    <div className="col-span-3 bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FaBuilding className="mr-2 text-green-600" size={16} />
                        Company Information
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Company Name</p>
                          <p className="font-medium text-gray-900">{selectedUser.companyName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">VAT Number</p>
                          <p className="font-medium text-gray-900">{selectedUser.companyVAT || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Business Type</p>
                          <p className="font-medium text-gray-900">{selectedUser.businessType || 'N/A'}</p>
                        </div>
                        <div className="col-span-3">
                          <p className="text-xs text-gray-500">Company Address</p>
                          <p className="font-medium text-gray-900">{selectedUser.companyAddress || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Industry</p>
                          <p className="font-medium text-gray-900">{selectedUser.industry || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Customer Status</p>
                          <p className="font-medium text-gray-900">{selectedUser.customerStatus}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Customer Since</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedUser.customerSince).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="col-span-3 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FiGlobe className="mr-2 text-blue-600" size={16} />
                        Shipping Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Origin Countries</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedUser.originCountries?.length > 0 ? (
                              selectedUser.originCountries.map((country, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {country}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Destination Markets</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedUser.destinationMarkets?.length > 0 ? (
                              selectedUser.destinationMarkets.map((market, idx) => (
                                <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {market}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Staff Specific Fields */}
                {['operations', 'warehouse'].includes(selectedUser.role) && (
                  <div className="col-span-3 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiBriefcase className="mr-2 text-purple-600" size={16} />
                      Employment Information
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Employee ID</p>
                        <p className="font-medium text-gray-900">{selectedUser.employeeId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">{selectedUser.department || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Designation</p>
                        <p className="font-medium text-gray-900">{selectedUser.designation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Employment Date</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.employmentDate 
                            ? new Date(selectedUser.employmentDate).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
                      </div>
                      {selectedUser.role === 'warehouse' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Warehouse Location</p>
                            <p className="font-medium text-gray-900">{selectedUser.warehouseLocation || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Warehouse Access</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedUser.warehouseAccess?.map((access, idx) => (
                                <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  {access}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      {selectedUser.role === 'operations' && (
                        <div>
                          <p className="text-xs text-gray-500">Assigned Customers</p>
                          <p className="font-medium text-gray-900">
                            {selectedUser.assignedCustomers?.length || 0} customers
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Specific Fields */}
                {selectedUser.role === 'admin' && (
                  <div className="col-span-3 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <MdAdminPanelSettings className="mr-2 text-red-600" size={16} />
                      Admin Privileges
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Admin Level</p>
                        <p className="font-medium text-gray-900 capitalize">{selectedUser.adminLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Access Level</p>
                        <p className="font-medium text-gray-900 capitalize">{selectedUser.accessLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Can Create Staff</p>
                        <p className="font-medium text-gray-900">{selectedUser.canCreateStaff ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Can Approve Payments</p>
                        <p className="font-medium text-gray-900">{selectedUser.canApprovePayments ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Preferences */}
                <div className="col-span-3 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiBell className="mr-2 text-yellow-600" size={16} />
                    Notification Preferences
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Email Notifications</p>
                      <p className="font-medium text-gray-900">
                        {selectedUser.notificationPreferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shipment Updates</p>
                      <p className="font-medium text-gray-900">
                        {selectedUser.notificationPreferences?.shipmentUpdates ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Invoice Notifications</p>
                      <p className="font-medium text-gray-900">
                        {selectedUser.notificationPreferences?.invoiceNotifications ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Marketing Emails</p>
                      <p className="font-medium text-gray-900">
                        {selectedUser.notificationPreferences?.marketingEmails ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FaUser className="mr-2 text-blue-600" size={16} />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={editFormData.firstName}
                          onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editFormData.lastName}
                          onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role & Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiShield className="mr-2 text-purple-600" size={16} />
                      Role & Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={editFormData.role}
                          onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="customer">Customer</option>
                          <option value="operations">Operations</option>
                          <option value="warehouse">Warehouse</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.isVerified}
                            onChange={(e) => setEditFormData({...editFormData, isVerified: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Email Verified</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Company Information (for customers) */}
                  {editFormData.role === 'customer' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FaBuilding className="mr-2 text-green-600" size={16} />
                        Company Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                          <input
                            type="text"
                            value={editFormData.companyName}
                            onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                          <textarea
                            value={editFormData.companyAddress}
                            onChange={(e) => setEditFormData({...editFormData, companyAddress: e.target.value})}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                          <input
                            type="text"
                            value={editFormData.companyVAT}
                            onChange={(e) => setEditFormData({...editFormData, companyVAT: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                          <input
                            type="text"
                            value={editFormData.businessType}
                            onChange={(e) => setEditFormData({...editFormData, businessType: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Staff Information */}
                  {['operations', 'warehouse'].includes(editFormData.role) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FiBriefcase className="mr-2 text-purple-600" size={16} />
                        Employment Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                          <input
                            type="text"
                            value={editFormData.employeeId}
                            onChange={(e) => setEditFormData({...editFormData, employeeId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <input
                            type="text"
                            value={editFormData.department}
                            onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                          <input
                            type="text"
                            value={editFormData.designation}
                            onChange={(e) => setEditFormData({...editFormData, designation: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {editFormData.role === 'warehouse' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Location</label>
                            <input
                              type="text"
                              value={editFormData.warehouseLocation}
                              onChange={(e) => setEditFormData({...editFormData, warehouseLocation: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preferences */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FiStar className="mr-2 text-yellow-600" size={16} />
                      Preferences
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={editFormData.preferredCurrency}
                          onChange={(e) => setEditFormData({...editFormData, preferredCurrency: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                          <option value="THB">THB</option>
                          <option value="CNY">CNY</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                          value={editFormData.language}
                          onChange={(e) => setEditFormData({...editFormData, language: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="th">Thai</option>
                          <option value="zh">Chinese</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <input
                          type="text"
                          value={editFormData.timezone}
                          onChange={(e) => setEditFormData({...editFormData, timezone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
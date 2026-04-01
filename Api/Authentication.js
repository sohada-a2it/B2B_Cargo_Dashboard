import axiosInstance from '@/lib/axiosInstance';
import Cookies from 'js-cookie';

// ==================== AUTHENTICATION ====================

// Login (All Roles)
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login', { email, password });
    
    if (response.data.success && response.data.token) {
      // Store in cookies
      Cookies.set('token', response.data.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.data), { expires: 7 });
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Customer Registration with OTP
export const registerCustomer = async (userData) => {
  try {
    const response = await axiosInstance.post('/customer/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post('/customer/verify-otp', { email, otp });
    
    if (response.data.success && response.data.token) {
      Cookies.set('token', response.data.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.data), { expires: 7 });
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'OTP verification failed' };
  }
};

// Resend OTP
export const resendOTP = async (email) => {
  try {
    const response = await axiosInstance.post('/customer/resend-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resend OTP' };
  }
};

// Forgot Password (All Roles)
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to process request' };
  }
};

// Reset Password (All Roles)
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axiosInstance.post('/reset-password', { 
      email, 
      otp, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};
// ✅ Verify Reset OTP
export const verifyResetOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post('/verify-reset-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'OTP verification failed' };
  }
};

// ✅ Resend Reset OTP (Optional)
export const resendResetOTP = async (email) => {
  try {
    const response = await axiosInstance.post('/resend-reset-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resend OTP' };
  }
};
// Logout
export const logout = () => {
  Cookies.remove('token');
  Cookies.remove('user');
};

// ==================== PROTECTED ROUTES ====================

// Get User Profile
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get profile' };
  }
};

// Update Profile
export const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/users/profile', userData);
    
    // Update stored user data
    if (response.data.success) {
      const currentUser = JSON.parse(Cookies.get('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data.data };
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// Change Password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.put('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

// ==================== ADMIN FUNCTIONS ====================

// Create Admin (Initial Setup)
export const createAdmin = async (adminData) => {
  try {
    const response = await axiosInstance.post('/admin/setup', adminData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create admin' };
  }
};

// Create Staff (Admin Only)
export const createStaff = async (staffData) => {
  try {
    const response = await axiosInstance.post('/admin/staff/create', staffData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create staff' };
  }
};

// Get All Users (Admin Only)
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get users' };
  }
};

// Get User By ID (Admin Only)
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/admin/getUsers/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user' };
  }
};

// Update User (Admin Only)
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/admin/updateUsers/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user' };
  }
};

// Delete User (Admin Only)
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

// Get Users By Role (Admin Only)
export const getUsersByRole = async (role) => {
  try {
    const response = await axiosInstance.get(`/admin/users/role/${role}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get users by role' };
  }
};

// ==================== HELPER FUNCTIONS ====================

// Get Current User from Cookie
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = Cookies.get('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Check if User is Authenticated
export const isAuthenticated = () => {
  return !!Cookies.get('token');
};

// Check if User has Specific Role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Check if User is Admin
export const isAdmin = () => {
  return hasRole('admin');
};

// Check if User is Customer
export const isCustomer = () => {
  return hasRole('customer');
};

// Check if User is Staff (Operations or Warehouse)
export const isStaff = () => {
  const user = getCurrentUser();
  return user?.role === 'operations' || user?.role === 'warehouse';
};
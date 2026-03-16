// services/tracking.js
import axiosInstance from '@/lib/axiosInstance';

// ==================== TRACKING API FUNCTIONS ====================

// 1. GET ALL TRACKINGS (Admin Only)
export const getAllTrackings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.search && { search: params.search }),
      ...(params.customerId && { customerId: params.customerId }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.sort && { sort: params.sort })
    });

    const response = await axiosInstance.get(`/getAllTracking?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        summary: response.data.summary,
        pagination: response.data.pagination,
        message: response.data.message || 'Trackings fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch trackings');
    
  } catch (error) {
    console.error('Get all trackings error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch trackings',
      error: error.response?.data
    };
  }
};

// 2. GET TRACKING BY ID
export const getTrackingById = async (id, type = 'shipment') => {
  try {
    const response = await axiosInstance.get(`/trackings/${id}?type=${type}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tracking fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch tracking');
    
  } catch (error) {
    console.error('Get tracking by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch tracking',
      error: error.response?.data
    };
  }
};

// 3. UPDATE TRACKING STATUS
export const updateTrackingStatus = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(`/trackings/${id}`, updateData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tracking status updated successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to update tracking status');
    
  } catch (error) {
    console.error('Update tracking status error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update tracking status',
      error: error.response?.data
    };
  }
};

// 4. BULK UPDATE TRACKINGS
export const bulkUpdateTrackings = async (trackingIds, updateData) => {
  try {
    const response = await axiosInstance.put('/trackings/bulk/update', {
      trackingIds,
      updateData
    });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Bulk update completed successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to bulk update trackings');
    
  } catch (error) {
    console.error('Bulk update trackings error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to bulk update trackings',
      error: error.response?.data
    };
  }
};

// 5. DELETE TRACKING
export const deleteTracking = async (id, type = 'shipment') => {
  try {
    const response = await axiosInstance.delete(`/trackings/${id}?type=${type}`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Tracking deleted successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to delete tracking');
    
  } catch (error) {
    console.error('Delete tracking error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to delete tracking',
      error: error.response?.data
    };
  }
};

// 6. BULK DELETE TRACKINGS
export const bulkDeleteTrackings = async (trackingIds) => {
  try {
    const response = await axiosInstance.post('/trackings/bulk/delete', {
      trackingIds
    });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Bulk delete completed successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to bulk delete trackings');
    
  } catch (error) {
    console.error('Bulk delete trackings error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to bulk delete trackings',
      error: error.response?.data
    };
  }
};

// 7. GET TRACKING STATS
export const getTrackingStats = async () => {
  try {
    const response = await axiosInstance.get('/getTrackingStats');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tracking stats fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch tracking stats');
    
  } catch (error) {
    console.error('Get tracking stats error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch tracking stats',
      error: error.response?.data
    };
  }
};

// 8. SEARCH TRACKINGS
export const searchTrackings = async (query, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      q: query,
      ...(params.type && { type: params.type }),
      ...(params.status && { status: params.status }),
      ...(params.customerId && { customerId: params.customerId }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    });

    const response = await axiosInstance.get(`/tracking/search?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
        message: 'Search completed successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to search trackings');
    
  } catch (error) {
    console.error('Search trackings error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to search trackings',
      error: error.response?.data
    };
  }
};

// 9. EXPORT TRACKINGS
export const exportTrackings = async (params = {}, format = 'csv') => {
  try {
    const queryParams = new URLSearchParams({
      format,
      ...(params.type && { type: params.type }),
      ...(params.status && { status: params.status }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    });

    const response = await axiosInstance.get(`/tracking/export?${queryParams}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trackings-${new Date().toISOString().split('T')[0]}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Trackings exported successfully'
    };
    
  } catch (error) {
    console.error('Export trackings error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to export trackings',
      error: error.response?.data
    };
  }
};

// 10. PUBLIC TRACKING (No Auth Required)
export const publicTracking = async (trackingNumber) => {
  try {
    const response = await axiosInstance.get(`/trackings/public/${trackingNumber}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Tracking information fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Tracking number not found');
    
  } catch (error) {
    console.error('Public tracking error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch tracking information',
      error: error.response?.data
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

// Get status color for UI
export const getTrackingStatusColor = (status) => {
  const statusColors = {
    'pending': 'warning',
    'booking_requested': 'info',
    'price_quoted': 'info',
    'booking_confirmed': 'info',
    'picked_up_from_warehouse': 'primary',
    'received_at_warehouse': 'primary',
    'consolidated': 'primary',
    'departed_port_of_origin': 'primary',
    'in_transit_sea_freight': 'primary',
    'arrived_at_destination_port': 'primary',
    'customs_cleared': 'primary',
    'out_for_delivery': 'warning',
    'delivered': 'success',
    'on_hold': 'error',
    'cancelled': 'error',
    'returned': 'error'
  };
  
  return statusColors[status] || 'default';
};

// Get status display text
export const getTrackingStatusDisplay = (status) => {
  const statusTexts = {
    'pending': 'Pending',
    'booking_requested': 'Booking Requested',
    'price_quoted': 'Price Quoted',
    'booking_confirmed': 'Booking Confirmed',
    'picked_up_from_warehouse': 'Picked Up',
    'received_at_warehouse': 'At Warehouse',
    'consolidated': 'Consolidated',
    'departed_port_of_origin': 'Departed Origin',
    'in_transit_sea_freight': 'In Transit',
    'arrived_at_destination_port': 'Arrived Destination',
    'customs_cleared': 'Customs Cleared',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'on_hold': 'On Hold',
    'cancelled': 'Cancelled',
    'returned': 'Returned'
  };
  
  return statusTexts[status] || status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Get progress percentage
export const getTrackingProgress = (status) => {
  const order = [
    'pending',
    'picked_up_from_warehouse',
    'received_at_warehouse',
    'consolidated',
    'departed_port_of_origin',
    'in_transit_sea_freight',
    'arrived_at_destination_port',
    'customs_cleared',
    'out_for_delivery',
    'delivered'
  ];
  
  const index = order.indexOf(status);
  if (index === -1) return 0;
  return Math.round((index / (order.length - 1)) * 100);
};

// Format date for tracking display
export const formatTrackingDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Format timeline
export const formatTimeline = (timeline) => {
  if (!timeline || !Array.isArray(timeline)) return [];
  
  return timeline.map(entry => ({
    ...entry,
    formattedDate: new Date(entry.date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }),
    timeAgo: formatTrackingDate(entry.date)
  }));
};

// Get tracking type icon
export const getTrackingTypeIcon = (type) => {
  const icons = {
    'shipment': '🚢',
    'booking': '📦',
    'consolidation': '📦📦'
  };
  return icons[type] || '📋';
};

// Get estimated delivery status
export const getEstimatedDeliveryStatus = (estimatedDate) => {
  if (!estimatedDate) return null;
  
  const today = new Date();
  const estimated = new Date(estimatedDate);
  const diffDays = Math.ceil((estimated - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      text: 'Overdue',
      color: 'error',
      days: Math.abs(diffDays)
    };
  } else if (diffDays === 0) {
    return {
      text: 'Today',
      color: 'warning',
      days: 0
    };
  } else if (diffDays <= 3) {
    return {
      text: `${diffDays} days left`,
      color: 'warning',
      days: diffDays
    };
  } else {
    return {
      text: `${diffDays} days left`,
      color: 'success',
      days: diffDays
    };
  }
};

// ==================== REACT HOOKS ====================

import { useState, useCallback } from 'react';

// Custom hook for single tracking operations
export const useTracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(null);

  const fetchTracking = useCallback(async (id, type = 'shipment') => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTrackingById(id, type);
      if (result.success) {
        setTracking(result.data);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateTrackingStatus(id, updateData);
      if (result.success && result.data) {
        setTracking(prev => ({ ...prev, ...result.data }));
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id, type = 'shipment') => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteTracking(id, type);
      if (result.success) {
        setTracking(null);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    tracking,
    fetchTracking,
    updateStatus,
    delete: remove
  };
};

// Custom hook for tracking list management
export const useTrackingsList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trackings, setTrackings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchAllTrackings = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllTrackings(params);
      if (result.success) {
        setTrackings(result.data || []);
        setSummary(result.summary);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTrackingStats();
      if (result.success) {
        setStats(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await searchTrackings(query, params);
      if (result.success) {
        setTrackings(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdate = useCallback(async (trackingIds, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bulkUpdateTrackings(trackingIds, updateData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDelete = useCallback(async (trackingIds) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bulkDeleteTrackings(trackingIds);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (params = {}, format = 'csv') => {
    try {
      setLoading(true);
      setError(null);
      const result = await exportTrackings(params, format);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    trackings,
    summary,
    pagination,
    stats,
    fetchAllTrackings,
    fetchStats,
    search,
    bulkUpdate,
    bulkDelete,
    exportData
  };
};

// Custom hook for public tracking
export const usePublicTracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);

  const track = useCallback(async (trackingNumber) => {
    try {
      setLoading(true);
      setError(null);
      const result = await publicTracking(trackingNumber);
      if (result.success) {
        setTrackingInfo(result.data);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setTrackingInfo(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    trackingInfo,
    track,
    clear
  };
};
// services/shipping.js - getAllShipments ফাংশন আপডেট

import axiosInstance from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
/**
 * Create a new shipment
 * @param {Object} shipmentData - shipment info
 * @returns {Object|null} created shipment or null on error
 */
export const createShipment = async (shipmentData) => {
  try {
    console.log('📤 Sending shipment data:', shipmentData);
    
    const response = await axiosInstance.post('/create-shipments', shipmentData, {
      timeout: 30000 // 30 seconds timeout
    });

    console.log('📥 Full response from server:', response);
    console.log('📥 Response data:', response.data);
    console.log('📥 Response success:', response.data?.success);
    console.log('📥 Response data field:', response.data?.data);

    // Check if response exists and has success flag
    if (response.data && response.data.success === true) {
      // Return the full response object with success flag
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Shipment created successfully'
      };
    }

    // If success is false
    throw new Error(response.data?.message || 'Failed to create shipment');
    
  } catch (error) {
    console.error('❌ Create shipment error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });
    
    // Return error object instead of throwing
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create shipment',
      error: error.response?.data?.error
    };
  }
};
// 1. GET ALL SHIPMENTS (with filters & pagination) 

// ==================== SHIPMENT API FUNCTIONS ====================
// services/shipping.js - getAllShipments ফাংশন

export const getAllShipments = async (params = {}) => {
  try {
    console.log('📦 Fetching shipments with params:', params);
    
    // ক্যাশ বাইপাস করার জন্য timestamp যোগ করুন
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.mode && { mode: params.mode }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
      timestamp: Date.now() // এইটা ক্যাশ বাইপাস করবে
    });

    const response = await axiosInstance.get(`/getAllShipment?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data || [],
        summary: response.data.summary,
        pagination: response.data.pagination || {
          total: response.data.data?.length || 0,
          page: params.page || 1,
          limit: params.limit || 20,
          pages: Math.ceil((response.data.data?.length || 0) / (params.limit || 20))
        },
        message: response.data.message || 'Shipments fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch shipments');
    
  } catch (error) {
    console.error('❌ Get all shipments error:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.error || error.message || 'Failed to fetch shipments',
      error: error.response?.data,
      pagination: {
        total: 0,
        page: params.page || 1,
        limit: params.limit || 20,
        pages: 0
      }
    };
  }
};

// 2. GET SINGLE SHIPMENT BY ID - বুকিংয়ের মতো
export const getShipmentById = async (shipmentId) => {
  try {
    const response = await axiosInstance.get(`/shipments/${shipmentId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch shipment');
    
  } catch (error) {
    console.error('Get shipment by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch shipment',
      error: error.response?.data
    };
  }
};

// 3. UPDATE SHIPMENT STATUS - বুকিংয়ের মতো
export const updateShipmentStatus = async (shipmentId, statusData) => {
  try {
    const response = await axiosInstance.patch(`/shipments/${shipmentId}/status`, statusData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update status');
    
  } catch (error) {
    console.error('Update shipment status error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update status',
      error: error.response?.data
    };
  }
};

// বাকি ফাংশনগুলো একইভাবে আপডেট করুন...

// 2. GET MY SHIPMENTS (Customer)
export const getMyShipments = async (params = {}) => {
  try {
    const safeParams = params || {};
    
    const queryParams = new URLSearchParams({
      page: safeParams.page || 1,
      limit: safeParams.limit || 10,
      ...(safeParams.status && { status: safeParams.status }),
      ...(safeParams.sort && { sort: safeParams.sort || '-createdAt' })
    });

    const response = await axiosInstance.get(`/shipments/my-shipments?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch my shipments');
    
  } catch (error) {
    console.error('Get my shipments error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch my shipments',
      error: error.response?.data
    };
  }
};

// 3. GET MY SHIPMENT BY ID (Customer)
export const getMyShipmentById = async (shipmentId) => {
  try {
    const response = await axiosInstance.get(`/shipments/my-shipments/${shipmentId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch shipment');
    
  } catch (error) {
    console.error('Get my shipment by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch shipment',
      error: error.response?.data
    };
  }
};

// 4. GET MY SHIPMENT TIMELINE (Customer)
export const getMyShipmentTimeline = async (shipmentId) => {
  try {
    const response = await axiosInstance.get(`/shipments/my-shipments/${shipmentId}/timeline`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch timeline');
    
  } catch (error) {
    console.error('Get my shipment timeline error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch timeline',
      error: error.response?.data
    };
  }
};

// 5. GET SINGLE SHIPMENT BY ID
// export const getShipmentById = async (shipmentId) => {
//   try {
//     const response = await axiosInstance.get(`/shipments/${shipmentId}`);
    
//     if (response.data.success) {
//       return {
//         success: true,
//         data: response.data.data,
//         message: response.data.message
//       };
//     }
    
//     throw new Error(response.data.message || 'Failed to fetch shipment');
    
//   } catch (error) {
//     console.error('Get shipment by id error:', error);
//     return {
//       success: false,
//       message: error.response?.data?.error || error.message || 'Failed to fetch shipment',
//       error: error.response?.data
//     };
//   }
// };

// 6. CREATE SHIPMENT (from Booking)
// export const createShipment = async (shipmentData) => {
//   try {
//     const response = await axiosInstance.post('/shipments/create', shipmentData);
    
//     if (response.data.success) {
//       return {
//         success: true,
//         data: response.data.data,
//         message: response.data.message
//       };
//     }
    
//     throw new Error(response.data.message || 'Failed to create shipment');
    
//   } catch (error) {
//     console.error('Create shipment error:', error);
//     return {
//       success: false,
//       message: error.response?.data?.error || error.message || 'Failed to create shipment',
//       error: error.response?.data
//     };
//   }
// };

// 7. UPDATE SHIPMENT 
// shipping.js - updateShipment ফাংশন আপডেট

export const updateShipment = async (shipmentId, updateData) => {
  try {
    console.log('📦 Updating shipment:', { shipmentId, updateData });
    
    const response = await axiosInstance.put(`/update-shipment/${shipmentId}`, updateData);
    
    console.log('✅ API Success - Full Response:', response.data);
    console.log('✅ Response Data:', response.data.data);
    console.log('✅ Tracking in Response:', response.data.data?.trackingNumber);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Shipment updated successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to update shipment');
    
  } catch (error) {
    console.error('❌ API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update shipment',
      error: error.response?.data,
      status: error.response?.status
    };
  }
};

// 8. DELETE SHIPMENT
export const deleteShipment = async (shipmentId) => {
  try {
    const response = await axiosInstance.delete(`/shipments/${shipmentId}`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to delete shipment');
    
  } catch (error) {
    console.error('Delete shipment error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to delete shipment',
      error: error.response?.data
    };
  }
};

// 9. UPDATE SHIPMENT STATUS
// export const updateShipmentStatus = async (shipmentId, statusData) => {
//   try {
//     const response = await axiosInstance.patch(`/shipments/${shipmentId}/status`, statusData);
    
//     if (response.data.success) {
//       return {
//         success: true,
//         data: response.data.data,
//         message: response.data.message
//       };
//     }
    
//     throw new Error(response.data.message || 'Failed to update status');
    
//   } catch (error) {
//     console.error('Update shipment status error:', error);
//     return {
//       success: false,
//       message: error.response?.data?.error || error.message || 'Failed to update status',
//       error: error.response?.data
//     };
//   }
// };

// 10. ASSIGN SHIPMENT TO STAFF
export const assignShipment = async (shipmentId, assignmentData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/assign`, assignmentData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to assign shipment');
    
  } catch (error) {
    console.error('Assign shipment error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to assign shipment',
      error: error.response?.data
    };
  }
};

// 11. ADD TRACKING UPDATE
export const addTrackingUpdate = async (shipmentId, trackingData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/tracking`, trackingData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add tracking update');
    
  } catch (error) {
    console.error('Add tracking update error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to add tracking update',
      error: error.response?.data
    };
  }
};

// 12. GET SHIPMENT TIMELINE
export const getShipmentTimeline = async (shipmentId) => {
  try {
    const response = await axiosInstance.get(`/shipments/${shipmentId}/timeline`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch timeline');
    
  } catch (error) {
    console.error('Get shipment timeline error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch timeline',
      error: error.response?.data
    };
  }
};

// 13. UPDATE TRANSPORT DETAILS
export const updateTransportDetails = async (shipmentId, transportData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/transport`, transportData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update transport details');
    
  } catch (error) {
    console.error('Update transport details error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update transport',
      error: error.response?.data
    };
  }
};

// 14. ADD DOCUMENT TO SHIPMENT
export const addShipmentDocument = async (shipmentId, documentData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/documents`, documentData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add document');
    
  } catch (error) {
    console.error('Add document error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to add document',
      error: error.response?.data
    };
  }
};

// 15. ADD INTERNAL NOTE
export const addInternalNote = async (shipmentId, noteData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/notes/internal`, noteData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add internal note');
    
  } catch (error) {
    console.error('Add internal note error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to add note',
      error: error.response?.data
    };
  }
};

// 16. ADD CUSTOMER NOTE
export const addCustomerNote = async (shipmentId, noteData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/notes/customer`, noteData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add customer note');
    
  } catch (error) {
    console.error('Add customer note error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to add note',
      error: error.response?.data
    };
  }
};

// 17. CANCEL SHIPMENT
export const cancelShipment = async (shipmentId, cancelData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/cancel`, cancelData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to cancel shipment');
    
  } catch (error) {
    console.error('Cancel shipment error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to cancel shipment',
      error: error.response?.data
    };
  }
};

// 18. ADD COST TO SHIPMENT
export const addShipmentCost = async (shipmentId, costData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/costs`, costData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add cost');
    
  } catch (error) {
    console.error('Add cost error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to add cost',
      error: error.response?.data
    };
  }
};

// 19. GET SHIPMENT COSTS
export const getShipmentCosts = async (shipmentId) => {
  try {
    const response = await axiosInstance.get(`/shipments/${shipmentId}/costs`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch costs');
    
  } catch (error) {
    console.error('Get shipment costs error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch costs',
      error: error.response?.data
    };
  }
};

// 20. UPDATE COST
export const updateShipmentCost = async (shipmentId, costId, updateData) => {
  try {
    const response = await axiosInstance.put(`/shipments/${shipmentId}/costs/${costId}`, updateData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update cost');
    
  } catch (error) {
    console.error('Update cost error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update cost',
      error: error.response?.data
    };
  }
};

// 21. DELETE COST
export const deleteShipmentCost = async (shipmentId, costId) => {
  try {
    const response = await axiosInstance.delete(`/shipments/${shipmentId}/costs/${costId}`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to delete cost');
    
  } catch (error) {
    console.error('Delete cost error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to delete cost',
      error: error.response?.data
    };
  }
};

// 22. GET PENDING WAREHOUSE SHIPMENTS
export const getPendingWarehouseShipments = async () => {
  try {
    const response = await axiosInstance.get('/shipments/warehouse/pending');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch warehouse shipments');
    
  } catch (error) {
    console.error('Get warehouse shipments error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch warehouse shipments',
      error: error.response?.data
    };
  }
};

// 23. RECEIVE AT WAREHOUSE
export const receiveAtWarehouse = async (shipmentId, receiveData) => {
  try {
    const response = await axiosInstance.patch(`/shipments/${shipmentId}/warehouse/receive`, receiveData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to receive at warehouse');
    
  } catch (error) {
    console.error('Receive at warehouse error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to receive',
      error: error.response?.data
    };
  }
};

// 24. PROCESS WAREHOUSE
export const processWarehouse = async (shipmentId, processData) => {
  try {
    const response = await axiosInstance.patch(`/shipments/${shipmentId}/warehouse/process`, processData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to process warehouse');
    
  } catch (error) {
    console.error('Process warehouse error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to process',
      error: error.response?.data
    };
  }
};

// 25. GET SHIPMENT STATISTICS
export const getShipmentStatistics = async (dateRange = {}) => {
  try {
    const safeDateRange = dateRange || {};
    
    const queryParams = new URLSearchParams({
      ...(safeDateRange.startDate && { startDate: safeDateRange.startDate }),
      ...(safeDateRange.endDate && { endDate: safeDateRange.endDate })
    });

    const response = await axiosInstance.get(`/shipments/stats/dashboard?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch statistics');
    
  } catch (error) {
    console.error('Get shipment statistics error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch statistics',
      error: error.response?.data
    };
  }
};

// 26. TRACK BY NUMBER (Public)
export const trackShipmentByNumber = async (trackingNumber) => {
  try {
    const response = await axiosInstance.get(`/shipments/track/${trackingNumber}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Tracking number not found');
    
  } catch (error) {
    console.error('Track shipment error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to track shipment',
      error: error.response?.data
    };
  }
};

// ==================== SHIPMENT HELPER FUNCTIONS ====================

// Get status color for UI
export const getShipmentStatusColor = (status) => {
  const statusColors = {
    'pending': 'warning',
    'received_at_warehouse': 'info',
    'consolidation_in_progress': 'warning',
    'ready_for_shipping': 'primary',
    'in_transit': 'info',
    'arrived_at_destination': 'success',
    'customs_clearance': 'warning',
    'out_for_delivery': 'info',
    'delivered': 'success',
    'cancelled': 'error',
    'draft': 'default'
  };
  
  return statusColors[status] || 'default';
};

// Get status display text
export const getShipmentStatusDisplayText = (status) => {
  const statusTexts = {
    'pending': 'Pending',
    'received_at_warehouse': 'Received at Warehouse',
    'consolidation_in_progress': 'Consolidation in Progress',
    'ready_for_shipping': 'Ready for Shipping',
    'in_transit': 'In Transit',
    'arrived_at_destination': 'Arrived at Destination',
    'customs_clearance': 'Customs Clearance',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'draft': 'Draft'
  };
  
  return statusTexts[status] || status;
};

// Get mode display text
export const getShipmentModeDisplay = (mode) => {
  const modes = {
    'air_freight': 'Air Freight',
    'sea_freight': 'Sea Freight',
    'road_freight': 'Road Freight',
    'rail_freight': 'Rail Freight',
    'express_courier': 'Express Courier'
  };
  
  return modes[mode] || mode;
};

// Get progress percentage
export const getShipmentProgress = (status) => {
  const progressMap = {
    'pending': 10,
    'received_at_warehouse': 25,
    'consolidation_in_progress': 35,
    'ready_for_shipping': 45,
    'in_transit': 60,
    'arrived_at_destination': 75,
    'customs_clearance': 85,
    'out_for_delivery': 95,
    'delivered': 100,
    'cancelled': 0,
    'draft': 5
  };
  
  return progressMap[status] || 0;
};

// Check if shipment is active
export const isShipmentActive = (status) => {
  const activeStatuses = [
    'pending',
    'received_at_warehouse',
    'consolidation_in_progress',
    'ready_for_shipping',
    'in_transit',
    'arrived_at_destination',
    'customs_clearance',
    'out_for_delivery'
  ];
  
  return activeStatuses.includes(status);
};

// Format date
export const formatShipmentDate = (dateString, format = 'medium') => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format currency
export const formatShipmentCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format weight
export const formatWeight = (weight, unit = 'kg') => {
  if (!weight && weight !== 0) return 'N/A';
  return `${weight.toFixed(2)} ${unit}`;
};

// Format volume
export const formatVolume = (volume, unit = 'cbm') => {
  if (!volume && volume !== 0) return 'N/A';
  return `${volume.toFixed(3)} ${unit}`;
};

// Calculate total weight from packages
export const calculateTotalWeight = (packages) => {
  if (!packages || !packages.length) return 0;
  
  return packages.reduce((total, pkg) => {
    return total + ((pkg.weight || 0) * (pkg.quantity || 1));
  }, 0);
};

// Calculate total volume from packages
export const calculateTotalVolume = (packages) => {
  if (!packages || !packages.length) return 0;
  
  return packages.reduce((total, pkg) => {
    return total + ((pkg.volume || 0) * (pkg.quantity || 1));
  }, 0);
};

// Check if ETA is on track
export const isOnTrack = (estimatedDelivery, actualDelivery, status) => {
  if (status === 'delivered' && actualDelivery && estimatedDelivery) {
    return new Date(actualDelivery) <= new Date(estimatedDelivery);
  }
  return true;
};

// Get days in transit
export const getDaysInTransit = (departureDate) => {
  if (!departureDate) return 0;
  
  const departure = new Date(departureDate);
  const now = new Date();
  const diffTime = Math.abs(now - departure);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ==================== SHIPMENT DASHBOARD FUNCTIONS ====================

// Get shipment summary
export const getShipmentSummary = (shipments) => {
  if (!shipments || !shipments.length) {
    return {
      total: 0,
      active: 0,
      delivered: 0,
      cancelled: 0,
      pending: 0,
      inTransit: 0
    };
  }

  return {
    total: shipments.length,
    active: shipments.filter(s => isShipmentActive(s.status)).length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    cancelled: shipments.filter(s => s.status === 'cancelled').length,
    pending: shipments.filter(s => s.status === 'pending').length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length
  };
};

// Group shipments by status
export const groupShipmentsByStatus = (shipments) => {
  if (!shipments || !shipments.length) return {};

  return shipments.reduce((groups, shipment) => {
    const status = shipment.status || 'unknown';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(shipment);
    return groups;
  }, {});
};

// Group shipments by mode
export const groupShipmentsByMode = (shipments) => {
  if (!shipments || !shipments.length) return {};

  return shipments.reduce((groups, shipment) => {
    const mode = shipment.shipmentDetails?.shipmentType || 'unknown';
    if (!groups[mode]) {
      groups[mode] = [];
    }
    groups[mode].push(shipment);
    return groups;
  }, {});
};

// Get top routes
export const getTopRoutes = (shipments, limit = 5) => {
  if (!shipments || !shipments.length) return [];

  const routeCounts = {};
  
  shipments.forEach(shipment => {
    const origin = shipment.shipmentDetails?.origin || 'Unknown';
    const destination = shipment.shipmentDetails?.destination || 'Unknown';
    const route = `${origin} → ${destination}`;
    
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });

  return Object.entries(routeCounts)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// ==================== SHIPMENT EXPORT FUNCTIONS ====================

// Export shipments to CSV
export const exportShipmentsToCSV = (shipments, filename = 'shipments.csv') => {
  if (!shipments || !shipments.length) return;

  const headers = [
    'Shipment Number',
    'Tracking Number',
    'Booking Number',
    'Customer',
    'Status',
    'Mode',
    'Origin',
    'Destination',
    'Packages',
    'Total Weight (kg)',
    'Total Volume (cbm)',
    'Total Cost',
    'Created Date',
    'Estimated Delivery',
    'Actual Delivery'
  ];

  const csvData = shipments.map(shipment => [
    shipment.shipmentNumber || 'N/A',
    shipment.trackingNumber || 'N/A',
    shipment.bookingId?.bookingNumber || 'N/A',
    shipment.customerId?.companyName || `${shipment.customerId?.firstName || ''} ${shipment.customerId?.lastName || ''}`.trim() || 'N/A',
    getShipmentStatusDisplayText(shipment.status),
    getShipmentModeDisplay(shipment.shipmentDetails?.shipmentType),
    shipment.shipmentDetails?.origin || 'N/A',
    shipment.shipmentDetails?.destination || 'N/A',
    shipment.packages?.length || 0,
    calculateTotalWeight(shipment.packages).toFixed(2),
    calculateTotalVolume(shipment.packages).toFixed(3),
    formatShipmentCurrency(shipment.totalCost),
    formatShipmentDate(shipment.createdAt, 'short'),
    shipment.transport?.estimatedArrival ? formatShipmentDate(shipment.transport.estimatedArrival, 'short') : 'N/A',
    shipment.actualDeliveryDate ? formatShipmentDate(shipment.actualDeliveryDate, 'short') : 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==================== REACT HOOKS ====================

// Custom hook for shipment operations
export const useShipmentOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shipment, setShipment] = useState(null);

  const fetchShipment = async (shipmentId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getShipmentById(shipmentId);
      if (result.success) {
        setShipment(result.data);
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
  };

  const updateStatus = async (shipmentId, statusData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateShipmentStatus(shipmentId, statusData);
      if (result.success) {
        setShipment(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTracking = async (shipmentId, trackingData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addTrackingUpdate(shipmentId, trackingData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addCost = async (shipmentId, costData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addShipmentCost(shipmentId, costData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assign = async (shipmentId, assignmentData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await assignShipment(shipmentId, assignmentData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    shipment,
    fetchShipment,
    updateStatus,
    addTracking,
    addCost,
    assign
  };
};

// Custom hook for customer shipments
export const useCustomerShipments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState(null);

  const fetchMyShipments = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const safeParams = params || {};
      const result = await getMyShipments(safeParams);
      if (result.success) {
        setShipments(result.data);
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
  };

  return {
    loading,
    error,
    shipments,
    pagination,
    fetchMyShipments
  };
};
export const updateTrackingNumber = async (shipmentId, trackingNumber) => {
  try {
    console.log('📦 Updating tracking number:', { shipmentId, trackingNumber });

    if (!shipmentId) {
      throw new Error('Shipment ID is required');
    }

    // ✅ চেক করুন trackingNumber স্ট্রিং কিনা
    if (typeof trackingNumber !== 'string') {
      throw new Error('Tracking number must be a string');
    }

    const trimmedTracking = trackingNumber.trim();
    
    if (!trimmedTracking) {
      throw new Error('Tracking number is required');
    }

    // ✅ সঠিকভাবে ডাটা পাঠান
    const response = await axiosInstance.put(
      `/update-shipment-tracking/${shipmentId}`, 
      { trackingNumber: trimmedTracking }  // শুধু { trackingNumber: "value" } ফরম্যাটে
    );

    console.log('✅ API Response:', response.data);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tracking number updated successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to update tracking number');

  } catch (error) {
    console.error('❌ Tracking number update error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update tracking number',
      error: error.response?.data,
      status: error.response?.status
    };
  }
};

/**
 * সব ট্র্যাকিং নাম্বার পাওয়ার জন্য
 */
export const getAllTrackings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 50,
      ...(params.search && { search: params.search }),
      timestamp: Date.now()
    });

    const response = await axiosInstance.get(`/getAllShipment?${queryParams}`);

    if (response.data.success) {
      const trackings = (response.data.data || []).map(shipment => ({
        id: shipment._id,
        shipmentNumber: shipment.shipmentNumber || shipment._id?.slice(-8).toUpperCase(),
        trackingNumber: shipment.trackingNumber || '',
        customerName: shipment.customerId?.companyName || 
                     `${shipment.customerId?.firstName || ''} ${shipment.customerId?.lastName || ''}`.trim() || 'N/A',
        origin: shipment.shipmentDetails?.origin || 'N/A',
        destination: shipment.shipmentDetails?.destination || 'N/A',
        createdAt: shipment.createdAt
      }));

      return {
        success: true,
        data: trackings,
        pagination: response.data.pagination,
        message: 'Trackings fetched successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to fetch trackings');

  } catch (error) {
    console.error('❌ Get all trackings error:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.error || error.message || 'Failed to fetch trackings',
      pagination: {
        total: 0,
        page: params.page || 1,
        limit: params.limit || 50,
        pages: 0
      }
    };
  }
};
// ==================== RETURN REQUEST API FUNCTIONS ====================

/**
 * 1. REQUEST RETURN (Customer)
 * POST /api/v1/shipments/:id/return-request
 * 
 * @param {string} shipmentId - Shipment ID
 * @param {object} returnData - { reason, description, items, images }
 * @returns {Promise<object>} - Return request response with cost
 */
export const requestReturn = async (shipmentId, returnData) => {
  try {
    console.log('🔄 Requesting return for shipment:', shipmentId);
    console.log('📦 Return Data:', returnData);

    const response = await axiosInstance.post(`/shipments/${shipmentId}/return-request`, returnData);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Return request submitted successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to submit return request');

  } catch (error) {
    console.error('❌ Request return error:', error);
    console.error('Error Response:', error.response?.data);
    
    return {
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to submit return request',
      error: error.response?.data,
      status: error.response?.status
    };
  }
};

/**
 * 2. GET RETURN REQUEST STATUS (Customer)
 * GET /api/v1/shipments/:id/return-status
 * 
 * @param {string} shipmentId - Shipment ID
 * @returns {Promise<object>} - Return status with cost details
 */
export const getReturnRequestStatus = async (shipmentId) => {
  try {
    console.log('📊 Getting return status for shipment:', shipmentId);

    const response = await axiosInstance.get(`/shipments/${shipmentId}/return-status`);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Return status fetched successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to fetch return status');

  } catch (error) {
    console.error('❌ Get return status error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch return status',
      error: error.response?.data
    };
  }
};

/**
 * 3. CUSTOMER CONFIRM RETURN (With Cost) - Complete হবে
 * PUT /api/v1/shipments/:id/return-confirm
 * 
 * @param {string} shipmentId - Shipment ID
 * @param {object} confirmData - { notes, acceptCost }
 * @returns {Promise<object>} - Return completion response
 */
export const customerConfirmReturn = async (shipmentId, confirmData) => {
  try {
    console.log('✅ Customer confirming return for shipment:', shipmentId);
    console.log('Confirm Data:', confirmData);

    const response = await axiosInstance.put(`/shipments/${shipmentId}/return-confirm`, confirmData);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Return confirmed and completed successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to confirm return');

  } catch (error) {
    console.error('❌ Customer confirm return error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to confirm return',
      error: error.response?.data
    };
  }
};

/**
 * 4. CUSTOMER REJECT/CANCEL RETURN
 * PUT /api/v1/shipments/:id/return-reject-customer
 * 
 * @param {string} shipmentId - Shipment ID
 * @param {object} rejectData - { reason }
 * @returns {Promise<object>} - Return cancellation response
 */
export const customerRejectReturn = async (shipmentId, rejectData) => {
  try {
    console.log('❌ Customer rejecting return for shipment:', shipmentId);
    console.log('Reject Data:', rejectData);

    const response = await axiosInstance.put(`/shipments/${shipmentId}/return-reject-customer`, rejectData);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Return cancelled successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to cancel return');

  } catch (error) {
    console.error('❌ Customer reject return error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to cancel return',
      error: error.response?.data
    };
  }
};

// ==================== ADMIN API FUNCTIONS ====================

/**
 * 5. GET ALL RETURN REQUESTS (Admin)
 * GET /api/v1/admin/return-requests
 * 
 * @param {object} params - { page, limit, status }
 * @returns {Promise<object>} - List of return requests
 */
export const getAllReturnRequests = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && params.status !== 'all' && { status: params.status }),
      timestamp: Date.now()
    });

    const response = await axiosInstance.get(`/admin/return-requests?${queryParams}`);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        summary: response.data.summary,
        pagination: response.data.pagination,
        message: response.data.message || 'Return requests fetched successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to fetch return requests');

  } catch (error) {
    console.error('❌ Get all return requests error:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.error || error.message || 'Failed to fetch return requests',
      error: error.response?.data,
      pagination: { total: 0, page: 1, limit: 20, pages: 0 }
    };
  }
};

/**
 * 6. ADMIN APPROVE RETURN REQUEST
 * PUT /api/v1/admin/return-requests/:id/approve
 * 
 * @param {string} returnId - Return request ID (Shipment ID)
 * @param {object} data - { returnTrackingNumber, notes, adjustCost }
 * @returns {Promise<object>} - Approval response with cost
 */
export const approveReturnRequest = async (returnId, data) => {
  try {
    console.log('✅ Approving return request:', returnId);
    console.log('Approve Data:', data);

    const response = await axiosInstance.put(`/admin/return-requests/${returnId}/approve`, {
      returnTrackingNumber: data.returnTrackingNumber,
      notes: data.notes,
      adjustCost: data.adjustCost
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Return request approved successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to approve return request');

  } catch (error) {
    console.error('❌ Approve return error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to approve return request',
      error: error.response?.data
    };
  }
};

/**
 * 7. ADMIN REJECT RETURN REQUEST
 * PUT /api/v1/admin/return-requests/:id/reject
 * 
 * @param {string} returnId - Return request ID (Shipment ID)
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<object>} - Rejection response
 */
export const rejectReturnRequest = async (returnId, rejectionReason) => {
  try {
    console.log('❌ Rejecting return request:', returnId);
    console.log('Rejection Reason:', rejectionReason);

    const response = await axiosInstance.put(`/admin/return-requests/${returnId}/reject`, {
      rejectionReason: rejectionReason
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Return request rejected'
      };
    }

    throw new Error(response.data.message || 'Failed to reject return request');

  } catch (error) {
    console.error('❌ Reject return error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to reject return request',
      error: error.response?.data
    };
  }
};

/**
 * 8. GET RETURN REQUEST STATISTICS (Admin)
 * GET /api/v1/admin/return-requests/stats
 * 
 * @returns {Promise<object>} - Return statistics
 */
export const getReturnStats = async () => {
  try {
    console.log('📊 Getting return statistics');

    const response = await axiosInstance.get('/admin/return-requests/stats');

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Statistics fetched successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to fetch statistics');

  } catch (error) {
    console.error('❌ Get return stats error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.error || error.message || 'Failed to fetch statistics',
      error: error.response?.data
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if shipment is eligible for return
 */
export const canRequestReturn = (shipment) => {
  if (!shipment) return false;
  
  const eligibleStatuses = ['delivered', 'completed'];
  if (!eligibleStatuses.includes(shipment.status)) return false;
  
  if (shipment.returnRequest && 
      shipment.returnRequest.status !== 'none' && 
      shipment.returnRequest.status !== 'rejected_by_admin' &&
      shipment.returnRequest.status !== 'rejected_by_customer') {
    return false;
  }
  
  const deliveryDate = shipment.dates?.delivered || shipment.courier?.actualDeliveryDate || shipment.updatedAt;
  if (deliveryDate) {
    const daysSinceDelivery = Math.floor((Date.now() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24));
    if (daysSinceDelivery > 14) return false;
  }
  
  return true;
};

/**
 * Get return reason display text
 */
export const getReturnReasonText = (reason) => {
  const reasonTexts = {
    'damaged_product': 'Damaged Product',
    'wrong_product': 'Wrong Product Received',
    'missing_items': 'Missing Items',
    'delayed_delivery': 'Delayed Delivery',
    'customer_cancellation': 'Customer Cancellation',
    'other': 'Other Reason'
  };
  return reasonTexts[reason] || reason || 'Not specified';
};

/**
 * Get return status display text
 */
export const getReturnStatusText = (status) => {
  const statusTexts = {
    'none': 'No Return',
    'pending': 'Pending Admin Approval',
    'approved': 'Admin Approved - Awaiting Your Confirmation',
    'rejected_by_admin': 'Rejected by Admin',
    'rejected_by_customer': 'Cancelled by You',
    'completed': 'Return Completed'
  };
  return statusTexts[status] || status || 'Unknown';
};

/**
 * Get return status color for UI
 */
export const getReturnStatusColor = (status) => {
  const statusColors = {
    'pending': 'yellow',
    'approved': 'blue',
    'rejected_by_admin': 'red',
    'rejected_by_customer': 'orange',
    'completed': 'green'
  };
  return statusColors[status] || 'gray';
};

/**
 * Get return status icon name
 */
export const getReturnStatusIcon = (status) => {
  const statusIcons = {
    'pending': 'Clock',
    'approved': 'ThumbsUp',
    'rejected_by_admin': 'ThumbsDown',
    'rejected_by_customer': 'XCircle',
    'completed': 'CheckCircle'
  };
  return statusIcons[status] || 'AlertCircle';
};

/**
 * Format return cost for display
 */
export const formatReturnCost = (cost, currency = 'USD', isFree = false) => {
  if (isFree) return 'FREE';
  if (!cost && cost !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cost);
};

/**
 * Get return cost breakdown display
 */
export const getReturnCostBreakdown = (breakdown) => {
  if (!breakdown) return null;
  
  return {
    shippingCost: breakdown.shippingCost || 0,
    handlingFee: breakdown.handlingFee || 0,
    restockingFee: breakdown.restockingFee || 0,
    total: breakdown.total || 0,
    note: breakdown.note || ''
  };
};
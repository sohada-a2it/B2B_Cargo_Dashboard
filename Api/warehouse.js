// services/warehouseService.js
import axiosInstance from '@/lib/axiosInstance';

// ==================== WAREHOUSE API FUNCTIONS ====================

// 1. GET EXPECTED SHIPMENTS (Warehouse Dashboard)
// services/warehouseService.js
// services/warehouseService.js - আপনার existing ফাইল
// Api/warehouse.js - এটা যোগ করুন

// Get single shipment by ID (for receive page)
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
    console.error('Get shipment error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message
    };
  }
};
 

export const getExpectedShipments = async (params = {}) => {
  try {
    // limit প্যারামিটার বাদ দিয়ে শুধু page পাঠাচ্ছি
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      // limit: params.limit || 100, // limit completely remove করে দিচ্ছি
      ...(params.status && { status: params.status }),
      ...(params.search && { search: params.search })
    });

    const response = await axiosInstance.get(`/expected-shipments?${queryParams}`);
    
    if (response.data.success) {
      console.log('Total shipments from API:', response.data.pagination?.total);
      console.log('Fetched shipments:', response.data.data?.length);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch expected shipments');
    
  } catch (error) {
    console.error('Get expected shipments error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch expected shipments',
      error: error.response?.data
    };
  }
};

// 2. RECEIVE SHIPMENT AT WAREHOUSE
// Api/warehouse.js - আপডেটেড receiveShipment ফাংশন

export const receiveShipment = async (shipmentId, receiptData) => {
  try {
    console.log('📤 Sending receive request for shipment:', shipmentId);
    console.log('📦 Receipt data:', receiptData);
    
    const response = await axiosInstance.post(`/receive/${shipmentId}`, receiptData);
    
    console.log('📥 Receive response:', response.data);
    
    // Success response
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Shipment received successfully'
      };
    }
    
    // If backend returns success: false but with data
    return {
      success: false,
      message: response.data.message || 'Failed to receive shipment',
      data: response.data.data,
      error: response.data.error
    };
    
  } catch (error) {
    console.error('❌ Receive shipment error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 400 error (Bad Request) - often means already received
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Bad request';
      
      // Check if it's "already received" error
      if (errorMessage.toLowerCase().includes('already received')) {
        return {
          success: false,
          message: errorMessage,
          alreadyReceived: true,  // Special flag for UI
          statusCode: 400
        };
      }
      
      return {
        success: false,
        message: errorMessage,
        statusCode: 400,
        error: error.response.data
      };
    }
    
    // Handle 404 error (Not Found)
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Shipment not found',
        statusCode: 404
      };
    }
    
    // Handle 500 error (Server Error)
    if (error.response?.status === 500) {
      return {
        success: false,
        message: 'Server error. Please try again.',
        statusCode: 500,
        error: error.response.data
      };
    }
    
    // Handle network errors (no response)
    if (error.request && !error.response) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        isNetworkError: true
      };
    }
    
    // Generic error
    return {
      success: false,
      message: error.message || 'Failed to receive shipment',
      error: error.response?.data
    };
  }
};

// 3. GET WAREHOUSE RECEIPTS
export const getWarehouseReceipts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.warehouseId && { warehouseId: params.warehouseId }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    });

    const response = await axiosInstance.get(`/receipts?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch warehouse receipts');
    
  } catch (error) {
    console.error('Get warehouse receipts error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch warehouse receipts',
      error: error.response?.data
    };
  }
};
// 23. DELETE WAREHOUSE RECEIPT (Admin Only)
export const deleteWarehouseReceipt = async (receiptId) => {
  try {
    const response = await axiosInstance.delete(`/receipts/${receiptId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Receipt deleted successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to delete receipt');
    
  } catch (error) {
    console.error('❌ Delete warehouse receipt error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to delete receipt',
      error: error.response?.data,
      statusCode: error.response?.status
    };
  }
};
// 4. GET RECEIPT BY ID
export const getReceiptById = async (receiptId) => {
  try {
    const response = await axiosInstance.get(`/receipts/${receiptId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch receipt');
    
  } catch (error) {
    console.error('Get receipt by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch receipt',
      error: error.response?.data
    };
  }
};

// 5. GET WAREHOUSE INVENTORY
export const getWarehouseInventory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.zone && { zone: params.zone }),
      ...(params.shipmentId && { shipmentId: params.shipmentId }),
      ...(params.warehouseId && { warehouseId: params.warehouseId })
    });

    const response = await axiosInstance.get(`/warehouse/inventory?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        summary: response.data.summary,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch inventory');
    
  } catch (error) {
    console.error('Get warehouse inventory error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch inventory',
      error: error.response?.data
    };
  }
};

// 6. UPDATE INVENTORY LOCATION
export const updateInventoryLocation = async (inventoryId, locationData) => {
  try {
    const response = await axiosInstance.put(`/warehouse/inventory/${inventoryId}/location`, locationData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update inventory location');
    
  } catch (error) {
    console.error('Update inventory location error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update location',
      error: error.response?.data
    };
  }
};

// 7. START CONSOLIDATION
export const startConsolidation = async (consolidationData) => {
  try {
    const response = await axiosInstance.post('/warehouse/consolidations/start', consolidationData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to start consolidation');
    
  } catch (error) {
    console.error('Start consolidation error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to start consolidation',
      error: error.response?.data
    };
  }
};

// 8. COMPLETE CONSOLIDATION
export const completeConsolidation = async (consolidationId, completionData) => {
  try {
    const response = await axiosInstance.put(`/warehouse/consolidations/${consolidationId}/complete`, completionData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to complete consolidation');
    
  } catch (error) {
    console.error('Complete consolidation error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to complete consolidation',
      error: error.response?.data
    };
  }
};

// 9. LOAD AND DEPART CONSOLIDATION
export const loadAndDepartConsolidation = async (consolidationId, departureData) => {
  try {
    const response = await axiosInstance.post(`/warehouse/consolidations/${consolidationId}/depart`, departureData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to load and depart consolidation');
    
  } catch (error) {
    console.error('Load and depart error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to depart consolidation',
      error: error.response?.data
    };
  }
};

// 10. GET WAREHOUSE DASHBOARD
export const getWarehouseDashboard = async () => {
  try {
    const response = await axiosInstance.get('/dashboard');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch warehouse dashboard');
    
  } catch (error) {
    console.error('Get warehouse dashboard error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch dashboard',
      error: error.response?.data
    };
  }
};

// 11. GET CONSOLIDATIONS
export const getConsolidations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.warehouseId && { warehouseId: params.warehouseId }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    });

    const response = await axiosInstance.get(`/warehouse/consolidations?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch consolidations');
    
  } catch (error) {
    console.error('Get consolidations error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch consolidations',
      error: error.response?.data
    };
  }
};

// 12. GET CONSOLIDATION BY ID
export const getConsolidationById = async (consolidationId) => {
  try {
    const response = await axiosInstance.get(`/warehouse/consolidations/${consolidationId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch consolidation');
    
  } catch (error) {
    console.error('Get consolidation by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch consolidation',
      error: error.response?.data
    };
  }
};

// 13. ADD DOCUMENTS TO CONSOLIDATION
export const addConsolidationDocuments = async (consolidationId, documents) => {
  try {
    const response = await axiosInstance.post(`/warehouse/consolidations/${consolidationId}/documents`, { documents });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add documents');
    
  } catch (error) {
    console.error('Add consolidation documents error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to add documents',
      error: error.response?.data
    };
  }
};

// 14. GET ALL WAREHOUSES
export const getAllWarehouses = async () => {
  try {
    const response = await axiosInstance.get('/getAllwarehouses');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch warehouses');
    
  } catch (error) {
    console.error('Get all warehouses error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch warehouses',
      error: error.response?.data
    };
  }
};

// 15. CREATE WAREHOUSE
export const createWarehouse = async (warehouseData) => {
  try {
    const response = await axiosInstance.post('/warehouses', warehouseData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to create warehouse');
    
  } catch (error) {
    console.error('Create warehouse error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to create warehouse',
      error: error.response?.data
    };
  }
};

// 16. UPDATE WAREHOUSE
export const updateWarehouse = async (warehouseId, updateData) => {
  try {
    const response = await axiosInstance.put(`/warehouses/${warehouseId}`, updateData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update warehouse');
    
  } catch (error) {
    console.error('Update warehouse error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update warehouse',
      error: error.response?.data
    };
  }
};

// 17. INSPECT RECEIVED SHIPMENT 

export const inspectShipment = async (receiptId, inspectionData) => {
  try {
    console.log('🔍 Sending inspection data:', inspectionData);
    
    const response = await axiosInstance.post(`/inspect/${receiptId}`, inspectionData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Inspection failed');
    
  } catch (error) {
    console.error('❌ Inspect shipment error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to complete inspection'
    };
  }
};

// 18. GET INVENTORY BY ZONE
export const getInventoryByZone = async (warehouseId) => {
  try {
    const response = await axiosInstance.get(`/warehouse/inventory/by-zone${warehouseId ? `?warehouseId=${warehouseId}` : ''}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch inventory by zone');
    
  } catch (error) {
    console.error('Get inventory by zone error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch inventory by zone',
      error: error.response?.data
    };
  }
};

// 19. GET RECENT RECEIPTS
export const getRecentReceipts = async (limit = 5) => {
  try {
    const response = await axiosInstance.get(`/warehouse/receipts/recent?limit=${limit}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch recent receipts');
    
  } catch (error) {
    console.error('Get recent receipts error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch recent receipts',
      error: error.response?.data
    };
  }
};

// 20. GENERATE WAREHOUSE RECEIPT PDF
export const generateReceiptPDF = async (receiptId) => {
  try {
    const response = await axiosInstance.get(`/receipts/${receiptId}/pdf`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `warehouse-receipt-${receiptId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Receipt PDF downloaded successfully'
    };
    
  } catch (error) {
    console.error('Generate receipt PDF error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to generate PDF',
      error: error.response?.data
    };
  }
};

// 21. GENERATE PACKING LIST PDF
export const generatePackingListPDF = async (consolidationId) => {
  try {
    const response = await axiosInstance.get(`/warehouse/consolidations/${consolidationId}/packing-list`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `packing-list-${consolidationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Packing list PDF downloaded successfully'
    };
    
  } catch (error) {
    console.error('Generate packing list PDF error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to generate packing list',
      error: error.response?.data
    };
  }
};

// 22. EXPORT INVENTORY TO CSV
export const exportInventoryToCSV = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.zone && { zone: params.zone }),
      ...(params.warehouseId && { warehouseId: params.warehouseId })
    });

    const response = await axiosInstance.get(`/warehouse/inventory/export?${queryParams}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Inventory exported successfully'
    };
    
  } catch (error) {
    console.error('Export inventory error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to export inventory',
      error: error.response?.data
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

// Get inventory status color for UI
export const getInventoryStatusColor = (status) => {
  const statusColors = {
    'received': 'info',
    'inspected': 'warning',
    'stored': 'success',
    'damaged': 'error',
    'consolidated': 'primary',
    'loaded': 'secondary',
    'shipped': 'default'
  };
  
  return statusColors[status] || 'default';
};

// Get consolidation status color
export const getConsolidationStatusColor = (status) => {
  const statusColors = {
    'pending': 'default',
    'in_progress': 'warning',
    'completed': 'success',
    'loaded': 'info',
    'departed': 'primary',
    'cancelled': 'error'
  };
  
  return statusColors[status] || 'default';
};

// Get inventory status display text
export const getInventoryStatusDisplayText = (status) => {
  const statusTexts = {
    'received': 'Received',
    'inspected': 'Inspected',
    'stored': 'In Storage',
    'damaged': 'Damaged',
    'consolidated': 'Consolidated',
    'loaded': 'Loaded',
    'shipped': 'Shipped'
  };
  
  return statusTexts[status] || status;
};

// Get consolidation status display text
export const getConsolidationStatusDisplayText = (status) => {
  const statusTexts = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'loaded': 'Loaded',
    'departed': 'Departed',
    'cancelled': 'Cancelled'
  };
  
  return statusTexts[status] || status;
};

// Get condition display text
export const getConditionDisplayText = (condition) => {
  const conditionTexts = {
    'Good': 'Good Condition',
    'Damaged': 'Damaged',
    'Partial': 'Partially Damaged',
    'Missing': 'Missing Items'
  };
  
  return conditionTexts[condition] || condition;
};

// Get condition color
export const getConditionColor = (condition) => {
  const conditionColors = {
    'Good': 'success',
    'Damaged': 'error',
    'Partial': 'warning',
    'Missing': 'error'
  };
  
  return conditionColors[condition] || 'default';
};

// Get package type display
export const getPackageTypeDisplay = (type) => {
  const packageTypes = {
    'Carton': 'Carton',
    'Pallet': 'Pallet',
    'Crate': 'Crate',
    'Box': 'Box',
    'Bag': 'Bag',
    'Drum': 'Drum',
    'Roll': 'Roll',
    'Bale': 'Bale',
    'Container': 'Container'
  };
  
  return packageTypes[type] || type;
};

// Format location string
export const formatLocation = (location) => {
  if (!location) return 'Not assigned';
  
  const parts = [];
  if (location.zone) parts.push(`Zone ${location.zone}`);
  if (location.aisle) parts.push(`Aisle ${location.aisle}`);
  if (location.rack) parts.push(`Rack ${location.rack}`);
  if (location.bin) parts.push(`Bin ${location.bin}`);
  
  return parts.join(' - ') || 'Not assigned';
};

// Format weight
export const formatWeight = (weight, unit = 'kg') => {
  if (!weight && weight !== 0) return 'N/A';
  return `${weight.toFixed(2)} ${unit}`;
};

// Format volume
export const formatVolume = (volume, unit = 'cbm') => {
  if (!volume && volume !== 0) return 'N/A';
  return `${volume.toFixed(2)} ${unit}`;
};

// Format dimensions
export const formatDimensions = (dimensions) => {
  if (!dimensions) return 'N/A';
  
  const parts = [];
  if (dimensions.length) parts.push(`${dimensions.length}cm`);
  if (dimensions.width) parts.push(`${dimensions.width}cm`);
  if (dimensions.height) parts.push(`${dimensions.height}cm`);
  
  return parts.length ? parts.join(' x ') : 'N/A';
};

// Calculate warehouse capacity usage
export const calculateCapacityUsage = (totalCapacity, usedCapacity) => {
  if (!totalCapacity || !usedCapacity) return 0;
  return Math.round((usedCapacity / totalCapacity) * 100);
};

// Get capacity usage color
export const getCapacityColor = (percentage) => {
  if (percentage >= 90) return 'error';
  if (percentage >= 75) return 'warning';
  if (percentage >= 50) return 'info';
  return 'success';
};

// Check if inventory is available for consolidation
export const isAvailableForConsolidation = (inventoryItem) => {
  const availableStatuses = ['stored'];
  return availableStatuses.includes(inventoryItem?.status);
};

// Get total inventory value
export const calculateInventoryValue = (inventory) => {
  if (!inventory || !inventory.length) return 0;
  
  return inventory.reduce((total, item) => {
    return total + (item.value || 0) * (item.quantity || 1);
  }, 0);
};

// Group inventory by zone
export const groupInventoryByZone = (inventory) => {
  if (!inventory || !inventory.length) return {};
  
  return inventory.reduce((groups, item) => {
    const zone = item.location?.zone || 'Unassigned';
    if (!groups[zone]) {
      groups[zone] = [];
    }
    groups[zone].push(item);
    return groups;
  }, {});
};

// Get storage duration in days
export const getStorageDuration = (receivedAt) => {
  if (!receivedAt) return 0;
  
  const received = new Date(receivedAt);
  const now = new Date();
  const diffTime = Math.abs(now - received);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Check if item is in long-term storage (over 30 days)
export const isLongTermStorage = (receivedAt) => {
  return getStorageDuration(receivedAt) > 30;
};

// ==================== REACT HOOKS ====================

// Custom hook for warehouse operations
export const useWarehouse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [consolidations, setConsolidations] = useState([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getWarehouseDashboard();
      if (result.success) {
        setDashboard(result.data);
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

  const fetchReceipts = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getWarehouseReceipts(params);
      if (result.success) {
        setReceipts(result.data);
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

  const fetchInventory = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getWarehouseInventory(params);
      if (result.success) {
        setInventory(result.data);
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

  const fetchConsolidations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConsolidations(params);
      if (result.success) {
        setConsolidations(result.data);
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

  const receiveShipmentAndUpdate = async (shipmentId, receiptData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await receiveShipment(shipmentId, receiptData);
      if (result.success) {
        // Refresh dashboard and receipts
        await fetchDashboard();
        await fetchReceipts();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startConsolidationAndUpdate = async (consolidationData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await startConsolidation(consolidationData);
      if (result.success) {
        // Refresh consolidations and inventory
        await fetchConsolidations();
        await fetchInventory();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocationAndRefresh = async (inventoryId, locationData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateInventoryLocation(inventoryId, locationData);
      if (result.success) {
        await fetchInventory();
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
    dashboard,
    receipts,
    inventory,
    consolidations,
    fetchDashboard,
    fetchReceipts,
    fetchInventory,
    fetchConsolidations,
    receiveShipmentAndUpdate,
    startConsolidationAndUpdate,
    updateLocationAndRefresh
  };
};

// Custom hook for consolidation operations
export const useConsolidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consolidation, setConsolidation] = useState(null);

  const fetchConsolidation = async (consolidationId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConsolidationById(consolidationId);
      if (result.success) {
        setConsolidation(result.data);
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

  const complete = async (consolidationId, completionData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await completeConsolidation(consolidationId, completionData);
      if (result.success && result.data) {
        setConsolidation(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const depart = async (consolidationId, departureData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadAndDepartConsolidation(consolidationId, departureData);
      if (result.success && result.data) {
        setConsolidation(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addDocuments = async (consolidationId, documents) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addConsolidationDocuments(consolidationId, documents);
      if (result.success) {
        await fetchConsolidation(consolidationId);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generatePackingList = async (consolidationId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await generatePackingListPDF(consolidationId);
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
    consolidation,
    fetchConsolidation,
    complete,
    depart,
    addDocuments,
    generatePackingList
  };
};
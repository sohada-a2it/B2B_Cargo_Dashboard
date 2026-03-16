// services/booking.js
import axiosInstance from '@/lib/axiosInstance';

// ==================== BOOKING API FUNCTIONS ====================
// Controller: bookingController.js অনুযায়ী

// 1. CREATE BOOKING (Customer)
// Controller: exports.createBooking
// Endpoint: POST /bookings
export const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post('/createBooking', bookingData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Create booking error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to create booking',
      error: error.response?.data
    };
  }
};

// 2. GET ALL BOOKINGS (Admin)
// 2. GET ALL BOOKINGS (Admin)
// In your Api/booking.js file - FIXED VERSION
export const getAllBookings = async (params = {}) => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    
    // Add all params to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    // FIXED: Use axiosInstance instead of fetch
    // Also fixed the endpoint to match your API (remove leading slash if needed)
    const response = await axiosInstance.get(`/getAllBooking?${queryParams.toString()}`);
    
    // axiosInstance already handles JSON parsing
    return response.data;
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    // Return error in the same format as your other functions
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch bookings',
      error: error.response?.data
    };
  }
};

// 3. GET SINGLE BOOKING BY ID
// Controller: exports.getBookingById
// Endpoint: GET /bookings/:id
export const getBookingById = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch booking');
    
  } catch (error) {
    console.error('Get booking by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch booking',
      error: error.response?.data
    };
  }
};

// 4. UPDATE PRICE QUOTE (Admin)
// Controller: exports.updatePriceQuote
// Endpoint: PUT /bookings/:id/price-quote
export const updatePriceQuote = async (bookingId, quoteData) => {
  try {
    const response = await axiosInstance.put(`/booking/${bookingId}/price-quote`, quoteData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update price quote');
    
  } catch (error) {
    console.error('Update price quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update price quote',
      error: error.response?.data
    };
  }
};

// 5. CUSTOMER ACCEPT QUOTE
// Controller: exports.acceptQuote
// Endpoint: PUT /bookings/:id/accept
export const acceptQuote = async (bookingId, notes = '') => {
  try {
    const response = await axiosInstance.put(`/bookings/${bookingId}/accept`, { notes });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to accept quote');
    
  } catch (error) {
    console.error('Accept quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to accept quote',
      error: error.response?.data
    };
  }
};

// 6. CUSTOMER REJECT QUOTE
// Controller: exports.rejectQuote
// Endpoint: POST /bookings/:id/reject-quote
export const rejectQuote = async (bookingId, reason = '') => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/reject-quote`, { reason });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to reject quote');
    
  } catch (error) {
    console.error('Reject quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to reject quote',
      error: error.response?.data
    };
  }
};

// 7. CANCEL BOOKING
// Controller: exports.cancelBooking
// Endpoint: POST /bookings/:id/cancel
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/cancel`, { reason });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to cancel booking');
    
  } catch (error) {
    console.error('Cancel booking error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to cancel booking',
      error: error.response?.data
    };
  }
};

// 8. GET MY BOOKINGS (Customer)
// Controller: exports.getMyBookings
// Endpoint: GET /bookings/my-bookings
export const getMyBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status }),
      ...(params.sort && { sort: params.sort || '-createdAt' })
    });

    const response = await axiosInstance.get(`/bookings/my-bookings?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        summary: response.data.summary,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch my bookings');
    
  } catch (error) {
    console.error('Get my bookings error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch bookings',
      error: error.response?.data
    };
  }
};

// 9. GET MY BOOKING BY ID (Customer)
// Controller: exports.getMyBookingById
// Endpoint: GET /bookings/my-bookings/:id
export const getMyBookingById = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/my-bookings/${bookingId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch booking');
    
  } catch (error) {
    console.error('Get my booking by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch booking',
      error: error.response?.data
    };
  }
};

// 10. GET MY BOOKING TIMELINE (Customer)
// Controller: exports.getMyBookingTimeline
// Endpoint: GET /bookings/my-bookings/:id/timeline
export const getMyBookingTimeline = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/my-bookings/${bookingId}/timeline`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch timeline');
    
  } catch (error) {
    console.error('Get booking timeline error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch timeline',
      error: error.response?.data
    };
  }
};

// 11. GET MY BOOKING INVOICE (Customer)
// Controller: exports.getMyBookingInvoice
// Endpoint: GET /bookings/my-bookings/:id/invoice
export const getMyBookingInvoice = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/my-bookings/${bookingId}/invoice`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch invoice');
    
  } catch (error) {
    console.error('Get booking invoice error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch invoice',
      error: error.response?.data
    };
  }
};

// 12. GET MY BOOKING QUOTE DETAILS (Customer)
// Controller: exports.getMyBookingQuote
// Endpoint: GET /bookings/my-bookings/:id/quote
export const getMyBookingQuote = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/my-bookings/${bookingId}/quote`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch quote details');
    
  } catch (error) {
    console.error('Get booking quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch quote details',
      error: error.response?.data
    };
  }
};

// 13. GET MY BOOKINGS SUMMARY (Customer Dashboard)
// Controller: exports.getMyBookingsSummary
// Endpoint: GET /bookings/my-bookings/summary
export const getMyBookingsSummary = async () => {
  try {
    const response = await axiosInstance.get('/bookings/my-bookings/summary');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch summary');
    
  } catch (error) {
    console.error('Get bookings summary error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch summary',
      error: error.response?.data
    };
  }
};

// 14. TRACK BY NUMBER (Public)
// Controller: exports.trackByNumber
// Endpoint: GET /bookings/track/:trackingNumber
export const trackByNumber = async (trackingNumber) => {
  try {
    const response = await axiosInstance.get(`/bookings/track/${trackingNumber}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Tracking number not found');
    
  } catch (error) {
    console.error('Track by number error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to track shipment',
      error: error.response?.data
    };
  }
};

// 15. UPDATE DELIVERY STATUS (Admin/Warehouse)
// Controller: exports.updateDeliveryStatus
// Endpoint: PUT /bookings/:id/delivery-status
export const updateDeliveryStatus = async (bookingId, statusData) => {
  try {
    const response = await axiosInstance.put(`/bookings/${bookingId}/delivery-status`, statusData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update delivery status');
    
  } catch (error) {
    console.error('Update delivery status error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update delivery status',
      error: error.response?.data
    };
  }
};

// 16. DOWNLOAD BOOKING DOCUMENT
// Controller: exports.downloadBookingDocument
// Endpoint: GET /bookings/:id/documents/:documentId/download
export const downloadBookingDocument = async (bookingId, documentId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'document.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Document downloaded successfully'
    };
    
  } catch (error) {
    console.error('Download document error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to download document',
      error: error.response?.data
    };
  }
};

// 17. ADD DOCUMENT TO BOOKING
// Controller: exports.addDocument
// Endpoint: POST /bookings/:id/documents
export const addDocument = async (bookingId, documentData) => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/documents`, documentData);
    
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

// ==================== HELPER FUNCTIONS ====================

// Get status color for UI
export const getStatusColor = (status) => {
  const statusColors = {
    'booking_requested': 'info',
    'price_quoted': 'warning',
    'booking_confirmed': 'primary',
    'cancelled': 'error',
    'rejected': 'error',
    'delivered': 'success'
  };
  
  return statusColors[status] || 'default';
};

// Get pricing status color
export const getPricingStatusColor = (status) => {
  const pricingColors = {
    'pending': 'default',
    'quoted': 'warning',
    'accepted': 'success',
    'rejected': 'error',
    'expired': 'default'
  };
  
  return pricingColors[status] || 'default';
};

// Get status display text
export const getStatusDisplayText = (status) => {
  const statusTexts = {
    'booking_requested': 'Booking Requested',
    'price_quoted': 'Price Quoted',
    'booking_confirmed': 'Booking Confirmed',
    'cancelled': 'Cancelled',
    'rejected': 'Rejected',
    'delivered': 'Delivered'
  };
  
  return statusTexts[status] || status;
};

// Get pricing status display text
export const getPricingStatusDisplayText = (status) => {
  const pricingTexts = {
    'pending': 'Pending',
    'quoted': 'Quoted',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'expired': 'Expired'
  };
  
  return pricingTexts[status] || status;
};

// Get shipment type display
export const getShipmentTypeDisplay = (type) => {
  const types = {
    'air_freight': 'Air Freight',
    'sea_freight': 'Sea Freight',
    'express_courier': 'Express Courier'
  };
  
  return types[type] || type;
};

// Get courier company display
export const getCourierCompanyDisplay = (company) => {
  const companies = {
    'DHL': 'DHL Express',
    'FedEx': 'FedEx',
    'UPS': 'UPS',
    'USPS': 'USPS',
    'Other': 'Other Courier'
  };
  
  return companies[company] || company;
};

// Get sender full name
export const getSenderName = (sender) => {
  if (!sender) return 'N/A';
  return sender.name || sender.companyName || 'N/A';
};

// Get receiver full name
export const getReceiverName = (receiver) => {
  if (!receiver) return 'N/A';
  return receiver.name || receiver.companyName || 'N/A';
};

// Format address
export const formatAddress = (addressObj) => {
  if (!addressObj) return 'N/A';
  
  const parts = [
    addressObj.addressLine1,
    addressObj.addressLine2,
    addressObj.city,
    addressObj.state,
    addressObj.country,
    addressObj.postalCode
  ].filter(Boolean);
  
  return parts.join(', ') || 'N/A';
};

// Format date
export const formatDate = (dateString, format = 'medium') => {
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
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Calculate totals from package details
export const calculatePackageTotals = (packageDetails) => {
  if (!packageDetails || !packageDetails.length) {
    return { totalPackages: 0, totalWeight: 0, totalVolume: 0 };
  }
  
  return packageDetails.reduce((totals, item) => {
    return {
      totalPackages: totals.totalPackages + (item.quantity || 0),
      totalWeight: totals.totalWeight + ((item.weight || 0) * (item.quantity || 0)),
      totalVolume: totals.totalVolume + ((item.volume || 0) * (item.quantity || 0))
    };
  }, { totalPackages: 0, totalWeight: 0, totalVolume: 0 });
};

// Format package details for display
export const formatPackageDetails = (packageDetails) => {
  if (!packageDetails || !packageDetails.length) return [];
  
  return packageDetails.map((item, index) => ({
    ...item,
    displayName: `${item.description} (${item.quantity} pcs, ${item.weight} kg, ${item.volume} cbm)`
  }));
};

// Check if quote is valid
export const isQuoteValid = (quote) => {
  if (!quote || !quote.validUntil) return false;
  return new Date() <= new Date(quote.validUntil);
};

// Calculate days remaining for quote
export const getQuoteDaysRemaining = (validUntil) => {
  if (!validUntil) return 0;
  
  const now = new Date();
  const validDate = new Date(validUntil);
  const diffTime = validDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Check if booking can be cancelled
export const canCancelBooking = (status) => {
  const cancellableStatuses = ['booking_requested', 'price_quoted'];
  return cancellableStatuses.includes(status);
};

// Check if booking can be quoted (Admin)
export const canQuoteBooking = (status, pricingStatus) => {
  return status === 'booking_requested' && pricingStatus === 'pending';
};

// Check if customer can respond to quote
export const canRespondToQuote = (status, pricingStatus, quoteValid) => {
  return status === 'price_quoted' && 
         pricingStatus === 'quoted' && 
         quoteValid === true;
};

// Check if booking has shipment
export const hasShipment = (booking) => {
  return booking && booking.shipmentId;
};

// Check if booking has invoice
export const hasInvoice = (booking) => {
  return booking && booking.invoiceId;
};

// Export bookings to CSV
export const exportBookingsToCSV = (bookings, filename = 'bookings.csv') => {
  if (!bookings || !bookings.length) return;

  const headers = [
    'Booking Number',
    'Tracking Number',
    'Sender Name',
    'Receiver Name',
    'Status',
    'Pricing Status',
    'Origin Country',
    'Destination Country',
    'Shipment Type',
    'Total Packages',
    'Total Weight (kg)',
    'Total Volume (cbm)',
    'Quoted Amount',
    'Currency',
    'Courier Company',
    'Created Date',
    'Confirmed Date'
  ];

  const csvData = bookings.map(booking => [
    booking.bookingNumber,
    booking.trackingNumber || 'N/A',
    getSenderName(booking.sender),
    getReceiverName(booking.receiver),
    getStatusDisplayText(booking.status),
    getPricingStatusDisplayText(booking.pricingStatus),
    booking.sender?.address?.country || 'N/A',
    booking.receiver?.address?.country || 'N/A',
    getShipmentTypeDisplay(booking.shipmentDetails?.shipmentType),
    booking.shipmentDetails?.totalPackages || 0,
    booking.shipmentDetails?.totalWeight || 0,
    booking.shipmentDetails?.totalVolume || 0,
    booking.quotedPrice?.amount || '',
    booking.quotedPrice?.currency || 'USD',
    getCourierCompanyDisplay(booking.courier?.company),
    formatDate(booking.createdAt, 'short'),
    booking.confirmedAt ? formatDate(booking.confirmedAt, 'short') : 'N/A'
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

// Custom hook for booking operations
import { useState } from 'react';

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const fetchBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBookingById(bookingId);
      if (result.success) {
        setBooking(result.data);
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

  const updateQuote = async (bookingId, quoteData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updatePriceQuote(bookingId, quoteData);
      if (result.success && result.data) {
        setBooking(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const accept = async (bookingId, notes) => {
    try {
      setLoading(true);
      setError(null);
      const result = await acceptQuote(bookingId, notes);
      if (result.success && result.data?.booking) {
        setBooking(result.data.booking);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reject = async (bookingId, reason) => {
    try {
      setLoading(true);
      setError(null);
      const result = await rejectQuote(bookingId, reason);
      if (result.success) {
        setBooking(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (bookingId, reason) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cancelBooking(bookingId, reason);
      if (result.success) {
        setBooking(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, statusData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateDeliveryStatus(bookingId, statusData);
      if (result.success) {
        setBooking(result.data);
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
    booking,
    fetchBooking,
    updateQuote,
    accept,
    reject,
    cancel,
    updateStatus
  };
};

// Custom hook for customer bookings
export const useCustomerBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchMyBookings = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyBookings(params);
      if (result.success) {
        setBookings(result.data);
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
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyBookingsSummary();
      if (result.success) {
        setSummary(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBookingDetails = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyBookingById(bookingId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTimeline = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyBookingTimeline(bookingId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInvoice = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyBookingInvoice(bookingId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getQuote = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyBookingQuote(bookingId);
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
    bookings,
    summary,
    pagination,
    fetchMyBookings,
    fetchSummary,
    getBookingDetails,
    getTimeline,
    getInvoice,
    getQuote
  };
};
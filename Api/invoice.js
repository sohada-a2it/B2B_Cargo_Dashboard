// services/invoiceService.js
import axiosInstance from '@/lib/axiosInstance';

// ==================== INVOICE API FUNCTIONS ====================

// 1. GET ALL INVOICES (Admin)
// Controller: exports.getAllInvoices
// Endpoint: GET /api/invoices/admin/all
export const getAllInvoices = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.paymentStatus && { paymentStatus: params.paymentStatus }),
      ...(params.customerId && { customerId: params.customerId }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.sort && { sort: params.sort })
    });

    const response = await axiosInstance.get(`/getAllInvoices?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        summary: response.data.summary,
        pagination: response.data.pagination,
        message: 'Invoices fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch invoices');
    
  } catch (error) {
    console.error('Get all invoices error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch invoices',
      error: error.response?.data
    };
  }
};

// 2. GET INVOICE BY ID
// Controller: exports.getInvoiceById
// Endpoint: GET /api/invoices/:id
export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await axiosInstance.get(`/getInvoiceById/${invoiceId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Invoice fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch invoice');
    
  } catch (error) {
    console.error('Get invoice by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch invoice',
      error: error.response?.data
    };
  }
};

// 3. GET INVOICES BY CUSTOMER
// Controller: exports.getInvoicesByCustomer
// Endpoint: GET /api/invoices/customer/:customerId
export const getInvoicesByCustomer = async (customerId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status })
    });

    const response = await axiosInstance.get(`/invoices/customer/${customerId}?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Customer invoices fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch customer invoices');
    
  } catch (error) {
    console.error('Get invoices by customer error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch customer invoices',
      error: error.response?.data
    };
  }
};

// 4. UPDATE INVOICE
// Controller: exports.updateInvoice
// Endpoint: PUT /api/invoices/:id
export const updateInvoice = async (invoiceId, updateData) => {
  try {
    const response = await axiosInstance.put(`/invoices/${invoiceId}`, updateData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Invoice updated successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to update invoice');
    
  } catch (error) {
    console.error('Update invoice error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update invoice',
      error: error.response?.data
    };
  }
};

// 5. DELETE INVOICE
// Controller: exports.deleteInvoice
// Endpoint: DELETE /api/invoices/:id
export const deleteInvoice = async (invoiceId) => {
  try {
    const response = await axiosInstance.delete(`/invoices/${invoiceId}`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Invoice deleted successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to delete invoice');
    
  } catch (error) {
    console.error('Delete invoice error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to delete invoice',
      error: error.response?.data
    };
  }
};

// 6. MARK INVOICE AS PAID
// Controller: exports.markAsPaid
// Endpoint: PUT /api/invoices/:id/mark-paid
export const markInvoiceAsPaid = async (invoiceId, paymentData) => {
  try {
    const response = await axiosInstance.put(`/mark-paid/${invoiceId}`, paymentData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Invoice marked as paid successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to mark invoice as paid');
    
  } catch (error) {
    console.error('Mark invoice as paid error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to mark invoice as paid',
      error: error.response?.data
    };
  }
};

// 7. SEND INVOICE EMAIL
// Controller: exports.sendInvoiceEmail
// Endpoint: POST /api/invoices/:id/send-email
export const sendInvoiceEmail = async (invoiceId, emailData) => {
  try {
    const response = await axiosInstance.post(`/invoices/${invoiceId}/send-email`, emailData);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Invoice email sent successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to send invoice email');
    
  } catch (error) {
    console.error('Send invoice email error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to send invoice email',
      error: error.response?.data
    };
  }
};

// 8. GET INVOICE STATS (Admin Dashboard)
// Controller: exports.getInvoiceStats
// Endpoint: GET /api/invoices/admin/stats
export const getInvoiceStats = async () => {
  try {
    const response = await axiosInstance.get('/getInvoiceStats');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Invoice stats fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch invoice stats');
    
  } catch (error) {
    console.error('Get invoice stats error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch invoice stats',
      error: error.response?.data
    };
  }
};

// 9. GENERATE INVOICE PDF
// Controller: exports.generateInvoicePDF
// Endpoint: POST /api/invoices/:id/generate-pdf
export const generateInvoicePDF = async (invoiceId) => {
  try {
    const response = await axiosInstance.post(`/invoices/${invoiceId}/generate-pdf`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Invoice PDF generated successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to generate invoice PDF');
    
  } catch (error) {
    console.error('Generate invoice PDF error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to generate invoice PDF',
      error: error.response?.data
    };
  }
};

// 10. BULK UPDATE INVOICES
// Controller: exports.bulkUpdateInvoices
// Endpoint: PUT /api/invoices/bulk/update
export const bulkUpdateInvoices = async (invoiceIds, updateData) => {
  try {
    const response = await axiosInstance.put('/invoices/bulk/update', {
      invoiceIds,
      updateData
    });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Invoices updated successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to bulk update invoices');
    
  } catch (error) {
    console.error('Bulk update invoices error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to bulk update invoices',
      error: error.response?.data
    };
  }
};

// 11. GET RECENT INVOICES
// Controller: exports.getRecentInvoices
// Endpoint: GET /api/invoices/admin/recent
export const getRecentInvoices = async (limit = 10) => {
  try {
    const response = await axiosInstance.get(`/invoices/admin/recent?limit=${limit}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Recent invoices fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch recent invoices');
    
  } catch (error) {
    console.error('Get recent invoices error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch recent invoices',
      error: error.response?.data
    };
  }
};

// 12. GET INVOICE BY BOOKING ID
// Controller: exports.getInvoiceByBooking
// Endpoint: GET /api/invoices/booking/:bookingId
export const getInvoiceByBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/invoices/booking/${bookingId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Invoice fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch invoice by booking');
    
  } catch (error) {
    console.error('Get invoice by booking error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch invoice by booking',
      error: error.response?.data
    };
  }
};

// 13. GET INVOICE BY SHIPMENT ID
// Controller: exports.getInvoiceByShipment
// Endpoint: GET /api/invoices/shipment/:shipmentId
export const getInvoiceByShipment = async (shipmentId) => {
  try {
    const response = await axiosInstance.get(`/invoices/shipment/${shipmentId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Invoice fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch invoice by shipment');
    
  } catch (error) {
    console.error('Get invoice by shipment error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch invoice by shipment',
      error: error.response?.data
    };
  }
};

// 14. TRACK BY NUMBER (Public)
// Controller: exports.trackByNumber
// Endpoint: GET /api/invoices/track/:trackingNumber
export const trackByNumber = async (trackingNumber) => {
  try {
    const response = await axiosInstance.get(`/invoices/track/${trackingNumber}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Tracking information fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch tracking information');
    
  } catch (error) {
    console.error('Track by number error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch tracking information',
      error: error.response?.data
    };
  }
};

// 15. GET MY BOOKING INVOICE (Customer)
// Controller: exports.getMyBookingInvoice
// Endpoint: GET /api/bookings/:id/invoice
export const getMyBookingInvoice = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}/invoice`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Booking invoice fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch booking invoice');
    
  } catch (error) {
    console.error('Get my booking invoice error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch booking invoice',
      error: error.response?.data
    };
  }
};

// 16. GET MY BOOKING QUOTE (Customer)
// Controller: exports.getMyBookingQuote
// Endpoint: GET /api/bookings/:id/quote
export const getMyBookingQuote = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}/quote`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Booking quote fetched successfully'
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch booking quote');
    
  } catch (error) {
    console.error('Get my booking quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch booking quote',
      error: error.response?.data
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

// Get payment status color for UI
export const getPaymentStatusColor = (status) => {
  const statusColors = {
    'paid': 'success',
    'pending': 'warning',
    'overdue': 'error',
    'cancelled': 'default',
    'refunded': 'info'
  };
  
  return statusColors[status] || 'default';
};

// Get invoice status color
export const getInvoiceStatusColor = (status) => {
  const statusColors = {
    'draft': 'default',
    'sent': 'info',
    'paid': 'success',
    'overdue': 'error',
    'cancelled': 'default'
  };
  
  return statusColors[status] || 'default';
};

// Get payment status display text
export const getPaymentStatusDisplayText = (status) => {
  const statusTexts = {
    'paid': 'Paid',
    'pending': 'Pending',
    'overdue': 'Overdue',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  
  return statusTexts[status] || status;
};

// Get invoice status display text
export const getInvoiceStatusDisplayText = (status) => {
  const statusTexts = {
    'draft': 'Draft',
    'sent': 'Sent',
    'paid': 'Paid',
    'overdue': 'Overdue',
    'cancelled': 'Cancelled'
  };
  
  return statusTexts[status] || status;
};

// Format invoice number with prefix
export const formatInvoiceNumber = (invoiceNumber) => {
  if (!invoiceNumber) return 'N/A';
  return `INV-${invoiceNumber}`;
};

// Calculate due status
export const getDueStatus = (dueDate, paymentStatus) => {
  if (paymentStatus === 'paid') return 'paid';
  if (!dueDate) return 'no-due-date';
  
  const today = new Date();
  const due = new Date(dueDate);
  
  if (today > due) return 'overdue';
  return 'pending';
};

// Get days until due
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Format currency with symbol
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
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

// Calculate tax amount
export const calculateTaxAmount = (subtotal, taxRate) => {
  return subtotal * (taxRate / 100);
};

// Calculate total with tax and discount
export const calculateTotal = (subtotal, taxAmount, discountAmount = 0) => {
  return subtotal + taxAmount - discountAmount;
};

// Validate payment data
export const validatePaymentData = (paymentData) => {
  const errors = {};
  
  if (!paymentData.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }
  
  if (paymentData.paymentMethod === 'bank_transfer' && !paymentData.paymentReference) {
    errors.paymentReference = 'Payment reference is required for bank transfer';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Check if invoice can be edited
export const canEditInvoice = (status) => {
  const editableStatuses = ['draft', 'sent'];
  return editableStatuses.includes(status);
};

// Check if invoice can be deleted
export const canDeleteInvoice = (status) => {
  const deletableStatuses = ['draft', 'cancelled'];
  return deletableStatuses.includes(status);
};

// Check if invoice can be marked as paid
export const canMarkAsPaid = (paymentStatus) => {
  return paymentStatus !== 'paid';
};

// Get payment methods
export const getPaymentMethods = () => {
  return [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'check', label: 'Check' },
    { value: 'online_payment', label: 'Online Payment' },
    { value: 'other', label: 'Other' }
  ];
};

// Get currency options
export const getCurrencyOptions = () => {
  return [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'BDT', label: 'BDT (৳)' },
    { value: 'INR', label: 'INR (₹)' }
  ];
};

// Export invoices to CSV
export const exportInvoicesToCSV = (invoices, filename = 'invoices.csv') => {
  if (!invoices || !invoices.length) return;

  const headers = [
    'Invoice Number',
    'Customer Name',
    'Booking Number',
    'Issue Date',
    'Due Date',
    'Subtotal',
    'Tax Amount',
    'Discount',
    'Total Amount',
    'Currency',
    'Payment Status',
    'Invoice Status',
    'Payment Method',
    'Payment Date'
  ];

  const csvData = invoices.map(invoice => [
    invoice.invoiceNumber,
    invoice.customerId ? 
      (invoice.customerId.firstName && invoice.customerId.lastName ? 
        `${invoice.customerId.firstName} ${invoice.customerId.lastName}` : 
        invoice.customerId.companyName || 'N/A') : 
      'N/A',
    invoice.bookingId?.bookingNumber || 'N/A',
    formatDate(invoice.issueDate, 'short'),
    formatDate(invoice.dueDate, 'short'),
    invoice.subtotal || 0,
    invoice.taxAmount || 0,
    invoice.discountAmount || 0,
    invoice.totalAmount || 0,
    invoice.currency || 'USD',
    getPaymentStatusDisplayText(invoice.paymentStatus),
    getInvoiceStatusDisplayText(invoice.status),
    invoice.paymentMethod || 'N/A',
    invoice.paymentDate ? formatDate(invoice.paymentDate, 'short') : 'N/A'
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

// Download invoice PDF
export const downloadInvoicePDF = async (invoiceId) => {
  try {
    // First generate PDF if not exists
    const generateResult = await generateInvoicePDF(invoiceId);
    
    if (!generateResult.success) {
      throw new Error(generateResult.message);
    }
    
    // Download the PDF
    const pdfUrl = generateResult.data.pdfUrl;
    const response = await axiosInstance.get(pdfUrl, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Invoice PDF downloaded successfully'
    };
    
  } catch (error) {
    console.error('Download invoice PDF error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to download invoice PDF',
      error: error.response?.data
    };
  }
};

// ==================== REACT HOOKS ====================

// Custom hook for invoice operations
import { useState, useCallback } from 'react';

export const useInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const fetchInvoice = useCallback(async (invoiceId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getInvoiceById(invoiceId);
      if (result.success) {
        setInvoice(result.data);
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

  const update = useCallback(async (invoiceId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateInvoice(invoiceId, updateData);
      if (result.success && result.data) {
        setInvoice(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsPaid = useCallback(async (invoiceId, paymentData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await markInvoiceAsPaid(invoiceId, paymentData);
      if (result.success && result.data) {
        setInvoice(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (invoiceId, emailData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await sendInvoiceEmail(invoiceId, emailData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePDF = useCallback(async (invoiceId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await generateInvoicePDF(invoiceId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (invoiceId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteInvoice(invoiceId);
      if (result.success) {
        setInvoice(null);
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
    invoice,
    fetchInvoice,
    update,
    markAsPaid,
    sendEmail,
    generatePDF,
    delete: remove
  };
};

// Custom hook for invoice list management
export const useInvoicesList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchAllInvoices = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllInvoices(params);
      if (result.success) {
        setInvoices(result.data);
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

  const fetchCustomerInvoices = useCallback(async (customerId, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getInvoicesByCustomer(customerId, params);
      if (result.success) {
        setInvoices(result.data);
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
      const result = await getInvoiceStats();
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

  const fetchRecent = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getRecentInvoices(limit);
      if (result.success) {
        setInvoices(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdate = useCallback(async (invoiceIds, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bulkUpdateInvoices(invoiceIds, updateData);
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
    invoices,
    summary,
    pagination,
    stats,
    fetchAllInvoices,
    fetchCustomerInvoices,
    fetchStats,
    fetchRecent,
    bulkUpdate
  };
};

// Export all functions as default object
export default {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByCustomer,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  sendInvoiceEmail,
  getInvoiceStats,
  generateInvoicePDF,
  bulkUpdateInvoices,
  getRecentInvoices,
  getInvoiceByBooking,
  getInvoiceByShipment,
  trackByNumber,
  getMyBookingInvoice,
  getMyBookingQuote,
  // Helpers
  getPaymentStatusColor,
  getInvoiceStatusColor,
  getPaymentStatusDisplayText,
  getInvoiceStatusDisplayText,
  formatInvoiceNumber,
  getDueStatus,
  getDaysUntilDue,
  formatCurrency,
  formatDate,
  calculateTaxAmount,
  calculateTotal,
  validatePaymentData,
  canEditInvoice,
  canDeleteInvoice,
  canMarkAsPaid,
  getPaymentMethods,
  getCurrencyOptions,
  exportInvoicesToCSV,
  downloadInvoicePDF,
  // Hooks
  useInvoice,
  useInvoicesList
};
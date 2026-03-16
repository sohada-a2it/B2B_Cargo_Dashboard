import { useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';

// ==================== DAMAGE REPORT API FUNCTIONS ====================

// 1. GET ALL DAMAGE REPORTS (Admin/Staff)
// Controller: exports.getAllDamageReports
// Endpoint: GET /damage-reports/all
export const getAllDamageReports = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.condition && { condition: params.condition }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.search && { search: params.search })
    });

    const response = await axiosInstance.get(`/damage-reports/all?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        stats: response.data.stats,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch damage reports');
    
  } catch (error) {
    console.error('Get all damage reports error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch damage reports',
      error: error.response?.data
    };
  }
};

// 2. GET SINGLE DAMAGE REPORT BY ID
// Controller: exports.getDamageReportById
// Endpoint: GET /damage-reports/:id
export const getDamageReportById = async (reportId) => {
  try {
    const response = await axiosInstance.get(`/damage-reports/${reportId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch damage report');
    
  } catch (error) {
    console.error('Get damage report by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch damage report',
      error: error.response?.data
    };
  }
};

// 3. UPDATE DAMAGE REPORT STATUS (Admin/Staff)
// Controller: exports.updateDamageReportStatus
// Endpoint: PUT /damage-reports/:id/status
export const updateDamageReportStatus = async (reportId, statusData) => {
  try {
    const response = await axiosInstance.put(`/damage-reports/${reportId}/status`, statusData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update damage report');
    
  } catch (error) {
    console.error('Update damage report error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update damage report',
      error: error.response?.data
    };
  }
};

// 4. ADD INSURANCE CLAIM TO DAMAGE REPORT
// Controller: exports.addInsuranceClaim
// Endpoint: POST /damage-reports/:id/insurance
export const addInsuranceClaim = async (reportId, claimData) => {
  try {
    const response = await axiosInstance.post(`/damage-reports/${reportId}/insurance`, claimData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add insurance claim');
    
  } catch (error) {
    console.error('Add insurance claim error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to add insurance claim',
      error: error.response?.data
    };
  }
};

// 5. GET DAMAGE REPORT STATISTICS
// Controller: exports.getDamageReportStats
// Endpoint: GET /damage-reports/stats
export const getDamageReportStats = async () => {
  try {
    const response = await axiosInstance.get('/damage-reports/stats');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch statistics');
    
  } catch (error) {
    console.error('Get damage stats error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch statistics',
      error: error.response?.data
    };
  }
};

// 6. BULK UPDATE DAMAGE REPORTS (Admin only)
// Controller: exports.bulkUpdateDamageReports
// Endpoint: POST /damage-reports/bulk/update
export const bulkUpdateDamageReports = async (updateData) => {
  try {
    const response = await axiosInstance.post('/damage-reports/bulk/update', updateData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to bulk update damage reports');
    
  } catch (error) {
    console.error('Bulk update error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to bulk update damage reports',
      error: error.response?.data
    };
  }
};

// 7. DELETE DAMAGE REPORT (Admin only)
// Controller: exports.deleteDamageReport
// Endpoint: DELETE /damage-reports/:id
export const deleteDamageReport = async (reportId) => {
  try {
    const response = await axiosInstance.delete(`/damage-reports/${reportId}`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to delete damage report');
    
  } catch (error) {
    console.error('Delete damage report error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to delete damage report',
      error: error.response?.data
    };
  }
};

// 8. EXPORT DAMAGE REPORTS
// Controller: exports.exportDamageReports
// Endpoint: GET /damage-reports/export
export const exportDamageReports = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      ...(params.format && { format: params.format || 'csv' }),
      ...(params.status && { status: params.status }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    });

    const response = await axiosInstance.get(`/damage-reports/export?${queryParams}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Set filename
    const filename = `damage-reports-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Damage reports exported successfully'
    };
    
  } catch (error) {
    console.error('Export damage reports error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to export damage reports',
      error: error.response?.data
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

// Get status color for UI
export const getDamageStatusColor = (status) => {
  const statusColors = {
    'pending_review': 'warning',
    'approved': 'success',
    'rejected': 'error',
    'disposed': 'default',
    'returned': 'info'
  };
  
  return statusColors[status] || 'default';
};

// Get condition color
export const getDamageConditionColor = (condition) => {
  const conditionColors = {
    'Minor Damage': 'warning',
    'Major Damage': 'error',
    'Partial': 'warning',
    'Shortage': 'info'
  };
  
  return conditionColors[condition] || 'default';
};

// Get disposition color
export const getDispositionColor = (disposition) => {
  const dispositionColors = {
    'quarantine': 'warning',
    'scrap': 'error',
    'return': 'info',
    'rework': 'primary',
    'insurance': 'secondary',
    'restock': 'success'
  };
  
  return dispositionColors[disposition] || 'default';
};

// Get status display text
export const getDamageStatusDisplayText = (status) => {
  const statusTexts = {
    'pending_review': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'disposed': 'Disposed',
    'returned': 'Returned to Supplier'
  };
  
  return statusTexts[status] || status;
};

// Get condition display text
export const getDamageConditionDisplayText = (condition) => {
  const conditionTexts = {
    'Minor Damage': 'Minor Damage',
    'Major Damage': 'Major Damage',
    'Partial': 'Partially Damaged',
    'Shortage': 'Shortage'
  };
  
  return conditionTexts[condition] || condition;
};

// Get disposition display text
export const getDispositionDisplayText = (disposition) => {
  const dispositionTexts = {
    'quarantine': 'Quarantine - Hold',
    'scrap': 'Scrap - Dispose',
    'return': 'Return to Supplier',
    'rework': 'Rework - Repair',
    'insurance': 'Insurance Claim',
    'restock': 'Restock - Return to Inventory'
  };
  
  return dispositionTexts[disposition] || disposition;
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

// Format location
export const formatLocation = (location) => {
  if (!location) return 'Not assigned';
  
  const parts = [
    location.zone,
    location.aisle,
    location.rack,
    location.bin
  ].filter(Boolean);
  
  return parts.join('-') || 'Not assigned';
};

// Get severity level
export const getDamageSeverity = (condition) => {
  const severity = {
    'Minor Damage': 1,
    'Partial': 2,
    'Major Damage': 3,
    'Shortage': 1
  };
  
  return severity[condition] || 0;
};

// Check if insurance claim can be filed
export const canFileInsurance = (report) => {
  if (!report) return false;
  return report.status === 'approved' && !report.insuranceClaim?.filed;
};

// Check if report can be disposed
export const canDispose = (report) => {
  if (!report) return false;
  return report.status === 'approved' && report.disposition === 'scrap';
};

// Export damage reports to CSV
export const exportToCSV = (reports, filename = 'damage-reports.csv') => {
  if (!reports || !reports.length) return;

  const headers = [
    'Report Number',
    'Tracking Number',
    'Condition',
    'Findings',
    'Status',
    'Disposition',
    'Reported By',
    'Reported Date',
    'Reviewed By',
    'Reviewed Date',
    'Insurance Claim',
    'Claim Number',
    'Claim Amount',
    'Location'
  ];

  const csvData = reports.map(report => [
    report.reportNumber,
    report.shipmentId?.trackingNumber || 'N/A',
    getDamageConditionDisplayText(report.condition),
    report.findings || '',
    getDamageStatusDisplayText(report.status),
    getDispositionDisplayText(report.disposition),
    report.reportedBy ? `${report.reportedBy.firstName || ''} ${report.reportedBy.lastName || ''}`.trim() || 'N/A' : 'N/A',
    formatDate(report.reportedAt, 'short'),
    report.reviewedBy ? `${report.reviewedBy.firstName || ''} ${report.reviewedBy.lastName || ''}`.trim() || 'N/A' : 'N/A',
    report.reviewedAt ? formatDate(report.reviewedAt, 'short') : 'N/A',
    report.insuranceClaim?.filed ? 'Yes' : 'No',
    report.insuranceClaim?.claimNumber || 'N/A',
    report.insuranceClaim?.amount ? formatCurrency(report.insuranceClaim.amount) : 'N/A',
    formatLocation(report.location)
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

// Custom hook for damage report operations
export const useDamageReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const fetchReport = async (reportId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDamageReportById(reportId);
      if (result.success) {
        setReport(result.data);
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

  const updateStatus = async (reportId, statusData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateDamageReportStatus(reportId, statusData);
      if (result.success && result.data) {
        setReport(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addClaim = async (reportId, claimData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addInsuranceClaim(reportId, claimData);
      if (result.success) {
        setReport(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (reportId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteDamageReport(reportId);
      if (result.success) {
        setReport(null);
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
    report,
    fetchReport,
    updateStatus,
    addClaim,
    delete: remove
  };
};

// Custom hook for damage reports list
export const useDamageReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchReports = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllDamageReports(params);
      if (result.success) {
        setReports(result.data);
        setStats(result.stats);
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

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDamageReportStats();
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
  };

  const bulkUpdate = async (updateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bulkUpdateDamageReports(updateData);
      if (result.success) {
        // Refresh list after bulk update
        await fetchReports();
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
    reports,
    stats,
    pagination,
    fetchReports,
    fetchStats,
    bulkUpdate
  };
};
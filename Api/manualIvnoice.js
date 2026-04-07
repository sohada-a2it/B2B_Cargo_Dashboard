import axiosInstance from '@/lib/axiosInstance';

// ==================== INVOICE API SERVICES ====================

/**
 * Get all invoices with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.status - Filter by status (paid, sent, generated, overdue)
 * @param {string} params.search - Search by invoice number, shipment number, or customer name
 * @returns {Promise<Object>} Invoices data with pagination
 */
export const getManualInvoices = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        
        const url = `/getAllmanualInvoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await axiosInstance.get(url);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                summary: response.data.summary,
                pagination: response.data.pagination,
                message: response.data.message
            };
        }
        
        throw new Error(response.data.message || 'Failed to fetch invoices');
        
    } catch (error) {
        console.error('❌ Get all invoices error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to fetch invoices',
            data: [],
            summary: { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0 },
            pagination: { total: 0, page: 1, limit: 20, pages: 0 }
        };
    }
};

/**
 * Get single invoice by ID
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Invoice data
 */
export const getInvoiceById = async (invoiceId) => {
    try {
        const response = await axiosInstance.get(`/invoices/${invoiceId}`);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        }
        
        throw new Error(response.data.message || 'Failed to fetch invoice');
        
    } catch (error) {
        console.error('❌ Get invoice by ID error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to fetch invoice',
            data: null
        };
    }
};

/**
 * Delete invoice by ID
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Delete status
 */
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
        console.error('❌ Delete invoice error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to delete invoice'
        };
    }
};

/**
 * Download invoice PDF
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<void>}
 */
export const downloadInvoicePDF = async (invoiceId) => {
    try {
        const response = await axiosInstance.get(`/invoices/${invoiceId}/download`, {
            responseType: 'blob'
        });
        
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers['content-disposition'];
        let filename = `invoice-${invoiceId}.pdf`;
        if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '');
            }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return {
            success: true,
            message: 'PDF downloaded successfully'
        };
        
    } catch (error) {
        console.error('❌ Download PDF error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to download PDF'
        };
    }
};

/**
 * Get invoice summary/stats
 * @returns {Promise<Object>} Invoice statistics
 */
export const getInvoiceSummary = async () => {
    try {
        const response = await axiosInstance.get('/invoices/summary');
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        }
        
        throw new Error(response.data.message || 'Failed to fetch summary');
        
    } catch (error) {
        console.error('❌ Get invoice summary error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to fetch summary',
            data: {
                total: 0,
                paid: 0,
                pending: 0,
                overdue: 0,
                totalAmount: 0
            }
        };
    }
};

/**
 * Get invoices by status
 * @param {string} status - Status (paid, sent, generated, overdue)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Filtered invoices
 */
export const getInvoicesByStatus = async (status, page = 1, limit = 20) => {
    return getManualInvoices({ status, page, limit });
};

/**
 * Search invoices
 * @param {string} searchTerm - Search term
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Search results
 */
export const searchInvoices = async (searchTerm, page = 1, limit = 20) => {
    return getManualInvoices({ search: searchTerm, page, limit });
};
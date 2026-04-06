import axiosInstance from '@/lib/axiosInstance';
import Cookies from 'js-cookie';

/**
 * Fetch all shipments (NewShipment)
 * @param {Object} params - Filters & pagination
 */
export const getAllNewShipments = async (params = {}) => {
  try {
    console.log('📦 Fetching shipments with params:', params);

    // URL query params
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
      timestamp: Date.now() // cache bypass
    });

    // API call
    const response = await axiosInstance.get(`/getNewShipment?${queryParams}`);

    if (response.data.success) {
      // Ensure data array exists
      const shipments = Array.isArray(response.data.data) ? response.data.data : [];

      return {
        success: true,
        data: shipments,
        summary: response.data.summary || {},
        pagination: response.data.pagination || {
          total: shipments.length,
          page: params.page || 1,
          limit: params.limit || 20,
          pages: Math.ceil(shipments.length / (params.limit || 20))
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
      error: error.response?.data || null,
      pagination: {
        total: 0,
        page: params.page || 1,
        limit: params.limit || 20,
        pages: 0
      }
    };
  }
};
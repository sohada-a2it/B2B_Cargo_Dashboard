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

// Update shipment status
export const updateShipmentStatus = async (shipmentId, statusData) => {
  try {
    console.log('📦 Updating shipment status:', { shipmentId, statusData });

    // Make API call to update status
    const response = await axiosInstance.put(`/updateShipmentStatus/${shipmentId}`, statusData);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Shipment status updated successfully'
      };
    }

    throw new Error(response.data.message || 'Failed to update shipment status');

  } catch (error) {
    console.error('❌ Update shipment status error:', error);

    return {
      success: false,
      data: null,
      message: error.response?.data?.error || error.message || 'Failed to update shipment status',
      error: error.response?.data || null
    };
  }
};
// Api/newShipping.js - সম্পূর্ণ নতুন updateTrackingNumber ফাংশন

// Api/newShipping.js

import axios from 'axios';
import { getAuthToken } from '@/helper/SessionHelper';

// ✅ API_URL ডিফাইন করুন
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const updateNewTrackingNumber = async (shipmentId, trackingNumber) => {
  try {
    if (!shipmentId) throw new Error('Shipment ID is required');
    if (!trackingNumber) throw new Error('Tracking number is required');
    
    const safeTrackingNumber = String(trackingNumber).trim();
    
    if (safeTrackingNumber === '') {
      throw new Error('Tracking number cannot be empty');
    }
    
    const token = getAuthToken();
    
    console.log('📤 Calling API:', `${API_URL}/api/v1/new-update-shipment-tracking/${shipmentId}`);
    
    // ✅ ফুল URL ব্যবহার করুন
    const response = await axios.put(
      `${API_URL}/new-update-shipment-tracking/${shipmentId}`,
      { trackingNumber: safeTrackingNumber },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ API Response:', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Tracking number updated successfully'
    };
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update tracking number'
    };
  }
};
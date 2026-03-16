// app/warehouse/damage-reports/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAllDamageReports,
  getDamageReportStats,
  updateDamageReportStatus,
  addInsuranceClaim,
  deleteDamageReport,
  bulkUpdateDamageReports,
  exportDamageReports,
  getDamageStatusColor,
  getDamageConditionColor,
  getDispositionColor,
  getDamageStatusDisplayText,
  getDamageConditionDisplayText,
  getDispositionDisplayText,
  formatLocation,
  formatCurrency,
  formatDate,
  useDamageReports,
  useDamageReport
} from '@/Api/damage';
import {
  Loader2, AlertTriangle, AlertOctagon, Package, Search,
  Calendar, MapPin, User, X, CheckCircle, Eye, Filter,
  ChevronLeft, ChevronRight, Download, RefreshCw,
  FileText, Trash2, Edit, Plus, Shield, DollarSign,
  Clock, Check, AlertCircle, Info, Printer, Upload,
  ArrowLeft, Home, Grid, List, SlidersHorizontal,
  PieChart, TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ==================== CONSTANTS ====================

const STATUS_COLORS = {
  pending_review: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
  approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: X },
  disposed: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Trash2 },
  returned: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Package }
};

const CONDITION_COLORS = {
  'Minor Damage': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
  'Major Damage': { bg: 'bg-red-100', text: 'text-red-700', icon: AlertOctagon },
  'Partial': { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
  'Shortage': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package }
};

const DISPOSITION_COLORS = {
  quarantine: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Shield },
  scrap: { bg: 'bg-red-100', text: 'text-red-700', icon: Trash2 },
  return: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
  rework: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Edit },
  insurance: { bg: 'bg-green-100', text: 'text-green-700', icon: DollarSign },
  restock: { bg: 'bg-teal-100', text: 'text-teal-700', icon: Package }
};

// ==================== STAT CARD COMPONENT ====================

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, trendValue, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue} from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// ==================== FILTER BAR COMPONENT ====================

const FilterBar = ({ filters, setFilters, total, onRefresh }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      {/* Main Filter Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by report #, tracking #..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
          >
            <option value="">All Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="disposed">Disposed</option>
            <option value="returned">Returned</option>
          </select>

          <select
            value={filters.condition}
            onChange={(e) => setFilters({ ...filters, condition: e.target.value, page: 1 })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
          >
            <option value="">All Conditions</option>
            <option value="Minor Damage">Minor Damage</option>
            <option value="Major Damage">Major Damage</option>
            <option value="Partial">Partial</option>
            <option value="Shortage">Shortage</option>
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors ${
              showAdvanced ? 'bg-orange-50 border-orange-200' : ''
            }`}
          >
            <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => exportDamageReports(filters)}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          <span className="text-sm text-gray-500 ml-2">
            Total: <span className="font-medium">{total}</span> reports
          </span>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Disposition</label>
            <select
              value={filters.disposition}
              onChange={(e) => setFilters({ ...filters, disposition: e.target.value, page: 1 })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
            >
              <option value="">All Dispositions</option>
              <option value="quarantine">Quarantine</option>
              <option value="scrap">Scrap</option>
              <option value="return">Return</option>
              <option value="rework">Rework</option>
              <option value="insurance">Insurance</option>
              <option value="restock">Restock</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                search: '',
                status: '',
                condition: '',
                disposition: '',
                startDate: '',
                endDate: '',
                page: 1
              })}
              className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== DAMAGE REPORT CARD COMPONENT ====================

const DamageReportCard = ({ report, onView, onUpdate, onDelete }) => {
  const status = STATUS_COLORS[report.status] || STATUS_COLORS.pending_review;
  const condition = CONDITION_COLORS[report.condition] || CONDITION_COLORS['Minor Damage'];
  const disposition = DISPOSITION_COLORS[report.disposition] || DISPOSITION_COLORS.quarantine;
  
  const StatusIcon = status.icon;
  const ConditionIcon = condition.icon;
  const DispositionIcon = disposition.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-xl transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${status.bg}`}>
            <StatusIcon className={`h-5 w-5 ${status.text}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-bold text-gray-900">
                {report.reportNumber}
              </p>
              <span className={`px-2 py-0.5 text-xs rounded-full ${status.bg} ${status.text}`}>
                {getDamageStatusDisplayText(report.status)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {report.shipmentId?.trackingNumber || 'No tracking'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(report)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => onUpdate(report)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            title="Update Status"
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(report._id)}
            className="p-1.5 hover:bg-red-100 rounded-lg"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Condition & Disposition Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${condition.bg} ${condition.text}`}>
          <ConditionIcon className="h-3 w-3 mr-1" />
          {getDamageConditionDisplayText(report.condition)}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${disposition.bg} ${disposition.text}`}>
          <DispositionIcon className="h-3 w-3 mr-1" />
          {getDispositionDisplayText(report.disposition)}
        </span>
        {report.insuranceClaim?.filed && (
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <DollarSign className="h-3 w-3 mr-1" />
            Insurance Filed
          </span>
        )}
      </div>

      {/* Findings */}
      {report.findings && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 bg-gray-50 p-2 rounded-lg">
          "{report.findings}"
        </p>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center text-gray-500">
          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {formatLocation(report.location) || 'Location N/A'}
        </div>
        <div className="flex items-center text-gray-500">
          <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {report.reportedBy?.firstName || 'Staff'}
        </div>
        <div className="flex items-center text-gray-500">
          <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {formatDate(report.reportedAt, 'short')}
        </div>
        {report.insuranceClaim?.amount > 0 && (
          <div className="flex items-center text-gray-500">
            <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-400" />
            {formatCurrency(report.insuranceClaim.amount)}
          </div>
        )}
      </div>

      {/* Insurance Claim Info */}
      {report.insuranceClaim?.filed && (
        <div className="mt-2 pt-2 border-t border-dashed text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Claim #:</span>
            <span className="font-medium">{report.insuranceClaim.claimNumber}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">Status:</span>
            <span className="font-medium capitalize">{report.insuranceClaim.status}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      {report.reviewedBy && (
        <div className="mt-3 pt-2 border-t text-xs text-gray-400 flex items-center justify-between">
          <span className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Reviewed by {report.reviewedBy.firstName}
          </span>
          <span>{formatDate(report.reviewedAt, 'short')}</span>
        </div>
      )}
    </div>
  );
};

// ==================== DETAILS MODAL COMPONENT ====================

const DetailsModal = ({ report, onClose, onUpdate }) => {
  if (!report) return null;

  const status = STATUS_COLORS[report.status] || STATUS_COLORS.pending_review;
  const condition = CONDITION_COLORS[report.condition] || CONDITION_COLORS['Minor Damage'];
  const disposition = DISPOSITION_COLORS[report.disposition] || DISPOSITION_COLORS.quarantine;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Damage Report Details</h2>
            <p className="text-sm text-gray-500 mt-1">{report.reportNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Status Badges */}
          <div className="flex gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.text}`}>
              {getDamageStatusDisplayText(report.status)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${condition.bg} ${condition.text}`}>
              {getDamageConditionDisplayText(report.condition)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${disposition.bg} ${disposition.text}`}>
              {getDispositionDisplayText(report.disposition)}
            </span>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="col-span-2 space-y-6">
              {/* Shipment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Shipment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Tracking Number</p>
                    <p className="text-sm font-medium">{report.shipmentId?.trackingNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipment Number</p>
                    <p className="text-sm font-medium">{report.shipmentId?.shipmentNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm">{report.shipmentId?.status || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Findings</h3>
                <p className="text-sm">{report.findings || 'No findings recorded'}</p>
              </div>

              {/* Package Details */}
              {report.details && report.details.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Package Details</h3>
                  <div className="space-y-2">
                    {report.details.map((detail, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border">
                        <div className="flex justify-between">
                          <span className="font-medium">Package {detail.packageIndex + 1}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            detail.condition === 'Good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {detail.condition}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          <div>Passed: {detail.passed}</div>
                          <div>Failed: {detail.failed}</div>
                          {detail.notes && <div className="col-span-3">Notes: {detail.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Meta Info */}
            <div className="space-y-4">
              {/* Location */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Storage Location</h3>
                <p className="text-sm">{formatLocation(report.location) || 'Not assigned'}</p>
              </div>

              {/* Reported By */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Reported By</h3>
                <p className="text-sm font-medium">
                  {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-1">{report.reportedBy?.email}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(report.reportedAt, 'long')}</p>
              </div>

              {/* Reviewed By */}
              {report.reviewedBy && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Reviewed By</h3>
                  <p className="text-sm font-medium">
                    {report.reviewedBy.firstName} {report.reviewedBy.lastName}
                  </p>
                  {report.reviewNotes && (
                    <p className="text-xs text-gray-600 mt-2">Notes: {report.reviewNotes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{formatDate(report.reviewedAt, 'long')}</p>
                </div>
              )}

              {/* Insurance Claim */}
              {report.insuranceClaim?.filed && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    Insurance Claim
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Claim #:</span>
                      <span className="font-medium">{report.insuranceClaim.claimNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{formatCurrency(report.insuranceClaim.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{report.insuranceClaim.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => onUpdate(report)}
                  className="w-full px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== UPDATE STATUS MODAL ====================

const UpdateStatusModal = ({ report, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: report?.status || 'pending_review',
    disposition: report?.disposition || 'quarantine',
    reviewNotes: report?.reviewNotes || '',
    insuranceClaim: {
      filed: report?.insuranceClaim?.filed || false,
      claimNumber: report?.insuranceClaim?.claimNumber || '',
      amount: report?.insuranceClaim?.amount || '',
      status: report?.insuranceClaim?.status || 'pending'
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateDamageReportStatus(report._id, formData);
      
      if (result.success) {
        toast.success('Damage report updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInsurance = async () => {
    if (!formData.insuranceClaim.claimNumber || !formData.insuranceClaim.amount) {
      toast.warning('Please fill claim number and amount');
      return;
    }

    setLoading(true);
    try {
      const result = await addInsuranceClaim(report._id, {
        claimNumber: formData.insuranceClaim.claimNumber,
        amount: parseFloat(formData.insuranceClaim.amount),
        status: formData.insuranceClaim.status
      });

      if (result.success) {
        toast.success('Insurance claim added');
        setFormData(prev => ({
          ...prev,
          insuranceClaim: { ...prev.insuranceClaim, filed: true }
        }));
      }
    } catch (error) {
      toast.error('Failed to add insurance claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Update Damage Report</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              >
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="disposed">Disposed</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            {/* Disposition */}
            <div>
              <label className="block text-sm font-medium mb-1">Disposition</label>
              <select
                value={formData.disposition}
                onChange={(e) => setFormData({ ...formData, disposition: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              >
                <option value="quarantine">Quarantine - Hold</option>
                <option value="scrap">Scrap - Dispose</option>
                <option value="return">Return to Supplier</option>
                <option value="rework">Rework - Repair</option>
                <option value="insurance">Insurance Claim</option>
                <option value="restock">Restock - Return to Inventory</option>
              </select>
            </div>

            {/* Review Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Review Notes</label>
              <textarea
                value={formData.reviewNotes}
                onChange={(e) => setFormData({ ...formData, reviewNotes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
                placeholder="Add your review notes..."
              />
            </div>

            {/* Insurance Claim Section */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Insurance Claim</h3>
              
              {!formData.insuranceClaim.filed ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Claim Number"
                    value={formData.insuranceClaim.claimNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      insuranceClaim: { ...formData.insuranceClaim, claimNumber: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Claim Amount"
                    value={formData.insuranceClaim.amount}
                    onChange={(e) => setFormData({
                      ...formData,
                      insuranceClaim: { ...formData.insuranceClaim, amount: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={formData.insuranceClaim.status}
                    onChange={(e) => setFormData({
                      ...formData,
                      insuranceClaim: { ...formData.insuranceClaim, status: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddInsurance}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Add Insurance Claim
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm">Claim Filed ✓</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Claim #: {formData.insuranceClaim.claimNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== BULK UPDATE MODAL ====================

const BulkUpdateModal = ({ selectedIds, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    disposition: '',
    reviewNotes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.status && !formData.disposition) {
      toast.warning('Please select at least one field to update');
      return;
    }

    setLoading(true);
    try {
      const result = await bulkUpdateDamageReports({
        reportIds: selectedIds,
        ...formData
      });

      if (result.success) {
        toast.success(`Updated ${result.data.modifiedCount} reports`);
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to bulk update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-2">Bulk Update Reports</h2>
          <p className="text-sm text-gray-500 mb-4">
            Updating {selectedIds.length} selected reports
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status (Optional)</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">No Change</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="disposed">Disposed</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Disposition (Optional)</label>
              <select
                value={formData.disposition}
                onChange={(e) => setFormData({ ...formData, disposition: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">No Change</option>
                <option value="quarantine">Quarantine</option>
                <option value="scrap">Scrap</option>
                <option value="return">Return</option>
                <option value="rework">Rework</option>
                <option value="insurance">Insurance</option>
                <option value="restock">Restock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Review Notes (Optional)</label>
              <textarea
                value={formData.reviewNotes}
                onChange={(e) => setFormData({ ...formData, reviewNotes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Add notes for all selected reports..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update All'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function DamageReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    condition: '',
    disposition: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 12
  });

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsResult, statsResult] = await Promise.all([
        getAllDamageReports(filters),
        getDamageReportStats()
      ]);

      if (reportsResult.success) {
        setReports(reportsResult.data);
        setPagination(reportsResult.pagination);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // Handle refresh
  const handleRefresh = () => {
    loadData();
    toast.info('Data refreshed');
  };

  // Handle view details
  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetails(true);
  };

  // Handle update
  const handleUpdate = (report) => {
    setSelectedReport(report);
    setShowUpdate(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this damage report?')) return;

    try {
      const result = await deleteDamageReport(id);
      if (result.success) {
        toast.success('Report deleted successfully');
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedIds(reports.map(r => r._id));
    } else {
      setSelectedIds([]);
    }
  }, [selectAll, reports]);

  // Handle individual select
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Chart data
  const statusChartData = {
    labels: stats?.byStatus?.map(s => getDamageStatusDisplayText(s._id)) || [],
    datasets: [{
      data: stats?.byStatus?.map(s => s.count) || [],
      backgroundColor: [
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(54, 162, 235, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const conditionChartData = {
    labels: stats?.byCondition?.map(c => getDamageConditionDisplayText(c._id)) || [],
    datasets: [{
      data: stats?.byCondition?.map(c => c.count) || [],
      backgroundColor: [
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(54, 162, 235, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link href="/warehouse" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <AlertOctagon className="h-6 w-6 mr-2 text-red-500" />
                  Damage Reports
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and track all damaged goods reports
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-lg border p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <StatCard
              title="Total Reports"
              value={stats?.total || 0}
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              title="Pending Review"
              value={stats?.pendingReview || 0}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Major Damage"
              value={stats?.byCondition?.find(c => c._id === 'Major Damage')?.count || 0}
              icon={AlertOctagon}
              color="red"
            />
            <StatCard
              title="Insurance Claims"
              value={stats?.byStatus?.find(s => s._id === 'approved')?.count || 0}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="This Month"
              value={stats?.monthly?.[0]?.count || 0}
              icon={Activity}
              color="blue"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-medium mb-3">Reports by Status</h3>
              <div className="h-48">
                <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-medium mb-3">Reports by Condition</h3>
              <div className="h-48">
                <Pie data={conditionChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            total={pagination?.total || 0}
            onRefresh={handleRefresh}
          />

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-sm text-orange-700">
                {selectedIds.length} reports selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectAll(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-white rounded"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowBulk(true)}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Bulk Update
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reports Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-[#E67E22] mb-4" />
            <p className="text-sm text-gray-500">Loading damage reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No damage reports found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {filters.search || filters.status || filters.condition
                ? 'No reports match your filters'
                : 'All shipments have been inspected without damage'}
            </p>
            {(filters.search || filters.status || filters.condition) && (
              <button
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  condition: '',
                  disposition: '',
                  startDate: '',
                  endDate: '',
                  page: 1
                })}
                className="text-[#E67E22] hover:text-[#d35400] text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <div key={report._id} className="relative">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(report._id)}
                  onChange={() => toggleSelect(report._id)}
                  className="absolute top-2 left-2 z-10 h-4 w-4 rounded border-gray-300 text-[#E67E22] focus:ring-[#E67E22]"
                />
                <DamageReportCard
                  report={report}
                  onView={handleViewDetails}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={() => setSelectAll(!selectAll)}
                      className="h-4 w-4 rounded border-gray-300 text-[#E67E22]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disposition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(report._id)}
                        onChange={() => toggleSelect(report._id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#E67E22]"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{report.reportNumber}</td>
                    <td className="px-6 py-4 text-sm">{report.shipmentId?.trackingNumber || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${CONDITION_COLORS[report.condition]?.bg}`}>
                        {getDamageConditionDisplayText(report.condition)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[report.status]?.bg}`}>
                        {getDamageStatusDisplayText(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${DISPOSITION_COLORS[report.disposition]?.bg}`}>
                        {getDispositionDisplayText(report.disposition)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatLocation(report.location)}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(report.reportedAt, 'short')}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewDetails(report)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdate(report)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Showing page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setFilters({ ...filters, page: pageNum })}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      pagination.page === pageNum
                        ? 'bg-[#E67E22] text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetails && selectedReport && (
        <DetailsModal
          report={selectedReport}
          onClose={() => {
            setShowDetails(false);
            setSelectedReport(null);
          }}
          onUpdate={() => {
            setShowDetails(false);
            setShowUpdate(true);
          }}
        />
      )}

      {showUpdate && selectedReport && (
        <UpdateStatusModal
          report={selectedReport}
          onClose={() => {
            setShowUpdate(false);
            setSelectedReport(null);
          }}
          onSuccess={loadData}
        />
      )}

      {showBulk && (
        <BulkUpdateModal
          selectedIds={selectedIds}
          onClose={() => {
            setShowBulk(false);
            setSelectedIds([]);
            setSelectAll(false);
          }}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
// app/admin/invoices/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getAllInvoices,
  getInvoiceById,
  getInvoiceStats,
  markInvoiceAsPaid,
  sendInvoiceEmail,
  deleteInvoice,
  bulkUpdateInvoices,
  getPaymentStatusColor,
  getInvoiceStatusColor,
  getPaymentStatusDisplayText,
  getInvoiceStatusDisplayText,
  formatCurrency,
  formatDate,
  getDaysUntilDue,
  canEditInvoice,
  canDeleteInvoice,
  canMarkAsPaid,
  downloadInvoicePDF,
} from '@/Api/invoice';

// ==================== MANUAL INVOICE API IMPORT ====================
import { getManualInvoices } from '@/Api/manualIvnoice';

import { toast } from 'react-toastify';
import {
  Loader2, Search, Calendar, User, Building,
  ArrowLeft, ChevronRight, DollarSign, Clock, CheckCircle,
  Eye, Edit, Trash2, PlusCircle, Filter, Download, Printer,
  ChevronDown, ChevronUp, X, AlertCircle, AlertTriangle,
  Mail, FileText, CreditCard, RefreshCw, MoreVertical,
  Check, Copy, Archive, Send, Ban, Receipt, TrendingUp,
  PieChart, BarChart3, Package, MapPin, Hash, Info
} from 'lucide-react';

// ==================== PDF IMPORTS & FUNCTIONS ====================
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// PDF Styles
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica.ttf'
});

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottom: '2px solid #E67E22', paddingBottom: 20 },
  companySection: { flex: 1 },
  companyName: { fontSize: 24, fontWeight: 'bold', color: '#E67E22', marginBottom: 5 },
  companyAddress: { fontSize: 9, color: '#4B5563', marginBottom: 2 },
  invoiceSection: { flex: 1, alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 28, fontWeight: 'bold', color: '#E67E22', marginBottom: 10 },
  invoiceDetails: { fontSize: 10, color: '#4B5563', textAlign: 'right' },
  status: { padding: 8, borderRadius: 4, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  statusPaid: { backgroundColor: '#D1FAE5', color: '#065F46' },
  statusPending: { backgroundColor: '#FEF3C7', color: '#92400E' },
  statusOverdue: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  statusDraft: { backgroundColor: '#F3F4F6', color: '#374151' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, backgroundColor: '#F97316', color: 'white', padding: 6, borderRadius: 4 },
  row: { flexDirection: 'row', marginBottom: 6, paddingHorizontal: 4 },
  label: { fontWeight: 'bold', width: '30%', fontSize: 9, color: '#374151' },
  value: { width: '70%', fontSize: 9, color: '#1F2937' },
  table: { marginTop: 10, marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 8, fontWeight: 'bold', fontSize: 9, borderBottom: '1px solid #E5E7EB' },
  tableRow: { flexDirection: 'row', padding: 8, borderBottom: '1px solid #F3F4F6' },
  col1: { width: '45%', fontSize: 9 },
  col2: { width: '20%', fontSize: 9, textAlign: 'center' },
  col3: { width: '20%', fontSize: 9, textAlign: 'right' },
  col4: { width: '15%', fontSize: 9, textAlign: 'right' },
  totalSection: { marginTop: 20, alignItems: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6, width: '50%' },
  totalLabel: { fontSize: 10, fontWeight: 'bold', width: '40%', textAlign: 'right', paddingRight: 10 },
  totalValue: { fontSize: 10, width: '60%', textAlign: 'right' },
  grandTotalRow: { marginTop: 5, borderTop: '1px solid #E67E22', paddingTop: 8 },
  grandTotalLabel: { fontSize: 14, fontWeight: 'bold', color: '#E67E22' },
  grandTotalValue: { fontSize: 14, fontWeight: 'bold', color: '#E67E22' },
  paymentInfo: { marginTop: 20, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#9CA3AF', borderTop: '1px solid #E5E7EB', paddingTop: 10 },
  thankYou: { fontSize: 10, fontWeight: 'bold', color: '#E67E22', marginBottom: 4 }
});

// PDF Helper Functions
const formatCurrencyPDF = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  const symbols = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹' };
  return `${symbols[currency] || '$'}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const formatDatePDF = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getStatusStylePDF = (paymentStatus) => {
  switch (paymentStatus) {
    case 'paid': return pdfStyles.statusPaid;
    case 'pending': return pdfStyles.statusPending;
    case 'overdue': return pdfStyles.statusOverdue;
    default: return pdfStyles.statusDraft;
  }
};

const getStatusTextPDF = (paymentStatus) => {
  switch (paymentStatus) {
    case 'paid': return '✓ PAID';
    case 'pending': return '⏳ PENDING';
    case 'overdue': return '⚠️ OVERDUE';
    default: return '📄 DRAFT';
  }
};

// PDF Component
const InvoicePDF = ({ invoice, companyInfo }) => {
  const defaultCompany = {
    name: 'B2B Logistics Group',
    address: '8825 STANFORD BLVD, SUITE 306, COLUMBIA, MD 21045',
    city: 'USA',
    phone: '+1-647-362-7735',
    email: 'info@cargologisticscompany.com'
  };
  const info = companyInfo || defaultCompany;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View style={pdfStyles.companySection}>
            <Text style={pdfStyles.companyName}>{info.name}</Text>
            <Text style={pdfStyles.companyAddress}>{info.address}</Text>
            <Text style={pdfStyles.companyAddress}>{info.city}</Text>
            <Text style={pdfStyles.companyAddress}>Phone: {info.phone}</Text>
            <Text style={pdfStyles.companyAddress}>Email: {info.email}</Text>
          </View>
          <View style={pdfStyles.invoiceSection}>
            <Text style={pdfStyles.invoiceTitle}>INVOICE</Text>
            <Text style={pdfStyles.invoiceDetails}>#{invoice.invoiceNumber}</Text> 
          </View>
        </View> 

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>BILL TO</Text>
          <View style={pdfStyles.row}><Text style={pdfStyles.label}>Company:</Text><Text style={pdfStyles.value}>{invoice.customerInfo?.companyName || 'N/A'}</Text></View>
          <View style={pdfStyles.row}><Text style={pdfStyles.label}>Contact:</Text><Text style={pdfStyles.value}>{invoice.customerInfo?.contactPerson || 'N/A'}</Text></View>
          <View style={pdfStyles.row}><Text style={pdfStyles.label}>Email:</Text><Text style={pdfStyles.value}>{invoice.customerInfo?.email || 'N/A'}</Text></View>
          <View style={pdfStyles.row}><Text style={pdfStyles.label}>Phone:</Text><Text style={pdfStyles.value}>{invoice.customerInfo?.phone || 'N/A'}</Text></View>
          <View style={pdfStyles.row}><Text style={pdfStyles.label}>Address:</Text><Text style={pdfStyles.value}>{invoice.customerInfo?.address || 'N/A'}</Text></View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.col1}>Description</Text>
            <Text style={pdfStyles.col2}>Type</Text>
            <Text style={pdfStyles.col3}>Amount</Text>
            <Text style={pdfStyles.col4}>Currency</Text>
          </View>
          {invoice.charges && invoice.charges.length > 0 ? (
            invoice.charges.map((charge, idx) => (
              <View key={idx} style={pdfStyles.tableRow}>
                <Text style={pdfStyles.col1}>{charge.description}</Text>
                <Text style={pdfStyles.col2}>{charge.type}</Text>
                <Text style={pdfStyles.col3}>{formatCurrencyPDF(charge.amount, charge.currency)}</Text>
                <Text style={pdfStyles.col4}>{charge.currency}</Text>
              </View>
            ))
          ) : (
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.col1}>No charges specified</Text>
              <Text style={pdfStyles.col2}>-</Text>
              <Text style={pdfStyles.col3}>-</Text>
              <Text style={pdfStyles.col4}>-</Text>
            </View>
          )}
        </View>

        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalRow}><Text style={pdfStyles.totalLabel}>Subtotal:</Text><Text style={pdfStyles.totalValue}>{formatCurrencyPDF(invoice.subtotal, invoice.currency)}</Text></View>
          <View style={pdfStyles.totalRow}><Text style={pdfStyles.totalLabel}>Tax ({invoice.taxRate || 0}%):</Text><Text style={pdfStyles.totalValue}>{formatCurrencyPDF(invoice.taxAmount, invoice.currency)}</Text></View>
          {invoice.discountAmount > 0 && <View style={pdfStyles.totalRow}><Text style={pdfStyles.totalLabel}>Discount:</Text><Text style={pdfStyles.totalValue}>-{formatCurrencyPDF(invoice.discountAmount, invoice.currency)}</Text></View>}
          <View style={[pdfStyles.totalRow, pdfStyles.grandTotalRow]}><Text style={[pdfStyles.totalLabel, pdfStyles.grandTotalLabel]}>TOTAL:</Text><Text style={[pdfStyles.totalValue, pdfStyles.grandTotalValue]}>{formatCurrencyPDF(invoice.totalAmount, invoice.currency)}</Text></View>
        </View>

        {invoice.paymentStatus === 'paid' && (
          <View style={pdfStyles.paymentInfo}>
            <Text style={pdfStyles.sectionTitle}>PAYMENT INFORMATION</Text>
            <View style={pdfStyles.row}><Text style={pdfStyles.label}>Method:</Text><Text style={pdfStyles.value}>{invoice.paymentMethod || 'N/A'}</Text></View>
            <View style={pdfStyles.row}><Text style={pdfStyles.label}>Date:</Text><Text style={pdfStyles.value}>{formatDatePDF(invoice.paymentDate)}</Text></View>
          </View>
        )}

        {invoice.notes && <View style={pdfStyles.section}><Text style={pdfStyles.sectionTitle}>NOTES</Text><Text style={{ fontSize: 8 }}>{invoice.notes}</Text></View>}
        
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.thankYou}>Thank you for your business!</Text>
          <Text>For inquiries: {info.email} | {info.phone}</Text>
        </View>
      </Page>
    </Document>
  );
};

const COMPANY_INFO = {
  name: 'B2B Logistics Group',
  address: '123 Business Avenue, Commercial Area',
  city: 'Dhaka, Bangladesh 1212',
  phone: '+880 1234-567890',
  email: 'info@b2blogistics.com'
};

// PDF Download Function
const generateAndDownloadSinglePDF = async (invoice) => {
  try {
    const blob = await pdf(<InvoicePDF invoice={invoice} companyInfo={COMPANY_INFO} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, message: 'PDF downloaded successfully' };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, message: error.message };
  }
};

// ==================== CONSTANTS ====================

const INVOICE_STATUS = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: FileText },
  sent: { label: 'Sent', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Send },
  paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
  overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: Ban }
};

const PAYMENT_STATUS = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Clock },
  paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
  overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: AlertCircle },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: Ban }
};

const PAYMENT_METHODS = [
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'Credit Card', label: 'Credit Card', icon: '💳' },
  { value: 'Cash', label: 'Cash', icon: '💵' },
  { value: 'Cheque', label: 'Cheque', icon: '📝' }
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'THB', label: 'THB (฿)', symbol: '฿' },
  { value: 'CNY', label: 'CNY (¥)', symbol: '¥' }
];

// ==================== HELPER FUNCTIONS ====================

const getStatusInfo = (status, type = 'invoice') => {
  const statusMap = type === 'payment' ? PAYMENT_STATUS : INVOICE_STATUS;
  return statusMap[status] || {
    label: status || 'Unknown',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    icon: FileText
  };
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ==================== COMPONENTS ====================

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'orange', subtitle }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, type = 'invoice' }) => {
  const info = getStatusInfo(status, type);
  const Icon = info.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${info.bg} ${info.text}`}>
      <Icon className="h-3 w-3 mr-1" />
      {info.label}
    </span>
  );
};

// Invoice Card Component
const InvoiceCard = ({ invoice, onView, onEdit, onDelete, onMarkPaid, onPDF }) => {
  const statusInfo = getStatusInfo(invoice.status);
  const paymentInfo = getStatusInfo(invoice.paymentStatus, 'payment');

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'paid';
  const daysUntilDue = getDaysUntilDue(invoice.dueDate);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Receipt className="h-4 w-4 text-[#E67E22]" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{invoice.invoiceNumber}</h3>
            <p className="text-xs text-gray-500">{formatDate(invoice.invoiceDate, 'short')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => onView(invoice._id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View"><Eye className="h-4 w-4 text-gray-600" /></button>
          {canEditInvoice(invoice.status) && (
            <button onClick={() => onEdit(invoice)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Edit"><Edit className="h-4 w-4 text-gray-600" /></button>
          )}
          <button onClick={() => onPDF(invoice._id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Download PDF"><FileText className="h-4 w-4 text-red-500" /></button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-[#E67E22]">{invoice.customerInfo?.companyName?.charAt(0) || 'C'}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{invoice.customerInfo?.companyName || 'N/A'}</p>
          <p className="text-xs text-gray-500">{invoice.customerInfo?.contactPerson || ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Due Date</p>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{formatDate(invoice.dueDate, 'short')}</span>
          </div>
          {daysUntilDue !== null && daysUntilDue <= 7 && invoice.paymentStatus !== 'paid' && (
            <p className="text-xs text-red-500 mt-1">Due in {daysUntilDue} days</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <p className="font-bold text-[#E67E22]">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <StatusBadge status={invoice.status} />
          <StatusBadge status={invoice.paymentStatus} type="payment" />
        </div>
        <div className="flex items-center space-x-1">
          {canMarkAsPaid(invoice.paymentStatus) && (
            <button onClick={() => onMarkPaid(invoice)} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
              <CreditCard className="h-3 w-3 inline mr-1" />Mark Paid
            </button>
          )}
          {canDeleteInvoice(invoice.status) && (
            <button onClick={() => onDelete(invoice._id)} className="p-1 hover:bg-red-100 rounded-lg"><Trash2 className="h-4 w-4 text-red-400" /></button>
          )}
        </div>
      </div>
    </div>
  );
};

// Invoice Table Row Component
const InvoiceTableRow = ({ invoice, onView, onEdit, onDelete, onMarkPaid, onPDF, onSelect, isSelected }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <input type="checkbox" checked={isSelected} onChange={() => onSelect(invoice._id)} className="rounded border-gray-300 text-[#E67E22] focus:ring-[#E67E22]" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <Receipt className="h-4 w-4 text-[#E67E22]" />
          <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
          {invoice.isManual && (
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Manual</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-[#E67E22]">{invoice.customerInfo?.companyName?.charAt(0) || 'C'}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{invoice.customerInfo?.companyName || 'N/A'}</p>
            <p className="text-xs text-gray-500">{invoice.customerInfo?.contactPerson || ''}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-gray-400" />{formatDate(invoice.invoiceDate, 'short')}</div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-right">
        <span className="font-bold text-[#E67E22]">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end space-x-1">
          <button onClick={() => onView(invoice._id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View"><Eye className="h-4 w-4 text-gray-600" /></button>
          <button onClick={() => onPDF(invoice._id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Download PDF"><FileText className="h-4 w-4 text-red-500" /></button>
          {canDeleteInvoice(invoice.status) && (
            <button onClick={() => onDelete(invoice._id)} className="p-1.5 hover:bg-red-100 rounded-lg" title="Delete"><Trash2 className="h-4 w-4 text-red-400" /></button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Filter Bar Component
const FilterBar = ({ filters, onFilterChange, onSearch, searchTerm, onRefresh }) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search by invoice number or customer..." value={searchTerm} onChange={(e) => onSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]" />
        </div>
      </div>
    </div>
  );
};

// Invoice Details Modal
const InvoiceDetailsModal = ({ isOpen, onClose, invoice, onMarkPaid, onPDF, onSendEmail, onEdit }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg"><Receipt className="h-6 w-6 text-[#E67E22]" /></div>
              <div>
                <h2 className="text-xl font-bold">{invoice.invoiceNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">Created on {formatDateTime(invoice.createdAt)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex space-x-4 mt-4">
            <button onClick={() => setActiveTab('details')} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#E67E22] text-[#E67E22]' : 'border-transparent text-gray-500'}`}>Details</button>
            <button onClick={() => setActiveTab('charges')} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'charges' ? 'border-[#E67E22] text-[#E67E22]' : 'border-transparent text-gray-500'}`}>Charges</button>
            <button onClick={() => setActiveTab('history')} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#E67E22] text-[#E67E22]' : 'border-transparent text-gray-500'}`}>History</button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center"><Building className="h-4 w-4 mr-2 text-[#E67E22]" />Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Company</p><p className="font-medium">{invoice.customerInfo?.companyName || 'N/A'}</p></div>
                  <div><p className="text-xs text-gray-500">Contact Person</p><p>{invoice.customerInfo?.contactPerson || 'N/A'}</p></div>
                  <div><p className="text-xs text-gray-500">Email</p><p>{invoice.customerInfo?.email || 'N/A'}</p></div>
                  <div><p className="text-xs text-gray-500">Phone</p><p>{invoice.customerInfo?.phone || 'N/A'}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p>{invoice.customerInfo?.address || 'N/A'}</p></div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center"><FileText className="h-4 w-4 mr-2 text-[#E67E22]" />Invoice Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Invoice Date</p><p>{formatDate(invoice.invoiceDate, 'long')}</p></div>
                  <div><p className="text-xs text-gray-500">Due Date</p><p>{formatDate(invoice.dueDate, 'long')}</p></div>
                  <div><p className="text-xs text-gray-500">Currency</p><p>{invoice.currency}</p></div>
                </div>
              </div>
              {invoice.notes && (
                <div className="bg-gray-50 p-4 rounded-lg"><h3 className="font-medium mb-2">Notes</h3><p className="text-sm text-gray-600">{invoice.notes}</p></div>
              )}
            </div>
          )}

          {activeTab === 'charges' && (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th><th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.charges?.map((charge, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{charge.description}</td>
                        <td className="px-4 py-2 text-sm">{charge.type}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(charge.amount, charge.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal:</span><span>{formatCurrency(invoice.subtotal, invoice.currency)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Tax ({invoice.taxRate || 0}%):</span><span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span></div>
                  {invoice.discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Discount:</span><span className="text-red-600">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span></div>}
                  <div className="border-t pt-2"><div className="flex justify-between font-bold"><span>Total:</span><span className="text-lg text-[#E67E22]">{formatCurrency(invoice.totalAmount, invoice.currency)}</span></div></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Created</span><span className="text-xs text-gray-500">{formatDateTime(invoice.createdAt)}</span></div>
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Last Updated</span><span className="text-xs text-gray-500">{formatDateTime(invoice.updatedAt)}</span></div>
                {invoice.emailSent && <div className="flex items-center justify-between"><span className="text-sm font-medium">Email Sent</span><span className="text-xs text-gray-500">{formatDateTime(invoice.emailSentAt)}</span></div>}
                {invoice.paymentDate && <div className="flex items-center justify-between"><span className="text-sm font-medium">Payment Date</span><span className="text-xs text-gray-500">{formatDateTime(invoice.paymentDate)}</span></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Modal
const PaymentModal = ({ isOpen, onClose, invoice, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'Bank Transfer',
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (invoice) {
      setPaymentData({
        paymentMethod: 'Bank Transfer',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async () => {
    if (!paymentData.paymentMethod) {
      toast.warning('Please select payment method');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(invoice, paymentData);
      onClose();
    } catch (error) {
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Mark Invoice as Paid</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Invoice</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
              <p className="text-sm text-[#E67E22] font-bold mt-1">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
              <select value={paymentData.paymentMethod} onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]">
                {PAYMENT_METHODS.map(method => (<option key={method.value} value={method.value}>{method.icon} {method.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
              <input type="text" value={paymentData.paymentReference} onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })} placeholder="Transaction ID / Reference" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input type="date" value={paymentData.paymentDate} onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })} max={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]" />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : <><CheckCircle className="h-4 w-4 mr-2" />Confirm Payment</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, invoice }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(invoice._id);
      onClose();
    } catch (error) {
      toast.error('Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
          <h2 className="text-lg font-bold mb-2">Delete Invoice</h2>
          <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete invoice <span className="font-medium text-gray-700">{invoice.invoiceNumber}</span>? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 flex items-center justify-center">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State
const EmptyState = ({ onRefresh }) => (
  <div className="text-center py-16 bg-white rounded-xl border">
    <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><Receipt className="h-10 w-10 text-[#E67E22]" /></div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Create your first invoice to get started with billing and payment tracking.</p>
    <div className="flex items-center justify-center space-x-3">
      <Link href="/admin/invoices/create" className="inline-flex items-center px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400]"><PlusCircle className="h-4 w-4 mr-2" />Create Invoice</Link>
      <button onClick={onRefresh} className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"><RefreshCw className="h-4 w-4 mr-2" />Refresh</button>
    </div>
  </div>
);

// ==================== MAIN PAGE ====================

export default function InvoicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
    customer: '',
    sort: '-createdAt'
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [pdfDownloading, setPdfDownloading] = useState(false);
  
  // State for combined invoices
  const [allInvoices, setAllInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  // Load data from BOTH APIs
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch from both APIs in parallel
      const [regularResult, manualResult] = await Promise.all([
        getAllInvoices({
          page: 1,
          limit: 1000,
          search: searchTerm || undefined,
        }),
        getManualInvoices({
          page: 1,
          limit: 1000,
          search: searchTerm || undefined,
        })
      ]);
      
      let combinedInvoices = [];
      let combinedSummary = {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        totalAmount: 0
      };
      
      // Add regular invoices
      if (regularResult.success && regularResult.data) {
        const regularInvoices = regularResult.data.map(inv => ({ ...inv, isManual: false }));
        combinedInvoices = [...combinedInvoices, ...regularInvoices];
        combinedSummary.total += regularResult.summary?.total || 0;
        combinedSummary.paid += regularResult.summary?.paid || 0;
        combinedSummary.pending += regularResult.summary?.pending || 0;
        combinedSummary.overdue += regularResult.summary?.overdue || 0;
        combinedSummary.totalAmount += regularResult.summary?.totalAmount || 0;
      }
      
      // Add manual invoices
      if (manualResult.success && manualResult.data) {
        const manualInvoices = manualResult.data.map(inv => ({ ...inv, isManual: true }));
        combinedInvoices = [...combinedInvoices, ...manualInvoices];
        combinedSummary.total += manualResult.summary?.total || 0;
        combinedSummary.paid += manualResult.summary?.paid || 0;
        combinedSummary.pending += manualResult.summary?.pending || 0;
        combinedSummary.overdue += manualResult.summary?.overdue || 0;
        combinedSummary.totalAmount += manualResult.summary?.totalAmount || 0;
      }
      
      // Sort by createdAt (newest first)
      combinedInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setAllInvoices(combinedInvoices);
      setFilteredInvoices(combinedInvoices);
      setSummary(combinedSummary);
      setPagination({
        page: 1,
        limit: 20,
        total: combinedInvoices.length,
        totalPages: Math.ceil(combinedInvoices.length / 20)
      });
      
      console.log(`✅ Total invoices: ${combinedInvoices.length} (Regular: ${regularResult.data?.length || 0}, Manual: ${manualResult.data?.length || 0})`);
      
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Invoices refreshed');
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredInvoices(allInvoices);
    } else {
      const filtered = allInvoices.filter(inv => 
        inv.invoiceNumber?.toLowerCase().includes(term.toLowerCase()) ||
        inv.customerInfo?.companyName?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  };

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv._id));
    }
  };

  const handleViewInvoice = (invoiceId) => {
    const invoice = allInvoices.find(inv => inv._id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setShowDetailsModal(true);
    }
  };

  const handleMarkAsPaid = async (invoice, paymentData) => {
    if (!invoice || !invoice._id) {
      toast.error('Invalid invoice data');
      return;
    }
    
    if (invoice.isManual) {
      // For manual invoices - you may need a separate API
      toast.info('Manual invoice payment update coming soon');
    } else {
      const result = await markAsPaid(invoice._id, paymentData);
      if (result.success) {
        toast.success('Invoice marked as paid');
        loadData();
      }
    }
  };

  const handlePDFDownload = async (invoiceId) => {
    setPdfDownloading(true);
    const toastId = toast.loading('Generating PDF...');
    
    try {
      const invoice = allInvoices.find(inv => inv._id === invoiceId);
      if (invoice) {
        const pdfResult = await generateAndDownloadSinglePDF(invoice);
        toast.dismiss(toastId);
        if (pdfResult.success) {
          toast.success(pdfResult.message);
        } else {
          toast.error(pdfResult.message);
        }
      } else {
        toast.dismiss(toastId);
        toast.error('Failed to fetch invoice data');
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const invoice = allInvoices.find(inv => inv._id === invoiceId);
    if (invoice?.isManual) {
      toast.info('Manual invoice deletion coming soon');
      return;
    }
    
    const result = await deleteInvoice(invoiceId);
    if (result.success) {
      toast.success('Invoice deleted');
      loadData();
    }
  };

  // Pagination
  const paginatedInvoices = filteredInvoices.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Receipt className="h-6 w-6 mr-2 text-[#E67E22]" />
                  Invoice Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and track all invoices (Regular + Manual)
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* <StatCard title="Total Invoices" value={summary.total} icon={Receipt} color="orange" />
          <StatCard title="Paid" value={summary.paid} icon={CheckCircle} color="green" />
          <StatCard title="Pending" value={summary.pending} icon={Clock} color="yellow" /> */}
          <StatCard title="Total Amount" value={formatCurrency(summary.totalAmount, 'USD')} icon={DollarSign} color="blue" />
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number or customer..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedInvoices.length > 0 && (
          <div className="bg-[#122652] text-white rounded-xl p-3 mb-4 flex items-center justify-between">
            <span className="text-sm">{selectedInvoices.length} invoice(s) selected</span>
            <button onClick={() => setSelectedInvoices([])} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm">Clear</button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
            <Loader2 className="h-10 w-10 animate-spin text-[#E67E22] mb-4" />
            <p className="text-sm text-gray-500">Loading invoices from both APIs...</p>
          </div>
        ) : paginatedInvoices.length === 0 ? (
          <EmptyState onRefresh={handleRefresh} />
        ) : (
          <>
            {/* Table View */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3"><input type="checkbox" checked={selectedInvoices.length === paginatedInvoices.length} onChange={handleSelectAll} className="rounded border-gray-300 text-[#E67E22] focus:ring-[#E67E22]" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedInvoices.map((invoice) => (
                      <InvoiceTableRow
                        key={invoice._id}
                        invoice={invoice}
                        onView={handleViewInvoice}
                        onEdit={() => {}}
                        onDelete={() => {
                          setSelectedInvoice(invoice);
                          setShowDeleteModal(true);
                        }}
                        onMarkPaid={() => {
                          setSelectedInvoice(invoice);
                          setShowPaymentModal(true);
                        }}
                        onPDF={handlePDFDownload}
                        onSelect={handleSelectInvoice}
                        isSelected={selectedInvoices.includes(invoice._id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg border">
                <p className="text-sm text-gray-500">Showing page {pagination.page} of {pagination.totalPages} ({filteredInvoices.length} total)</p>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1 border rounded-lg disabled:opacity-50">Previous</button>
                  <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <InvoiceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
        onMarkPaid={() => { setShowDetailsModal(false); setShowPaymentModal(true); }}
        onEdit={() => {}}
        onPDF={handlePDFDownload}
        onSendEmail={() => {}}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
        onConfirm={handleMarkAsPaid}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
        onConfirm={handleDeleteInvoice}
      />
    </div>
  );
}
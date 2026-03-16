// components/dashboard/DashboardSummary.jsx
"use client";
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Download,
  MoreVert,
  CalendarToday,
  Inventory,
  LocalShipping,
  Receipt,
  Payment,
  Warning,
  CheckCircle,
  Pending,
  Assessment,
  Warehouse,
  Flight,
  DirectionsBoat,
  LocalShipping as TruckIcon,
  Info
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';

// Import all service functions
import { getCurrentUser, isAdmin, isStaff } from '@/Api/Authentication';
import { getAllBookings, getMyBookingsSummary, getStatusDisplayText } from '@/Api/booking';
import { getAllShipments, getShipmentStatistics, getShipmentStatusDisplayText } from '@/Api/shipping';
import { getAllInvoices, getInvoiceStats, getPaymentStatusDisplayText } from '@/Api/invoice';
import { getAllTrackings, getTrackingStats, getTrackingStatusDisplay } from '@/Api/tracking';
import { getConsolidations, getConsolidationStats } from '@/Api/consolidation';
import { getWarehouseDashboard, getExpectedShipments } from '@/Api/warehouse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

const DashboardSummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // State for all data
  const [summary, setSummary] = useState({
    bookings: {
      total: 0,
      pending: 0,
      confirmed: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0,
      chartData: []
    },
    shipments: {
      total: 0,
      inTransit: 0,
      delivered: 0,
      pending: 0,
      active: 0,
      chartData: []
    },
    invoices: {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      amount: 0,
      collected: 0,
      chartData: []
    },
    tracking: {
      total: 0,
      active: 0,
      delivered: 0,
      delayed: 0,
      chartData: []
    },
    consolidation: {
      total: 0,
      inProgress: 0,
      completed: 0,
      readyForDispatch: 0,
      totalVolume: 0,
      totalWeight: 0,
      chartData: []
    },
    warehouse: {
      expectedToday: 0,
      received: 0,
      inventory: 0,
      storageUsed: 0,
      storageCapacity: 0,
      pendingInspection: 0,
      zoneUtilization: []
    },
    user: null
  });

  const user = getCurrentUser();
  const isAdminUser = isAdmin();
  const isStaffUser = isStaff();

  useEffect(() => {
    fetchAllDashboardData();
    
    // Auto refresh every 5 minutes
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 300000);
    
    return () => clearInterval(interval);
  }, [timeRange, refreshKey]);

  const fetchAllDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.allSettled([
        fetchBookingsData(),
        fetchShipmentsData(),
        fetchInvoicesData(),
        fetchTrackingData(),
        fetchConsolidationData(),
        fetchWarehouseData()
      ]);

      const failedRequests = results.filter(r => r.status === 'rejected');
      if (failedRequests.length > 0) {
        console.warn(`${failedRequests.length} dashboard requests failed`);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsData = async () => {
    try {
      // Get bookings based on user role
      let bookingsData;
      if (isAdminUser || isStaffUser) {
        bookingsData = await getAllBookings({ limit: 100 });
      } else {
        bookingsData = await getMyBookingsSummary();
      }

      if (bookingsData.success) {
        const bookings = bookingsData.data || [];
        
        // Calculate booking stats
        const stats = {
          total: bookings.length,
          pending: bookings.filter(b => b.status === 'booking_requested').length,
          quoted: bookings.filter(b => b.status === 'price_quoted').length,
          confirmed: bookings.filter(b => b.status === 'booking_confirmed').length,
          delivered: bookings.filter(b => b.status === 'delivered').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length,
          revenue: bookings.reduce((sum, b) => sum + (b.quotedPrice?.amount || 0), 0)
        };

        // Generate chart data for last 7 days
        const chartData = generateBookingChartData(bookings);

        setSummary(prev => ({
          ...prev,
          bookings: { ...stats, chartData }
        }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchShipmentsData = async () => {
    try {
      let shipmentsData;
      if (isAdminUser || isStaffUser) {
        shipmentsData = await getAllShipments({ limit: 100 });
      } else {
        shipmentsData = await getShipmentStatistics();
      }

      if (shipmentsData.success) {
        const shipments = shipmentsData.data || [];
        
        const stats = {
          total: shipments.length,
          inTransit: shipments.filter(s => s.status === 'in_transit').length,
          delivered: shipments.filter(s => s.status === 'delivered').length,
          pending: shipments.filter(s => s.status === 'pending').length,
          active: shipments.filter(s => !['delivered', 'cancelled'].includes(s.status)).length,
          chartData: generateShipmentChartData(shipments)
        };

        setSummary(prev => ({
          ...prev,
          shipments: { ...stats }
        }));
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const fetchInvoicesData = async () => {
    try {
      let invoicesData;
      if (isAdminUser || isStaffUser) {
        invoicesData = await getAllInvoices({ limit: 100 });
      } else {
        invoicesData = await getInvoiceStats();
      }

      if (invoicesData.success) {
        const invoices = invoicesData.data || [];
        
        const stats = {
          total: invoices.length,
          paid: invoices.filter(i => i.paymentStatus === 'paid').length,
          pending: invoices.filter(i => i.paymentStatus === 'pending').length,
          overdue: invoices.filter(i => i.paymentStatus === 'overdue').length,
          amount: invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
          collected: invoices
            .filter(i => i.paymentStatus === 'paid')
            .reduce((sum, i) => sum + (i.totalAmount || 0), 0),
          chartData: generateInvoiceChartData(invoices)
        };

        setSummary(prev => ({
          ...prev,
          invoices: { ...stats }
        }));
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchTrackingData = async () => {
    try {
      if (isAdminUser || isStaffUser) {
        const trackingData = await getAllTrackings({ limit: 100 });
        
        if (trackingData.success) {
          const trackings = trackingData.data || [];
          
          const stats = {
            total: trackings.length,
            active: trackings.filter(t => !['delivered', 'cancelled'].includes(t.status)).length,
            delivered: trackings.filter(t => t.status === 'delivered').length,
            delayed: trackings.filter(t => {
              if (t.estimatedDelivery && t.status !== 'delivered') {
                return new Date() > new Date(t.estimatedDelivery);
              }
              return false;
            }).length,
            chartData: generateTrackingChartData(trackings)
          };

          setSummary(prev => ({
            ...prev,
            tracking: { ...stats }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
    }
  };

  const fetchConsolidationData = async () => {
    try {
      if (isAdminUser || isStaffUser) {
        const [consolidationsData, statsData] = await Promise.allSettled([
          getConsolidations({ limit: 100 }),
          getConsolidationStats()
        ]);

        const consolidations = consolidationsData.value?.data || [];
        const stats = statsData.value?.data || {};

        const calculatedStats = {
          total: consolidations.length,
          inProgress: consolidations.filter(c => c.status === 'in_progress').length,
          completed: consolidations.filter(c => c.status === 'completed').length,
          readyForDispatch: consolidations.filter(c => c.status === 'ready_for_dispatch').length,
          totalVolume: consolidations.reduce((sum, c) => sum + (c.totalVolume || 0), 0),
          totalWeight: consolidations.reduce((sum, c) => sum + (c.totalWeight || 0), 0),
          chartData: generateConsolidationChartData(consolidations)
        };

        setSummary(prev => ({
          ...prev,
          consolidation: { ...calculatedStats, ...stats }
        }));
      }
    } catch (error) {
      console.error('Error fetching consolidation:', error);
    }
  };

  const fetchWarehouseData = async () => {
    try {
      if (isStaffUser) {
        const [dashboardData, expectedData] = await Promise.allSettled([
          getWarehouseDashboard(),
          getExpectedShipments({ limit: 100 })
        ]);

        const dashboard = dashboardData.value?.data || {};
        const expected = expectedData.value?.data || [];

        const stats = {
          expectedToday: expected.filter(e => {
            const expectedDate = new Date(e.expectedDeliveryDate);
            const today = new Date();
            return expectedDate.toDateString() === today.toDateString();
          }).length,
          received: dashboard.totalReceived || 0,
          inventory: dashboard.totalInventory || 0,
          storageUsed: dashboard.storageUsed || 0,
          storageCapacity: dashboard.storageCapacity || 100,
          pendingInspection: dashboard.pendingInspection || 0,
          zoneUtilization: dashboard.zoneUtilization || []
        };

        setSummary(prev => ({
          ...prev,
          warehouse: { ...stats }
        }));
      }
    } catch (error) {
      console.error('Error fetching warehouse:', error);
    }
  };

  // Helper functions for chart data generation
  const generateBookingChartData = (bookings) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      count: bookings.filter(b => b.createdAt?.startsWith(date)).length,
      revenue: bookings
        .filter(b => b.createdAt?.startsWith(date))
        .reduce((sum, b) => sum + (b.quotedPrice?.amount || 0), 0)
    }));
  };

  const generateShipmentChartData = (shipments) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      count: shipments.filter(s => s.createdAt?.startsWith(date)).length,
      delivered: shipments.filter(s => 
        s.status === 'delivered' && s.updatedAt?.startsWith(date)
      ).length
    }));
  };

  const generateInvoiceChartData = (invoices) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      count: invoices.filter(i => i.createdAt?.startsWith(date)).length,
      amount: invoices
        .filter(i => i.createdAt?.startsWith(date))
        .reduce((sum, i) => sum + (i.totalAmount || 0), 0)
    }));
  };

  const generateTrackingChartData = (trackings) => {
    const statuses = ['pending', 'in_transit', 'out_for_delivery', 'delivered'];
    return statuses.map(status => ({
      status: getTrackingStatusDisplay(status),
      count: trackings.filter(t => t.status === status).length
    }));
  };

  const generateConsolidationChartData = (consolidations) => {
    const statuses = ['draft', 'in_progress', 'completed', 'ready_for_dispatch'];
    return statuses.map(status => ({
      status: status.replace('_', ' ').toUpperCase(),
      count: consolidations.filter(c => c.status === status).length
    }));
  };

  // Chart configurations
  const bookingChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const bookingChartData = {
    labels: summary.bookings.chartData.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'Bookings',
        data: summary.bookings.chartData.map(d => d.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }
    ]
  };

  const invoiceChartData = {
    labels: summary.invoices.chartData.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'Invoice Amount',
        data: summary.invoices.chartData.map(d => d.amount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4
      }
    ]
  };

  const trackingPieData = {
    labels: summary.tracking.chartData.map(d => d.status),
    datasets: [{
      data: summary.tracking.chartData.map(d => d.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)'
      ]
    }]
  };

  const consolidationBarData = {
    labels: summary.consolidation.chartData.map(d => d.status),
    datasets: [{
      label: 'Consolidations',
      data: summary.consolidation.chartData.map(d => d.count),
      backgroundColor: 'rgba(153, 102, 255, 0.8)'
    }]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.firstName || user?.name || 'User'}!
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => setRefreshKey(prev => prev + 1)}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Report">
            <IconButton onClick={() => exportDashboardReport(summary)}>
              <Download />
            </IconButton>
          </Tooltip>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { setTimeRange('day'); setAnchorEl(null); }}>
              <CalendarToday sx={{ mr: 1, fontSize: 16 }} /> Today
            </MenuItem>
            <MenuItem onClick={() => { setTimeRange('week'); setAnchorEl(null); }}>
              <CalendarToday sx={{ mr: 1, fontSize: 16 }} /> This Week
            </MenuItem>
            <MenuItem onClick={() => { setTimeRange('month'); setAnchorEl(null); }}>
              <CalendarToday sx={{ mr: 1, fontSize: 16 }} /> This Month
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Bookings KPI */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt sx={{ color: 'primary.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Total Bookings
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                {summary.bookings.total}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  size="small" 
                  label={`${summary.bookings.pending} Pending`} 
                  color="warning" 
                  variant="outlined"
                />
                <Chip 
                  size="small" 
                  label={`${summary.bookings.confirmed} Confirmed`} 
                  color="success" 
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Revenue: ${summary.bookings.revenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipments KPI */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping sx={{ color: 'info.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Active Shipments
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                {summary.shipments.active}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  size="small" 
                  label={`${summary.shipments.inTransit} In Transit`} 
                  color="info" 
                  variant="outlined"
                />
                <Chip 
                  size="small" 
                  label={`${summary.shipments.delivered} Delivered`} 
                  color="success" 
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Total: {summary.shipments.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoices KPI */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Payment sx={{ color: 'success.main', mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Invoice Status
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                ${summary.invoices.collected.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  size="small" 
                  label={`${summary.invoices.paid} Paid`} 
                  color="success" 
                  variant="outlined"
                />
                {summary.invoices.overdue > 0 && (
                  <Chip 
                    size="small" 
                    label={`${summary.invoices.overdue} Overdue`} 
                    color="error" 
                    variant="outlined"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Pending: ${(summary.invoices.amount - summary.invoices.collected).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Warehouse KPI */}
        {isStaffUser && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warehouse sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Warehouse Status
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {summary.warehouse.inventory} Items
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    size="small" 
                    label={`${summary.warehouse.expectedToday} Expected`} 
                    color="warning" 
                    variant="outlined"
                  />
                  {summary.warehouse.pendingInspection > 0 && (
                    <Chip 
                      size="small" 
                      label={`${summary.warehouse.pendingInspection} Inspect`} 
                      color="info" 
                      variant="outlined"
                    />
                  )}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Storage: {summary.warehouse.storageUsed}% used
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={summary.warehouse.storageUsed}
                    color={summary.warehouse.storageUsed > 90 ? 'error' : 'primary'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Bookings Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Trend (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={bookingChartData} options={bookingChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Amount Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={invoiceChartData} options={bookingChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tracking Status */}
        {isAdminUser && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tracking Status Distribution
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut data={trackingPieData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Consolidation Status */}
        {isStaffUser && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Consolidation Status
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={consolidationBarData} options={{ responsive: true, maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Zone Utilization */}
        {isStaffUser && summary.warehouse.zoneUtilization.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Warehouse Zone Utilization
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {summary.warehouse.zoneUtilization.map((zone, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Zone {zone.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {zone.used}/{zone.capacity} items
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(zone.used / zone.capacity) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Recent Activity & Alerts */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {summary.bookings.chartData.slice(-5).map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ fontSize: 16, color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2">
                      {item.count} new bookings on {item.date}
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={`$${item.revenue}`} 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alerts & Notifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Overdue Invoices Alert */}
              {summary.invoices.overdue > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Warning sx={{ color: 'error.main', mr: 1 }} />
                  <Typography variant="body2" color="error.dark">
                    {summary.invoices.overdue} overdue invoices require attention
                  </Typography>
                </Box>
              )}

              {/* Storage Alert */}
              {summary.warehouse.storageUsed > 90 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Warning sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="body2" color="warning.dark">
                    Warehouse storage is nearly full ({summary.warehouse.storageUsed}% used)
                  </Typography>
                </Box>
              )}

              {/* Pending Inspections */}
              {summary.warehouse.pendingInspection > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Info sx={{ color: 'info.main', mr: 1 }} />
                  <Typography variant="body2" color="info.dark">
                    {summary.warehouse.pendingInspection} items pending inspection
                  </Typography>
                </Box>
              )}

              {/* Delayed Shipments */}
              {summary.tracking.delayed > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Warning sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="body2" color="warning.dark">
                    {summary.tracking.delayed} shipments are delayed
                  </Typography>
                </Box>
              )}

              {/* Ready for Dispatch */}
              {summary.consolidation.readyForDispatch > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body2" color="success.dark">
                    {summary.consolidation.readyForDispatch} consolidations ready for dispatch
                  </Typography>
                </Box>
              )}

              {summary.invoices.overdue === 0 && 
               summary.warehouse.storageUsed <= 90 && 
               summary.warehouse.pendingInspection === 0 && 
               summary.tracking.delayed === 0 && 
               summary.consolidation.readyForDispatch === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 40, mr: 1 }} />
                  <Typography variant="body1" color="success.main">
                    All systems operational
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Export function for dashboard report
const exportDashboardReport = (summary) => {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      bookings: summary.bookings,
      shipments: summary.shipments,
      invoices: summary.invoices,
      tracking: summary.tracking,
      consolidation: summary.consolidation,
      warehouse: summary.warehouse
    }
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default DashboardSummary;
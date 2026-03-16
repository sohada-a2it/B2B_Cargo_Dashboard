// components/documents/PackingListPDF.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// স্টাইল ডিফাইন করুন
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E67E22',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#E67E22',
    textAlign: 'center',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#F3F4F6',
    padding: 5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    color: '#666',
  },
  value: {
    width: '70%',
    fontWeight: 'medium',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E67E22',
    color: 'white',
    padding: 8,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
    fontSize: 10,
  },
  col1: { width: '10%' },
  col2: { width: '25%' },
  col3: { width: '15%' },
  col4: { width: '25%' },
  col5: { width: '12%' },
  col6: { width: '13%' },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalText: {
    width: '20%',
    fontWeight: 'bold',
  },
  totalValue: {
    width: '15%',
    textAlign: 'right',
  },
});

// Packing List PDF
export const PackingListPDF = ({ consolidation }) => {
  const shipments = consolidation.shipments || [];
  
  // টোটাল ক্যালকুলেট করুন
  const totalPackages = shipments.reduce((sum, s) => 
    sum + (s.packages || s.totalPackages || 1), 0);
  
  const totalWeight = shipments.reduce((sum, s) => 
    sum + (s.weight || s.totalWeight || 0), 0);
  
  const totalVolume = shipments.reduce((sum, s) => 
    sum + (s.volume || s.totalVolume || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* হেডার */}
        <View style={styles.header}>
          <Text style={styles.title}>PACKING LIST</Text>
          <Text style={styles.companyName}>LogiSwift Logistics</Text>
        </View>

        {/* কনসলিডেশন ইনফরমেশন */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consolidation Information</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Consolidation #:</Text>
            <Text style={styles.value}>{consolidation.consolidationNumber}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Origin:</Text>
            <Text style={styles.value}>{consolidation.originWarehouse || 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Destination:</Text>
            <Text style={styles.value}>{consolidation.destinationPort || 'N/A'}</Text>
          </View>
        </View>

        {/* কন্টেইনার ইনফরমেশন */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Container Information</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Container Number:</Text>
            <Text style={styles.value}>{consolidation.containerNumber || 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Container Type:</Text>
            <Text style={styles.value}>{consolidation.containerType || 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Seal Number:</Text>
            <Text style={styles.value}>{consolidation.sealNumber || 'N/A'}</Text>
          </View>
        </View>

        {/* শিপমেন্ট টেবিল */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipments Details</Text>
          
          <View style={styles.table}>
            {/* টেবিল হেডার */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>#</Text>
              <Text style={styles.col2}>Shipment #</Text>
              <Text style={styles.col3}>Packages</Text>
              <Text style={styles.col4}>Description</Text>
              <Text style={styles.col5}>Weight (kg)</Text>
              <Text style={styles.col6}>Volume (m³)</Text>
            </View>

            {/* টেবিল রো */}
            {shipments.map((shipment, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{shipment.shipmentNumber || `SHIP-${index + 1}`}</Text>
                <Text style={styles.col3}>{shipment.packages || shipment.totalPackages || 1}</Text>
                <Text style={styles.col4}>{shipment.description || '-'}</Text>
                <Text style={styles.col5}>{shipment.weight || shipment.totalWeight || 0}</Text>
                <Text style={styles.col6}>{shipment.volume || shipment.totalVolume || 0}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* সামারি ও টোটাল */}
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Packages:</Text>
            <Text style={styles.totalValue}>{totalPackages}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Weight:</Text>
            <Text style={styles.totalValue}>{totalWeight.toFixed(2)} kg</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Volume:</Text>
            <Text style={styles.totalValue}>{totalVolume.toFixed(2)} m³</Text>
          </View>
        </View>

        {/* ফুটার */}
        <View style={{ marginTop: 40, textAlign: 'center', color: '#999', fontSize: 8 }}>
          <Text>This document is automatically generated by LogiSwift System</Text>
        </View>
      </Page>
    </Document>
  );
};

// Container Manifest PDF
export const ContainerManifestPDF = ({ consolidation }) => {
  const shipments = consolidation.shipments || [];
  
  const totalPackages = shipments.reduce((sum, s) => 
    sum + (s.packages || s.totalPackages || 1), 0);
  
  const totalWeight = shipments.reduce((sum, s) => 
    sum + (s.weight || s.totalWeight || 0), 0);
  
  const totalVolume = shipments.reduce((sum, s) => 
    sum + (s.volume || s.totalVolume || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>CONTAINER MANIFEST</Text>
          <Text style={styles.companyName}>LogiSwift Logistics</Text>
        </View>

        {/* Container Details - Highlighted */}
        <View style={{ ...styles.section, backgroundColor: '#FEF3E2', padding: 10 }}>
          <Text style={{ ...styles.sectionTitle, backgroundColor: '#E67E22', color: 'white' }}>
            CONTAINER DETAILS
          </Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Container Number:</Text>
            <Text style={{ ...styles.value, fontSize: 14, fontWeight: 'bold' }}>
              {consolidation.containerNumber || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Container Type:</Text>
            <Text style={styles.value}>{consolidation.containerType || 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Seal Number:</Text>
            <Text style={styles.value}>{consolidation.sealNumber || 'N/A'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Route:</Text>
            <Text style={styles.value}>
              {consolidation.originWarehouse || 'N/A'} → {consolidation.destinationPort || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Carrier Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Carrier Information</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Carrier Name:</Text>
            <Text style={styles.value}>{consolidation.carrier?.name || 'Not Assigned'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Vessel/Flight #:</Text>
            <Text style={styles.value}>
              {consolidation.carrier?.vesselNumber || consolidation.carrier?.flightNumber || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Booking Ref:</Text>
            <Text style={styles.value}>{consolidation.carrier?.bookingReference || 'N/A'}</Text>
          </View>
        </View>

        {/* Shipments Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipments Summary</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>#</Text>
              <Text style={styles.col2}>Shipment #</Text>
              <Text style={styles.col3}>Packages</Text>
              <Text style={styles.col4}>Weight (kg)</Text>
              <Text style={styles.col5}>Volume (m³)</Text>
            </View>

            {shipments.map((shipment, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{shipment.shipmentNumber || `SHIP-${index + 1}`}</Text>
                <Text style={styles.col3}>{shipment.packages || shipment.totalPackages || 1}</Text>
                <Text style={styles.col4}>{shipment.weight || shipment.totalWeight || 0}</Text>
                <Text style={styles.col5}>{shipment.volume || shipment.totalVolume || 0}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Container Totals */}
        <View style={{ ...styles.footer, backgroundColor: '#F3F4F6', padding: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>
            CONTAINER TOTALS
          </Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Shipments:</Text>
            <Text style={styles.totalValue}>{shipments.length}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Packages:</Text>
            <Text style={styles.totalValue}>{totalPackages}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Weight:</Text>
            <Text style={styles.totalValue}>{totalWeight.toFixed(2)} kg</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Volume:</Text>
            <Text style={styles.totalValue}>{totalVolume.toFixed(2)} m³</Text>
          </View>
        </View>

        {/* Declaration */}
        <View style={{ marginTop: 20, fontSize: 8, color: '#666' }}>
          <Text>I hereby declare that the information provided in this manifest is true and correct.</Text>
          <Text>Generated by: LogiSwift System on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};
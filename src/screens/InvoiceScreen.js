import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Share,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const InvoiceLineItem = ({ item }) => (
  <View style={styles.lineItem}>
    <View style={styles.lineItemContent}>
      <Text style={styles.lineItemDesc}>{item.description}</Text>
      <Text style={styles.lineItemQty}>Qty: {item.quantity}</Text>
    </View>
    <View style={styles.lineItemPrice}>
      <Text style={styles.lineItemUnitPrice}>
        ₹{item.unitPrice.toLocaleString('en-IN')}
      </Text>
      <Text style={styles.lineItemTotal}>
        ₹{item.total.toLocaleString('en-IN')}
      </Text>
    </View>
  </View>
);

export const InvoiceScreen = ({ route, navigation }) => {
  const { appState } = useContext(AppContext);
  const { orderId } = route.params;

  const invoice = useMemo(() => {
    return appState.invoices.find(inv => inv.orderId === orderId);
  }, [appState.invoices, orderId]);

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Invoice not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice #${invoice.id}\nCustomer: ${invoice.customerName}\nTotal: ₹${invoice.total.toLocaleString('en-IN')}`,
        title: 'Share Invoice',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = () => {
    // In a real app, this would trigger PDF download
    console.log('Downloading invoice', invoice.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.id}</Text>
          </View>
          <View style={styles.invoiceDateBox}>
            <Text style={styles.invoiceDateLabel}>Date</Text>
            <Text style={styles.invoiceDate}>{invoice.date}</Text>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From</Text>
          <Text style={styles.companyName}>Vikas Marketing</Text>
          <Text style={styles.companyDetail}>Kitchenware Wholesale</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.customerName}>{invoice.customerName}</Text>
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { width: 60 }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, { width: 80 }]}>Price</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Total</Text>
          </View>

          <FlatList
            data={invoice.items}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => <InvoiceLineItem item={item} />}
            scrollEnabled={false}
          />
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ₹{invoice.subtotal.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>
              ₹{invoice.gst.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount Due</Text>
            <Text style={styles.totalValue}>
              ₹{invoice.total.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Payment Terms</Text>
          <Text style={styles.termsText}>
            Payment due within 30 days of invoice date. Please make payments through our preferred payment methods.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonIcon}>📤</Text>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
        >
          <Text style={styles.downloadButtonIcon}>⬇️</Text>
          <Text style={styles.downloadButtonText}>Download PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    paddingHorizontal: SPACING.sm,
  },
  backText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  invoiceHeader: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  invoiceLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  invoiceNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  invoiceDateBox: {
    alignItems: 'flex-end',
  },
  invoiceDateLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
  },
  invoiceDate: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginTop: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  companyName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  companyDetail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  customerName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    marginBottom: 0,
  },
  tableHeaderCell: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  lineItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  lineItemContent: {
    flex: 1,
  },
  lineItemDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  lineItemQty: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray600,
  },
  lineItemPrice: {
    alignItems: 'flex-end',
  },
  lineItemUnitPrice: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  lineItemTotal: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  summarySection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.gray50,
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  termsSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  termsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  termsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.gray500,
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  shareButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  shareButtonIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  shareButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  downloadButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  downloadButtonIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
});

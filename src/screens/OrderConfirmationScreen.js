import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const CartItem = ({ item, onRemove, onQuantityChange }) => (
  <View style={styles.cartItem}>
    <View style={styles.itemContent}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSku}>SKU: {item.sku}</Text>
      </View>
      <Text style={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
    </View>

    <View style={styles.quantityRow}>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          onPress={() => onQuantityChange(item.id, item.quantity - 1)}
          style={styles.quantityBtn}
        >
          <Text style={styles.quantityBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantityValue}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => onQuantityChange(item.id, item.quantity + 1)}
          style={styles.quantityBtn}
        >
          <Text style={styles.quantityBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalLabel}>Total</Text>
        <Text style={styles.itemTotalValue}>
          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const OrderConfirmationScreen = ({ navigation }) => {
  const { appState, removeFromCart, updateCartQuantity, submitOrder } = useContext(AppContext);

  const cartSummary = useMemo(() => {
    const subtotal = appState.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: appState.cart.length,
      totalQuantity: appState.cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [appState.cart]);

  const handleSubmitOrder = () => {
    if (appState.cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart');
      return;
    }

    Alert.alert(
      'Confirm Order',
      `Total: ₹${cartSummary.total.toLocaleString('en-IN')}\n\nDo you want to submit this order?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Submit Order',
          onPress: () => {
            const order = submitOrder();
            Alert.alert(
              'Order Submitted',
              `Order ID: ${order.id}\n\nThank you for your order!`,
              [
                {
                  text: 'View Order',
                  onPress: () => {
                    navigation.navigate('OrderHistory');
                  },
                },
              ]
            );
          },
          style: 'default',
        },
      ]
    );
  };

  if (appState.cart.length === 0 && !appState.selectedCustomer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Review</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Cart is empty</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('CustomerSelect')}
          >
            <Text style={styles.continueButtonText}>Start New Order</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Order Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Info */}
        {appState.selectedCustomer && (
          <View style={styles.customerSection}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {appState.selectedCustomer.name}
              </Text>
              <Text style={styles.customerDetail}>
                {appState.selectedCustomer.city} • {appState.selectedCustomer.phone}
              </Text>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.itemsSection}>
          <View style={styles.itemsSectionHeader}>
            <Text style={styles.sectionTitle}>Items ({cartSummary.itemCount})</Text>
            <Text style={styles.itemCountText}>
              {cartSummary.totalQuantity} units
            </Text>
          </View>

          <FlatList
            data={appState.cart}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onRemove={removeFromCart}
                onQuantityChange={updateCartQuantity}
              />
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ₹{cartSummary.subtotal.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (18% GST)</Text>
            <Text style={styles.summaryValue}>
              ₹{cartSummary.tax.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₹{cartSummary.total.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            This order will be recorded in your order history and sent to the admin for processing.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate('ProductListing')}
        >
          <Text style={styles.cancelButtonText}>Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitOrder}
        >
          <Text style={styles.submitButtonText}>Submit Order</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.lg,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  customerSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  customerInfo: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  customerName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  customerDetail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
  },
  itemsSection: {
    marginBottom: SPACING.lg,
  },
  itemsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  itemCountText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray500,
  },
  cartItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  itemSku: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  quantityBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  quantityBtnText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
  quantityValue: {
    paddingHorizontal: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  itemTotal: {
    alignItems: 'center',
  },
  itemTotalLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
  },
  itemTotalValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  removeButton: {
    paddingHorizontal: SPACING.sm,
  },
  removeText: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  summarySection: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray50,
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
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
  infoBox: {
    backgroundColor: COLORS.primaryLight + '20',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray700,
    lineHeight: 20,
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
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray600,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
});

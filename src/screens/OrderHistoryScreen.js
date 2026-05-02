import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const OrderItem = ({ order, onPress }) => (
  <TouchableOpacity
    style={styles.orderItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.orderHeader}>
      <View>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.orderCustomer}>{order.customerName}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          order.status === 'completed' ? styles.statusCompleted : styles.statusPending,
        ]}
      >
        <Text style={styles.statusText}>
          {order.status === 'completed' ? '✓' : '⏳'} {order.status}
        </Text>
      </View>
    </View>

    <View style={styles.orderDetails}>
      <Text style={styles.orderDate}>{order.date}</Text>
      <Text style={styles.orderAmount}>₹{order.total.toLocaleString('en-IN')}</Text>
    </View>

    <View style={styles.orderFooter}>
      <Text style={styles.itemCount}>{order.items.length} items</Text>
      <Text style={styles.arrow}>→</Text>
    </View>
  </TouchableOpacity>
);

export const OrderHistoryScreen = ({ navigation }) => {
  const { appState } = useContext(AppContext);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = useMemo(() => {
    let orders = appState.orders;

    if (filterStatus !== 'all') {
      orders = orders.filter(o => o.status === filterStatus);
    }

    if (searchText) {
      orders = orders.filter(
        o =>
          o.id.includes(searchText) ||
          o.customerName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return orders;
  }, [appState.orders, searchText, filterStatus]);

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
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search order ID..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={COLORS.gray400}
          />
          {searchText ? (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.searchIcon}>🔍</Text>
          )}
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {['all', 'pending', 'completed'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.filterButtonTextActive,
                ]}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <OrderItem
                order={item}
                onPress={() =>
                  navigation.navigate('OrderDetails', { orderId: item.id })
                }
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        )}
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray900,
  },
  searchIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  clearButton: {
    padding: SPACING.sm,
  },
  clearText: {
    color: COLORS.gray400,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  orderItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderId: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  orderCustomer: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusCompleted: {
    backgroundColor: COLORS.successLight,
  },
  statusPending: {
    backgroundColor: COLORS.warningLight,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  orderDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
  },
  orderAmount: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  itemCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
  },
  arrow: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.gray400,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray500,
  },
});

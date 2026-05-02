import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const MetricCard = ({ title, value, icon, color }) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

const OrderCard = ({ order, onPress }) => (
  <TouchableOpacity
    style={styles.orderCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.orderCardHeader}>
      <Text style={styles.orderCardTitle}>{order.customerName}</Text>
      <View
        style={[
          styles.statusBadge,
          order.status === 'completed'
            ? styles.statusCompleted
            : styles.statusPending,
        ]}
      >
        <Text style={styles.statusText}>
          {order.status === 'completed' ? '✓' : '⏳'} {order.status}
        </Text>
      </View>
    </View>
    <View style={styles.orderCardDetails}>
      <Text style={styles.orderCardDate}>{order.date}</Text>
      <Text style={styles.orderCardAmount}>₹{order.total.toLocaleString('en-IN')}</Text>
    </View>
  </TouchableOpacity>
);

export const SalesmanDashboardScreen = ({ navigation }) => {
  const { appState, handleLogout } = useContext(AppContext);

  const metrics = useMemo(() => {
    const totalOrders = appState.orders.length;
    const totalRevenue = appState.orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = appState.orders.filter(o => o.status === 'pending').length;
    const totalCustomers = appState.customers.length;

    return [
      { title: 'Total Orders', value: totalOrders, icon: '📦', color: COLORS.primary },
      { title: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: '💰', color: COLORS.success },
      { title: 'Pending Orders', value: pendingOrders, icon: '⏳', color: COLORS.warning },
      { title: 'Total Customers', value: totalCustomers, icon: '👥', color: COLORS.secondary },
    ];
  }, [appState.orders, appState.customers]);

  const recentOrders = appState.orders.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{appState.currentUser?.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            handleLogout();
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics Grid */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersSectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length > 0 ? (
            <FlatList
              data={recentOrders}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <OrderCard
                  order={item}
                  onPress={() =>
                    navigation.navigate('OrderDetails', { orderId: item.id })
                  }
                />
              )}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No orders yet</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CustomerSelect')}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Create New Order</Text>
              <Text style={styles.actionSubtext}>Select customer and products</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View All Orders</Text>
              <Text style={styles.actionSubtext}>Check order status and history</Text>
            </View>
          </TouchableOpacity>
        </View>
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
  greeting: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray500,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  metricsSection: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    gap: SPACING.md,
  },
  metricCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricIcon: {
    fontSize: TYPOGRAPHY.sizes.xl,
    marginRight: SPACING.sm,
  },
  metricTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
  },
  ordersSection: {
    marginBottom: SPACING['2xl'],
  },
  ordersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderCardTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
    flex: 1,
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
  orderCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderCardDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
  },
  orderCardAmount: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray500,
    fontSize: TYPOGRAPHY.sizes.base,
    paddingVertical: SPACING.lg,
  },
  actionsSection: {
    marginBottom: SPACING['2xl'],
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  actionIcon: {
    fontSize: TYPOGRAPHY.sizes.xl,
    marginRight: SPACING.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  actionSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
});

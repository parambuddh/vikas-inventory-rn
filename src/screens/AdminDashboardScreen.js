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
  <View style={[styles.metricCard, { borderTopColor: color }]}>
    <Text style={styles.metricIcon}>{icon}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

const RecentOrderCard = ({ order, onPress }) => (
  <TouchableOpacity
    style={styles.recentOrderCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.recentOrderHeader}>
      <View>
        <Text style={styles.recentOrderId}>{order.id}</Text>
        <Text style={styles.recentOrderCustomer}>{order.customerName}</Text>
      </View>
      <View
        style={[
          styles.recentOrderBadge,
          order.status === 'completed'
            ? styles.recentOrderBadgeCompleted
            : styles.recentOrderBadgePending,
        ]}
      >
        <Text style={styles.recentOrderBadgeText}>
          {order.status === 'completed' ? '✓' : '⏳'}
        </Text>
      </View>
    </View>
    <View style={styles.recentOrderFooter}>
      <Text style={styles.recentOrderDate}>{order.date}</Text>
      <Text style={styles.recentOrderAmount}>₹{order.total.toLocaleString('en-IN')}</Text>
    </View>
  </TouchableOpacity>
);

export const AdminDashboardScreen = ({ navigation }) => {
  const { appState, handleLogout } = useContext(AppContext);

  const metrics = useMemo(() => {
    const totalOrders = appState.orders.length;
    const totalRevenue = appState.orders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = appState.orders.filter(o => o.status === 'completed').length;
    const lowStockProducts = appState.products.filter(p => p.stock < 50).length;

    return [
      { title: 'Total Orders', value: totalOrders, icon: '📦', color: COLORS.primary },
      { title: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: '💰', color: COLORS.success },
      { title: 'Completed', value: completedOrders, icon: '✓', color: COLORS.successDark },
      { title: 'Low Stock', value: lowStockProducts, icon: '⚠️', color: COLORS.warning },
    ];
  }, [appState.orders, appState.products]);

  const recentOrders = appState.orders.slice(0, 5);
  const pendingTasks = appState.tasks.filter(t => t.status === 'pending').length;
  const unreadNotifications = appState.notifications.filter(n => !n.read).length;

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

        {/* Alerts Section */}
        {(pendingTasks > 0 || unreadNotifications > 0) && (
          <View style={styles.alertsSection}>
            <View style={styles.alertRow}>
              {pendingTasks > 0 && (
                <TouchableOpacity
                  style={[styles.alertCard, styles.alertWarning]}
                  onPress={() => navigation.navigate('Tasks')}
                >
                  <Text style={styles.alertIcon}>📋</Text>
                  <Text style={styles.alertText}>{pendingTasks} Pending Tasks</Text>
                </TouchableOpacity>
              )}
              {unreadNotifications > 0 && (
                <TouchableOpacity
                  style={[styles.alertCard, styles.alertNotification]}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Text style={styles.alertIcon}>🔔</Text>
                  <Text style={styles.alertText}>{unreadNotifications} Notifications</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersSectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminOrders')}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length > 0 ? (
            <FlatList
              data={recentOrders}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <RecentOrderCard
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
          <Text style={styles.sectionTitle}>Management</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('InventoryManagement')}
          >
            <Text style={styles.actionIcon}>📦</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Inventory Management</Text>
              <Text style={styles.actionSubtext}>Update stock levels</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.actionIcon}>🔔</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Notifications</Text>
              <Text style={styles.actionSubtext}>{unreadNotifications} unread</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Text style={styles.actionIcon}>✓</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Tasks</Text>
              <Text style={styles.actionSubtext}>{pendingTasks} pending</Text>
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
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  metricsSection: {
    marginBottom: SPACING['2xl'],
  },
  metricsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderTopWidth: 4,
    width: '48%',
    ...SHADOWS.sm,
  },
  metricIcon: {
    fontSize: TYPOGRAPHY.sizes.xl,
    marginBottom: SPACING.xs,
  },
  metricTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  alertsSection: {
    marginBottom: SPACING.lg,
  },
  alertRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  alertCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  alertWarning: {
    backgroundColor: COLORS.warningLight + '30',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertNotification: {
    backgroundColor: COLORS.primaryLight + '30',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  alertIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
    marginRight: SPACING.sm,
  },
  alertText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray900,
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
  recentOrderCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recentOrderId: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  recentOrderCustomer: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  recentOrderBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentOrderBadgeCompleted: {
    backgroundColor: COLORS.successLight,
  },
  recentOrderBadgePending: {
    backgroundColor: COLORS.warningLight,
  },
  recentOrderBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
  recentOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  recentOrderDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
  },
  recentOrderAmount: {
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

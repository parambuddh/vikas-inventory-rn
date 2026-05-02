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

const NotificationItem = ({ notification, onPress, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return '📦';
      case 'stock':
        return '⚠️';
      case 'inventory':
        return '📊';
      default:
        return '🔔';
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'order':
        return COLORS.primary;
      case 'stock':
        return COLORS.danger;
      case 'inventory':
        return COLORS.warning;
      default:
        return COLORS.gray500;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.read && styles.notificationItemUnread,
      ]}
      onPress={() => !notification.read && onMarkAsRead(notification.id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.notificationIcon, { color: getColor() }]}>
        {getIcon()}
      </Text>
      
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationMessage,
            !notification.read && styles.notificationMessageBold,
          ]}
        >
          {notification.message}
        </Text>
        <Text style={styles.notificationDate}>{notification.date}</Text>
      </View>

      {!notification.read && (
        <View style={styles.unreadIndicator}>
          <View style={styles.unreadDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export const NotificationsScreen = ({ navigation }) => {
  const { appState, markNotificationAsRead } = useContext(AppContext);

  const sortedNotifications = useMemo(() => {
    return [...appState.notifications].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [appState.notifications]);

  const unreadCount = sortedNotifications.filter(n => !n.read).length;

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
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sortedNotifications.length > 0 ? (
          <>
            {/* Unread Notifications */}
            {unreadCount > 0 && (
              <>
                <Text style={styles.sectionTitle}>Unread ({unreadCount})</Text>
                <FlatList
                  data={sortedNotifications.filter(n => !n.read)}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <NotificationItem
                      notification={item}
                      onMarkAsRead={markNotificationAsRead}
                    />
                  )}
                  scrollEnabled={false}
                />
              </>
            )}

            {/* Read Notifications */}
            {sortedNotifications.filter(n => n.read).length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Earlier ({sortedNotifications.filter(n => n.read).length})
                </Text>
                <FlatList
                  data={sortedNotifications.filter(n => n.read)}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <NotificationItem
                      notification={item}
                      onMarkAsRead={markNotificationAsRead}
                    />
                  )}
                  scrollEnabled={false}
                />
              </>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
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
  badgeContainer: {
    backgroundColor: COLORS.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  notificationItemUnread: {
    backgroundColor: COLORS.primaryLight + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  notificationMessageBold: {
    fontWeight: '600',
    color: COLORS.gray900,
  },
  notificationDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  unreadIndicator: {
    marginLeft: SPACING.md,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
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

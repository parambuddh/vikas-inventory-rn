import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { COLORS } from '../styles/colors';

/**
 * ResponsiveContainer
 * - On Android: renders children full-width (standard mobile layout)
 * - On Web: constrains to max 480px (phone-like) and centers on screen
 *   with a subtle background behind it
 */
export const ResponsiveContainer = ({ children, style }) => {
  const { width } = useWindowDimensions();

  if (Platform.OS === 'web' && width > 500) {
    return (
      <View style={styles.webOuter}>
        <View style={[styles.webInner, style]}>
          {children}
        </View>
      </View>
    );
  }

  return <View style={[styles.mobileContainer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  mobileContainer: {
    flex: 1,
  },
  webOuter: {
    flex: 1,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
  },
  webInner: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.background,
    // Phone-like shadow on web
    ...Platform.select({
      web: {
        boxShadow: '0 0 40px rgba(0,0,0,0.12)',
      },
      default: {},
    }),
  },
});

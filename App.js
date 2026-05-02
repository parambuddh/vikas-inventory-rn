import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, AppContext } from './src/context/AppContext';
import { COLORS } from './src/styles/colors';

// Import Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { SalesmanDashboardScreen } from './src/screens/SalesmanDashboardScreen';
import { CustomerSelectScreen } from './src/screens/CustomerSelectScreen';
import { ProductListingScreen } from './src/screens/ProductListingScreen';
import { OrderConfirmationScreen } from './src/screens/OrderConfirmationScreen';
import { OrderHistoryScreen } from './src/screens/OrderHistoryScreen';
import { OrderDetailsScreen } from './src/screens/OrderDetailsScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { InventoryManagementScreen } from './src/screens/InventoryManagementScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { InvoiceScreen } from './src/screens/InvoiceScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animationEnabled: true,
};

const SalesmanNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="SalesmanDashboard" component={SalesmanDashboardScreen} />
    <Stack.Screen name="CustomerSelect" component={CustomerSelectScreen} />
    <Stack.Screen name="ProductListing" component={ProductListingScreen} />
    <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="Invoice" component={InvoiceScreen} />
  </Stack.Navigator>
);

const AdminNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="AdminOrders" component={OrderHistoryScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="Invoice" component={InvoiceScreen} />
    <Stack.Screen name="InventoryManagement" component={InventoryManagementScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Tasks" component={TasksScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { appState } = useContext(AppContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!appState.currentUser ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : appState.userRole === 'salesman' ? (
          <Stack.Screen name="SalesmanStack" component={SalesmanNavigator} />
        ) : (
          <Stack.Screen name="AdminStack" component={AdminNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <AppNavigator />
    </AppProvider>
  );
}

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockData } from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState({
    currentUser: null,
    userRole: null,
    cart: [],
    selectedCustomer: null,
    currentPlan: 'flexible',
    orders: [...mockData.orders],
    customers: [...mockData.customers],
    products: [...mockData.products],
    notifications: [...mockData.notifications],
    tasks: [...mockData.tasks],
    invoices: [...mockData.invoices],
  });

  const [toasts, setToasts] = useState([]);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('appState');
      const savedPlan = await AsyncStorage.getItem('currentPlan');
      
      if (savedState) {
        setAppState(prev => ({
          ...prev,
          ...JSON.parse(savedState),
        }));
      }
      
      if (savedPlan) {
        setAppState(prev => ({
          ...prev,
          currentPlan: savedPlan,
        }));
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  const saveState = async (newState) => {
    try {
      await AsyncStorage.setItem('appState', JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  // Handle Login
  const handleLogin = (username, password) => {
    const user = mockData.users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      const newState = {
        ...appState,
        currentUser: user,
        userRole: user.role,
      };
      setAppState(newState);
      saveState(newState);
      showToast(`Welcome, ${user.name}!`, 'success');
      return true;
    }

    showToast('Invalid credentials', 'error');
    return false;
  };

  // Handle Logout
  const handleLogout = () => {
    const newState = {
      ...appState,
      currentUser: null,
      userRole: null,
      cart: [],
      selectedCustomer: null,
    };
    setAppState(newState);
    saveState(newState);
    showToast('Logged out successfully', 'info');
  };

  // Select Customer
  const selectCustomer = (customerId) => {
    const customer = appState.customers.find(c => c.id === customerId);
    if (customer) {
      const newState = {
        ...appState,
        selectedCustomer: customer,
        cart: [],
      };
      setAppState(newState);
      saveState(newState);
      return true;
    }
    return false;
  };

  // Add to Cart
  const addToCart = (product, quantity) => {
    const existingItem = appState.cart.find(item => item.id === product.id);

    let newCart;
    if (existingItem) {
      newCart = appState.cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...appState.cart, { ...product, quantity }];
    }

    const newState = {
      ...appState,
      cart: newCart,
    };
    setAppState(newState);
    saveState(newState);
    showToast(`${product.name} added to cart`, 'success');
  };

  // Remove from Cart
  const removeFromCart = (productId) => {
    const newCart = appState.cart.filter(item => item.id !== productId);
    const newState = {
      ...appState,
      cart: newCart,
    };
    setAppState(newState);
    saveState(newState);
    showToast('Item removed from cart', 'info');
  };

  // Update Cart Quantity
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = appState.cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );

    const newState = {
      ...appState,
      cart: newCart,
    };
    setAppState(newState);
    saveState(newState);
  };

  // Submit Order
  const submitOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Date.now()}`,
      customerId: appState.selectedCustomer.id,
      customerName: appState.selectedCustomer.name,
      date: new Date().toISOString().split('T')[0],
      items: appState.cart,
      subtotal: appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      tax: appState.cart.reduce((sum, item) => sum + (item.price * item.quantity * 0.18), 0),
      total: appState.cart.reduce((sum, item) => sum + (item.price * item.quantity * 1.18), 0),
      status: 'pending',
    };

    const newState = {
      ...appState,
      orders: [newOrder, ...appState.orders],
      cart: [],
      selectedCustomer: null,
    };

    setAppState(newState);
    saveState(newState);
    showToast('Order submitted successfully!', 'success');
    return newOrder;
  };

  // Complete Order (Admin)
  const completeOrder = (orderId) => {
    const newOrders = appState.orders.map(order =>
      order.id === orderId ? { ...order, status: 'completed' } : order
    );

    const newState = {
      ...appState,
      orders: newOrders,
    };

    setAppState(newState);
    saveState(newState);
    showToast('Order completed', 'success');
  };

  // Mark Notification as Read
  const markNotificationAsRead = (notificationId) => {
    const newNotifications = appState.notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );

    const newState = {
      ...appState,
      notifications: newNotifications,
    };

    setAppState(newState);
    saveState(newState);
  };

  // Complete Task (Admin)
  const completeTask = (taskId) => {
    const newTasks = appState.tasks.map(task =>
      task.id === taskId ? { ...task, status: 'completed' } : task
    );

    const newState = {
      ...appState,
      tasks: newTasks,
    };

    setAppState(newState);
    saveState(newState);
    showToast('Task completed', 'success');
  };

  // Update Stock (Admin)
  const updateStock = (productId, newStock) => {
    const newProducts = appState.products.map(product =>
      product.id === productId
        ? { ...product, stock: newStock, inStock: newStock > 0 }
        : product
    );

    const newState = {
      ...appState,
      products: newProducts,
    };

    setAppState(newState);
    saveState(newState);
    showToast('Stock updated', 'success');
  };

  // Set Current Plan
  const setCurrentPlan = async (plan) => {
    const newState = {
      ...appState,
      currentPlan: plan,
    };

    setAppState(newState);
    await AsyncStorage.setItem('currentPlan', plan);
    saveState(newState);
  };

  // Show Toast
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        toasts,
        handleLogin,
        handleLogout,
        selectCustomer,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        submitOrder,
        completeOrder,
        markNotificationAsRead,
        completeTask,
        updateStock,
        setCurrentPlan,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

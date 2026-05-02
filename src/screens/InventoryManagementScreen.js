import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const InventoryItem = ({ product, onEdit }) => (
  <TouchableOpacity
    style={styles.inventoryItem}
    onPress={() => onEdit(product)}
    activeOpacity={0.7}
  >
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productSku}>{product.sku}</Text>
    </View>

    <View style={styles.stockInfo}>
      <View style={styles.stockColumn}>
        <Text style={styles.stockLabel}>Stock</Text>
        <Text
          style={[
            styles.stockValue,
            !product.inStock && styles.stockValueZero,
          ]}
        >
          {product.stock}
        </Text>
      </View>
      <View style={styles.stockColumn}>
        <Text style={styles.statusLabel}>Status</Text>
        <View
          style={[
            styles.statusBadge,
            product.inStock ? styles.statusInStock : styles.statusOutOfStock,
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {product.inStock ? 'In' : 'Out'}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export const InventoryManagementScreen = ({ navigation }) => {
  const { appState, updateStock } = useContext(AppContext);
  const [searchText, setSearchText] = useState('');
  const [editModal, setEditModal] = useState({
    visible: false,
    product: null,
  });
  const [newStock, setNewStock] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchText) return appState.products;

    return appState.products.filter(
      product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, appState.products]);

  const handleEditProduct = (product) => {
    setEditModal({ visible: true, product });
    setNewStock(product.stock.toString());
  };

  const handleSaveStock = () => {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
      Alert.alert('Invalid Stock', 'Please enter a valid number');
      return;
    }

    updateStock(editModal.product.id, stock);
    setEditModal({ visible: false, product: null });
  };

  const lowStockProducts = appState.products.filter(p => p.stock < 50);
  const outOfStockProducts = appState.products.filter(p => !p.inStock);

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
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Alerts */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <View style={styles.alertsSection}>
            {outOfStockProducts.length > 0 && (
              <View style={[styles.alert, styles.alertDanger]}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertText}>
                  {outOfStockProducts.length} product(s) out of stock
                </Text>
              </View>
            )}
            {lowStockProducts.length > 0 && (
              <View style={[styles.alert, styles.alertWarning]}>
                <Text style={styles.alertIcon}>⚡</Text>
                <Text style={styles.alertText}>
                  {lowStockProducts.length} product(s) low on stock
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or SKU..."
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

        {/* Inventory List */}
        {filteredProducts.length > 0 ? (
          <View style={styles.inventoryList}>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {filteredProducts.length} Products
              </Text>
            </View>
            <FlatList
              data={filteredProducts}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <InventoryItem
                  product={item}
                  onEdit={handleEditProduct}
                />
              )}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModal.visible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Stock</Text>
              <TouchableOpacity
                onPress={() => setEditModal({ visible: false, product: null })}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {editModal.product && (
              <>
                <View style={styles.modalProductInfo}>
                  <Text style={styles.modalProductName}>
                    {editModal.product.name}
                  </Text>
                  <Text style={styles.modalProductSku}>
                    SKU: {editModal.product.sku}
                  </Text>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Current Stock</Text>
                  <Text style={styles.modalCurrentValue}>
                    {editModal.product.stock} units
                  </Text>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>New Stock</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newStock}
                    onChangeText={setNewStock}
                    keyboardType="number-pad"
                    placeholder="Enter new stock quantity"
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setEditModal({ visible: false, product: null })}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={handleSaveStock}
                  >
                    <Text style={styles.modalSaveButtonText}>Update Stock</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  alertsSection: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  alertDanger: {
    backgroundColor: COLORS.dangerLight + '30',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  alertWarning: {
    backgroundColor: COLORS.warningLight + '30',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
    marginRight: SPACING.md,
  },
  alertText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray900,
    flex: 1,
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
  inventoryList: {
    marginBottom: SPACING.lg,
  },
  listHeader: {
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  listHeaderText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  inventoryItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  productSku: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  stockInfo: {
    flexDirection: 'row',
    gap: SPACING.lg,
    alignItems: 'center',
  },
  stockColumn: {
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  stockValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stockValueZero: {
    color: COLORS.danger,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusInStock: {
    backgroundColor: COLORS.successLight,
  },
  statusOutOfStock: {
    backgroundColor: COLORS.dangerLight,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.black + '60',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  modalCloseText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: COLORS.gray400,
  },
  modalProductInfo: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  modalProductName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  modalProductSku: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  modalInputGroup: {
    marginBottom: SPACING.lg,
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  modalCurrentValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray900,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: COLORS.gray600,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
});

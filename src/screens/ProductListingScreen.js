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
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const ProductCard = ({ product, onAddToCart }) => (
  <View style={[
    styles.productCard,
    !product.inStock && styles.productCardOutOfStock,
  ]}>
    <View style={styles.productHeader}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productSku}>SKU: {product.sku}</Text>
      </View>
      {!product.inStock && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
    </View>

    <View style={styles.productDetails}>
      <View style={styles.detailColumn}>
        <Text style={styles.detailLabel}>Price</Text>
        <Text style={styles.detailValue}>₹{product.price.toLocaleString('en-IN')}</Text>
      </View>
      <View style={styles.detailColumn}>
        <Text style={styles.detailLabel}>Stock</Text>
        <Text style={[
          styles.detailValue,
          product.stock === 0 && styles.stockZero,
        ]}>
          {product.stock} units
        </Text>
      </View>
      <View style={styles.detailColumn}>
        <Text style={styles.detailLabel}>Category</Text>
        <Text style={styles.detailValue}>{product.category}</Text>
      </View>
    </View>

    <TouchableOpacity
      style={[
        styles.addButton,
        !product.inStock && styles.addButtonDisabled,
      ]}
      onPress={() => onAddToCart(product)}
      disabled={!product.inStock}
    >
      <Text style={styles.addButtonText}>
        {product.inStock ? '➕ Add to Cart' : '✕ Unavailable'}
      </Text>
    </TouchableOpacity>
  </View>
);

export const ProductListingScreen = ({ navigation }) => {
  const { appState, addToCart } = useContext(AppContext);
  const [searchText, setSearchText] = useState('');
  const [quantityModal, setQuantityModal] = useState({
    visible: false,
    product: null,
  });
  const [quantity, setQuantity] = useState('1');

  const filteredProducts = useMemo(() => {
    if (!searchText) return appState.products;
    
    return appState.products.filter(
      product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, appState.products]);

  const handleAddToCart = (product) => {
    setQuantityModal({ visible: true, product });
    setQuantity('1');
  };

  const handleConfirmAdd = () => {
    const qty = parseInt(quantity);
    if (qty > 0 && qty <= quantityModal.product.stock) {
      addToCart(quantityModal.product, qty);
      setQuantityModal({ visible: false, product: null });
    } else {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
    }
  };

  const cartItemCount = appState.cart.length;

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
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('OrderConfirmation')}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
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

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onAddToCart={handleAddToCart}
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )}
      </ScrollView>

      {/* Quantity Modal */}
      {quantityModal.visible && quantityModal.product && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add {quantityModal.product.name}
            </Text>
            
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityInput}>
              <TouchableOpacity
                onPress={() => {
                  const q = Math.max(1, parseInt(quantity) - 1);
                  setQuantity(q.toString());
                }}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityValue}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                textAlign="center"
              />
              
              <TouchableOpacity
                onPress={() => {
                  const q = Math.min(
                    quantityModal.product.stock,
                    parseInt(quantity) + 1
                  );
                  setQuantity(q.toString());
                }}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalInfo}>
              Available: {quantityModal.product.stock} units
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setQuantityModal({ visible: false, product: null })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmAdd}
              >
                <Text style={styles.confirmButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  cartButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  cartIcon: {
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: 'bold',
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
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  productCardOutOfStock: {
    opacity: 0.6,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
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
  outOfStockBadge: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  outOfStockText: {
    color: COLORS.dangerDark,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  detailColumn: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  stockZero: {
    color: COLORS.danger,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
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
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.black + '80',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  quantityLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  quantityButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  quantityButtonText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityValue: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    minWidth: 60,
  },
  modalInfo: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalButtons: {
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
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
});

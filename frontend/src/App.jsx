import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import ProductSearch from './components/ProductSearch';
import TrackedProducts from './components/TrackedProducts';
import ProductDetailModal from './components/ProductDetailModal';
import AlertSettingsModal from './components/AlertSettingsModal';
import { api } from './services/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [alertProduct, setAlertProduct] = useState(null);

  const fetchProducts = async () => {
    setRefreshing(true);
    try {
      const data = await api.getTrackedProducts();
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch tracked products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <Navbar onRefresh={fetchProducts} refreshing={refreshing} />

      <main className="container">
        <StatsOverview products={products} />

        <ProductSearch
          trackedProducts={products}
          onTrackSuccess={fetchProducts}
        />

        <TrackedProducts
          products={products}
          onRefresh={fetchProducts}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onOpenAlertModal={(p) => setAlertProduct(p)}
        />
      </main>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onRefresh={fetchProducts}
        />
      )}

      {alertProduct && (
        <AlertSettingsModal
          product={alertProduct}
          onClose={() => setAlertProduct(null)}
        />
      )}
    </div>
  );
}

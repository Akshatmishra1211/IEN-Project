import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, Loader2, Tag, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function ProductSearch({ trackedProducts = [], onTrackSuccess }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await api.searchCatalog(query);
      if (data && data.products) {
        setResults(data.products);
      }
    } catch (err) {
      console.error('Error searching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (product) => {
    setTrackingId(product.id);
    try {
      await api.trackProduct({
        mock_product_id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        sku: product.sku,
        description: product.description
      });
      onTrackSuccess();
    } catch (err) {
      console.error('Error tracking product:', err);
      alert('Failed to track product: ' + (err.response?.data?.error || err.message));
    } finally {
      setTrackingId(null);
    }
  };

  const trackedIds = new Set(trackedProducts.map(p => p.mock_product_id));

  return (
    <div className="glass-card" style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} color="var(--accent-cyan)" /> Search & Add Product to Tracker
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Search INE's hosted mock store catalog by product name, category, or SKU.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          className="input"
          placeholder="e.g. Nordkraft, Auralite, Slide, Watch, Footwear, SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: '44px' }}
        />
        <Search
          size={18}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        {loading && (
          <Loader2
            size={18}
            color="var(--accent-cyan)"
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }}
          />
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '14px',
        maxHeight: '380px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {results.map((product) => {
          const isTracked = trackedIds.has(product.id);
          const isProcessing = trackingId === product.id;

          return (
            <div
              key={product.id}
              style={{
                background: 'rgba(11, 15, 25, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {product.brand}
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {product.sku}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '12px' }}>
                  {product.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(35, 49, 82, 0.4)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={12} /> {product.category}
                </span>

                <button
                  className={isTracked ? "btn btn-secondary" : "btn btn-primary"}
                  onClick={() => !isTracked && handleTrack(product)}
                  disabled={isTracked || isProcessing}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  {isProcessing ? (
                    <> <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Adding... </>
                  ) : isTracked ? (
                    <> <Check size={12} color="var(--accent-emerald)" /> Tracked </>
                  ) : (
                    <> <Plus size={12} /> Track Price </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {!loading && results.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No products found matching "{query}". Try searching for brand or category names.
          </div>
        )}
      </div>
    </div>
  );
}

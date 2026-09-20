import React, { useState } from 'react';
import { RefreshCw, Eye, History, Bell, Trash2, ExternalLink, Play, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function TrackedProducts({
  products = [],
  onRefresh,
  onSelectProduct,
  onOpenAlertModal
}) {
  const [scrapingId, setScrapingId] = useState(null);
  const [headedNotice, setHeadedNotice] = useState(null);

  const handleManualScrape = async (product, headed = false) => {
    setScrapingId(product.id);
    if (headed) {
      setHeadedNotice(`Launching Headed Browser on Server/Local host for ${product.name}... Watch the browser window on your desktop!`);
    }

    try {
      const res = await api.triggerScrapeProduct(product.id, headed);
      onRefresh();
    } catch (err) {
      alert('Scrape failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setScrapingId(null);
      if (headed) {
        setTimeout(() => setHeadedNotice(null), 8000);
      }
    }
  };

  const handleUntrack = async (id, name) => {
    if (window.confirm(`Are you sure you want to stop tracking "${name}"?`)) {
      try {
        await api.untrackProduct(id);
        onRefresh();
      } catch (err) {
        alert('Failed to untrack product');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
          Tracked Products & Live Price Feeds ({products.length})
        </h2>
      </div>

      {headedNotice && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-main)',
          fontSize: '0.88rem'
        }}>
          <Play size={18} color="var(--accent-cyan)" />
          {headedNotice}
        </div>
      )}

      {products.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            No products are currently being tracked. Search the catalog above to add your first product!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {products.map((p) => {
            const isScraping = scrapingId === p.id;
            const statusClass = p.last_status === 'SUCCESS' ? 'badge-success'
              : p.last_status === 'RETRIED' ? 'badge-retried' : 'badge-failed';

            return (
              <div key={p.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className={`badge ${statusClass}`}>
                      {p.last_status === 'SUCCESS' && <CheckCircle2 size={12} />}
                      {p.last_status === 'RETRIED' && <Clock size={12} />}
                      {p.last_status === 'FAILED' && <AlertTriangle size={12} />}
                      {p.last_status || 'PENDING'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Mock ID #{p.mock_product_id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
                    {p.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '14px' }}>
                    {p.brand} &bull; {p.category}
                  </div>

                  {/* Price & Stock Display Box */}
                  <div style={{
                    background: 'rgba(11, 15, 25, 0.7)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'baseline',
                    justify: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current Scraped Price</span>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: p.current_price ? 'var(--text-main)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {p.current_price !== null ? `₹${p.current_price.toLocaleString('en-IN')}` : 'Not Scraped Yet'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Stock Status</span>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: p.current_stock?.includes('Out of Stock') ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                      }}>
                        {p.current_stock || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} />
                    Last Scraped: {p.last_scraped_at ? new Date(p.last_scraped_at).toLocaleString() : 'Pending initial run'}
                  </div>
                </div>

                {/* Actions Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(35, 49, 82, 0.5)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleManualScrape(p, false)}
                      disabled={isScraping}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                      <RefreshCw size={13} style={{ animation: isScraping ? 'spin 1s linear infinite' : 'none' }} />
                      {isScraping ? 'Scraping...' : 'Scrape Now'}
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => handleManualScrape(p, true)}
                      disabled={isScraping}
                      style={{ fontSize: '0.8rem', padding: '8px', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                      title="Run browser in visible (headed) mode for screen recording"
                    >
                      <Eye size={13} />
                      Observable Run
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => onSelectProduct(p)}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                      <History size={13} /> History & Logs
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => onOpenAlertModal(p)}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                      <Bell size={13} /> Price Alert
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleUntrack(p.id, p.name)}
                      style={{ padding: '8px 10px' }}
                      title="Untrack product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

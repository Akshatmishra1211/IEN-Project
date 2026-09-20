import React, { useState, useEffect } from 'react';
import { X, History, FileText, Eye, RefreshCw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../services/api';
import PriceHistoryChart from './PriceHistoryChart';
import ScrapeLogsTable from './ScrapeLogsTable';

export default function ProductDetailModal({ product, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'logs'
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetchData();
  }, [product.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histData, logData] = await Promise.all([
        api.getPriceHistory(product.id),
        api.getScrapeLogs(product.id)
      ]);
      if (histData.history) setHistory(histData.history);
      if (logData.logs) setLogs(logData.logs);
    } catch (err) {
      console.error('Error fetching detail data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualScrape = async (headed = false) => {
    setScraping(true);
    try {
      await api.triggerScrapeProduct(product.id, headed);
      await fetchData();
      onRefresh();
    } catch (err) {
      alert('Scrape failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              {product.brand} &bull; SKU: {product.sku}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '2px' }}>
              {product.name}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest Price</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {product.current_price !== null ? `₹${product.current_price}` : 'N/A'}
            </div>
          </div>

          <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock Status</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: product.current_stock?.includes('Out of Stock') ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {product.current_stock || 'Unknown'}
            </div>
          </div>

          <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Scrape Outcome</span>
            <div style={{ marginTop: '6px' }}>
              <span className={`badge ${product.last_status === 'SUCCESS' ? 'badge-success' : product.last_status === 'RETRIED' ? 'badge-retried' : 'badge-failed'}`}>
                {product.last_status || 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '18px' }}>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={16} /> Price History Chart ({history.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'logs' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'logs' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} /> Audit Scrape Logs ({logs.length})
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading history and audit logs...
          </div>
        ) : (
          <div>
            {activeTab === 'history' && <PriceHistoryChart history={history} />}
            {activeTab === 'logs' && <ScrapeLogsTable logs={logs} />}
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleManualScrape(false)}
              disabled={scraping}
              style={{ fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} style={{ animation: scraping ? 'spin 1s linear infinite' : 'none' }} />
              Trigger Headless Scrape
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => handleManualScrape(true)}
              disabled={scraping}
              style={{ fontSize: '0.85rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
            >
              <Eye size={14} /> Observable Headed Run
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

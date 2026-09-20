import React from 'react';
import { Activity, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';

export default function Navbar({ onRefresh, refreshing, dbMode }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.9)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.3rem'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              INE PriceTracker <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, padding: '2px 8px', background: 'rgba(6,182,212,0.1)', borderRadius: '6px', marginLeft: '6px' }}>v1.0</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Automated Scraper & Price History Dashboard
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href="https://demo.inelabteamdev.com/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            Mock Store <ExternalLink size={14} />
          </a>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            background: 'rgba(35, 49, 82, 0.4)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            {dbMode || 'Supabase Active'}
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}

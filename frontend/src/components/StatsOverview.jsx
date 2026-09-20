import React from 'react';
import { Package, TrendingDown, CheckCircle2, Clock } from 'lucide-react';

export default function StatsOverview({ products = [] }) {
  const totalTracked = products.length;

  let totalLogsCount = 0;
  let successCount = 0;
  let priceDropCount = 0;

  products.forEach(p => {
    if (p.last_status === 'SUCCESS' || p.last_status === 'RETRIED') {
      successCount++;
    }
    if (p.mrp && p.current_price && p.current_price < p.mrp) {
      priceDropCount++;
    }
  });

  const successRate = totalTracked > 0 ? Math.round((successCount / totalTracked) * 100) : 100;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      <div className="glass-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tracked Products</span>
          <Package size={20} color="var(--accent-cyan)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>
          {totalTracked}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Active scraping targets
        </div>
      </div>

      <div className="glass-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Scrape Success Rate</span>
          <CheckCircle2 size={20} color="var(--accent-emerald)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-emerald)' }}>
          {successRate}%
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {successCount} / {totalTracked} healthy runs
        </div>
      </div>

      <div className="glass-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Price Drops</span>
          <TrendingDown size={20} color="var(--accent-purple)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-purple)' }}>
          {priceDropCount}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Products below MRP
        </div>
      </div>

      <div className="glass-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Scrape Schedule</span>
          <Clock size={20} color="var(--accent-amber)" />
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>
          Every 2 Hours
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          cron-job.org / Server Trigger
        </div>
      </div>
    </div>
  );
}

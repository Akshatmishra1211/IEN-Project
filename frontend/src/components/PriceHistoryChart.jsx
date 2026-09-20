import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function PriceHistoryChart({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        No price history recorded yet. Perform a scrape to capture data points!
      </div>
    );
  }

  const chartData = history.map(item => ({
    time: new Date(item.scraped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    price: item.price,
    mrp: item.mrp || item.price,
    stock: item.stock
  }));

  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const padding = Math.max(50, Math.round((maxPrice - minPrice) * 0.2));

  return (
    <div style={{ width: '100%', height: 280, marginTop: '14px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(35, 49, 82, 0.4)" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            domain={[Math.max(0, minPrice - padding), maxPrice + padding]}
            tickFormatter={(v) => `₹${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#131b2e',
              borderColor: '#233152',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '0.85rem'
            }}
            formatter={(value, name) => [`₹${value}`, name === 'price' ? 'Price' : 'MRP']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#06b6d4"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

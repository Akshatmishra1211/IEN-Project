import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function ScrapeLogsTable({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
        No scrape audit logs available for this product yet.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Outcome Status</th>
            <th>Attempts</th>
            <th>Duration</th>
            <th>Scraped Price</th>
            <th>Stock Status</th>
            <th>Details / Errors</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const statusClass = log.status === 'SUCCESS' ? 'badge-success'
              : log.status === 'RETRIED' ? 'badge-retried' : 'badge-failed';

            return (
              <tr key={log.id}>
                <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  {new Date(log.scraped_at).toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${statusClass}`}>
                    {log.status === 'SUCCESS' && <CheckCircle2 size={11} />}
                    {log.status === 'RETRIED' && <Clock size={11} />}
                    {log.status === 'FAILED' && <AlertCircle size={11} />}
                    {log.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                  {log.attempts}
                </td>
                <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  {log.duration_ms} ms
                </td>
                <td style={{ fontWeight: 700, color: log.price_found ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {log.price_found !== null ? `₹${log.price_found}` : '-'}
                </td>
                <td style={{ fontSize: '0.82rem' }}>
                  {log.stock_found || '-'}
                </td>
                <td style={{ fontSize: '0.78rem', color: log.error_message ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                  {log.error_message ? (
                    <span style={{ color: 'var(--accent-rose)' }}>{log.error_message}</span>
                  ) : log.structure_changed ? (
                    <span style={{ color: 'var(--accent-amber)' }}>⚠️ Page Shift Detected</span>
                  ) : (
                    'Clean scrape execution'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

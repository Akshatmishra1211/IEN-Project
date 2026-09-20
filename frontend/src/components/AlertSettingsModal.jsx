import React, { useState } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AlertSettingsModal({ product, onClose }) {
  const [targetPrice, setTargetPrice] = useState(product?.current_price ? Math.round(product.current_price * 0.9) : '');
  const [alertType, setAlertType] = useState('PRICE_DROP');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAlert({
        product_id: product.id,
        target_price: parseFloat(targetPrice),
        alert_type: alertType,
        user_email: email
      });
      setSuccessMsg('Price alert saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      alert('Failed to set alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--accent-cyan)" /> Price & Stock Alert Configuration
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Configure notification trigger for <strong>{product.name}</strong>.
        </p>

        {successMsg ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', padding: '14px', borderRadius: '8px', color: 'var(--accent-emerald)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Check size={18} /> {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Alert Type
              </label>
              <select
                className="input"
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
              >
                <option value="PRICE_DROP">Price Drops Below Target</option>
                <option value="BACK_IN_STOCK">Back In Stock</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Target Price (₹)
              </label>
              <input
                type="number"
                className="input"
                placeholder="e.g. 1200"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Current price is ₹{product.current_price || 'N/A'}
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Recipient Email (Optional)
              </label>
              <input
                type="email"
                className="input"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Alert'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

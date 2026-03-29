import { useState, useEffect } from 'react';
import { get, post, del } from '../api';

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'];

const categoryIcons = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
  Bills: '📋', Health: '💊', Education: '📚', Other: '📦',
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'Food', limit_amount: '' });

  async function fetchBudgets() {
    setLoading(true);
    try {
      const data = await get('/api/budgets');
      setBudgets(data);
    } catch (err) {
      console.error('Fetch budgets error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await post('/api/budgets', {
        category: form.category,
        limit_amount: parseFloat(form.limit_amount),
      });
      setShowModal(false);
      setForm({ category: 'Food', limit_amount: '' });
      fetchBudgets();
    } catch (err) {
      console.error('Add budget error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await del(`/api/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error('Delete budget error:', err);
    }
  };

  const getProgressClass = (pct) => {
    if (pct >= 90) return 'danger';
    if (pct >= 70) return 'warning';
    return 'safe';
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit_amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Track your spending against budget limits</p>
        </div>
        <button id="add-budget-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Set Budget
        </button>
      </div>

      {/* Overall Summary */}
      {budgets.length > 0 && (
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div className="stat-label">Overall Budget Usage</div>
              <div className="stat-value" style={{ fontSize: 24 }}>
                ₹{totalSpent.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 400 }}>/ ₹{totalBudget.toLocaleString()}</span>
              </div>
            </div>
            <div className={`budget-percentage ${getProgressClass(overallPct)}`} style={{ color: getProgressClass(overallPct) === 'safe' ? 'var(--success)' : getProgressClass(overallPct) === 'warning' ? 'var(--warning)' : 'var(--danger)' }}>
              {overallPct.toFixed(0)}%
            </div>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div
              className={`progress-fill ${getProgressClass(overallPct)}`}
              style={{ width: `${Math.min(overallPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>No budgets set yet</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Set your first budget</button>
          </div>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgets.map((budget, i) => {
            const pctClass = getProgressClass(budget.percentage);
            return (
              <div key={budget.id} className="budget-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="budget-header">
                  <div className="budget-category">
                    {categoryIcons[budget.category] || '📦'} {budget.category}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="budget-percentage" style={{
                      color: pctClass === 'safe' ? 'var(--success)' : pctClass === 'warning' ? 'var(--warning)' : 'var(--danger)',
                      fontSize: 18,
                    }}>
                      {budget.percentage.toFixed(0)}%
                    </span>
                    <button className="btn-icon" onClick={() => handleDelete(budget.id)} title="Delete" style={{ padding: 4 }}>
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-info">
                    <span className="spent">₹{budget.spent.toLocaleString()} spent</span>
                    <span className="limit">₹{budget.limit_amount.toLocaleString()} limit</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${pctClass}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>
                {budget.percentage >= 90 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>
                    ⚠️ Budget almost exhausted!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Set Budget</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  id="budget-category"
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{categoryIcons[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Limit (₹)</label>
                <input
                  id="budget-limit"
                  type="number"
                  className="form-input"
                  placeholder="e.g., 10000"
                  value={form.limit_amount}
                  onChange={(e) => setForm({ ...form, limit_amount: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="budget-submit" type="submit" className="btn btn-primary">Set Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { get, post, del } from '../api';

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Salary', 'Transfer', 'Other'];

const categoryIcons = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
  Bills: '📋', Health: '💊', Education: '📚', Salary: '💰',
  Transfer: '🔄', Other: '📦',
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  // Form state
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  async function fetchTransactions(page = 1) {
    setLoading(true);
    try {
      let url = `/api/transactions?page=${page}&limit=15`;
      if (filterCategory) url += `&category=${filterCategory}`;
      if (filterType) url += `&type=${filterType}`;
      const data = await get(url);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, [filterCategory, filterType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await post('/api/transactions', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setShowModal(false);
      setForm({ amount: '', type: 'expense', description: '', category: '', date: new Date().toISOString().split('T')[0] });
      fetchTransactions(pagination.page);
    } catch (err) {
      console.error('Add transaction error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await del(`/api/transactions/${id}`);
      fetchTransactions(pagination.page);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{pagination.total} total transactions</p>
        </div>
        <button id="add-transaction-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          id="filter-category"
          className="form-select"
          style={{ width: 180 }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{categoryIcons[c]} {c}</option>
          ))}
        </select>
        <select
          id="filter-type"
          className="form-select"
          style={{ width: 160 }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <p>No transactions found</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add your first transaction</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="fade-in">
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{txn.description}</td>
                    <td>
                      <span className={`category-badge category-${txn.category}`}>
                        {categoryIcons[txn.category] || '📦'} {txn.category}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: txn.type === 'income' ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 600,
                        fontSize: 12,
                        textTransform: 'uppercase',
                      }}>
                        {txn.type}
                      </span>
                    </td>
                    <td className={txn.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                      {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => handleDelete(txn.id)} title="Delete">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchTransactions(pagination.page - 1)}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTransactions(pagination.page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Transaction</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    id="txn-amount"
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    id="txn-type"
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  id="txn-description"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Swiggy Order, Uber Ride"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category (auto-detected)</label>
                  <select
                    id="txn-category"
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Auto-detect</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    id="txn-date"
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="txn-submit" type="submit" className="btn btn-primary">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

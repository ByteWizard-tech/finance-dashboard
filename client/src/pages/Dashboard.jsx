import { useState, useEffect } from 'react';
import { get } from '../api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

const COLORS = ['#6cceb5', '#f0d68a', '#e8a0b4', '#8bc5a3', '#a8c8e8', '#c8a8d8', '#d8b888', '#88b8b0'];

const categoryIcons = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
  Bills: '📋', Health: '💊', Education: '📚', Salary: '💰',
  Transfer: '🔄', Other: '📦',
};

function formatCurrency(val) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val?.toFixed(0) || 0}`;
}

function DonutCenterLabel({ viewBox, total }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="donut-center-label">
        Total
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" className="donut-center-total">
        {formatCurrency(total)}
      </text>
    </g>
  );
}

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [insights, setInsights] = useState({ insights: [], data: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [balanceData, insightsData] = await Promise.all([
          get('/api/accounts/balance'),
          get('/api/insights'),
        ]);
        setBalance(balanceData);
        setInsights(insightsData);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const pieData = (insights.data.categoryBreakdown || []).map((c) => ({
    name: c.category,
    value: Math.round(c.total),
  }));

  const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);

  const trendData = (insights.data.monthlyTrend || []).map((m) => ({
    month: m.month,
    Income: Math.round(m.income),
    Expenses: Math.round(m.expenses),
  }));

  const barData = trendData.map((d) => ({
    month: d.month.split('-')[1],
    Income: d.Income,
    Expenses: d.Expenses,
  }));

  const tooltipStyle = {
    background: '#1a1d23',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview at a glance</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card fade-in fade-in-delay-1">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">{formatCurrency(balance?.totalBalance || 0)}</div>
        </div>
        <div className="stat-card fade-in fade-in-delay-2">
          <div className="stat-label">Monthly Income</div>
          <div className="stat-value positive">{formatCurrency(balance?.monthlyIncome || 0)}</div>
        </div>
        <div className="stat-card fade-in fade-in-delay-3">
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value negative">{formatCurrency(balance?.monthlyExpense || 0)}</div>
        </div>
        <div className="stat-card fade-in fade-in-delay-4">
          <div className="stat-label">Monthly Savings</div>
          <div className={`stat-value ${(balance?.monthlySavings || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(Math.abs(balance?.monthlySavings || 0))}
          </div>
          <div className={`stat-change ${(balance?.monthlySavings || 0) >= 0 ? 'up' : 'down'}`}>
            {(balance?.monthlySavings || 0) >= 0 ? '↑ Saving' : '↓ Overspent'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Donut Chart */}
        <div className="chart-card fade-in">
          <h3>Spending by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Pie
                  data={[{ value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={0}
                  dataKey="value"
                  fill="none"
                >
                  <Cell fill="none" />
                  {/* Center label rendered via custom label */}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#9a9ba0', fontSize: 12 }}>
                      {categoryIcons[value] || '📦'} {value}
                    </span>
                  )}
                />
                {/* Center text */}
                <text x="50%" y="46%" textAnchor="middle" className="donut-center-label">
                  Total
                </text>
                <text x="50%" y="56%" textAnchor="middle" className="donut-center-total">
                  {formatCurrency(pieTotal)}
                </text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No expense data yet</p></div>
          )}
        </div>

        {/* Line Chart */}
        <div className="chart-card fade-in">
          <h3>Monthly Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" tick={{ fill: '#5e5f65', fontSize: 11 }} />
                <YAxis tick={{ fill: '#5e5f65', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                  contentStyle={tooltipStyle}
                />
                <Line type="monotone" dataKey="Income" stroke="#6cceb5" strokeWidth={2} dot={{ r: 3, fill: '#6cceb5' }} />
                <Line type="monotone" dataKey="Expenses" stroke="#e8a0b4" strokeWidth={2} dot={{ r: 3, fill: '#e8a0b4' }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No trend data yet</p></div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="chart-card fade-in">
          <h3>Income vs Expenses</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" tick={{ fill: '#5e5f65', fontSize: 11 }} />
                <YAxis tick={{ fill: '#5e5f65', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="Income" fill="#6cceb5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#e8a0b4" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No data yet</p></div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="insights-section">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AI Insights</h3>
          </div>
          {insights.insights.length > 0 ? (
            <div className="insights-grid">
              {insights.insights.map((insight, i) => (
                <div key={i} className="insight-card fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="insight-text">{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>Add more transactions to generate AI insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

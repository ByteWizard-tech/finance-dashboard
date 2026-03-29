const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/accounts
router.get('/', auth, (req, res) => {
  const accounts = db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(req.user.id);
  setTimeout(() => res.json(accounts), 300);
});

// GET /api/balance
router.get('/balance', auth, (req, res) => {
  const account = db.prepare('SELECT COALESCE(SUM(balance), 0) as total_balance FROM accounts WHERE user_id = ?').get(req.user.id);

  const monthlyIncome = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE user_id = ? AND type = 'income' AND date >= date('now', 'start of month')
  `).get(req.user.id);

  const monthlyExpense = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE user_id = ? AND type = 'expense' AND date >= date('now', 'start of month')
  `).get(req.user.id);

  setTimeout(() => {
    res.json({
      totalBalance: account.total_balance,
      monthlyIncome: monthlyIncome.total,
      monthlyExpense: monthlyExpense.total,
      monthlySavings: monthlyIncome.total - monthlyExpense.total,
    });
  }, 300);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/budgets
router.get('/', auth, (req, res) => {
  const userId = req.user.id;
  const budgets = db.prepare('SELECT * FROM budgets WHERE user_id = ?').all(userId);

  // Calculate spent amount per category for current month
  const enriched = budgets.map(budget => {
    const spent = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ? AND category = ? AND type = 'expense'
      AND date >= date('now', 'start of month')
    `).get(userId, budget.category);

    return {
      ...budget,
      spent: spent.total,
      percentage: budget.limit_amount > 0 ? Math.min((spent.total / budget.limit_amount) * 100, 100) : 0,
    };
  });

  res.json(enriched);
});

// POST /api/budgets
router.post('/', auth, (req, res) => {
  const userId = req.user.id;
  const { category, limit_amount } = req.body;

  if (!category || !limit_amount) {
    return res.status(400).json({ error: 'Category and limit_amount are required' });
  }

  // Check if budget for this category already exists
  const existing = db.prepare('SELECT id FROM budgets WHERE user_id = ? AND category = ?').get(userId, category);
  if (existing) {
    db.prepare('UPDATE budgets SET limit_amount = ? WHERE id = ?').run(limit_amount, existing.id);
    const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(existing.id);
    return res.json(updated);
  }

  const result = db.prepare('INSERT INTO budgets (user_id, category, limit_amount) VALUES (?, ?, ?)').run(userId, category, limit_amount);
  const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json(budget);
});

// DELETE /api/budgets/:id
router.delete('/:id', auth, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const budget = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?').get(id, userId);
  if (!budget) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(id, userId);
  res.json({ message: 'Budget deleted' });
});

module.exports = router;

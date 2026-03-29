const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { categorize } = require('../services/categorizer');

// GET /api/transactions — paginated, with simulated delay
router.get('/', auth, (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const type = req.query.type;

  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
  const params = [userId];
  const countParams = [userId];

  if (category) {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
    countParams.push(category);
  }

  if (type) {
    query += ' AND type = ?';
    countQuery += ' AND type = ?';
    params.push(type);
    countParams.push(type);
  }

  query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const total = db.prepare(countQuery).get(...countParams).total;
  const transactions = db.prepare(query).all(...params);

  // Simulated bank API delay
  setTimeout(() => {
    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }, 300);
});

// POST /api/transactions
router.post('/', auth, (req, res) => {
  const userId = req.user.id;
  const { amount, type, description, date, category: userCategory } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ error: 'Amount and type are required' });
  }

  // Auto-categorize if no category provided
  const category = userCategory || categorize(description || '');

  const result = db.prepare(
    'INSERT INTO transactions (user_id, amount, type, category, description, date) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, amount, type, category, description || '', date || new Date().toISOString());

  // Update account balance
  const balanceChange = type === 'income' ? amount : -amount;
  db.prepare('UPDATE accounts SET balance = balance + ? WHERE user_id = ?').run(balanceChange, userId);

  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json(transaction);
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, userId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  // Reverse balance change
  const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
  db.prepare('UPDATE accounts SET balance = balance + ? WHERE user_id = ?').run(balanceChange, userId);

  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, userId);

  res.json({ message: 'Transaction deleted' });
});

module.exports = router;

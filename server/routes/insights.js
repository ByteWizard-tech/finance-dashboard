const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getInsights } = require('../services/insights');

// GET /api/insights
router.get('/', auth, (req, res) => {
  try {
    const result = getInsights(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('Insights error:', err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

module.exports = router;

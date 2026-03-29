const db = require('../db');

function getInsights(userId) {
  const insights = [];
  const data = {};

  // --- Monthly Spending Comparison ---
  const currentMonth = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    AND date >= date('now', 'start of month')
  `).get(userId);

  const prevMonth = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    AND date >= date('now', 'start of month', '-1 month')
    AND date < date('now', 'start of month')
  `).get(userId);

  data.currentMonthSpending = currentMonth.total;
  data.previousMonthSpending = prevMonth.total;

  if (prevMonth.total > 0) {
    const change = ((currentMonth.total - prevMonth.total) / prevMonth.total * 100).toFixed(1);
    if (change > 0) {
      insights.push(`📈 You spent ${change}% more this month compared to last month`);
    } else if (change < 0) {
      insights.push(`📉 Great! You spent ${Math.abs(change)}% less this month compared to last month`);
    } else {
      insights.push(`📊 Your spending is consistent with last month`);
    }
  }

  // --- Category Analysis ---
  const categoryBreakdown = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    AND date >= date('now', 'start of month')
    GROUP BY category
    ORDER BY total DESC
  `).all(userId);

  data.categoryBreakdown = categoryBreakdown;

  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    insights.push(`🏆 ${top.category} is your highest expense this month (₹${top.total.toFixed(0)})`);

    if (categoryBreakdown.length > 1) {
      const least = categoryBreakdown[categoryBreakdown.length - 1];
      insights.push(`💡 ${least.category} is your lowest expense (₹${least.total.toFixed(0)})`);
    }
  }

  // --- Category Comparison vs Previous Month ---
  const prevCategoryBreakdown = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    AND date >= date('now', 'start of month', '-1 month')
    AND date < date('now', 'start of month')
    GROUP BY category
  `).all(userId);

  const prevCatMap = {};
  prevCategoryBreakdown.forEach(c => { prevCatMap[c.category] = c.total; });

  categoryBreakdown.forEach(cat => {
    const prev = prevCatMap[cat.category];
    if (prev && prev > 0) {
      const change = ((cat.total - prev) / prev * 100).toFixed(1);
      if (Math.abs(change) > 15) {
        if (change > 0) {
          insights.push(`⚠️ You spent ${change}% more on ${cat.category} this month`);
        } else {
          insights.push(`✅ ${cat.category} costs decreased by ${Math.abs(change)}%`);
        }
      }
    }
  });

  // --- Weekend vs Weekday Analysis ---
  const weekendSpending = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    AND date >= date('now', 'start of month')
    AND (CAST(strftime('%w', date) AS INTEGER) IN (0, 6))
  `).get(userId);

  const weekdaySpending = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    AND date >= date('now', 'start of month')
    AND (CAST(strftime('%w', date) AS INTEGER) NOT IN (0, 6))
  `).get(userId);

  data.weekendSpending = weekendSpending.total;
  data.weekdaySpending = weekdaySpending.total;

  if (weekendSpending.count > 0 && weekdaySpending.count > 0) {
    const weekendAvg = weekendSpending.total / Math.max(weekendSpending.count, 1);
    const weekdayAvg = weekdaySpending.total / Math.max(weekdaySpending.count, 1);
    if (weekendAvg > weekdayAvg * 1.3) {
      insights.push(`🎉 You tend to spend ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% more on weekends`);
    }
  }

  // --- Anomaly Detection ---
  const avgTransaction = db.prepare(`
    SELECT COALESCE(AVG(amount), 0) as avg_amount
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
  `).get(userId);

  const anomalies = db.prepare(`
    SELECT description, amount, date
    FROM transactions
    WHERE user_id = ? AND type = 'expense' AND amount > ?
    ORDER BY date DESC
    LIMIT 3
  `).all(userId, avgTransaction.avg_amount * 3);

  data.anomalies = anomalies;
  if (anomalies.length > 0) {
    insights.push(`🚨 ${anomalies.length} unusually large transaction(s) detected recently`);
  }

  // --- Forecast (average of last 3 months) ---
  const last3Months = db.prepare(`
    SELECT COALESCE(AVG(monthly_total), 0) as forecast
    FROM (
      SELECT SUM(amount) as monthly_total
      FROM transactions
      WHERE user_id = ? AND type = 'expense'
      AND date >= date('now', '-3 months')
      GROUP BY strftime('%Y-%m', date)
    )
  `).get(userId);

  data.forecast = last3Months.forecast;
  if (last3Months.forecast > 0) {
    insights.push(`🔮 Based on your history, expect ~₹${last3Months.forecast.toFixed(0)} in expenses next month`);
  }

  // --- Monthly Trend Data ---
  const monthlyTrend = db.prepare(`
    SELECT strftime('%Y-%m', date) as month,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
           SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
    FROM transactions
    WHERE user_id = ?
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month DESC
    LIMIT 6
  `).all(userId);

  data.monthlyTrend = monthlyTrend.reverse();

  return { insights, data };
}

module.exports = { getInsights };

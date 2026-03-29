const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import shared db (which creates tables on load)
const db = require('../db');

// ── Merchants & Categories ─────────────────────────────────────
const merchants = [
  // Food
  { name: 'Swiggy Order', category: 'Food', min: 150, max: 800 },
  { name: 'Zomato Delivery', category: 'Food', min: 200, max: 900 },
  { name: 'Dominos Pizza', category: 'Food', min: 300, max: 700 },
  { name: 'Starbucks Coffee', category: 'Food', min: 250, max: 600 },
  { name: 'BigBasket Grocery', category: 'Food', min: 500, max: 3000 },
  { name: 'Blinkit Essentials', category: 'Food', min: 100, max: 800 },
  // Transport
  { name: 'Uber Ride', category: 'Transport', min: 100, max: 500 },
  { name: 'Ola Cab', category: 'Transport', min: 80, max: 600 },
  { name: 'Rapido Bike', category: 'Transport', min: 50, max: 200 },
  { name: 'Metro Card Recharge', category: 'Transport', min: 200, max: 500 },
  { name: 'Fuel - Petrol', category: 'Transport', min: 500, max: 3000 },
  // Shopping
  { name: 'Amazon Purchase', category: 'Shopping', min: 300, max: 5000 },
  { name: 'Flipkart Order', category: 'Shopping', min: 200, max: 4000 },
  { name: 'Myntra Fashion', category: 'Shopping', min: 500, max: 3000 },
  { name: 'Nike Store', category: 'Shopping', min: 2000, max: 8000 },
  // Entertainment
  { name: 'Netflix Subscription', category: 'Entertainment', min: 199, max: 649 },
  { name: 'Spotify Premium', category: 'Entertainment', min: 119, max: 179 },
  { name: 'Hotstar Subscription', category: 'Entertainment', min: 299, max: 1499 },
  { name: 'PVR Movie Tickets', category: 'Entertainment', min: 300, max: 1200 },
  // Bills
  { name: 'Electricity Bill', category: 'Bills', min: 800, max: 3000 },
  { name: 'Internet Bill - Airtel', category: 'Bills', min: 500, max: 1500 },
  { name: 'Mobile Recharge', category: 'Bills', min: 200, max: 700 },
  { name: 'House Rent', category: 'Bills', min: 8000, max: 25000 },
  { name: 'Insurance EMI', category: 'Bills', min: 1000, max: 5000 },
  // Health
  { name: 'Apollo Pharmacy', category: 'Health', min: 200, max: 2000 },
  { name: 'Gym Membership', category: 'Health', min: 1000, max: 3000 },
  { name: 'Doctor Consultation', category: 'Health', min: 500, max: 2000 },
  // Education
  { name: 'Udemy Course', category: 'Education', min: 400, max: 2000 },
  { name: 'Book Purchase', category: 'Education', min: 200, max: 1000 },
];

const incomeTypes = [
  { name: 'Salary Credit', min: 30000, max: 80000 },
  { name: 'Freelance Payment', min: 5000, max: 25000 },
  { name: 'Cashback Reward', min: 50, max: 500 },
  { name: 'Interest Credit', min: 100, max: 2000 },
  { name: 'Dividend Income', min: 500, max: 5000 },
];

// ── Helpers ─────────────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(monthsBack) {
  const now = new Date();
  const past = new Date(now);
  past.setMonth(past.getMonth() - monthsBack);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// ── Seed ────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM budgets');
  db.exec('DELETE FROM accounts');
  db.exec('DELETE FROM users');

  const users = [
    { name: 'Omesh Sengar', email: 'omesh@demo.com', password: 'password123' },
    { name: 'Priya Sharma', email: 'priya@demo.com', password: 'password123' },
    { name: 'Rahul Verma', email: 'rahul@demo.com', password: 'password123' },
  ];

  const insertUser = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  const insertAccount = db.prepare('INSERT INTO accounts (user_id, name, balance) VALUES (?, ?, ?)');
  const insertTransaction = db.prepare('INSERT INTO transactions (user_id, amount, type, category, description, date) VALUES (?, ?, ?, ?, ?, ?)');
  const insertBudget = db.prepare('INSERT INTO budgets (user_id, category, limit_amount) VALUES (?, ?, ?)');

  for (const userData of users) {
    const hash = await bcrypt.hash(userData.password, 10);
    const result = insertUser.run(userData.name, userData.email, hash);
    const userId = result.lastInsertRowid;

    let balance = 0;
    const txnCount = rand(200, 500);

    console.log(`👤 ${userData.name} (${userData.email}) — generating ${txnCount} transactions...`);

    // Generate transactions
    for (let i = 0; i < txnCount; i++) {
      const isIncome = Math.random() < 0.15; // 15% income
      const date = randomDate(6);

      if (isIncome) {
        const income = incomeTypes[rand(0, incomeTypes.length - 1)];
        const amount = rand(income.min, income.max);
        balance += amount;
        insertTransaction.run(userId, amount, 'income', 'Salary', income.name, date.toISOString());
      } else {
        const merchant = merchants[rand(0, merchants.length - 1)];
        const amount = rand(merchant.min, merchant.max);
        balance -= amount;
        insertTransaction.run(userId, amount, 'expense', merchant.category, merchant.name, date.toISOString());
      }
    }

    // Create account with calculated balance
    insertAccount.run(userId, 'Main Account', balance);

    // Create default budgets
    const defaultBudgets = [
      { category: 'Food', limit: 15000 },
      { category: 'Transport', limit: 5000 },
      { category: 'Shopping', limit: 10000 },
      { category: 'Entertainment', limit: 3000 },
      { category: 'Bills', limit: 20000 },
      { category: 'Health', limit: 5000 },
    ];

    for (const budget of defaultBudgets) {
      insertBudget.run(userId, budget.category, budget.limit);
    }

    console.log(`   ✅ Balance: ₹${balance.toFixed(2)}, Budgets: ${defaultBudgets.length}\n`);
  }

  console.log('🎉 Seed complete!');
  console.log('\n📌 Demo Login:');
  console.log('   Email: omesh@demo.com');
  console.log('   Password: password123');
}

seed().catch(console.error);

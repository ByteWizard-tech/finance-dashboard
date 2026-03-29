// Smart keyword-based categorization engine
const categoryMap = {
  // Food & Dining
  Food: ['swiggy', 'zomato', 'dominos', 'pizza', 'mcdonald', 'burger', 'restaurant', 'cafe', 'starbucks', 'food', 'grocery', 'bigbasket', 'blinkit', 'zepto', 'dining'],
  // Transport
  Transport: ['uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'diesel', 'parking', 'toll', 'cab', 'auto', 'bus', 'train', 'flight'],
  // Shopping
  Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'nike', 'adidas', 'mall', 'shop', 'store', 'purchase', 'buy'],
  // Entertainment
  Entertainment: ['netflix', 'spotify', 'hotstar', 'prime', 'movie', 'cinema', 'concert', 'game', 'gaming', 'youtube', 'subscription'],
  // Bills & Utilities
  Bills: ['electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'phone', 'recharge', 'mobile', 'bill', 'rent', 'insurance', 'emi'],
  // Health
  Health: ['pharmacy', 'hospital', 'doctor', 'medicine', 'gym', 'fitness', 'health', 'medical', 'clinic', 'apollo'],
  // Education
  Education: ['course', 'udemy', 'coursera', 'book', 'tuition', 'school', 'college', 'university', 'exam', 'education'],
  // Income
  Salary: ['salary', 'paycheck', 'wage', 'income', 'bonus', 'dividend', 'interest', 'refund', 'cashback', 'freelance'],
  // Transfers
  Transfer: ['transfer', 'upi', 'neft', 'imps', 'sent', 'received', 'paytm', 'phonepe', 'gpay'],
};

function categorize(description) {
  if (!description) return 'Other';
  const desc = description.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
}

module.exports = { categorize, categoryMap };

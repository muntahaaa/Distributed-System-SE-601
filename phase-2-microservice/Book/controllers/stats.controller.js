const { Book } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const LOAN_SERVICE_URL = process.env.LOAN_SERVICE_URL || 'http://localhost:5003';

exports.getPopularBooks = async (req, res) => {
    try {
      const books = await Book.findAll({
        attributes: ['id', 'title', 'author'],
      });

      // Get loan statistics from Loan service
      const loanStats = await axios.get(`${LOAN_SERVICE_URL}/api/loans/stats/book-loans`, {
        headers: { Authorization: req.headers.authorization }
      });

      const booksWithBorrowCount = books.map(book => ({
        ...book.toJSON(),
        borrow_count: loanStats.data.find(stat => stat.book_id === book.id)?.loan_count || 0
      }));

      // Sort by borrow count and take top 10
      const popularBooks = booksWithBorrowCount
        .sort((a, b) => b.borrow_count - a.borrow_count)
        .slice(0, 10);
  
      res.json(popularBooks);
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ message: 'Error fetching popular books', error: error.message });
    }
};

exports.getSystemOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get book statistics
    const [totalBooks, availableBooks] = await Promise.all([
      Book.sum('copies'),
      Book.sum('available_copies')
    ]);

    // Get user count from User service
    const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/stats/count`, {
      headers: { Authorization: req.headers.authorization }
    });
    const totalUsers = userResponse.data.count;

    // Get loan statistics from Loan service
    const loanResponse = await axios.get(`${LOAN_SERVICE_URL}/api/loans/stats/overview`, {
      headers: { Authorization: req.headers.authorization }
    });
    const loanStats = loanResponse.data;

    res.json({
      total_books: totalBooks,
      total_users: totalUsers,
      books_available: availableBooks,
      books_borrowed: totalBooks - availableBooks,
      total_loans: loanStats.total_loans,
      active_loans: loanStats.active_loans,
      overdue_loans: loanStats.overdue_loans,
      loans_today: loanStats.loans_today,
      returns_today: loanStats.returns_today
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'Error fetching system overview', error: error.message });
  }
};


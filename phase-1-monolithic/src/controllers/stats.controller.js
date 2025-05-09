const { Book, User, Loan } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getPopularBooks = async (req, res) => {
  try {
    const { sequelize } = Book;
    const popularBooks = await sequelize.query(`
      SELECT b.id, b.title, b.author, COUNT(l.id) as borrow_count
      FROM books b
      LEFT JOIN loans l ON b.id = l.book_id
      GROUP BY b.id, b.title, b.author
      ORDER BY borrow_count DESC
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json(popularBooks);
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'Error fetching popular books', error: error.message });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const { sequelize } = User;
    const activeUsers = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        COUNT(l.id) as total_borrows,
        COUNT(CASE WHEN l.status = 'ACTIVE' THEN 1 END) as current_borrows
      FROM users u
      LEFT JOIN loans l ON u.id = l.user_id
      GROUP BY u.id, u.name
      HAVING COUNT(l.id) > 0
      ORDER BY total_borrows DESC
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json(activeUsers);
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'Error fetching active users', error: error.message });
  }
};

exports.getSystemOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBooks,
      totalUsers,
      totalLoans,
      activeLoans,
      overdueLoans,
      todayLoans,
      todayReturns
    ] = await Promise.all([
      Book.sum('copies'),
      User.count(),
      Loan.count(),
      Loan.count({ where: { status: 'ACTIVE' } }),
      Loan.count({
        where: {
          status: 'ACTIVE',
          due_date: { [Op.lt]: new Date() }
        }
      }),
      Loan.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      }),
      Loan.count({
        where: {
          return_date: {
            [Op.gte]: today
          }
        }
      })
    ]);

    const availableBooks = await Book.sum('available_copies');

    res.json({
      total_books: totalBooks,
      total_users: totalUsers,
      books_available: availableBooks,
      books_borrowed: totalBooks - availableBooks,
      total_loans: totalLoans,
      active_loans: activeLoans,
      overdue_loans: overdueLoans,
      loans_today: todayLoans,
      returns_today: todayReturns
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system overview', error: error.message });
  }
};
const { Loan } = require('../models');
const { Op, fn, col } = require('sequelize');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:5002';

exports.getUserLoans = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const loans = await Loan.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    // Fetch book details for each loan
    const loansWithDetails = await Promise.all(
      loans.map(async (loan) => {
        const bookResponse = await axios.get(`${BOOK_SERVICE_URL}/api/books/${loan.book_id}`);
        return {
          ...loan.toJSON(),
          book: {
            title: bookResponse.data.title,
            author: bookResponse.data.author
          }
        };
      })
    );

    res.json(loansWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
};

exports.getOverdueLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: {
        status: 'ACTIVE',
        due_date: { [Op.lt]: new Date() }
      }
    });

    // Fetch user and book details for each loan
    const overdueLoans = await Promise.all(
      loans.map(async (loan) => {
        const [userResponse, bookResponse] = await Promise.all([
          axios.get(`${USER_SERVICE_URL}/api/users/${loan.user_id}`),
          axios.get(`${BOOK_SERVICE_URL}/api/books/${loan.book_id}`)
        ]);

        return {
          id: loan.id,
          user: {
            name: userResponse.data.name,
            email: userResponse.data.email
          },
          book: {
            title: bookResponse.data.title,
            author: bookResponse.data.author
          },
          issue_date: loan.issue_date,
          due_date: loan.due_date,
          days_overdue: Math.ceil((new Date() - new Date(loan.due_date)) / (1000 * 60 * 60 * 24))
        };
      })
    );

    res.json(overdueLoans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overdue loans', error: error.message });
  }
};

exports.extendLoan = async (req, res) => {
  try {
    const { loan_id, extension_days } = req.body;
    const loan = await Loan.findByPk(loan_id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Can only extend active loans' });
    }

    if (loan.extensions_count >= 2) {
      return res.status(400).json({ message: 'Maximum extensions reached' });
    }

    const newDueDate = new Date(loan.due_date);
    newDueDate.setDate(newDueDate.getDate() + extension_days);

    await loan.update({
      due_date: newDueDate,
      extensions_count: loan.extensions_count + 1
    });

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error extending loan', error: error.message });
  }
};


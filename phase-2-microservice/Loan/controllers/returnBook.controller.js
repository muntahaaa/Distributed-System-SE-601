const { Loan } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:5002';

exports.returnBook = async (req, res) => {
  try {
    const { loan_id } = req.body;
    const loan = await Loan.findByPk(loan_id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status === 'RETURNED') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    loan.return_date = new Date();
    loan.status = 'RETURNED';
    await loan.save();

    // Update book available copies
    try {
      const bookResponse = await axios.put(`${BOOK_SERVICE_URL}/api/books/${loan.book_id}`, {
        increment_copies: 1
      });

      // Get book details for response
      const bookDetails = await axios.get(`${BOOK_SERVICE_URL}/api/books/${loan.book_id}`);
      const loanWithBookDetails = {
        ...loan.toJSON(),
        book: {
          title: bookDetails.data.title,
          author: bookDetails.data.author
        }
      };

      res.json(loanWithBookDetails);
    } catch (error) {
      // If we can't update the book copies, we'll still mark the loan as returned
      console.error('Error updating book copies:', error);
      res.json(loan);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error returning book', error: error.message });
  }
};

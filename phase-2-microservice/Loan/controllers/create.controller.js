const { Loan } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:5002';

exports.createLoan = async (req, res) => {
  try {
    const { book_id, user_id, due_date } = req.body;

    // Verify book exists and has available copies
    try {
      const bookResponse = await axios.get(`${BOOK_SERVICE_URL}/api/books/${book_id}`);
      const book = bookResponse.data;
      if (book.available_copies <= 0) {
        return res.status(400).json({ message: 'No copies available for loan' });
      }
    } catch (error) {
      return res.status(404).json({ message: 'Book not found' });
    }    // Verify user exists
    const actualUserId = user_id || req.user.id;
    try {
      await axios.get(`${USER_SERVICE_URL}/api/users/${actualUserId}`, {
        headers: {
          'Authorization': req.headers.authorization
        }
      });
    } catch (error) {
      console.error('Error verifying user:', error.response?.data || error.message);
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the loan
    const loan = await Loan.create({
      user_id: actualUserId,
      book_id,
      due_date,
      status: 'ACTIVE'
    });    // Update book available copies
    try {
      await axios.put(`${BOOK_SERVICE_URL}/api/books/${book_id}`, 
        { decrement_copies: 1 },
        { headers: { 'Authorization': req.headers.authorization } }
      );
    } catch (error) {
      console.error('Error updating book copies:', error.response?.data || error.message);
      // Continue anyway as the loan is already created
    }    // Fetch complete loan details with user and book info
    const headers = { 'Authorization': req.headers.authorization };
    const [bookDetails, userDetails] = await Promise.all([
      axios.get(`${BOOK_SERVICE_URL}/api/books/${book_id}`, { headers }),
      axios.get(`${USER_SERVICE_URL}/api/users/${actualUserId}`, { headers })
    ]);

    const loanWithDetails = {
      ...loan.toJSON(),
      book: {
        title: bookDetails.data.title,
        author: bookDetails.data.author
      },
      user: {
        name: userDetails.data.name,
        email: userDetails.data.email
      }
    };

    res.status(201).json(loanWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
};

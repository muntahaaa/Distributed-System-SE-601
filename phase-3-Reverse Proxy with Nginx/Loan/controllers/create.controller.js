const { Loan } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');
const CircuitBreaker = require('opossum');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:5002';

// Circuit breaker configuration
const circuitBreakerOptions = {
  timeout: 5000, // 5 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000 // 30 seconds
};

// Create circuit breakers for services
const userServiceBreaker = new CircuitBreaker(
  async (config) => await axios(config),
  circuitBreakerOptions
);

const bookServiceBreaker = new CircuitBreaker(
  async (config) => await axios(config),
  circuitBreakerOptions
);

userServiceBreaker.fallback(() => ({
  status: 503,
  data: { message: 'User service is temporarily unavailable' }
}));

bookServiceBreaker.fallback(() => ({
  status: 503,
  data: { message: 'Book service is temporarily unavailable' }
}));

exports.createLoan = async (req, res) => {
  try {
    const { book_id, user_id, due_date } = req.body;
    const headers = { 
      'Authorization': req.headers.authorization,
      'Content-Type': 'application/json'
    };

    // Verify book exists and has available copies
    try {
      const bookResponse = await bookServiceBreaker.fire({
        method: 'get',
        url: `${BOOK_SERVICE_URL}/api/books/${book_id}`,
        headers,
        timeout: 5000
      });
      const book = bookResponse.data;
      if (book.available_copies <= 0) {
        return res.status(400).json({ message: 'No copies available for loan' });
      }
    } catch (error) {
      return res.status(404).json({ message: 'Book not found or service unavailable' });
    }

    // Verify user exists
    try {
      await userServiceBreaker.fire({
        method: 'get',
        url: `${USER_SERVICE_URL}/api/users/${user_id}`,
        headers,
        timeout: 5000
      });
    } catch (error) {
      return res.status(404).json({ message: 'User not found or service unavailable' });
    }

    // Create the loan
    const loan = await Loan.create({
      user_id,
      book_id,
      due_date,
      status: 'ACTIVE'
    });

    // Update book available copies
    try {
      await bookServiceBreaker.fire({
        method: 'put',
        url: `${BOOK_SERVICE_URL}/api/books/${book_id}`,
        data: { decrement_copies: 1 },
        headers,
        timeout: 5000
      });
    } catch (error) {
      console.error('Error updating book copies:', error.message);
      // Continue anyway as the loan is already created
    }

    // Fetch complete loan details
    const [bookDetails, userDetails] = await Promise.all([
      bookServiceBreaker.fire({
        method: 'get',
        url: `${BOOK_SERVICE_URL}/api/books/${book_id}`,
        headers,
        timeout: 5000
      }),
      userServiceBreaker.fire({
        method: 'get',
        url: `${USER_SERVICE_URL}/api/users/${user_id}`,
        headers,
        timeout: 5000
      })
    ]);

    const loanWithDetails = {
      ...loan.toJSON(),
      book: bookDetails.data,
      user: userDetails.data
    };

    res.status(201).json(loanWithDetails);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
};

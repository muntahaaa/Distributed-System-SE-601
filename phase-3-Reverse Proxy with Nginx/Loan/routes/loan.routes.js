const express = require('express');
const createController = require('../controllers/create.controller');
const returnBookController = require('../controllers/returnBook.controller');
const getLoansController = require('../controllers/getLoans.controller');
const statsController = require('../controllers/stats.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/user', getLoansController.getUserLoans); // Default to current user
router.get('/user/:userId', getLoansController.getUserLoans); // Specific user
router.post('/', createController.createLoan);
router.post('/return', returnBookController.returnBook);
router.post('/extend', getLoansController.extendLoan);

// Admin and Librarian only routes
router.get('/overdue', authorize('admin', 'librarian'), getLoansController.getOverdueLoans);
router.get('/stats/user-loans', authorize('admin', 'librarian'), statsController.getUserLoanStats);
router.get('/stats/book-loans', authorize('admin', 'librarian'), statsController.getBookLoanStats);
router.get('/stats/overview', authorize('admin', 'librarian'), statsController.getLoanOverview);

module.exports = router;
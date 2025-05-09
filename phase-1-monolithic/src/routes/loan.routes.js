const express = require('express');
const loanController = require('../controllers/loan.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// All loan routes require authentication
router.use(authenticate);

// Routes for all authenticated users
router.post('/', loanController.createLoan);
router.post('/return', loanController.returnBook);
router.get('/user/:userId?', loanController.getUserLoans);
router.post('/extend', loanController.extendLoan);

// Admin only routes
router.get('/overdue', authorize('admin'), loanController.getOverdueLoans);

module.exports = router;
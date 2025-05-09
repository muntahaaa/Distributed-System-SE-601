const express = require('express');
const bookController = require('../controllers/book.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes - Search and retrieve
router.get('/', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Protected routes - Admin only
router.post('/', authenticate, authorize('admin'), bookController.createBook);
router.put('/:id', authenticate, authorize('admin'), bookController.updateBook);
router.delete('/:id', authenticate, authorize('admin'), bookController.deleteBook);

module.exports = router;
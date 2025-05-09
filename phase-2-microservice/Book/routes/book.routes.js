const express = require('express');
const createController = require('../controllers/create.controller');
const updateController = require('../controllers/update.controller');
const deleteController = require('../controllers/delete.controller');
const searchController = require('../controllers/search.controller');
const getByIDController = require('../controllers/getByID.controller');
const statsController = require('../controllers/stats.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Stats routes - Admin and Librarian only
router.get('/stats/popular', authenticate, authorize('admin', 'librarian'), statsController.getPopularBooks);
router.get('/stats/overview', authenticate, authorize('admin', 'librarian'), statsController.getSystemOverview);

// Public routes - Search and retrieve
router.get('/', searchController.searchBooks);
router.get('/:id', getByIDController.getBookById);

// Protected routes - Admin only
router.post('/', authenticate, authorize('admin'), createController.createBook);
router.put('/:id', authenticate, authorize('admin'), updateController.updateBook);
router.delete('/:id', authenticate, authorize('admin'), deleteController.deleteBook);

module.exports = router;
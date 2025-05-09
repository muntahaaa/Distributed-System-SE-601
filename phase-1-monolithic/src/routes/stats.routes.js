const express = require('express');
const statsController = require('../controllers/stats.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// All stats routes require authentication and admin privileges
router.use(authenticate);
router.use(authorize('admin'));

router.get('/books/popular', statsController.getPopularBooks);
router.get('/users/active', statsController.getActiveUsers);
router.get('/overview', statsController.getSystemOverview);

module.exports = router;
const express = require('express');
const profileController = require('../controllers/profile.controller');
const loginController = require('../controllers/login.controller');
const registerController = require('../controllers/register.controller');
const statsController = require('../controllers/stats.controller');
const validateTokenController = require('../controllers/validateUser.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Auth routes
router.post('/register', registerController.register);
router.post('/login', loginController.login);

// Token validation route (for microservices)
router.get('/validate', authenticate, validateTokenController.validateToken);

// Protected routes
router.get('/profile', authenticate, profileController.getProfile);
router.put('/profile', authenticate, profileController.updateProfile);
router.get('/:id', authenticate, authorize('admin'), profileController.getUserById);

// Stats routes
router.get('/stats/active-users', authenticate, authorize('admin', 'librarian'), statsController.getActiveUsers);
router.get('/stats/count', authenticate, authorize('admin', 'librarian'), statsController.getUserCount);

module.exports = router;
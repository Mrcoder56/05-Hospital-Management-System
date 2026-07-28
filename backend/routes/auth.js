const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', protect, authorize('admin'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;

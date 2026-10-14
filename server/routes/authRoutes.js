const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Private auth endpoints
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Role verification test endpoints for verification
router.get('/role-check/recruiter', protect, requireRole('recruiter', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted to recruiter workspace.',
    user: req.user,
  });
});

router.get('/role-check/admin', protect, requireRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted to admin console.',
    user: req.user,
  });
});

module.exports = router;

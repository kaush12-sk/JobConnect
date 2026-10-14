const express = require('express');
const {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  getAdminJobs,
  deleteAdminJob,
  getAdminCompanies,
  deleteAdminCompany,
  getAdminApplications,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// Enforce authentication and strict Admin role for all routes in this file
router.use(protect);
router.use(requireRole('admin'));

// Platform statistics
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);

// Job moderation
router.get('/jobs', getAdminJobs);
router.delete('/jobs/:id', deleteAdminJob);

// Company directory & moderation
router.get('/companies', getAdminCompanies);
router.delete('/companies/:id', deleteAdminCompany);

// Applications overview
router.get('/applications', getAdminApplications);

module.exports = router;

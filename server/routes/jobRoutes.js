const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  changeJobStatus,
  getRecruiterJobs,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// Public routes
router.get('/', getJobs);

// Recruiter specific management routes (must come before /:id)
router.get('/recruiter/my-jobs', protect, requireRole('recruiter', 'admin'), getRecruiterJobs);

// Single Job Details
router.get('/:id', getJobById);

// Protected Recruiter mutation routes
router.post('/', protect, requireRole('recruiter', 'admin'), createJob);
router.put('/:id', protect, requireRole('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, requireRole('recruiter', 'admin'), deleteJob);
router.patch('/:id/status', protect, requireRole('recruiter', 'admin'), changeJobStatus);

module.exports = router;

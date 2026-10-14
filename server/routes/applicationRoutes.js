const express = require('express');
const {
  applyToJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  getJobApplications,
  downloadResume,
  getApplicationStats,
  checkApplicationStatus,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const upload = require('../middleware/upload');

const router = express.Router();

// All application routes require authentication
router.use(protect);

// 1. Job Seeker application submission (with Multer file upload)
router.post('/', requireRole('jobseeker', 'admin'), upload.single('resume'), applyToJob);

// 2. Job Seeker applications list & stats
router.get('/my-applications', requireRole('jobseeker', 'admin'), getMyApplications);
router.get('/stats', requireRole('jobseeker', 'admin'), getApplicationStats);

// 3. Quick check if user applied to a specific job
router.get('/check/:jobId', checkApplicationStatus);

// 4. Recruiter view of candidates for a specific job
router.get('/job/:jobId', requireRole('recruiter', 'admin'), getJobApplications);

// 5. Recruiter or Admin updates candidate application status
router.patch('/:id/status', requireRole('recruiter', 'admin'), updateApplicationStatus);

// 6. Protected Resume Download (Applicant, Job Recruiter, or Admin)
router.get('/:id/resume', downloadResume);

// 7. Application Details (Applicant, Job Recruiter, or Admin)
router.get('/:id', getApplicationById);

// 8. Withdraw Application (Applicant or Admin)
router.delete('/:id', requireRole('jobseeker', 'admin'), withdrawApplication);

module.exports = router;


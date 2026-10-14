const express = require('express');
const {
  createCompany,
  getMyCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// Public routes
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);

// Protected Recruiter routes
router.post('/', protect, requireRole('recruiter', 'admin'), createCompany);
router.get('/recruiter/my-company', protect, requireRole('recruiter', 'admin'), getMyCompany);
router.put('/:id', protect, requireRole('recruiter', 'admin'), updateCompany);
router.delete('/:id', protect, requireRole('recruiter', 'admin'), deleteCompany);

module.exports = router;

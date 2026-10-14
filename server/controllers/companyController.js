const Company = require('../models/Company');

/**
 * @desc    Create a new company profile (Recruiters only)
 * @route   POST /api/companies
 * @access  Private (Recruiter / Admin)
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, description, logo, website, location, industry } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a company name.',
      });
    }

    // Check if recruiter already has a registered company
    const existing = await Company.findOne({ recruiter: req.user._id });
    if (existing && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You have already registered a company profile. You can edit your existing company.',
        companyId: existing._id,
      });
    }

    const company = await Company.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      logo: logo ? logo.trim() : '',
      website: website ? website.trim() : '',
      location: location ? location.trim() : '',
      industry: industry ? industry.trim() : '',
      recruiter: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Company profile created successfully.',
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in recruiter's company
 * @route   GET /api/companies/my-company
 * @access  Private (Recruiter / Admin)
 */
const getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ recruiter: req.user._id });

    if (!company) {
      return res.status(200).json({
        success: true,
        company: null,
        message: 'No company profile registered yet.',
      });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies (for public directory & job post dropdown)
 * @route   GET /api/companies
 * @access  Public
 */
const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single company by ID
 * @route   GET /api/companies/:id
 * @access  Public
 */
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('recruiter', 'name email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company not found with ID: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company profile
 * @route   PUT /api/companies/:id
 * @access  Private (Owner Recruiter / Admin)
 */
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company not found with ID: ${req.params.id}`,
      });
    }

    // Authorization: Verify Ownership
    if (!company.recruiter.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this company profile.',
      });
    }

    const { name, description, logo, website, location, industry } = req.body;

    if (name) company.name = name.trim();
    if (description !== undefined) company.description = description.trim();
    if (logo !== undefined) company.logo = logo.trim();
    if (website !== undefined) company.website = website.trim();
    if (location !== undefined) company.location = location.trim();
    if (industry !== undefined) company.industry = industry.trim();

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully.',
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete company profile
 * @route   DELETE /api/companies/:id
 * @access  Private (Owner Recruiter / Admin)
 */
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company not found with ID: ${req.params.id}`,
      });
    }

    // Authorization: Verify Ownership
    if (!company.recruiter.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this company profile.',
      });
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Company profile deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getMyCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};

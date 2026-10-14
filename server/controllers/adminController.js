const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * @desc    Get system-wide platform statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      jobseekersCount,
      recruitersCount,
      adminsCount,
      totalCompanies,
      totalJobs,
      activeJobs,
      closedJobs,
      draftJobs,
      totalApplications,
      appliedCount,
      reviewingCount,
      shortlistedCount,
      selectedCount,
      rejectedCount,
      recentUsers,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'admin' }),
      Company.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'Active' }),
      Job.countDocuments({ status: 'Closed' }),
      Job.countDocuments({ status: 'Draft' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Applied' }),
      Application.countDocuments({ status: 'Reviewing' }),
      Application.countDocuments({ status: 'Shortlisted' }),
      Application.countDocuments({ status: 'Selected' }),
      Application.countDocuments({ status: 'Rejected' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt location'),
      Job.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title company status createdAt location jobType')
        .populate('company', 'name logo'),
      Application.find()
        .sort({ appliedAt: -1 })
        .limit(5)
        .populate('applicant', 'name email')
        .populate({ path: 'job', select: 'title company', populate: { path: 'company', select: 'name' } }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          jobseekers: jobseekersCount,
          recruiters: recruitersCount,
          admins: adminsCount,
        },
        companies: {
          total: totalCompanies,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          draft: draftJobs,
        },
        applications: {
          total: totalApplications,
          applied: appliedCount,
          reviewing: reviewingCount,
          shortlisted: shortlistedCount,
          selected: selectedCount,
          rejected: rejectedCount,
        },
        recentActivity: {
          users: recentUsers,
          jobs: recentJobs,
          applications: recentApplications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with search, role filter, pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role && ['jobseeker', 'recruiter', 'admin'].includes(role)) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-password'),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteAdminUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Cascade deletions for integrity:
    if (user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ recruiter: user._id });
      const jobIds = recruiterJobs.map((j) => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ recruiter: user._id });
      await Company.deleteMany({ recruiter: user._id });
    } else if (user.role === 'jobseeker') {
      await Application.deleteMany({ applicant: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `User '${user.name}' and all associated records deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs (Admin moderation)
 * @route   GET /api/admin/jobs
 * @access  Private (Admin only)
 */
const getAdminJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status && ['Active', 'Closed', 'Draft'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('company', 'name logo location')
        .populate('recruiter', 'name email'),
      Job.countDocuments(query),
    ]);

    // Attach real application count to each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const appCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicationCount: appCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete any job (Admin moderation)
 * @route   DELETE /api/admin/jobs/:id
 * @access  Private (Admin only)
 */
const deleteAdminJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: `Job '${job.title}' and all associated applications removed.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies (Admin view)
 * @route   GET /api/admin/companies
 * @access  Private (Admin only)
 */
const getAdminCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [companies, total] = await Promise.all([
      Company.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('recruiter', 'name email'),
      Company.countDocuments(query),
    ]);

    // Add job count for each company
    const companiesWithJobCount = await Promise.all(
      companies.map(async (c) => {
        const jobsCount = await Job.countDocuments({ company: c._id });
        return {
          ...c.toObject(),
          jobsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: companiesWithJobCount.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      companies: companiesWithJobCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete any company (Admin moderation)
 * @route   DELETE /api/admin/companies/:id
 * @access  Private (Admin only)
 */
const deleteAdminCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    // Delete jobs of this company and their applications
    const jobs = await Job.find({ company: company._id });
    const jobIds = jobs.map((j) => j._id);
    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ company: company._id });
    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: `Company '${company.name}' and all its postings removed.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications (Admin overview)
 * @route   GET /api/admin/applications
 * @access  Private (Admin only)
 */
const getAdminApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};

    if (status && ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Selected'].includes(status)) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('applicant', 'name email phone location')
        .populate({
          path: 'job',
          select: 'title location jobType company recruiter',
          populate: [
            { path: 'company', select: 'name logo' },
            { path: 'recruiter', select: 'name email' },
          ],
        }),
      Application.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  getAdminJobs,
  deleteAdminJob,
  getAdminCompanies,
  deleteAdminCompany,
  getAdminApplications,
};

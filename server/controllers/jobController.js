const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (Recruiter / Admin)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
      deadline,
      status,
    } = req.body;

    // 1. Required fields validation
    if (!title || !description || !company || !location || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, company, location, and deadline.',
      });
    }

    // 2. Validate salary numbers
    const numSalaryMin = Number(salaryMin) || 0;
    const numSalaryMax = Number(salaryMax) || 0;

    if (isNaN(numSalaryMin) || isNaN(numSalaryMax)) {
      return res.status(400).json({
        success: false,
        message: 'Salary values must be valid numbers.',
      });
    }

    if (numSalaryMin < 0 || numSalaryMax < 0) {
      return res.status(400).json({
        success: false,
        message: 'Salary values cannot be negative.',
      });
    }

    if (numSalaryMax > 0 && numSalaryMin > numSalaryMax) {
      return res.status(400).json({
        success: false,
        message: 'Minimum salary cannot exceed maximum salary.',
      });
    }

    // 3. Validate deadline
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid application deadline date.',
      });
    }

    // 4. Verify company existence and recruiter ownership
    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: 'The selected company profile does not exist.',
      });
    }

    if (!companyDoc.recruiter.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only post jobs for companies you own.',
      });
    }

    // 5. Parse skills
    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills;
    } else if (typeof skills === 'string' && skills.trim()) {
      skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // 6. Create job
    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      company: companyDoc._id,
      recruiter: req.user._id,
      location: location.trim(),
      jobType: jobType || 'Full Time',
      experienceLevel: experienceLevel || 'Mid Level',
      salaryMin: numSalaryMin,
      salaryMax: numSalaryMax,
      skills: skillsArray,
      deadline: parsedDeadline,
      status: status || 'Active',
    });

    const populatedJob = await Job.findById(job._id)
      .populate('company', 'name logo location industry website')
      .populate('recruiter', 'name email');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully!',
      job: populatedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active jobs with search, filtering, sorting, and pagination
 * @route   GET /api/jobs
 * @access  Public
 */
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      q,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      company,
      skills,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const queryFilter = {
      status: 'Active', // Public queries only show Active listings
    };

    // 1. Search Query (Search title, description, skills, or company name)
    const searchQuery = (search || q || '').trim();
    if (searchQuery) {
      // Find matching company IDs first
      const matchingCompanies = await Company.find({
        name: { $regex: searchQuery, $options: 'i' },
      }).select('_id');
      const matchingCompanyIds = matchingCompanies.map((c) => c._id);

      queryFilter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { skills: { $in: [new RegExp(searchQuery, 'i')] } },
        { location: { $regex: searchQuery, $options: 'i' } },
        ...(matchingCompanyIds.length > 0 ? [{ company: { $in: matchingCompanyIds } }] : []),
      ];
    }

    // 2. Specific filters
    if (location && location.trim()) {
      queryFilter.location = { $regex: location.trim(), $options: 'i' };
    }

    if (jobType && jobType !== 'All') {
      queryFilter.jobType = { $regex: `^${jobType.replace('-', ' ')}`, $options: 'i' };
    }

    if (experienceLevel && experienceLevel !== 'All') {
      queryFilter.experienceLevel = experienceLevel;
    }

    if (company) {
      queryFilter.company = company;
    }

    // Salary range filters
    if (minSalary && !isNaN(minSalary)) {
      queryFilter.salaryMax = { $gte: Number(minSalary) };
    }
    if (maxSalary && !isNaN(maxSalary)) {
      queryFilter.salaryMin = { $lte: Number(maxSalary) };
    }

    // Skills filter
    if (skills) {
      const skillsList = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsList.length > 0) {
        queryFilter.skills = { $in: skillsList.map((s) => new RegExp(s, 'i')) };
      }
    }

    // 3. Sorting options
    let sortOptions = { createdAt: -1 }; // Default: Newest first
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'salary_desc') {
      sortOptions = { salaryMax: -1, salaryMin: -1 };
    } else if (sort === 'salary_asc') {
      sortOptions = { salaryMin: 1, salaryMax: 1 };
    } else if (sort === 'title_asc') {
      sortOptions = { title: 1 };
    } else if (sort === 'title_desc') {
      sortOptions = { title: -1 };
    }

    // 4. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const totalJobs = await Job.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalJobs / limitNum) || 1;

    const jobs = await Job.find(queryFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('company', 'name logo location industry website')
      .populate('recruiter', 'name email');

    res.status(200).json({
      success: true,
      jobs,
      currentPage: pageNum,
      totalPages,
      totalJobs,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name description logo website location industry')
      .populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with ID: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job posting
 * @route   PUT /api/jobs/:id
 * @access  Private (Owner Recruiter / Admin)
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with ID: ${req.params.id}`,
      });
    }

    // Ownership Enforcement
    if (!job.recruiter.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to edit this job posting.',
      });
    }

    const {
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
      deadline,
      status,
    } = req.body;

    // Validate salary if updated
    const numSalaryMin = salaryMin !== undefined ? Number(salaryMin) : job.salaryMin;
    const numSalaryMax = salaryMax !== undefined ? Number(salaryMax) : job.salaryMax;

    if (numSalaryMax > 0 && numSalaryMin > numSalaryMax) {
      return res.status(400).json({
        success: false,
        message: 'Minimum salary cannot exceed maximum salary.',
      });
    }

    if (title) job.title = title.trim();
    if (description) job.description = description.trim();
    if (location) job.location = location.trim();
    if (jobType) job.jobType = jobType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (salaryMin !== undefined) job.salaryMin = numSalaryMin;
    if (salaryMax !== undefined) job.salaryMax = numSalaryMax;
    if (status) job.status = status;
    if (deadline) {
      const parsedDeadline = new Date(deadline);
      if (!isNaN(parsedDeadline.getTime())) job.deadline = parsedDeadline;
    }

    if (skills) {
      job.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (company && company !== job.company.toString()) {
      const companyDoc = await Company.findById(company);
      if (companyDoc && (companyDoc.recruiter.equals(req.user._id) || req.user.role === 'admin')) {
        job.company = companyDoc._id;
      }
    }

    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate('company', 'name logo location industry website')
      .populate('recruiter', 'name email');

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully.',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/jobs/:id
 * @access  Private (Owner Recruiter / Admin)
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with ID: ${req.params.id}`,
      });
    }

    // Ownership Enforcement
    if (!job.recruiter.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this job posting.',
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change status of a job posting (Active, Closed, Draft)
 * @route   PATCH /api/jobs/:id/status
 * @access  Private (Owner Recruiter / Admin)
 */
const changeJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Active', 'Closed', 'Draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be Active, Closed, or Draft.',
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with ID: ${req.params.id}`,
      });
    }

    // Ownership Enforcement
    if (!job.recruiter.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to modify this job posting.',
      });
    }

    job.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job status successfully updated to ${status}.`,
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruiter's posted jobs with live MongoDB statistics
 * @route   GET /api/jobs/recruiter/my-jobs
 * @access  Private (Recruiter / Admin)
 */
const getRecruiterJobs = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    // 1. Fetch all jobs belonging to recruiter
    const jobs = await Job.find({ recruiter: recruiterId })
      .sort({ createdAt: -1 })
      .populate('company', 'name logo location');

    // 2. Compute real-time MongoDB counts
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'Active').length;
    const closedJobs = jobs.filter((j) => j.status === 'Closed').length;
    const draftJobs = jobs.filter((j) => j.status === 'Draft').length;

    // 3. Compute real application counts per job using MongoDB aggregation
    const jobIds = jobs.map((j) => j._id);
    const applicationCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    applicationCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const jobsWithCounts = jobs.map((job) => {
      const jobObj = job.toObject();
      jobObj.applicationCount = countMap[job._id.toString()] || 0;
      return jobObj;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        closedJobs,
        draftJobs,
      },
      jobs: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  changeJobStatus,
  getRecruiterJobs,
};

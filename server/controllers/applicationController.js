const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');

/**
 * Helper to safely delete an uploaded file if a check fails
 */
const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('[Cleanup File Error]', err);
    }
  }
};

/**
 * @desc    Submit an application for a job (with resume file & cover letter)
 * @route   POST /api/applications
 * @access  Private (Job Seeker / Admin)
 */
const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    // 1. Validate basic inputs
    if (!jobId) {
      if (req.file) cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid job ID.',
      });
    }

    if (!coverLetter || coverLetter.trim().length < 20) {
      if (req.file) cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Cover letter must be at least 20 characters long.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF, DOC, or DOCX up to 5 MB).',
      });
    }

    // 2. Validate role
    if (req.user.role !== 'jobseeker' && req.user.role !== 'admin') {
      cleanupFile(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Only job seekers can apply for jobs.',
      });
    }

    // 3. Find and validate Job
    const job = await Job.findById(jobId);
    if (!job) {
      cleanupFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    // 4. Job status check
    if (job.status !== 'Active') {
      cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Applications for this position are closed.',
      });
    }

    // 5. Application deadline check
    if (job.deadline && new Date() > new Date(job.deadline)) {
      cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'The application deadline for this position has passed.',
      });
    }

    // 6. Duplicate Application check
    const existingApplication = await Application.findOne({
      job: job._id,
      applicant: req.user._id,
    });

    if (existingApplication) {
      cleanupFile(req.file.path);
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job.',
      });
    }

    // 7. Create Application in MongoDB
    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      resume: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: `/uploads/resumes/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      coverLetter: coverLetter.trim(),
      status: 'Applied',
    });

    const populatedApplication = await Application.findById(application._id)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location industry' },
      })
      .populate('applicant', 'name email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application: populatedApplication,
    });
  } catch (error) {
    if (req.file) cleanupFile(req.file.path);
    next(error);
  }
};

/**
 * @desc    Get all applications submitted by the logged-in job seeker
 * @route   GET /api/applications/my-applications
 * @access  Private (Job Seeker / Admin)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .sort({ appliedAt: -1 })
      .populate({
        path: 'job',
        select: 'title location jobType experienceLevel salaryMin salaryMax status deadline company',
        populate: {
          path: 'company',
          select: 'name logo location industry website',
        },
      });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application details by ID
 * @route   GET /api/applications/:id
 * @access  Private (Applicant / Owner Recruiter / Admin)
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        populate: [
          { path: 'company', select: 'name description logo location industry website' },
          { path: 'recruiter', select: 'name email' },
        ],
      })
      .populate('applicant', 'name email phone location skills bio createdAt');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Authorization verification
    const isApplicant = application.applicant._id.equals(req.user._id);
    const isJobRecruiter =
      application.job &&
      application.job.recruiter &&
      application.job.recruiter._id.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this application.',
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw an application
 * @route   DELETE /api/applications/:id
 * @access  Private (Owner Job Seeker / Admin)
 */
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Verify ownership
    if (!application.applicant.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only withdraw your own applications.',
      });
    }

    // Check status: cannot withdraw if already Selected or Rejected
    if (application.status === 'Selected' || application.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: `Applications that are already ${application.status} cannot be withdrawn.`,
      });
    }

    // Clean up physical file from server
    if (application.resume && application.resume.storedName) {
      const filePath = path.join(__dirname, '../uploads/resumes', application.resume.storedName);
      cleanupFile(filePath);
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for a specific job (Recruiter view)
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Owner Recruiter / Admin)
 */
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('company', 'name logo');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    // Authorization: Recruiter must own this job posting
    if (!job.recruiter.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view applications for jobs you posted.',
      });
    }

    const applications = await Application.find({ job: job._id })
      .sort({ appliedAt: -1 })
      .populate('applicant', 'name email phone location skills bio createdAt');

    res.status(200).json({
      success: true,
      job: {
        _id: job._id,
        title: job.title,
        status: job.status,
        company: job.company,
        applicationCount: applications.length,
      },
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download/view a candidate resume (Protected)
 * @route   GET /api/applications/:id/resume
 * @access  Private (Applicant / Owner Recruiter / Admin)
 */
const downloadResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'recruiter');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Check authorization: must be the applicant, the job's recruiter, or admin
    const isApplicant = application.applicant.equals(req.user._id);
    const isRecruiter =
      application.job && application.job.recruiter && application.job.recruiter.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to access this resume.',
      });
    }

    if (!application.resume || !application.resume.storedName) {
      return res.status(404).json({
        success: false,
        message: 'No resume file associated with this application.',
      });
    }

    const filePath = path.join(__dirname, '../uploads/resumes', application.resume.storedName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'The requested resume file was not found on the server.',
      });
    }

    res.download(filePath, application.resume.originalName);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get real-time application statistics for the logged-in job seeker
 * @route   GET /api/applications/stats
 * @access  Private (Job Seeker / Admin)
 */
const getApplicationStats = async (req, res, next) => {
  try {
    const applicantId = req.user._id;

    const [total, applied, reviewing, shortlisted, selected, rejected] = await Promise.all([
      Application.countDocuments({ applicant: applicantId }),
      Application.countDocuments({ applicant: applicantId, status: 'Applied' }),
      Application.countDocuments({ applicant: applicantId, status: 'Reviewing' }),
      Application.countDocuments({ applicant: applicantId, status: 'Shortlisted' }),
      Application.countDocuments({ applicant: applicantId, status: 'Selected' }),
      Application.countDocuments({ applicant: applicantId, status: 'Rejected' }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        applied,
        reviewing,
        shortlisted,
        selected,
        rejected,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if current user has applied for a given job
 * @route   GET /api/applications/check/:jobId
 * @access  Private (Job Seeker / Authenticated)
 */
const checkApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    }).select('status appliedAt');

    res.status(200).json({
      success: true,
      hasApplied: !!application,
      status: application ? application.status : null,
      applicationId: application ? application._id : null,
      appliedAt: application ? application.appliedAt : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (Recruiter who owns the job or Admin)
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Owner Recruiter / Admin)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Selected'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('job', 'title recruiter company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Strict Authorization: must be the recruiter who posted the job or an admin
    const isOwnerRecruiter =
      application.job &&
      application.job.recruiter &&
      application.job.recruiter.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to change the status of this application.',
      });
    }

    application.status = status;
    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('applicant', 'name email phone location skills bio')
      .populate({
        path: 'job',
        select: 'title location jobType company recruiter',
        populate: { path: 'company', select: 'name logo' },
      });

    res.status(200).json({
      success: true,
      message: `Application status successfully updated to ${status}.`,
      application: populatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  getJobApplications,
  downloadResume,
  getApplicationStats,
  checkApplicationStatus,
  updateApplicationStatus,
};


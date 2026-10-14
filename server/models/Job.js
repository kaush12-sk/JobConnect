const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Job must be linked to a company'],
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must be linked to a recruiter'],
    },
    location: {
      type: String,
      required: [true, 'Please specify job location'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: [
        'Full Time',
        'Part Time',
        'Internship',
        'Contract',
        'Remote',
        'Full-time',
        'Part-time',
      ],
      default: 'Full Time',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead'],
      default: 'Mid Level',
    },
    salaryMin: {
      type: Number,
      default: 0,
      min: [0, 'Minimum salary cannot be negative'],
    },
    salaryMax: {
      type: Number,
      default: 0,
      min: [0, 'Maximum salary cannot be negative'],
    },
    skills: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide an application deadline'],
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1, jobType: 1, experienceLevel: 1, status: 1, createdAt: -1 });
jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ company: 1 });

module.exports = mongoose.model('Job', jobSchema);

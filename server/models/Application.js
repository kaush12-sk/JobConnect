const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must reference a job'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must reference an applicant'],
    },
    resume: {
      originalName: {
        type: String,
        required: [true, 'Original resume file name is required'],
      },
      storedName: {
        type: String,
        required: [true, 'Stored resume file name is required'],
      },
      path: {
        type: String,
        required: [true, 'Resume file path is required'],
      },
      mimeType: {
        type: String,
        required: [true, 'Resume mimeType is required'],
      },
      size: {
        type: Number,
        required: [true, 'Resume file size is required'],
      },
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [20, 'Cover letter must be at least 20 characters long'],
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Selected'],
        message: '{VALUE} is not a recognized application status',
      },
      default: 'Applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate applications for the same job by the same user
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Individual query indexes for high performance
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Send,
  Loader2,
  Info,
} from 'lucide-react';
import { getJobById } from '../../services/jobService';
import { submitApplication, checkApplicationStatus } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';
import SkeletonCard from '../../components/SkeletonCard';

const ApplyJob = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState(null);

  // Application state
  const [hasApplied, setHasApplied] = useState(false);
  const [existingAppId, setExistingAppId] = useState(null);

  // Form states
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Load Job details and application status
  useEffect(() => {
    const fetchJobAndStatus = async () => {
      setLoadingJob(true);
      setJobError(null);
      try {
        const jobData = await getJobById(jobId);
        if (jobData?.job) {
          setJob(jobData.job);
        } else {
          setJobError('Job posting not found.');
        }

        // Check if user already applied
        if (isAuthenticated && user?.role === 'jobseeker') {
          try {
            const statusRes = await checkApplicationStatus(jobId);
            if (statusRes.hasApplied) {
              setHasApplied(true);
              setExistingAppId(statusRes.applicationId);
            }
          } catch (statusErr) {
            console.warn('[ApplyJob] Status check error:', statusErr.message);
          }
        }
      } catch (err) {
        setJobError(err.message || 'Failed to load job details.');
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJobAndStatus();
  }, [jobId, isAuthenticated, user]);

  // Handle resume file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(null);

    if (!file) return;

    // Validate extension
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setFileError('Invalid file type. Only PDF, DOC, and DOCX documents are permitted.');
      setResumeFile(null);
      return;
    }

    // Validate size (max 5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File size exceeds the 5 MB limit. Please upload a smaller file.');
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    setFileError(null);
    const fileInput = document.getElementById('resume-file-input');
    if (fileInput) fileInput.value = '';
  };

  // Format bytes helper
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Submit Application
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // 1. Role validation
    if (user?.role !== 'jobseeker') {
      setFormError('Only job seekers can submit applications.');
      return;
    }

    // 2. Validate cover letter length
    if (coverLetter.trim().length < 20) {
      setFormError('Please provide a cover letter of at least 20 characters.');
      return;
    }

    // 3. Validate resume file
    if (!resumeFile) {
      setFormError('Please select and upload your resume file.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('coverLetter', coverLetter.trim());
      formData.append('resume', resumeFile);

      const result = await submitApplication(formData);

      if (result.success) {
        setFormSuccess('Application submitted successfully.');
        setTimeout(() => {
          if (result.application?._id) {
            navigate(`/applications/${result.application._id}`);
          } else {
            navigate('/applications');
          }
        }, 1200);
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already applied')) {
        setHasApplied(true);
        setFormError('You have already applied for this job.');
      } else {
        setFormError(err.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive compensation';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)} / yr`;
    if (min) return `From ${formatter.format(min)} / yr`;
    return `Up to ${formatter.format(max)} / yr`;
  };

  if (loadingJob) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', maxWidth: '850px' }}>
        <SkeletonCard height="150px" />
        <div style={{ marginTop: '1.5rem' }}>
          <SkeletonCard height="350px" />
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', maxWidth: '750px', textAlign: 'center' }}>
        <Alert type="error" message={jobError || 'Job posting not found.'} />
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/jobs" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Job Search
          </Link>
        </div>
      </div>
    );
  }

  // Check deadline expiration and active status
  const isDeadlinePassed = job.deadline && new Date() > new Date(job.deadline);
  const isClosed = job.status !== 'Active' || isDeadlinePassed;

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '860px' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={`/jobs/${job._id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Job Requisition
        </Link>
      </div>

      {/* Top Requisition Card */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--primary)',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          JOB APPLICATION
        </span>
        <h1 style={{ fontSize: '1.75rem', margin: '0.4rem 0 0.75rem', fontWeight: 800 }}>
          {job.title}
        </h1>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Building2 size={16} style={{ color: 'var(--primary)' }} />
            {job.company?.name || 'Hiring Organization'}
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
            {job.location}
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Briefcase size={16} style={{ color: 'var(--text-muted)' }} />
            {job.jobType}
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={16} style={{ color: 'var(--success)' }} />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>

          {job.deadline && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isDeadlinePassed ? 'var(--error)' : 'var(--text-secondary)',
                fontWeight: isDeadlinePassed ? 700 : 400,
              }}
            >
              <Clock size={16} />
              {isDeadlinePassed ? 'Deadline Passed' : `Apply by ${new Date(job.deadline).toLocaleDateString()}`}
            </span>
          )}
        </div>
      </div>

      {/* Job Closed / Deadline Passed Alert */}
      {isClosed && (
        <div style={{ marginBottom: '2rem' }}>
          <Alert
            type="warning"
            message={
              isDeadlinePassed
                ? 'Applications for this position are closed because the deadline has passed.'
                : 'This job posting is currently closed and no longer accepting applications.'
            }
          />
          <div style={{ marginTop: '1.25rem' }}>
            <Link to="/jobs" className="btn btn-secondary">
              Explore Active Openings
            </Link>
          </div>
        </div>
      )}

      {/* Already Applied Alert */}
      {!isClosed && hasApplied && (
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--primary-50, #eff6ff)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--primary-light, #bfdbfe)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <CheckCircle size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem', color: 'var(--primary)' }}>
                You have already applied for this job.
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Your credentials and resume are securely recorded with the hiring team.
              </p>
            </div>
            {existingAppId && (
              <Link to={`/applications/${existingAppId}`} className="btn btn-primary" style={{ flexShrink: 0 }}>
                View Application
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Application Form */}
      {!isClosed && !hasApplied && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 700 }}>
            Submit Your Candidacy
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Please provide your updated resume and a customized cover letter detailing your qualifications.
          </p>

          {formError && (
            <div style={{ marginBottom: '1.5rem' }}>
              <Alert type="error" message={formError} />
            </div>
          )}

          {formSuccess && (
            <div style={{ marginBottom: '1.5rem' }}>
              <Alert type="success" message={formSuccess} />
            </div>
          )}

          {/* Section 1: Resume Upload */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: '0.4rem',
              }}
            >
              Resume / CV Attachment <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Accepted formats: PDF, DOC, DOCX. Maximum file size: 5 MB.
            </p>

            {!resumeFile ? (
              <div
                onClick={() => document.getElementById('resume-file-input').click()}
                style={{
                  border: '2px dashed var(--border-subtle, #cbd5e1)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface-alt, #f8fafc)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle, #cbd5e1)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-alt, #f8fafc)';
                }}
              >
                <input
                  id="resume-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-50, #eff6ff)',
                    color: 'var(--primary, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <UploadCloud size={26} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Click to select or drag and drop your resume
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  PDF, DOC, or DOCX (up to 5 MB)
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'var(--primary-50, #eff6ff)',
                  border: '1px solid var(--primary-light, #bfdbfe)',
                  borderRadius: 'var(--radius-lg, 12px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {resumeFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatFileSize(resumeFile.size)} • Ready for upload
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('resume-file-input').click()}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="btn btn-outline"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.85rem',
                      color: 'var(--error)',
                      borderColor: 'var(--error-light, #fca5a5)',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            )}

            {fileError && (
              <div style={{ marginTop: '0.75rem', color: 'var(--error)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={15} /> {fileError}
              </div>
            )}
          </div>

          {/* Section 2: Cover Letter */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
              <label
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                Cover Letter <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: coverLetter.length < 20 ? 'var(--text-muted)' : 'var(--success)',
                  fontWeight: 600,
                }}
              >
                {coverLetter.length} / 3000 characters (min. 20)
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Share your relevant experience, key achievements, and why you are interested in this position.
            </p>

            <textarea
              className="input-field"
              rows={7}
              placeholder="Explain why you are a good fit for this position and how your skills align with the requirements..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              maxLength={3000}
              required
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                borderRadius: 'var(--radius-md, 8px)',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Submitter Info Card */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-muted, #f8fafc)',
              borderRadius: 'var(--radius-md, 8px)',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Applying as: </span>
              <strong>{user?.name}</strong> ({user?.email})
            </div>
            <Link to="/profile" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
              Edit Profile Info
            </Link>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to={`/jobs/${job._id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !resumeFile || coverLetter.trim().length < 20}
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spin-animation" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ApplyJob;

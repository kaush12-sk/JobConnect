import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Download,
  FileText,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getApplicationById, withdrawApplication, downloadResume } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import ApplicationTimeline from '../../components/ApplicationTimeline';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import SkeletonCard from '../../components/SkeletonCard';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Withdraw Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getApplicationById(id);
        if (data?.application) {
          setApplication(data.application);
        } else {
          setError('Application details not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve application details.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleDownloadResume = async () => {
    if (!application?.resume?.storedName) return;
    setDownloading(true);
    try {
      await downloadResume(application._id, application.resume.originalName);
    } catch (err) {
      alert('Failed to download resume: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await withdrawApplication(application._id);
      navigate('/applications');
    } catch (err) {
      setError(err.message || 'Failed to withdraw application.');
      setIsWithdrawing(false);
      setWithdrawModalOpen(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;
    return `Up to ${formatter.format(max)}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
        <SkeletonCard height="160px" />
        <div style={{ marginTop: '1.5rem' }}>
          <SkeletonCard height="380px" />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '700px', textAlign: 'center' }}>
        <Alert type="error" message={error || 'Application not found or access unauthorized.'} />
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/applications" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to My Applications
          </Link>
        </div>
      </div>
    );
  }

  const { job, applicant, resume, coverLetter, status, appliedAt, updatedAt } = application;
  const isApplicant = applicant?._id === user?._id;
  const isLocked = status === 'Selected' || status === 'Rejected';

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '920px' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={isApplicant ? '/applications' : `/recruiter/jobs/${job?._id}/applications`}
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
          <ArrowLeft size={16} /> {isApplicant ? 'Back to My Applications' : 'Back to Applicants List'}
        </Link>
      </div>

      {/* Main Header Banner */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                APPLICATION DETAILS
              </span>
              <StatusBadge status={status} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              {job?.title || 'Position Title'}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <Building2 size={16} style={{ color: 'var(--primary)' }} />
                {job?.company?.name || 'Company Profile'}
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                {job?.location || 'Remote'}
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} style={{ color: 'var(--success)' }} />
                {formatSalary(job?.salaryMin, job?.salaryMax)}
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                Applied on {new Date(appliedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {job?._id && (
              <Link to={`/jobs/${job._id}`} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                View Job Posting <ExternalLink size={14} />
              </Link>
            )}

            {isApplicant && !isLocked && (
              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="btn btn-outline"
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--error)',
                  borderColor: 'var(--error-light, #fca5a5)',
                }}
              >
                <Trash2 size={14} /> Withdraw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Application Tracking Timeline Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Application Progress & Milestones
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Real-time candidate tracking directly synchronized with the recruiter's hiring team.
        </p>

        <ApplicationTimeline status={status} appliedAt={appliedAt} updatedAt={updatedAt} />
      </div>

      {/* Grid: 2 Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Resume & Cover Letter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '2 1 500px' }}>
          {/* Resume Attachment Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Candidate Resume Attachment
            </h3>

            {resume ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'var(--bg-muted, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: 'var(--radius-lg, 12px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-50, #eff6ff)',
                      color: 'var(--primary, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {resume.originalName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatFileSize(resume.size)} • {resume.mimeType || 'Document'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadResume}
                  disabled={downloading}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
                >
                  {downloading ? (
                    <>
                      <Loader2 size={15} className="spin-animation" /> Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={15} /> Download Resume
                    </>
                  )}
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No resume record attached.</p>
            )}
          </div>

          {/* Cover Letter Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Cover Letter
            </h3>
            <div
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                fontSize: '0.95rem',
                whiteSpace: 'pre-line',
                backgroundColor: 'var(--bg-muted, #f8fafc)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
              }}
            >
              {coverLetter || 'No cover letter provided.'}
            </div>
          </div>
        </div>

        {/* Right Column: Applicant Info & Company Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1 1 320px' }}>
          {/* Applicant Profile Snapshot */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--primary)' }} /> Applicant Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  CANDIDATE NAME
                </span>
                <p style={{ fontWeight: 600, margin: '0.15rem 0 0' }}>{applicant?.name || 'N/A'}</p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  EMAIL ADDRESS
                </span>
                <p style={{ fontWeight: 500, margin: '0.15rem 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} /> {applicant?.email || 'N/A'}
                </p>
              </div>

              {applicant?.phone && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    CONTACT PHONE
                  </span>
                  <p style={{ fontWeight: 500, margin: '0.15rem 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} style={{ color: 'var(--text-muted)' }} /> {applicant.phone}
                  </p>
                </div>
              )}

              {applicant?.location && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    LOCATION
                  </span>
                  <p style={{ fontWeight: 500, margin: '0.15rem 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} /> {applicant.location}
                  </p>
                </div>
              )}

              {applicant?.skills && applicant.skills.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    KEY SKILLS
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                    {applicant.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-md, 6px)',
                          backgroundColor: 'var(--primary-50, #eff6ff)',
                          color: 'var(--primary, #2563eb)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hiring Company Snapshot */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} style={{ color: 'var(--primary)' }} /> Organization
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  COMPANY
                </span>
                <p style={{ fontWeight: 700, margin: '0.15rem 0 0', fontSize: '0.95rem' }}>
                  {job?.company?.name || 'Company Profile'}
                </p>
              </div>

              {job?.company?.industry && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    INDUSTRY
                  </span>
                  <p style={{ margin: '0.15rem 0 0' }}>{job.company.industry}</p>
                </div>
              )}

              {job?.company?.location && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    HEADQUARTERS
                  </span>
                  <p style={{ margin: '0.15rem 0 0' }}>{job.company.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Application Withdrawal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => {
          if (!isWithdrawing) setWithdrawModalOpen(false);
        }}
        title="Withdraw Application"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: 'var(--error, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <AlertCircle size={24} />
          </div>

          <h3 style={{ fontSize: '1.15rem', textAlign: 'center', marginBottom: '0.5rem', fontWeight: 700 }}>
            Are you sure you want to withdraw this application?
          </h3>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              textAlign: 'center',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            This action cannot be undone. Your resume file will be removed from the recruiter's system.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setWithdrawModalOpen(false)}
              disabled={isWithdrawing}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmWithdraw}
              disabled={isWithdrawing}
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--error, #dc2626)',
                borderColor: 'var(--error, #dc2626)',
              }}
            >
              {isWithdrawing ? (
                <>
                  <Loader2 size={16} className="spin-animation" /> Withdrawing...
                </>
              ) : (
                'Yes, Withdraw Application'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationDetail;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { checkApplicationStatus } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Globe,
  Tag,
  ArrowLeft,
  Share2,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

const JobDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [appStatus, setAppStatus] = useState({ hasApplied: false, applicationId: null, status: null });

  useEffect(() => {
    const fetchJobAndApplication = async () => {
      setLoading(true);
      try {
        const res = await jobService.getJobById(id);
        setJob(res.job);

        // Check if current user has already applied
        if (isAuthenticated && user?.role === 'jobseeker') {
          try {
            const check = await checkApplicationStatus(id);
            if (check?.hasApplied) {
              setAppStatus({
                hasApplied: true,
                applicationId: check.applicationId,
                status: check.status,
              });
            }
          } catch (err) {
            console.warn('[JobDetail] App status check:', err.message);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobAndApplication();
  }, [id, isAuthenticated, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive / Undisclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} per year`;
    if (min) return `From $${min.toLocaleString()} per year`;
    return `Up to $${max.toLocaleString()} per year`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" text="Retrieving job requisition details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '3rem 2rem' }}>
            <h2>Job Opportunity Unavailable</h2>
            <p style={{ margin: '1rem 0 2rem', color: 'var(--text-secondary)' }}>
              {error || 'The job requisition you are seeking could not be found or may have expired.'}
            </p>
            <Link to="/jobs" className="btn btn-primary">
              <ArrowLeft size={16} /> Explore Active Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    company,
    recruiter,
    location,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    skills = [],
    deadline,
    createdAt,
    status,
  } = job;

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Back Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <Link
            to="/jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Job Search
          </Link>

          <button
            onClick={handleShare}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Share2 size={14} /> {copied ? 'Link Copied!' : 'Share Requisition'}
          </button>
        </div>

        {/* Top Hero Banner */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            marginBottom: '2rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Company Logo Avatar */}
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary)',
                  display: company?.logo ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  border: '1px solid var(--primary-light)',
                }}
              >
                {company?.name ? company.name.substring(0, 2).toUpperCase() : 'JC'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {company?.name || 'Verified Employer'}
                  </span>
                  <span className="badge badge-primary">{jobType}</span>
                  <span className="badge badge-neutral">{experienceLevel}</span>
                  {status && status !== 'Active' && (
                    <span className="badge badge-warning">{status}</span>
                  )}
                </div>
                <h1 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.2 }}>{title}</h1>
              </div>
            </div>

            {/* Prominent Apply Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {appStatus.hasApplied ? (
                <Link
                  to={`/applications/${appStatus.applicationId}`}
                  className="btn btn-secondary btn-lg"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Applied
                </Link>
              ) : status !== 'Active' ? (
                <button
                  disabled
                  className="btn btn-secondary btn-lg"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', opacity: 0.6, cursor: 'not-allowed' }}
                >
                  Closed
                </button>
              ) : deadline && new Date() > new Date(deadline) ? (
                <button
                  disabled
                  className="btn btn-secondary btn-lg"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', opacity: 0.6, cursor: 'not-allowed' }}
                >
                  Applications Closed
                </button>
              ) : (
                <Link
                  to={isAuthenticated ? `/jobs/${id}/apply` : `/login?redirect=/jobs/${id}/apply`}
                  className="btn btn-primary btn-lg"
                  style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-glow)' }}
                  id="job-apply-now-btn"
                >
                  <Send size={18} /> Apply Now
                </Link>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {appStatus.hasApplied
                  ? 'Click to view application status'
                  : 'Direct employer submission'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.75rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
              <MapPin size={17} style={{ color: 'var(--text-muted)' }} />
              <strong>{location}</strong>
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
              <DollarSign size={17} style={{ color: 'var(--success)' }} />
              <strong>{formatSalary(salaryMin, salaryMax)}</strong>
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
              <Calendar size={17} style={{ color: 'var(--text-muted)' }} />
              Posted {formatDate(createdAt)}
            </span>

            {deadline && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--warning-text)' }}>
                <Clock size={17} />
                Apply by {formatDate(deadline)}
              </span>
            )}
          </div>
        </div>

        {/* Main Content Layout: 2 Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Left Column: Role Details & Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '2 1 600px' }}>
            {/* Required Skills Card */}
            {skills && skills.length > 0 && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={18} style={{ color: 'var(--primary)' }} /> Required Technical Competencies
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary)',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        border: '1px solid var(--primary-light)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description Card */}
            <div className="card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Position Overview & Responsibilities</h3>
              <div style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                fontSize: '1rem',
                whiteSpace: 'pre-line',
              }}>
                {description}
              </div>

              <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Interested in this role?</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Applications are reviewed on a rolling basis.
                  </p>
                </div>
                {appStatus.hasApplied ? (
                  <Link
                    to={`/applications/${appStatus.applicationId}`}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> View My Application
                  </Link>
                ) : status !== 'Active' ? (
                  <button disabled className="btn btn-secondary">
                    Position Closed
                  </button>
                ) : deadline && new Date() > new Date(deadline) ? (
                  <button disabled className="btn btn-secondary">
                    Applications Closed
                  </button>
                ) : (
                  <Link
                    to={isAuthenticated ? `/jobs/${id}/apply` : `/login?redirect=/jobs/${id}/apply`}
                    className="btn btn-primary"
                  >
                    <Send size={16} /> Apply Now
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Company & Recruiter Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1 1 320px' }}>
            {/* Company Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} style={{ color: 'var(--primary)' }} /> About the Company
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    COMPANY NAME
                  </span>
                  <p style={{ fontWeight: 700, marginTop: '0.2rem', fontSize: '1rem' }}>
                    {company?.name || 'Technology Company'}
                  </p>
                </div>

                {company?.industry && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      INDUSTRY
                    </span>
                    <p style={{ fontWeight: 600, marginTop: '0.2rem' }}>{company.industry}</p>
                  </div>
                )}

                {company?.location && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      HEADQUARTERS
                    </span>
                    <p style={{ fontWeight: 600, marginTop: '0.2rem' }}>{company.location}</p>
                  </div>
                )}

                {company?.website && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      WEBSITE
                    </span>
                    <p style={{ marginTop: '0.2rem' }}>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                      >
                        {company.website.replace(/^https?:\/\//, '')} <ExternalLink size={13} />
                      </a>
                    </p>
                  </div>
                )}

                {company?.description && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                      {company.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recruiter Trust Badge */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-light)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)' }}>
                    Verified Requisition
                  </span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Listed directly by verified recruiter {recruiter?.name || 'Representative'}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobDetail;

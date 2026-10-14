import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { companyService } from '../services/companyService';
import {
  getMyApplications,
  getApplicationStats,
} from '../services/applicationService';
import {
  Briefcase,
  Building,
  UserCheck,
  Clock,
  CheckCircle2,
  FileText,
  Search,
  PlusCircle,
  ArrowRight,
  Award,
  XCircle,
  Eye,
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ProfileCompletionBar from '../components/ProfileCompletionBar';
import SkeletonCard from '../components/SkeletonCard';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'jobseeker';

  // Job Seeker States
  const [seekerStats, setSeekerStats] = useState({
    total: 0,
    applied: 0,
    reviewing: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingSeeker, setLoadingSeeker] = useState(true);

  // Recruiter States
  const [recruiterStats, setRecruiterStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    draftJobs: 0,
  });
  const [recruiterCompany, setRecruiterCompany] = useState(null);
  const [loadingRecruiter, setLoadingRecruiter] = useState(true);

  // Fetch job seeker dashboard data
  useEffect(() => {
    if (role === 'jobseeker') {
      const fetchSeekerData = async () => {
        setLoadingSeeker(true);
        try {
          const [statsRes, appsRes, jobsRes] = await Promise.all([
            getApplicationStats().catch(() => ({ stats: {} })),
            getMyApplications().catch(() => ({ applications: [] })),
            jobService.getJobs({ limit: 4 }).catch(() => ({ jobs: [] })),
          ]);

          if (statsRes?.stats) {
            setSeekerStats(statsRes.stats);
          }
          if (appsRes?.applications) {
            setRecentApplications(appsRes.applications.slice(0, 4));
          }
          if (jobsRes?.jobs) {
            setRecommendedJobs(jobsRes.jobs);
          }
        } catch (err) {
          console.warn('[Dashboard] Data loading error:', err.message);
        } finally {
          setLoadingSeeker(false);
        }
      };

      fetchSeekerData();
    }
  }, [role]);

  // Fetch recruiter dashboard data
  useEffect(() => {
    if (role === 'recruiter') {
      setLoadingRecruiter(true);
      Promise.all([
        jobService.getRecruiterJobs().catch(() => ({ stats: {} })),
        companyService.getMyCompany().catch(() => ({ company: null })),
      ])
        .then(([jobData, companyData]) => {
          if (jobData?.stats) setRecruiterStats(jobData.stats);
          if (companyData?.company) setRecruiterCompany(companyData.company);
        })
        .finally(() => setLoadingRecruiter(false));
    }
  }, [role]);

  // Format currency
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

  // ==========================================
  // JOB SEEKER DASHBOARD VIEW
  // ==========================================
  const renderJobSeekerDashboard = () => {
    const hasAnyApps = seekerStats.total > 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Metric Cards - Real MongoDB Application Counts */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Total Applied */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                TOTAL APPLIED
              </span>
              <FileText size={17} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{seekerStats.total}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All-time submissions</span>
          </div>

          {/* Under Review */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '3px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                UNDER REVIEW
              </span>
              <Clock size={17} style={{ color: '#d97706' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706' }}>
              {seekerStats.reviewing + seekerStats.applied}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Screening in progress</span>
          </div>

          {/* Shortlisted */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '3px solid #7c3aed' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                SHORTLISTED
              </span>
              <Award size={17} style={{ color: '#7c3aed' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#7c3aed' }}>
              {seekerStats.shortlisted}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Advancing to interviews</span>
          </div>

          {/* Selected */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '3px solid #16a34a' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                SELECTED / HIRED
              </span>
              <CheckCircle2 size={17} style={{ color: '#16a34a' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16a34a' }}>
              {seekerStats.selected}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offers extended</span>
          </div>

          {/* Rejected */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '3px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                NOT SELECTED
              </span>
              <XCircle size={17} style={{ color: '#dc2626' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#dc2626' }}>
              {seekerStats.rejected}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requisitions closed</span>
          </div>
        </div>

        {/* Status Distribution Bar (Real MongoDB Application Data) */}
        {hasAnyApps && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Application Status Overview
            </h3>
            {/* Visual breakdown bar */}
            <div
              style={{
                width: '100%',
                height: '14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-muted, #f1f5f9)',
                overflow: 'hidden',
                display: 'flex',
                marginBottom: '1rem',
              }}
            >
              {seekerStats.applied > 0 && (
                <div
                  style={{
                    width: `${(seekerStats.applied / seekerStats.total) * 100}%`,
                    backgroundColor: 'var(--primary, #2563eb)',
                  }}
                  title={`Applied: ${seekerStats.applied}`}
                />
              )}
              {seekerStats.reviewing > 0 && (
                <div
                  style={{
                    width: `${(seekerStats.reviewing / seekerStats.total) * 100}%`,
                    backgroundColor: '#f59e0b',
                  }}
                  title={`Reviewing: ${seekerStats.reviewing}`}
                />
              )}
              {seekerStats.shortlisted > 0 && (
                <div
                  style={{
                    width: `${(seekerStats.shortlisted / seekerStats.total) * 100}%`,
                    backgroundColor: '#7c3aed',
                  }}
                  title={`Shortlisted: ${seekerStats.shortlisted}`}
                />
              )}
              {seekerStats.selected > 0 && (
                <div
                  style={{
                    width: `${(seekerStats.selected / seekerStats.total) * 100}%`,
                    backgroundColor: '#16a34a',
                  }}
                  title={`Selected: ${seekerStats.selected}`}
                />
              )}
              {seekerStats.rejected > 0 && (
                <div
                  style={{
                    width: `${(seekerStats.rejected / seekerStats.total) * 100}%`,
                    backgroundColor: '#ef4444',
                  }}
                  title={`Not Selected: ${seekerStats.rejected}`}
                />
              )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary, #2563eb)' }} />
                Applied ({seekerStats.applied})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                Reviewing ({seekerStats.reviewing})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
                Shortlisted ({seekerStats.shortlisted})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                Selected ({seekerStats.selected})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                Not Selected ({seekerStats.rejected})
              </span>
            </div>
          </div>
        )}

        {/* Two Columns: Recent Applications + Profile Completion */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Recent Applications */}
          <div className="card" style={{ padding: '2rem', flex: '2 1 500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Recent Applications</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                  Live status of your submitted candidacies
                </p>
              </div>
              <Link to="/applications" className="btn btn-secondary btn-sm">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {loadingSeeker ? (
              <SkeletonCard height="120px" />
            ) : recentApplications.length === 0 ? (
              <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                <div className="empty-state-icon" style={{ margin: '0 auto 1rem' }}>
                  <FileText size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>No Applications Yet</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '380px' }}>
                  Start applying to open opportunities with our streamlined resume upload.
                </p>
                <Link to="/jobs" className="btn btn-primary btn-sm">
                  <Search size={15} /> Explore Jobs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {recentApplications.map((app) => (
                  <div
                    key={app._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md, 8px)',
                      backgroundColor: 'var(--bg-muted, #f8fafc)',
                      border: '1px solid var(--border-subtle, #e2e8f0)',
                    }}
                  >
                    <div>
                      <Link
                        to={`/applications/${app._id}`}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                        }}
                      >
                        {app.job?.title || 'Unknown Position'}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {app.job?.company?.name || 'Company'} • Applied{' '}
                        {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <StatusBadge status={app.status} size="small" />
                      <Link
                        to={`/applications/${app._id}`}
                        className="btn btn-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Profile Completion + Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1 1 320px' }}>
            {/* Dynamic Profile Completion Widget */}
            <ProfileCompletionBar user={user} hasResume={seekerStats.total > 0} />

            {/* Quick Actions Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Quick Candidate Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <Link
                  to="/jobs"
                  className="btn btn-primary btn-block"
                  style={{ justifyContent: 'center', fontSize: '0.875rem' }}
                >
                  <Search size={16} /> Search Active Jobs
                </Link>
                <Link
                  to="/applications"
                  className="btn btn-secondary btn-block"
                  style={{ justifyContent: 'center', fontSize: '0.875rem' }}
                >
                  <FileText size={16} /> Track My Applications
                </Link>
                <Link
                  to="/profile"
                  className="btn btn-outline btn-block"
                  style={{ justifyContent: 'center', fontSize: '0.875rem' }}
                >
                  Edit Profile & Skills
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Jobs Section */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Recommended Opportunities</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                Curated open requisitions currently seeking talent
              </p>
            </div>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              View All Jobs <ArrowRight size={14} />
            </Link>
          </div>

          {recommendedJobs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No open requisitions available at this moment.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {recommendedJobs.map((j) => (
                <div
                  key={j._id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    backgroundColor: 'var(--bg-muted, #f8fafc)',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.2rem' }}>
                      {j.company?.name || 'Company'}
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                      <Link to={`/jobs/${j._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {j.title}
                      </Link>
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span>{j.location} • {j.jobType}</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatSalary(j.salaryMin, j.salaryMax)}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <Link to={`/jobs/${j._id}`} className="btn btn-secondary btn-block btn-sm" style={{ justifyContent: 'center' }}>
                      View Position
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // RECRUITER DASHBOARD VIEW
  // ==========================================
  const renderRecruiterDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Recruiter Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACTIVE POSTS</span>
              <Briefcase size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{recruiterStats.activeJobs}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live in candidate search</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL REQUISITIONS</span>
              <UserCheck size={18} style={{ color: 'var(--secondary)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{recruiterStats.totalJobs}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All created jobs</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>DRAFT ROLES</span>
              <Clock size={18} style={{ color: 'var(--warning)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{recruiterStats.draftJobs}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unpublished drafts</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>COMPANY STATUS</span>
              <Building size={18} style={{ color: recruiterCompany ? 'var(--success)' : 'var(--warning)' }} />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: recruiterCompany ? 'var(--success)' : 'var(--warning-text)' }}>
              {recruiterCompany ? 'Verified' : 'Pending Setup'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {recruiterCompany ? recruiterCompany.name : 'Profile required'}
            </span>
          </div>
        </div>

        {/* Recruiter Workspace Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          <div className="card" style={{ flex: '2 1 500px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Requisitions Management
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You have <strong>{recruiterStats.totalJobs}</strong> job requisitions configured in MongoDB ({recruiterStats.activeJobs} active). You can view applicants, review candidates, modify statuses, or create new listings.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/recruiter/jobs" className="btn btn-primary">
                <Briefcase size={16} /> Open Jobs Manager & Applicants
              </Link>
              <Link to="/jobs/create" className="btn btn-secondary">
                <PlusCircle size={16} /> Post New Requisition
              </Link>
            </div>
          </div>

          <div className="card" style={{ flex: '1 1 320px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Company Workspace
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Maintain your organization brand to attract qualified applicants.
            </p>

            <Link to={recruiterCompany ? '/company' : '/company/create'} className="btn btn-secondary btn-block">
              <Building size={16} /> {recruiterCompany ? 'View Company Profile' : 'Setup Company'}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            {role === 'recruiter' ? 'Recruiter Console' : 'Job Seeker Dashboard'}
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
          Welcome back, {user?.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          {role === 'recruiter'
            ? 'Manage your organizational job postings and review incoming candidate applications.'
            : 'Track your active applications, discover tailored requisitions, and optimize your career profile.'}
        </p>
      </div>

      {role === 'recruiter' ? renderRecruiterDashboard() : renderJobSeekerDashboard()}
    </div>
  );
};

export default Dashboard;

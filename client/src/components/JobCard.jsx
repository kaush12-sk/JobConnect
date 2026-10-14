import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';

const JobCard = ({ job }) => {
  if (!job) return null;

  const {
    _id,
    title,
    company,
    location,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    skills = [],
    createdAt,
    deadline,
    status,
  } = job;

  // Format currency
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary Undisclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCompanyInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        transition: 'all var(--transition-normal)',
      }}
    >
      <div>
        {/* Top Header: Company Avatar + Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                style={{
                  width: '44px',
                  height: '44px',
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
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary)',
                display: company?.logo ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '1px solid var(--primary-light)',
              }}
            >
              {getCompanyInitials(company?.name)}
            </div>

            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {company?.name || 'Verified Employer'}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>
                <Link to={`/jobs/${_id}`} style={{ color: 'var(--text-primary)' }}>
                  {title}
                </Link>
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span className="badge badge-primary">{jobType}</span>
            {status && status !== 'Active' ? (
              <span className={`badge ${status === 'Draft' ? 'badge-warning' : 'badge-danger'}`}>
                {status === 'Closed' ? 'Closed' : status}
              </span>
            ) : deadline && new Date() > new Date(deadline) ? (
              <span className="badge badge-danger">Applications Closed</span>
            ) : null}
          </div>
        </div>

        {/* Key Metrics: Location, Experience, Salary */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          margin: '1rem 0',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} style={{ color: 'var(--text-muted)' }} />
            {location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Briefcase size={15} style={{ color: 'var(--text-muted)' }} />
            {experienceLevel}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <DollarSign size={15} style={{ color: 'var(--success)' }} />
            {formatSalary(salaryMin, salaryMax)}
          </span>
        </div>

        {/* Skills Chips */}
        {skills && skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
            {skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                +{skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Dates + Action */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span>Posted {formatDate(createdAt)}</span>
          {deadline && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning-text)' }}>
              <Clock size={12} /> Apply by {formatDate(deadline)}
            </span>
          )}
        </div>

        <Link to={`/jobs/${_id}`} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
          View Details <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;

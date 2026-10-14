import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileCompletionBar = ({ user, hasResume = false }) => {
  if (!user) return null;

  // Criteria definition (each criterion has a weight)
  const criteria = [
    { label: 'Full Name', completed: Boolean(user.name && user.name.trim()) },
    { label: 'Phone Number', completed: Boolean(user.phone && user.phone.trim()) },
    { label: 'Current Location', completed: Boolean(user.location && user.location.trim()) },
    { label: 'Professional Bio', completed: Boolean(user.bio && user.bio.trim()) },
    { label: 'Skills & Competencies', completed: Boolean(user.skills && user.skills.length > 0) },
    { label: 'Resume Uploaded', completed: hasResume },
  ];

  const completedCount = criteria.filter((c) => c.completed).length;
  const percentage = Math.round((completedCount / criteria.length) * 100);

  let barColor = 'var(--warning, #f59e0b)';
  if (percentage >= 80) {
    barColor = 'var(--success, #16a34a)';
  } else if (percentage < 40) {
    barColor = 'var(--error, #ef4444)';
  }

  const missingCriteria = criteria.filter((c) => !c.completed);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface, #ffffff)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        padding: '1.25rem 1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.65rem',
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Profile Strength</span>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', margin: '0.1rem 0 0' }}>
            Complete profiles receive 3x more recruiter views
          </p>
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: '1.1rem',
            color: barColor,
          }}
        >
          {percentage}%
        </span>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--bg-muted, #f1f5f9)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '0.85rem',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: '9999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Missing items or celebration */}
      {missingCriteria.length > 0 ? (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #475569)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>Missing: </span>
          {missingCriteria.map((item, idx) => (
            <span key={item.label}>
              <span style={{ color: 'var(--primary, #2563eb)' }}>{item.label}</span>
              {idx < missingCriteria.length - 1 ? ', ' : ''}
            </span>
          ))}
          <div style={{ marginTop: '0.5rem' }}>
            <Link
              to="/profile"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--primary, #2563eb)',
                textDecoration: 'none',
              }}
            >
              Complete your profile →
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            color: 'var(--success, #16a34a)',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={15} /> All profile sections completed!
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBar;

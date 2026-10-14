import React from 'react';
import { CheckCircle2, Clock, Eye, Award, CheckCheck, XCircle } from 'lucide-react';

const STAGES = [
  { key: 'Applied', label: 'Application Submitted', desc: 'Received by company', icon: Clock },
  { key: 'Reviewing', label: 'Under Review', desc: 'Screening qualifications', icon: Eye },
  { key: 'Shortlisted', label: 'Shortlisted', desc: 'Advanced to interview stage', icon: Award },
  { key: 'Selected', label: 'Selected', desc: 'Offer extended or hired', icon: CheckCheck },
];

const STAGE_ORDER = {
  Applied: 0,
  Reviewing: 1,
  Shortlisted: 2,
  Selected: 3,
};

const ApplicationTimeline = ({ status, appliedAt, updatedAt }) => {
  const isRejected = status === 'Rejected';
  const currentStep = STAGE_ORDER[status] ?? 0;

  return (
    <div style={{ padding: '1.5rem 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          position: 'relative',
        }}
      >
        {STAGES.map((stage, idx) => {
          const isPast = !isRejected && currentStep > idx;
          const isCurrent = !isRejected && currentStep === idx;
          const isFuture = isRejected || currentStep < idx;

          let circleBg = 'var(--bg-muted, #f1f5f9)';
          let circleColor = 'var(--text-muted, #94a3b8)';
          let circleBorder = 'var(--border-subtle, #e2e8f0)';

          if (isPast) {
            circleBg = 'var(--success-50, #dcfce7)';
            circleColor = 'var(--success, #16a34a)';
            circleBorder = 'var(--success, #16a34a)';
          } else if (isCurrent) {
            circleBg = 'var(--primary-50, #eff6ff)';
            circleColor = 'var(--primary, #2563eb)';
            circleBorder = 'var(--primary, #2563eb)';
          }

          const IconComponent = isPast ? CheckCircle2 : stage.icon;

          return (
            <div
              key={stage.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Step Circle */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: circleBg,
                  color: circleColor,
                  border: `2px solid ${circleBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconComponent size={20} />
              </div>

              {/* Step Title */}
              <span
                style={{
                  fontWeight: isCurrent ? 700 : 600,
                  fontSize: '0.9rem',
                  color: isCurrent
                    ? 'var(--primary, #2563eb)'
                    : isPast
                    ? 'var(--text-primary, #0f172a)'
                    : 'var(--text-muted, #94a3b8)',
                  marginBottom: '0.2rem',
                }}
              >
                {stage.label}
              </span>

              {/* Step Desc */}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
                {stage.desc}
              </span>

              {/* Timestamp on applicable steps */}
              {stage.key === 'Applied' && appliedAt && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.25rem' }}>
                  {new Date(appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}

              {isCurrent && stage.key !== 'Applied' && updatedAt && (
                <span style={{ fontSize: '0.7rem', color: 'var(--primary, #2563eb)', marginTop: '0.25rem', fontWeight: 600 }}>
                  Updated {new Date(updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Rejected Status Notification if applicable */}
      {isRejected && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991b1b',
          }}
        >
          <XCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>Application Closed: Not Selected</div>
            <div style={{ fontSize: '0.825rem', color: '#b91c1c' }}>
              Thank you for your interest. While this requisition is no longer progressing, we encourage you to apply for other matching positions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTimeline;

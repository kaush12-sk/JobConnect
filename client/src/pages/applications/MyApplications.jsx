import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Eye,
  Trash2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Search,
  FileCheck,
} from 'lucide-react';
import { getMyApplications, withdrawApplication } from '../../services/applicationService';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import SkeletonCard from '../../components/SkeletonCard';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Withdraw Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Load applications
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyApplications();
      if (data?.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle Withdraw
  const handleOpenWithdrawModal = (app) => {
    setSelectedApp(app);
    setWithdrawModalOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedApp) return;
    setIsWithdrawing(true);
    setError(null);

    try {
      await withdrawApplication(selectedApp._id);
      setSuccessMessage(`Application for "${selectedApp.job?.title || 'Job'}" successfully withdrawn.`);
      setWithdrawModalOpen(false);
      setSelectedApp(null);
      // Refresh applications list
      fetchApplications();
    } catch (err) {
      setError(err.message || 'Failed to withdraw application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Filtered applications based on search
  const filteredApps = applications.filter((app) => {
    const jobTitle = app.job?.title || '';
    const companyName = app.job?.company?.name || '';
    const term = searchTerm.toLowerCase().trim();
    return jobTitle.toLowerCase().includes(term) || companyName.toLowerCase().includes(term);
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
            My Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Track the real-time status of your active requisitions and interview pipelines.
          </p>
        </div>

        <Link to="/jobs" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={16} /> Browse New Jobs
        </Link>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SkeletonCard height="90px" />
          <SkeletonCard height="90px" />
          <SkeletonCard height="90px" />
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <div
          className="card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '2rem auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-50, #eff6ff)',
              color: 'var(--primary, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <FileCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No applications yet
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Start exploring thousands of career opportunities and submit your candidacy with our 1-click resume workflow.
          </p>
          <Link to="/jobs" className="btn btn-primary">
            Start Applying to Jobs <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {/* Search Filter Bar */}
          <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '2.5rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="card table-responsive" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-muted, #f8fafc)', borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Job & Role
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Company
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Location
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Applied Date
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const isLocked = app.status === 'Selected' || app.status === 'Rejected';
                  return (
                    <tr
                      key={app._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted, #f8fafc)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '1.25rem' }}>
                        <Link
                          to={`/applications/${app._id}`}
                          style={{
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                          }}
                        >
                          {app.job?.title || 'Unknown Position'}
                        </Link>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {app.job?.jobType || 'Full Time'}
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                          <Building2 size={15} style={{ color: 'var(--primary)' }} />
                          {app.job?.company?.name || 'Company Profile'}
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                          {app.job?.location || 'Remote'}
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          {new Date(app.appliedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem' }}>
                        <StatusBadge status={app.status} />
                      </td>

                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Link
                            to={`/applications/${app._id}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
                          >
                            <Eye size={14} /> View
                          </Link>

                          <button
                            onClick={() => handleOpenWithdrawModal(app)}
                            disabled={isLocked}
                            title={isLocked ? `Cannot withdraw an application that is ${app.status}` : 'Withdraw application'}
                            className="btn btn-outline"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.825rem',
                              color: isLocked ? 'var(--text-muted)' : 'var(--error)',
                              borderColor: isLocked ? 'var(--border-subtle)' : 'var(--error-light, #fca5a5)',
                              cursor: isLocked ? 'not-allowed' : 'pointer',
                              opacity: isLocked ? 0.5 : 1,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Confirmation Modal for Application Withdrawal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => {
          if (!isWithdrawing) {
            setWithdrawModalOpen(false);
            setSelectedApp(null);
          }
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
            You are about to withdraw your application for <strong>"{selectedApp?.job?.title}"</strong> at{' '}
            <strong>{selectedApp?.job?.company?.name}</strong>. Your submitted resume and candidate profile will be
            removed from the recruiter's active pipeline.
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

export default MyApplications;

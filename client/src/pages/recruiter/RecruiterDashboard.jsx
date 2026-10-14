import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  AlertCircle,
  Building,
  Users,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    draftJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadRecruiterData = async () => {
    setLoading(true);
    try {
      const res = await jobService.getRecruiterJobs();
      setJobs(res.jobs || []);
      setStats(res.stats || { totalJobs: 0, activeJobs: 0, closedJobs: 0, draftJobs: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load recruiter data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiterData();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobService.changeJobStatus(jobId, newStatus);
      setSuccess(`Job status updated to ${newStatus}.`);
      // Update local state instantly
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
      );
      // Reload stats
      const res = await jobService.getRecruiterJobs();
      setStats(res.stats);
    } catch (err) {
      setError(err.message || 'Failed to change job status.');
    }
  };

  const confirmDelete = (job) => {
    setSelectedJob(job);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedJob?._id) return;
    setDeleting(true);
    try {
      await jobService.deleteJob(selectedJob._id);
      setSuccess(`'${selectedJob.title}' was successfully deleted.`);
      setDeleteModalOpen(false);
      setSelectedJob(null);
      await loadRecruiterData();
    } catch (err) {
      setError(err.message || 'Failed to delete job.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" text="Loading recruiter dashboard..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container">
        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-warning">Hiring Console</span>
            </div>
            <h1>Job Postings Manager</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Oversee open requisitions, update publication statuses, and manage your talent pipeline
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/company" className="btn btn-secondary">
              <Building size={16} /> My Company
            </Link>
            <Link to="/jobs/create" className="btn btn-primary" id="post-new-job-btn">
              <PlusCircle size={16} /> Post a Job
            </Link>
          </div>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Live MongoDB Count Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL REQUISITIONS</span>
              <Briefcase size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.totalJobs}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created by your account</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACTIVE LISTINGS</span>
              <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--success)' }}>{stats.activeJobs}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visible to candidates</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>DRAFT ROLES</span>
              <Clock size={18} style={{ color: 'var(--warning)' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--warning-text)' }}>{stats.draftJobs}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending publication</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>CLOSED REQUISITIONS</span>
              <FileText size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.closedJobs}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filled or archived</span>
          </div>
        </div>

        {/* Jobs List / Table Container */}
        {jobs.length === 0 ? (
          <div className="card empty-state" style={{ padding: '3.5rem 2rem' }}>
            <div className="empty-state-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Briefcase size={32} />
            </div>
            <h3 className="empty-state-title">You Haven't Posted Any Jobs Yet</h3>
            <p className="empty-state-desc">
              Publish your first opening to begin sourcing skilled candidates directly from our job marketplace.
            </p>
            <Link to="/jobs/create" className="btn btn-primary">
              <PlusCircle size={16} /> Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            {/* Desktop Table View */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5.px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Job Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Applicants</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Posted</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Deadline</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job._id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    {/* Title & Company */}
                    <td style={{ padding: '1.1rem 1rem' }}>
                      <Link to={`/jobs/${job._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {job.title}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {job.company?.name || 'Company'} • {job.location}
                      </div>
                    </td>

                    {/* Job Type */}
                    <td style={{ padding: '1.1rem 1rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {job.jobType}
                      </span>
                    </td>

                    {/* Live Application Count */}
                    <td style={{ padding: '1.1rem 1rem' }}>
                      <Link
                        to={`/recruiter/jobs/${job._id}/applications`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: job.applicationCount > 0 ? 'var(--primary-50, #eff6ff)' : 'var(--bg-muted, #f1f5f9)',
                          color: job.applicationCount > 0 ? 'var(--primary, #2563eb)' : 'var(--text-secondary, #64748b)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          border: job.applicationCount > 0 ? '1px solid var(--primary-light, #bfdbfe)' : '1px solid var(--border-subtle, #e2e8f0)',
                        }}
                        title="View Candidates who applied"
                      >
                        <Users size={13} />
                        {job.applicationCount || 0} {job.applicationCount === 1 ? 'Applicant' : 'Applicants'}
                      </Link>
                    </td>

                    {/* Status Dropdown Selector */}
                    <td style={{ padding: '1.1rem 1rem' }}>
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job._id, e.target.value)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor:
                            job.status === 'Active'
                              ? 'var(--success-bg)'
                              : job.status === 'Draft'
                              ? 'var(--warning-bg)'
                              : 'var(--bg-muted)',
                          color:
                            job.status === 'Active'
                              ? 'var(--success-text)'
                              : job.status === 'Draft'
                              ? 'var(--warning-text)'
                              : 'var(--text-secondary)',
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Posted Date */}
                    <td style={{ padding: '1.1rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {formatDate(job.createdAt)}
                    </td>

                    {/* Deadline */}
                    <td style={{ padding: '1.1rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {formatDate(job.deadline)}
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '1.1rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                        <Link
                          to={`/recruiter/jobs/${job._id}/applications`}
                          className="btn btn-secondary btn-sm"
                          title="View Candidates who applied"
                          style={{ padding: '0.4rem 0.55rem', color: 'var(--primary)' }}
                        >
                          <Users size={15} />
                        </Link>
                        <Link
                          to={`/jobs/${job._id}`}
                          className="btn btn-secondary btn-sm"
                          title="View public job posting"
                          style={{ padding: '0.4rem 0.55rem' }}
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/jobs/edit/${job._id}`}
                          className="btn btn-secondary btn-sm"
                          title="Edit job requisition"
                          style={{ padding: '0.4rem 0.55rem' }}
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={() => confirmDelete(job)}
                          className="btn btn-secondary btn-sm"
                          title="Delete job requisition"
                          style={{ padding: '0.4rem 0.55rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Requisition Deletion"
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertCircle size={22} />
            </div>
            <div>
              <h4 style={{ marginBottom: '0.25rem' }}>Are you sure you want to delete this job?</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You are about to permanently remove <strong>{selectedJob?.title}</strong>. This listing will no longer appear on the public job marketplace.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="btn btn-secondary"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={deleting}
              id="confirm-delete-job-btn"
            >
              {deleting ? 'Deleting...' : 'Delete Job'}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default RecruiterDashboard;

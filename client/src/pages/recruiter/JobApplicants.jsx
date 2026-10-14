import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Building2,
  Calendar,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Loader2,
  FileText,
  Search,
  CheckCircle,
} from 'lucide-react';
import { getJobApplications, downloadResume, updateApplicationStatus } from '../../services/applicationService';
import StatusBadge from '../../components/StatusBadge';
import Alert from '../../components/Alert';
import SkeletonCard from '../../components/SkeletonCard';
import Modal from '../../components/Modal';

const JobApplicants = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [downloadingId, setDownloadingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Cover Letter Modal
  const [selectedAppModal, setSelectedAppModal] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getJobApplications(jobId);
        if (data?.applications) {
          setJob(data.job);
          setApplications(data.applications);
        } else {
          setError('No applicant data returned.');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve applicant pipeline.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  const handleDownloadCandidateResume = async (app) => {
    if (!app?.resume?.storedName) return;
    setDownloadingId(app._id);
    try {
      await downloadResume(app._id, app.resume.originalName);
    } catch (err) {
      alert('Failed to download resume: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingStatusId(appId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await updateApplicationStatus(appId, newStatus);
      if (res?.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
        if (selectedAppModal && selectedAppModal._id === appId) {
          setSelectedAppModal((prev) => ({ ...prev, status: newStatus }));
        }
        setSuccessMsg(`Candidate status successfully updated to "${newStatus}".`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update application status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };


  const filteredApplicants = applications.filter((app) => {
    const candidateName = app.applicant?.name || '';
    const candidateEmail = app.applicant?.email || '';
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      candidateName.toLowerCase().includes(term) || candidateEmail.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/recruiter/jobs"
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
          <ArrowLeft size={16} /> Back to Job Management
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                CANDIDATE PIPELINE
              </span>
              {job?.status && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    backgroundColor: job.status === 'Active' ? 'var(--success-50, #dcfce7)' : 'var(--bg-muted)',
                    color: job.status === 'Active' ? 'var(--success, #16a34a)' : 'var(--text-muted)',
                  }}
                >
                  {job.status}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              {job?.title || 'Job Applicants'}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <Building2 size={16} style={{ color: 'var(--primary)' }} />
                {job?.company?.name || 'Company'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} style={{ color: 'var(--text-muted)' }} />
                <strong>{applications.length}</strong> Total Applicants
              </span>
            </div>
          </div>

          <Link to={`/jobs/${jobId}`} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            View Public Listing
          </Link>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert type="success" message={successMsg} />
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert type="error" message={error} />
        </div>
      )}


      {/* Loading Skeleton */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SkeletonCard height="80px" />
          <SkeletonCard height="80px" />
          <SkeletonCard height="80px" />
        </div>
      ) : applications.length === 0 ? (
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
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Users size={32} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No applicants have applied yet
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            As candidates submit their resumes for this position, their credentials and cover letters will appear in this pipeline.
          </p>
          <Link to="/recruiter/jobs" className="btn btn-secondary">
            Back to My Jobs
          </Link>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Search input */}
            <div style={{ position: 'relative', width: '320px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Search candidates by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.4rem', width: '100%', fontSize: '0.9rem' }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Status:
              </span>
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Statuses ({applications.length})</option>
                <option value="Applied">Applied</option>
                <option value="Reviewing">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Not Selected</option>
              </select>
            </div>
          </div>

          {/* Applicants Table */}
          <div className="card table-responsive" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-muted, #f8fafc)', borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Candidate
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Contact Details
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Applied Date
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>
                    Candidate Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((app) => (
                  <tr
                    key={app._id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted, #f8fafc)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Candidate Name & Skills */}
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {app.applicant?.name || 'Applicant'}
                      </div>
                      {app.applicant?.location && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <MapPin size={12} /> {app.applicant.location}
                        </div>
                      )}
                      {app.applicant?.skills && app.applicant.skills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.4rem' }}>
                          {app.applicant.skills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: 'var(--primary-50, #eff6ff)',
                                color: 'var(--primary, #2563eb)',
                                fontWeight: 600,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                          {app.applicant.skills.length > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                              +{app.applicant.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Contact Details */}
                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <Mail size={13} style={{ color: 'var(--text-muted)' }} /> {app.applicant?.email || 'N/A'}
                      </div>
                      {app.applicant?.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Phone size={13} style={{ color: 'var(--text-muted)' }} /> {app.applicant.phone}
                        </div>
                      )}
                    </td>

                    {/* Applied Date */}
                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                        {new Date(app.appliedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                        <select
                          value={app.status}
                          disabled={updatingStatusId === app._id}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className="input-field"
                          style={{
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor:
                              app.status === 'Selected'
                                ? 'var(--success-50, #ecfdf5)'
                                : app.status === 'Shortlisted'
                                ? 'var(--primary-50, #eff6ff)'
                                : app.status === 'Rejected'
                                ? 'var(--danger-50, #fef2f2)'
                                : app.status === 'Reviewing'
                                ? '#fffbeb'
                                : 'var(--bg-muted, #f8fafc)',
                            color:
                              app.status === 'Selected'
                                ? 'var(--success, #065f46)'
                                : app.status === 'Shortlisted'
                                ? 'var(--primary, #1e40af)'
                                : app.status === 'Rejected'
                                ? 'var(--danger, #991b1b)'
                                : app.status === 'Reviewing'
                                ? '#92400e'
                                : 'var(--text-secondary, #475569)',
                            border: '1px solid var(--border-subtle, #cbd5e1)',
                          }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Reviewing">Reviewing</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        {updatingStatusId === app._id && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Loader2 size={10} className="spin-animation" /> Updating...
                          </span>
                        )}
                      </div>
                    </td>


                    {/* Actions */}
                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                        {/* Resume Download */}
                        <button
                          onClick={() => handleDownloadCandidateResume(app)}
                          disabled={downloadingId === app._id}
                          className="btn btn-primary"
                          title="Download Resume"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          {downloadingId === app._id ? (
                            <Loader2 size={13} className="spin-animation" />
                          ) : (
                            <Download size={13} />
                          )}
                          Resume
                        </button>

                        {/* Cover Letter Quick View */}
                        <button
                          onClick={() => setSelectedAppModal(app)}
                          className="btn btn-secondary"
                          title="View Cover Letter & Bio"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <FileText size={13} /> Cover Letter
                        </button>

                        {/* Full Application Details */}
                        <Link
                          to={`/applications/${app._id}`}
                          className="btn btn-outline"
                          title="View Full Application"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          <Eye size={13} /> Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Cover Letter Quick Modal */}
      <Modal
        isOpen={Boolean(selectedAppModal)}
        onClose={() => setSelectedAppModal(null)}
        title={`Candidate: ${selectedAppModal?.applicant?.name || 'Applicant'}`}
      >
        {selectedAppModal && (
          <div>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md, 8px)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email:</span>
                <div style={{ fontWeight: 600 }}>{selectedAppModal.applicant?.email}</div>
              </div>
              {selectedAppModal.applicant?.phone && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone:</span>
                  <div style={{ fontWeight: 600 }}>{selectedAppModal.applicant.phone}</div>
                </div>
              )}
              {selectedAppModal.applicant?.location && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location:</span>
                  <div style={{ fontWeight: 600 }}>{selectedAppModal.applicant.location}</div>
                </div>
              )}
            </div>

            {selectedAppModal.applicant?.bio && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>Candidate Bio</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {selectedAppModal.applicant.bio}
                </p>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>Cover Letter Submission</h4>
              <div
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-line',
                  backgroundColor: 'var(--bg-muted)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {selectedAppModal.coverLetter || 'No cover letter provided.'}
              </div>
            </div>

            {/* Change Status in Modal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-muted, #f8fafc)',
                borderRadius: 'var(--radius-md, 8px)',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-subtle, #e2e8f0)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Candidate Status:</span>
                <StatusBadge status={selectedAppModal.status} size="small" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Move to:</span>
                <select
                  value={selectedAppModal.status}
                  disabled={updatingStatusId === selectedAppModal._id}
                  onChange={(e) => handleStatusChange(selectedAppModal._id, e.target.value)}
                  className="input-field"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
                >
                  <option value="Applied">Applied</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>

              <button
                onClick={() => handleDownloadCandidateResume(selectedAppModal)}
                disabled={downloadingId === selectedAppModal._id}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <Download size={14} /> Download Resume
              </button>
              <button
                onClick={() => setSelectedAppModal(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobApplicants;

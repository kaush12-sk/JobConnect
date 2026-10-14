import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  Edit,
  Trash2,
  PlusCircle,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';

const CompanyDetail = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const loadCompany = async () => {
    setLoading(true);
    try {
      const res = await companyService.getMyCompany();
      setCompany(res.company);
    } catch (err) {
      setError(err.message || 'Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, []);

  const handleDelete = async () => {
    if (!company?._id) return;
    setDeleting(true);
    try {
      await companyService.deleteCompany(company._id);
      setSuccess('Company profile removed.');
      setCompany(null);
      setDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete company.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" text="Loading company profile..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-warning">Recruiter Workspace</span>
            </div>
            <h1>Company Management</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your verified employer brand, office details, and hiring presence
            </p>
          </div>

          {company && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/company/edit" className="btn btn-secondary">
                <Edit size={16} /> Edit Profile
              </Link>
              <Link to="/jobs/create" className="btn btn-primary">
                <PlusCircle size={16} /> Post a Job
              </Link>
            </div>
          )}
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Empty State when no company profile is registered */}
        {!company ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Building2 size={32} />
            </div>
            <h3 className="empty-state-title">No Company Profile Registered</h3>
            <p className="empty-state-desc">
              You haven't configured an employer profile yet. Create one to begin posting jobs and showcasing your company brand to candidates.
            </p>
            <Link to="/company/create" className="btn btn-primary btn-lg" id="create-company-btn">
              <PlusCircle size={18} /> Register Company Profile
            </Link>
          </div>
        ) : (
          /* Populated Company Card */
          <div className="card" style={{ padding: '2.5rem' }}>
            {/* Top Brand Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
            }}>
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  style={{
                    width: '76px',
                    height: '76px',
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
                  width: '76px',
                  height: '76px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary)',
                  display: company.logo ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  border: '1px solid var(--primary-light)',
                }}
              >
                {company.name.substring(0, 2).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.75rem' }}>{company.name}</h2>
                  <span className="badge badge-success">Verified Employer</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  {company.industry || 'Tech & Engineering'}
                </span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              padding: '2rem 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} /> HEADQUARTERS
                </span>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem' }}>
                  {company.location || 'Location not specified'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Globe size={15} /> WEBSITE
                </span>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem' }}>
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {company.website.replace(/^https?:\/\//, '')} <ExternalLink size={13} />
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Briefcase size={15} /> INDUSTRY SECTOR
                </span>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem' }}>
                  {company.industry || 'Technology'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} /> REGISTERED ON
                </span>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem' }}>
                  {new Date(company.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Description Section */}
            <div style={{ padding: '2rem 0' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>About {company.name}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {company.description || 'No detailed company description provided yet. Add an overview of your mission, values, and engineering culture.'}
              </p>
            </div>

            {/* Danger Zone: Delete Company */}
            <div style={{
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--danger-text)' }}>Remove Company Profile</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Permanently delete this company profile from the JobConnect directory.
                </p>
              </div>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
              >
                <Trash2 size={15} /> Delete Company
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Company Profile"
        >
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete <strong>{company?.name}</strong>? This action cannot be undone.
          </p>
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
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Company'}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CompanyDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  FileText,
  Image,
  ArrowLeft,
  Check,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';

const CompanyForm = ({ isEdit = false }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    industry: 'Software & Technology',
    website: '',
    location: '',
    description: '',
    logo: '',
  });

  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sample logo presets for convenient recruiter selection
  const logoPresets = [
    { label: 'Blue Gradient', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80' },
    { label: 'Purple Tech', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80' },
    { label: 'Emerald Geometric', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=120&auto=format&fit=crop&q=80' },
    { label: 'Sunset Minimal', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&auto=format&fit=crop&q=80' },
  ];

  useEffect(() => {
    if (isEdit) {
      const fetchExisting = async () => {
        try {
          const res = await companyService.getMyCompany();
          if (res.company) {
            setCompanyId(res.company._id);
            setFormData({
              name: res.company.name || '',
              industry: res.company.industry || '',
              website: res.company.website || '',
              location: res.company.location || '',
              description: res.company.description || '',
              logo: res.company.logo || '',
            });
          } else {
            navigate('/company/create', { replace: true });
          }
        } catch (err) {
          setError(err.message || 'Failed to fetch company details.');
        } finally {
          setLoading(false);
        }
      };
      fetchExisting();
    }
  }, [isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSelectPresetLogo = (url) => {
    setFormData((prev) => ({ ...prev, logo: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Company name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && companyId) {
        await companyService.updateCompany(companyId, formData);
      } else {
        await companyService.createCompany(formData);
      }
      navigate('/company');
    } catch (err) {
      setError(err.message || 'Failed to save company profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" text="Loading company information..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Top Back Link */}
        <Link
          to="/company"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Company Profile
        </Link>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-warning">Recruiter Workspace</span>
          </div>
          <h1>{isEdit ? 'Edit Company Profile' : 'Register New Company'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isEdit
              ? 'Keep your employer brand details fresh and accurate for prospective talent'
              : 'Establish your verified corporate identity to publish job requisitions on JobConnect'}
          </p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div className="card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Company Name *
              </label>
              <div className="input-with-icon">
                <Building2 size={18} className="input-icon-left" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Acme Technologies"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Industry and Website Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="industry">
                  Industry / Sector
                </label>
                <div className="input-with-icon">
                  <Briefcase size={18} className="input-icon-left" />
                  <input
                    id="industry"
                    name="industry"
                    type="text"
                    placeholder="e.g. Cloud Infrastructure, FinTech"
                    value={formData.industry}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="website">
                  Website URL
                </label>
                <div className="input-with-icon">
                  <Globe size={18} className="input-icon-left" />
                  <input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Headquarters Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Headquarters Location
              </label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon-left" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. San Francisco, CA or Remote First"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Logo Selection (Preset Avatars + Custom URL) */}
            <div className="form-group">
              <label className="form-label" htmlFor="logo">
                Company Brand Logo (Preset Avatar or URL)
              </label>

              {/* Preset Badges */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {logoPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPresetLogo(preset.url)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: formData.logo === preset.url ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: formData.logo === preset.url ? 'var(--primary-50)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <span>{preset.label}</span>
                    {formData.logo === preset.url && <Check size={14} style={{ color: 'var(--primary)' }} />}
                  </button>
                ))}
              </div>

              <div className="input-with-icon">
                <Image size={18} className="input-icon-left" />
                <input
                  id="logo"
                  name="logo"
                  type="url"
                  placeholder="Or paste custom image URL (https://...)"
                  value={formData.logo}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Company Overview & Culture
              </label>
              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Describe your company mission, tech stack, and what makes your team a great place to work..."
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>

            {/* Submit Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/company" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                id="save-company-btn"
              >
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Company Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;

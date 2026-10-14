import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Globe, MapPin, Briefcase, Plus, CheckCircle2 } from 'lucide-react';
import Alert from '../components/Alert';

const Company = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: 'Acme Technologies',
    industry: 'Software & Cloud Infrastructure',
    website: 'https://acme.example.com',
    location: user?.location || 'San Francisco, CA',
    description: 'We build enterprise developer tools and scalable cloud infrastructure for modern engineering teams.',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-warning">Recruiter Workspace</span>
          </div>
          <h1>Company Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage the brand identity that candidates see when applying to your job requisitions
          </p>
        </div>

        {saved && (
          <Alert
            type="success"
            message="Company profile details saved successfully for Day 1 demonstration!"
            onClose={() => setSaved(false)}
          />
        )}

        <div className="card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="companyName">
                Company Name *
              </label>
              <div className="input-with-icon">
                <Building2 size={18} className="input-icon-left" />
                <input
                  id="companyName"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="industry">
                  Industry / Sector
                </label>
                <div className="input-with-icon">
                  <Briefcase size={18} className="input-icon-left" />
                  <input
                    id="industry"
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Headquarters Location
              </label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon-left" />
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Company Overview & Culture
              </label>
              <textarea
                id="description"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-textarea"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Save Company Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Company;

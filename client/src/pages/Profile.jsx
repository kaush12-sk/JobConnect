import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Shield,
  Tag,
  FileText,
  Edit2,
  Check,
  X,
  Plus,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import ProfileCompletionBar from '../components/ProfileCompletionBar';
import Alert from '../components/Alert';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // Sync state with user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        skills: Array.isArray(user.skills) ? [...user.skills] : [],
      });
    }
  }, [user]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setIsSaving(true);

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setSaveSuccess('Profile updated successfully.');
        setIsEditing(false);
      } else {
        setSaveError(res.error || 'Failed to update profile.');
      }
    } catch (err) {
      setSaveError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        skills: Array.isArray(user.skills) ? [...user.skills] : [],
      });
    }
    setIsEditing(false);
    setSaveError(null);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">Candidate Profile</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.35rem' }}>
              Profile & Professional Details
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Manage your personal credentials, contact points, and technical competencies.
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Edit2 size={15} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                <X size={15} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="spin-animation" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={15} /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Profile Completion Widget */}
        <div style={{ marginBottom: '2rem' }}>
          <ProfileCompletionBar user={user} hasResume={Boolean(user?.skills && user.skills.length > 0)} />
        </div>

        {/* Alerts */}
        {saveSuccess && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Alert type="success" message={saveSuccess} onClose={() => setSaveSuccess(null)} />
          </div>
        )}

        {saveError && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Alert type="error" message={saveError} onClose={() => setSaveError(null)} />
          </div>
        )}

        {/* Main Profile Shell */}
        <div className="card" style={{ padding: '2.5rem' }}>
          {/* Top Banner Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.75rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-md)',
                flexShrink: 0,
              }}
            >
              {getInitials(isEditing ? formData.name : user?.name)}
            </div>

            <div style={{ flex: '1 1 250px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                {isEditing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name"
                    style={{ fontSize: '1.25rem', fontWeight: 700, maxWidth: '320px', padding: '0.4rem 0.8rem' }}
                  />
                ) : (
                  <h2 style={{ fontSize: '1.65rem', margin: 0, fontWeight: 800 }}>{user?.name}</h2>
                )}

                <span className={`badge ${user?.role === 'recruiter' ? 'badge-warning' : 'badge-primary'}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.925rem',
                  margin: '0.25rem 0 0',
                }}
              >
                <Mail size={15} style={{ color: 'var(--text-muted)' }} /> {user?.email}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Primary login)</span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.75rem',
              padding: '2rem 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {/* Location */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
                <MapPin size={14} /> LOCATION
              </span>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}
                />
              ) : (
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                  {user?.location || 'Not specified'}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
                <Phone size={14} /> PHONE NUMBER
              </span>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 000-0000"
                  style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}
                />
              ) : (
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                  {user?.phone || 'Not provided'}
                </p>
              )}
            </div>

            {/* Member Since (Read-only) */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
                <Calendar size={14} /> ACCOUNT CREATED
              </span>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                {formattedDate}
              </p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
                <Shield size={14} /> PERMISSION ROLE
              </span>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {user?.role} Access
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} /> Professional Bio & Summary
            </h3>
            {isEditing ? (
              <textarea
                className="input-field"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write a brief professional summary highlighting your core background and achievements..."
                maxLength={500}
                style={{ width: '100%', fontSize: '0.95rem', lineHeight: 1.6 }}
              />
            ) : (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {user?.bio || 'No professional summary provided yet. Click "Edit Profile" to add your bio.'}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div style={{ paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={18} style={{ color: 'var(--primary)' }} /> Technical Skills & Competencies
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Add skills to match with recruiter candidate searches (e.g. React, Node.js, MongoDB, JavaScript).
            </p>

            {/* Editable Skills Tag Input */}
            {isEditing && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', maxWidth: '450px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type a skill and press Enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDownSkill}
                  style={{ fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-secondary"
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
            )}

            {/* Skills Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(isEditing ? formData.skills : user?.skills || []).map((skill, index) => (
                <span
                  key={index}
                  style={{
                    padding: '0.35rem 0.75rem',
                    backgroundColor: 'var(--primary-50, #eff6ff)',
                    border: '1px solid var(--primary-light, #bfdbfe)',
                    borderRadius: 'var(--radius-md, 8px)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--primary, #2563eb)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {skill}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}

              {(!isEditing && (!user?.skills || user.skills.length === 0)) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills listed yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

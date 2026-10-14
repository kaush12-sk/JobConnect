import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Briefcase,
  Building,
  CheckCircle,
} from 'lucide-react';
import Alert from '../components/Alert';

const Register = () => {
  const { register, isAuthenticated, user, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    role: 'jobseeker', // Default: jobseeker
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localError) setLocalError('');
    if (authError) clearError();
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Please enter your full name.';
    }
    if (!formData.email.trim()) {
      return 'Please enter your email address.';
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return 'Please provide a valid email format (e.g. name@example.com).';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match. Please re-check.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const validationMsg = validateForm();
    if (validationMsg) {
      setLocalError(validationMsg);
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      location: formData.location.trim(),
      role: formData.role,
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(79, 70, 229, 0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-md)',
          }}>
            <Briefcase size={26} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Join thousands of professionals and employers on JobConnect
          </p>
        </div>

        {/* Card */}
        <div className="card card-glass" style={{ boxShadow: 'var(--shadow-xl)', padding: '2.5rem' }}>
          {/* Errors */}
          {(localError || authError) && (
            <Alert
              type="danger"
              message={localError || authError}
              onClose={() => {
                setLocalError('');
                clearError();
              }}
            />
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection UI - Job Seeker vs Recruiter (Admin not selectable) */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                Select Your Purpose on JobConnect
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Job Seeker Card */}
                <div
                  onClick={() => handleRoleSelect('jobseeker')}
                  style={{
                    border: formData.role === 'jobseeker' ? '2px solid var(--primary)' : '1.5px solid var(--border-subtle)',
                    backgroundColor: formData.role === 'jobseeker' ? 'var(--primary-50)' : 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                  }}
                  id="role-jobseeker-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <Briefcase size={20} style={{ color: formData.role === 'jobseeker' ? 'var(--primary)' : 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: formData.role === 'jobseeker' ? 'var(--primary)' : 'var(--text-primary)' }}>
                      Job Seeker
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    Find jobs & track your applications
                  </p>
                  {formData.role === 'jobseeker' && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--primary)' }}>
                      <CheckCircle size={16} />
                    </span>
                  )}
                </div>

                {/* Recruiter Card */}
                <div
                  onClick={() => handleRoleSelect('recruiter')}
                  style={{
                    border: formData.role === 'recruiter' ? '2px solid var(--secondary)' : '1.5px solid var(--border-subtle)',
                    backgroundColor: formData.role === 'recruiter' ? '#f0f9ff' : 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                  }}
                  id="role-recruiter-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <Building size={20} style={{ color: formData.role === 'recruiter' ? 'var(--secondary)' : 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: formData.role === 'recruiter' ? '#0284c7' : 'var(--text-primary)' }}>
                      Recruiter
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    Post jobs & hire top tier talent
                  </p>
                  {formData.role === 'recruiter' && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--secondary)' }}>
                      <CheckCircle size={16} />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name *
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon-left" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Work or Personal Email *
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon-left" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="alex.morgan@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Current Location (City, Country)
              </label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon-left" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Password and Confirm Password Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password (min 6) *
                </label>
                <div className="input-with-icon has-right-icon">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 chars"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-right"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: '0.75rem' }}
              id="register-submit-btn"
            >
              {loading ? 'Creating Account...' : `Register as ${formData.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}`}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  LayoutDashboard,
  Search,
  User,
  Building2,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
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

  const roleLabel = {
    jobseeker: 'Job Seeker',
    recruiter: 'Recruiter',
    admin: 'Admin',
  };

  const roleBadgeClass = {
    jobseeker: 'badge-primary',
    recruiter: 'badge-warning',
    admin: 'badge-danger',
  };

  return (
    <nav className={`navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
            <Briefcase size={26} strokeWidth={2.4} />
            <span>JobConnect</span>
            <span className="brand-badge">MERN</span>
          </Link>

          {/* Navigation Links */}
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/jobs"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Jobs
              </NavLink>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                </li>
                {user?.role === 'jobseeker' && (
                  <li>
                    <NavLink
                      to="/applications"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Applications
                    </NavLink>
                  </li>
                )}
                {user?.role === 'recruiter' && (
                  <>
                    <li>
                      <NavLink
                        to="/jobs/create"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Post a Job
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/recruiter/jobs"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Jobs
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/company"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Company
                      </NavLink>
                    </li>
                  </>
                )}
                {user?.role === 'admin' && (
                  <li>
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Console
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </NavLink>
                </li>

              </>
            )}
          </ul>

          {/* Right Actions */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div className="user-profile-pill">
                    <div className="user-avatar">
                      {getInitials(user?.name)}
                    </div>
                    <div className="user-info-text">
                      <span className="user-name">{user?.name}</span>
                      <span className={`badge ${roleBadgeClass[user?.role] || 'badge-primary'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                        {roleLabel[user?.role] || user?.role}
                      </span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign out of JobConnect"
                  id="logout-button"
                >
                  <LogOut size={16} />
                  <span style={{ display: 'none' }}>Sign Out</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-link">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-link">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Building,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [liveJobCount, setLiveJobCount] = useState(0);

  useEffect(() => {
    jobService
      .getJobs({ limit: 1 })
      .then((res) => {
        if (res?.total) setLiveJobCount(res.total);
      })
      .catch(() => {});
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(locationQuery)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '5rem 0 4rem',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(79, 70, 229, 0.12) 0%, rgba(248, 250, 252, 0) 70%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="badge badge-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
              <Sparkles size={14} /> {liveJobCount > 0 ? `${liveJobCount}+ Active Positions` : 'Production MERN Stack Portal'}
            </span>
          </div>


          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.15 }}>
            Discover Your Next Career Move on <span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JobConnect</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            The unified recruitment ecosystem connecting ambitious job seekers with world-class engineering, design, and product companies.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearch}
            className="card card-glass"
            style={{
              padding: '0.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              boxShadow: '0 20px 35px -10px rgba(79, 70, 229, 0.15)',
              marginBottom: '2.5rem',
            }}
          >
            <div style={{ flex: '1 1 240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Job title, keywords, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem', border: 'none', background: 'transparent' }}
              />
            </div>

            <div style={{ width: '1px', height: '32px', background: 'var(--border-subtle)', display: 'none' }} />

            <div style={{ flex: '1 1 200px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="City, State, or Remote"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem', border: 'none', background: 'transparent' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              <Search size={18} />
              <span>Find Jobs</span>
            </button>
          </form>

          {/* Quick Action Links */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Logged in as <strong>{user?.name}</strong> ({user?.role})
              </span>
              <Link to="/dashboard" className="btn btn-outline-primary btn-sm">
                Open Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg" id="home-register-btn">
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" id="home-login-btn">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Dual Audience Pillars */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>Engineered for Both Sides of Hiring</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto' }}>
              Whether you are hunting for high-impact roles or assembling high-performance squads, JobConnect provides dedicated tools.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}>
            {/* Candidate Card */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}>
                  <Briefcase size={26} />
                </div>
                <h3 style={{ marginBottom: '0.75rem' }}>For Job Seekers</h3>
                <p style={{ marginBottom: '1.5rem' }}>
                  Navigate opportunities transparently with structured salaries, clear requirements, and direct application tracking.
                </p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9375rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    <span>Real-time status tracking (Applied, Shortlisted, Selected)</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9375rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    <span>Personalized talent profile & skill tags</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9375rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    <span>Direct connection to verified employer listings</span>
                  </li>
                </ul>
              </div>

              <Link to="/register" className="btn btn-outline-primary btn-block">
                Start as Candidate <ArrowRight size={16} />
              </Link>
            </div>

            {/* Recruiter Card */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}>
                  <Building size={26} />
                </div>
                <h3 style={{ marginBottom: '0.75rem' }}>For Recruiters & Companies</h3>
                <p style={{ marginBottom: '1.5rem' }}>
                  Post open requisitions, showcase your company brand, and manage candidate workflows without messy spreadsheets.
                </p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9375rem' }}>
                    <CheckCircle2 size={18} style={{ color: '#0284c7' }} />
                    <span>Establish and customize your verified Company profile</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9375rem' }}>
                    <CheckCircle2 size={18} style={{ color: '#0284c7' }} />
                    <span>Publish job posts with salary ranges and skill filters</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9375rem' }}>
                    <CheckCircle2 size={18} style={{ color: '#0284c7' }} />
                    <span>Manage candidate pipeline through review stages</span>
                  </li>
                </ul>
              </div>

              <Link to="/register" className="btn btn-primary btn-block">
                Hire Talent <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section style={{ padding: '4rem 0 6rem', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
          }}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>JWT Security</h4>
              <p style={{ fontSize: '0.9rem' }}>
                Encrypted bearer tokens, salted bcrypt hashing, and role-enforced backend API routes.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} />
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Role-Based Routing</h4>
              <p style={{ fontSize: '0.9rem' }}>
                Dedicated dashboards tailored dynamically for Job Seekers, Recruiters, and Admins.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} />
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Pure MERN Foundation</h4>
              <p style={{ fontSize: '0.9rem' }}>
                Strict MongoDB, Express, React, and Node.js architecture with zero unnecessary external bloat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

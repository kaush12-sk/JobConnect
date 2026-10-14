import React from 'react';
import { Briefcase, Heart, Shield, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
        }}>
          {/* Col 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              <Briefcase size={22} style={{ color: 'var(--primary)' }} />
              <span>JobConnect</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              A high-performance recruitment and career discovery platform connecting exceptional talent with forward-thinking employers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem' }}>
              <Terminal size={14} />
              <span>Built with MongoDB, Express, React, and Node.js</span>
            </div>
          </div>

          {/* Col 2: For Job Seekers */}
          <div>
            <h4>For Candidates</h4>
            <ul className="footer-links">
              <li><Link to="/jobs">Browse Opportunities</Link></li>
              <li><Link to="/register">Create Seeker Account</Link></li>
              <li><Link to="/dashboard">Application Tracker</Link></li>
              <li><Link to="/profile">Talent Profile</Link></li>
            </ul>
          </div>

          {/* Col 3: For Recruiters */}
          <div>
            <h4>For Employers</h4>
            <ul className="footer-links">
              <li><Link to="/register">Hire Talent</Link></li>
              <li><Link to="/company">Employer Profile</Link></li>
              <li><Link to="/dashboard">Recruiter Desk</Link></li>
              <li><a href="#pricing">Enterprise Solutions</a></li>
            </ul>
          </div>

          {/* Col 4: Platform Security & Trust */}
          <div>
            <h4>Security & Standards</h4>
            <ul className="footer-links">
              <li><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={14} /> JWT Secured</span></li>
              <li><span>Bcrypt Hash Protection</span></li>
              <li><span>Role-Based Access Control</span></li>
              <li><span>Zero Plaintext Credentials</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} JobConnect Inc. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
            <span>Day 1 Production Foundation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

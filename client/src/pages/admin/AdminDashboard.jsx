import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Building2,
  FileCheck,
  TrendingUp,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Loader2,
  Filter,
} from 'lucide-react';
import {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  getAdminJobs,
  deleteAdminJob,
  getAdminCompanies,
  deleteAdminCompany,
  getAdminApplications,
} from '../../services/adminService';
import StatusBadge from '../../components/StatusBadge';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import SkeletonCard from '../../components/SkeletonCard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('');
  const [jobPage, setJobPage] = useState(1);
  const [jobTotalPages, setJobTotalPages] = useState(1);

  // Companies state
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [companyPage, setCompanyPage] = useState(1);
  const [companyTotalPages, setCompanyTotalPages] = useState(1);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [appPage, setAppPage] = useState(1);
  const [appTotalPages, setAppTotalPages] = useState(1);

  // Action / Feedback states
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'user'|'job'|'company', id, name }
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch Stats on mount or tab change
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await getAdminStats();
      if (data?.stats) setStats(data.stats);
    } catch (err) {
      setActionError(err.message || 'Failed to load platform analytics.');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 2. Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getAdminUsers({
        page: userPage,
        limit: 10,
        role: userRoleFilter || undefined,
        search: userSearch || undefined,
      });
      if (data?.users) {
        setUsers(data.users);
        setUserTotalPages(data.totalPages);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to fetch users list.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userPage, userRoleFilter]);

  // 3. Fetch Jobs
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await getAdminJobs({
        page: jobPage,
        limit: 10,
        status: jobStatusFilter || undefined,
        search: jobSearch || undefined,
      });
      if (data?.jobs) {
        setJobs(data.jobs);
        setJobTotalPages(data.totalPages);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to fetch jobs list.');
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'jobs') fetchJobs();
  }, [activeTab, jobPage, jobStatusFilter]);

  // 4. Fetch Companies
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const data = await getAdminCompanies({
        page: companyPage,
        limit: 10,
        search: companySearch || undefined,
      });
      if (data?.companies) {
        setCompanies(data.companies);
        setCompanyTotalPages(data.totalPages);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to fetch companies list.');
    } finally {
      setCompaniesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'companies') fetchCompanies();
  }, [activeTab, companyPage]);

  // 5. Fetch Applications
  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const data = await getAdminApplications({
        page: appPage,
        limit: 10,
        status: appStatusFilter || undefined,
      });
      if (data?.applications) {
        setApplications(data.applications);
        setAppTotalPages(data.totalPages);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to fetch applications.');
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab, appPage, appStatusFilter]);

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (deleteTarget.type === 'user') {
        await deleteAdminUser(deleteTarget.id);
        setActionSuccess(`User '${deleteTarget.name}' deleted successfully.`);
        fetchUsers();
      } else if (deleteTarget.type === 'job') {
        await deleteAdminJob(deleteTarget.id);
        setActionSuccess(`Job '${deleteTarget.name}' deleted successfully.`);
        fetchJobs();
      } else if (deleteTarget.type === 'company') {
        await deleteAdminCompany(deleteTarget.id);
        setActionSuccess(`Company '${deleteTarget.name}' deleted successfully.`);
        fetchCompanies();
      }
      fetchStats(); // Update global stats
      setDeleteTarget(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete selected resource.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--danger, #dc2626)',
                  backgroundColor: 'var(--danger-50, #fef2f2)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <ShieldAlert size={12} /> System Administrator
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
              Platform Administration Console
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: 0 }}>
              Comprehensive real-time platform metrics, moderation, and data governance powered directly by MongoDB.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1.75rem',
            borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
            paddingBottom: '0.5rem',
            overflowX: 'auto',
          }}
        >
          {[
            { key: 'overview', label: 'Overview & Stats', icon: TrendingUp },
            { key: 'users', label: 'User Directory', icon: Users },
            { key: 'jobs', label: 'Jobs Moderation', icon: Briefcase },
            { key: 'companies', label: 'Companies', icon: Building2 },
            { key: 'applications', label: 'All Applications', icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--primary, #2563eb)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert type="success" message={actionSuccess} />
        </div>
      )}
      {actionError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert type="error" message={actionError} />
        </div>
      )}

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div>
          {statsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <SkeletonCard height="110px" />
              <SkeletonCard height="110px" />
              <SkeletonCard height="110px" />
              <SkeletonCard height="110px" />
            </div>
          ) : stats ? (
            <>
              {/* Primary Stat Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem',
                }}
              >
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Total Registered Users
                    </span>
                    <Users size={18} style={{ color: '#2563eb' }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.users?.total || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    {stats.users?.jobseekers} Seekers · {stats.users?.recruiters} Recruiters · {stats.users?.admins} Admins
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #0891b2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Registered Companies
                    </span>
                    <Building2 size={18} style={{ color: '#0891b2' }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.companies?.total || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    Active verified employer profiles
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #16a34a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Total Job Postings
                    </span>
                    <Briefcase size={18} style={{ color: '#16a34a' }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.jobs?.total || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    {stats.jobs?.active} Active · {stats.jobs?.closed} Closed · {stats.jobs?.draft} Draft
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #9333ea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Total Applications
                    </span>
                    <FileCheck size={18} style={{ color: '#9333ea' }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.applications?.total || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    {stats.applications?.selected} Hired · {stats.applications?.shortlisted} Shortlisted
                  </div>
                </div>
              </div>

              {/* Status Breakdowns Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Application Funnel Breakdown */}
                <div className="card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    Application Pipeline Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { label: 'Applied (New)', count: stats.applications?.applied, color: '#64748b', bg: '#f1f5f9' },
                      { label: 'Under Review', count: stats.applications?.reviewing, color: '#d97706', bg: '#fef3c7' },
                      { label: 'Shortlisted', count: stats.applications?.shortlisted, color: '#2563eb', bg: '#dbeafe' },
                      { label: 'Selected (Hired)', count: stats.applications?.selected, color: '#16a34a', bg: '#dcfce7' },
                      { label: 'Rejected', count: stats.applications?.rejected, color: '#dc2626', bg: '#fee2e2' },
                    ].map((item, idx) => {
                      const total = stats.applications?.total || 1;
                      const percent = Math.round(((item.count || 0) / total) * 100);
                      return (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 600 }}>{item.label}</span>
                            <span><strong>{item.count || 0}</strong> ({percent}%)</span>
                          </div>
                          <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-muted, #f1f5f9)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${percent}%`, backgroundColor: item.color, borderRadius: '4px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Platform Activity Feed */}
                <div className="card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    Recent Signups
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {stats.recentActivity?.users?.map((u) => (
                      <div
                        key={u._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingBottom: '0.6rem',
                          borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>{u.email}</div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: u.role === 'recruiter' ? '#f3e8ff' : '#eff6ff',
                            color: u.role === 'recruiter' ? '#7e22ce' : '#1d4ed8',
                          }}
                        >
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>No statistics available.</div>
          )}
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role:</span>
              <select
                className="input-field"
                value={userRoleFilter}
                onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="">All Roles</option>
                <option value="jobseeker">Job Seekers</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <div style={{ padding: '2rem 0' }}><Loader2 size={28} className="spin-animation" style={{ margin: '0 auto', display: 'block', color: 'var(--primary)' }} /></div>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No users match the search criteria.</p>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>User Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Location</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Joined</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: u.role === 'admin' ? '#fee2e2' : u.role === 'recruiter' ? '#f3e8ff' : '#eff6ff',
                            color: u.role === 'admin' ? '#991b1b' : u.role === 'recruiter' ? '#7e22ce' : '#1d4ed8',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{u.location || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setDeleteTarget({ type: 'user', id: u._id, name: u.name })}
                          className="btn btn-outline"
                          title="Delete User"
                          style={{ padding: '0.3rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger-50)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '1.25rem' }}>
            <Pagination currentPage={userPage} totalPages={userTotalPages} onPageChange={(p) => setUserPage(p)} />
          </div>
        </div>
      )}

      {/* TAB 3: JOBS MODERATION */}
      {activeTab === 'jobs' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search job title or location..."
                value={jobSearch}
                onChange={(e) => { setJobSearch(e.target.value); setJobPage(1); }}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
              <select
                className="input-field"
                value={jobStatusFilter}
                onChange={(e) => { setJobStatusFilter(e.target.value); setJobPage(1); }}
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {jobsLoading ? (
            <div style={{ padding: '2rem 0' }}><Loader2 size={28} className="spin-animation" style={{ margin: '0 auto', display: 'block', color: 'var(--primary)' }} /></div>
          ) : jobs.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No jobs match the filters.</p>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Job Title</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Company</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Recruiter</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Applicants</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        <Link to={`/jobs/${j._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {j.title}
                        </Link>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{j.company?.name || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{j.recruiter?.name || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{j.applicationCount || 0}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: j.status === 'Active' ? 'var(--success-50, #dcfce7)' : 'var(--bg-muted)',
                            color: j.status === 'Active' ? 'var(--success, #16a34a)' : 'var(--text-muted)',
                          }}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <Link to={`/jobs/${j._id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.5rem' }} title="View Public Job">
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget({ type: 'job', id: j._id, name: j.title })}
                            className="btn btn-outline"
                            title="Delete Job"
                            style={{ padding: '0.3rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger-50)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '1.25rem' }}>
            <Pagination currentPage={jobPage} totalPages={jobTotalPages} onPageChange={(p) => setJobPage(p)} />
          </div>
        </div>
      )}

      {/* TAB 4: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search company name, industry, location..."
                value={companySearch}
                onChange={(e) => { setCompanySearch(e.target.value); setCompanyPage(1); }}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {companiesLoading ? (
            <div style={{ padding: '2rem 0' }}><Loader2 size={28} className="spin-animation" style={{ margin: '0 auto', display: 'block', color: 'var(--primary)' }} /></div>
          ) : companies.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No companies registered yet.</p>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Company Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Industry</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Location</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Recruiter</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Active Jobs</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{c.industry || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{c.location || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {c.recruiter?.name} ({c.recruiter?.email})
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{c.jobsCount || 0}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setDeleteTarget({ type: 'company', id: c._id, name: c.name })}
                          className="btn btn-outline"
                          title="Delete Company"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger-50)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '1.25rem' }}>
            <Pagination currentPage={companyPage} totalPages={companyTotalPages} onPageChange={(p) => setCompanyPage(p)} />
          </div>
        </div>
      )}

      {/* TAB 5: APPLICATIONS OVERVIEW */}
      {activeTab === 'applications' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status Filter:</span>
              <select
                className="input-field"
                value={appStatusFilter}
                onChange={(e) => { setAppStatusFilter(e.target.value); setAppPage(1); }}
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {appsLoading ? (
            <div style={{ padding: '2rem 0' }}><Loader2 size={28} className="spin-animation" style={{ margin: '0 auto', display: 'block', color: 'var(--primary)' }} /></div>
          ) : applications.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No applications found.</p>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Candidate</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Job Title</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Company</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Applied Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{app.applicant?.name}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{app.job?.title}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{app.job?.company?.name || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <StatusBadge status={app.status} size="small" />
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <Link to={`/applications/${app._id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '1.25rem' }}>
            <Pagination currentPage={appPage} totalPages={appTotalPages} onPageChange={(p) => setAppPage(p)} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Confirm Deletion`}
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Are you sure you want to proceed?</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            You are about to permanently remove {deleteTarget?.type}:{' '}
            <strong>{deleteTarget?.name}</strong>. This action cannot be undone and will cascade to related applications and data.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => setDeleteTarget(null)}
              className="btn btn-secondary"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="btn"
              disabled={deleting}
              style={{ backgroundColor: 'var(--danger, #dc2626)', color: '#ffffff' }}
            >
              {deleting ? <Loader2 size={16} className="spin-animation" /> : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

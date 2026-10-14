import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { companyService } from '../../services/companyService';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Layers,
  FileText,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';

const JobForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    jobType: 'Full Time',
    experienceLevel: 'Mid Level',
    salaryMin: '',
    salaryMax: '',
    skills: '',
    deadline: '',
    status: 'Active',
  });

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobTypeOptions = ['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote'];
  const experienceOptions = ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead'];
  const statusOptions = ['Active', 'Closed', 'Draft'];

  useEffect(() => {
    const initializeData = async () => {
      try {
        // 1. Fetch recruiter's company first
        const compRes = await companyService.getMyCompany();
        if (!compRes.company) {
          setError('You must create a company profile before posting jobs.');
          setLoading(false);
          return;
        }

        setCompanies([compRes.company]);
        setFormData((prev) => ({ ...prev, company: compRes.company._id, location: compRes.company.location || '' }));

        // 2. If edit mode, fetch job data
        if (isEdit && id) {
          const jobRes = await jobService.getJobById(id);
          const j = jobRes.job;

          // Format deadline to YYYY-MM-DD
          let formattedDeadline = '';
          if (j.deadline) {
            const d = new Date(j.deadline);
            formattedDeadline = d.toISOString().split('T')[0];
          }

          setFormData({
            title: j.title || '',
            description: j.description || '',
            company: j.company?._id || j.company || compRes.company._id,
            location: j.location || '',
            jobType: j.jobType || 'Full Time',
            experienceLevel: j.experienceLevel || 'Mid Level',
            salaryMin: j.salaryMin || '',
            salaryMax: j.salaryMax || '',
            skills: Array.isArray(j.skills) ? j.skills.join(', ') : '',
            deadline: formattedDeadline,
            status: j.status || 'Active',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize form.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.title.trim()) return 'Job title is required.';
    if (!formData.description.trim()) return 'Job description is required.';
    if (!formData.company) return 'Please select an associated company.';
    if (!formData.location.trim()) return 'Job location is required.';
    if (!formData.deadline) return 'Application deadline is required.';

    const min = Number(formData.salaryMin) || 0;
    const max = Number(formData.salaryMax) || 0;

    if (min < 0 || max < 0) {
      return 'Salary values cannot be negative.';
    }

    if (max > 0 && min > max) {
      return 'Minimum salary cannot exceed maximum salary.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        salaryMin: Number(formData.salaryMin) || 0,
        salaryMax: Number(formData.salaryMax) || 0,
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (isEdit) {
        await jobService.updateJob(id, payload);
      } else {
        await jobService.createJob(payload);
      }

      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.message || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" text="Preparing job editor..." />
      </div>
    );
  }

  // If recruiter doesn't have a company profile yet, prompt to create one first
  if (companies.length === 0) {
    return (
      <div style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '3rem 2rem' }}>
            <div className="empty-state-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Building2 size={32} />
            </div>
            <h2>Company Profile Required</h2>
            <p style={{ margin: '1rem auto 2rem', color: 'var(--text-secondary)' }}>
              Before posting an open requisition, you need to configure your company profile so candidates know who they are applying to.
            </p>
            <Link to="/company/create" className="btn btn-primary btn-lg">
              Create Company Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Back Link */}
        <Link
          to="/recruiter/jobs"
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
          <ArrowLeft size={16} /> Back to Recruiter Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-warning">Recruiter Desk</span>
          </div>
          <h1>{isEdit ? 'Edit Job Requisition' : 'Publish a New Job Opportunity'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Reach exceptional talent by providing accurate role scope, skill expectations, and compensation
          </p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div className="card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Job Title *
              </label>
              <div className="input-with-icon">
                <Briefcase size={18} className="input-icon-left" />
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Company and Location Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="company">
                  Company *
                </label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon-left" />
                  <select
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="form-select"
                    style={{ paddingLeft: '2.75rem' }}
                  >
                    {companies.map((comp) => (
                      <option key={comp._id} value={comp._id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">
                  Job Location *
                </label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon-left" />
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Job Type & Experience Level Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="jobType">
                  Employment Type *
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="form-select"
                >
                  {jobTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="experienceLevel">
                  Experience Level *
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="form-select"
                >
                  {experienceOptions.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="salaryMin">
                  Minimum Salary (USD/yr)
                </label>
                <div className="input-with-icon">
                  <DollarSign size={18} className="input-icon-left" />
                  <input
                    id="salaryMin"
                    name="salaryMin"
                    type="number"
                    min="0"
                    placeholder="e.g. 120000"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="salaryMax">
                  Maximum Salary (USD/yr)
                </label>
                <div className="input-with-icon">
                  <DollarSign size={18} className="input-icon-left" />
                  <input
                    id="salaryMax"
                    name="salaryMax"
                    type="number"
                    min="0"
                    placeholder="e.g. 150000"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Deadline & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="deadline">
                  Application Deadline *
                </label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon-left" />
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Publication Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div className="form-group">
              <label className="form-label" htmlFor="skills">
                Required Technical Skills (comma-separated)
              </label>
              <div className="input-with-icon">
                <Tag size={18} className="input-icon-left" />
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  placeholder="e.g. React, Node.js, TypeScript, MongoDB"
                  value={formData.skills}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                Separate skills with commas. These empower our talent search engine.
              </span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Comprehensive Role Description & Expectations *
              </label>
              <textarea
                id="description"
                name="description"
                rows="7"
                required
                placeholder="Outline the mission, primary day-to-day responsibilities, tech stack, and ideal candidate profile..."
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/recruiter/jobs" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                id="submit-job-btn"
              >
                {submitting ? 'Submitting...' : isEdit ? 'Update Requisition' : 'Post Job Requisition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;

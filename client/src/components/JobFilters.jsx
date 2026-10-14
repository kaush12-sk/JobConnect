import React, { useState } from 'react';
import { Filter, RotateCcw, MapPin, Briefcase, DollarSign, Layers } from 'lucide-react';

const JobFilters = ({ filters, onFilterChange, onReset, isMobile, isOpen, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const jobTypes = ['All', 'Full Time', 'Part Time', 'Remote', 'Contract', 'Internship'];
  const experienceLevels = ['All', 'Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead'];

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
    if (onClose) onClose();
  };

  const handleClear = () => {
    const cleared = {
      location: '',
      jobType: 'All',
      experienceLevel: 'All',
      minSalary: '',
      maxSalary: '',
    };
    setLocalFilters(cleared);
    onReset();
    if (onClose) onClose();
  };

  const content = (
    <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--primary)' }} /> Refine Results
        </h3>
        <button
          type="button"
          onClick={handleClear}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <RotateCcw size={14} /> Clear
        </button>
      </div>

      {/* Location Filter */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={15} style={{ color: 'var(--text-muted)' }} /> Location
        </label>
        <input
          type="text"
          placeholder="e.g. New York, Remote..."
          value={localFilters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="form-input"
        />
      </div>

      {/* Job Type Filter */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Briefcase size={15} style={{ color: 'var(--text-muted)' }} /> Job Type
        </label>
        <select
          value={localFilters.jobType || 'All'}
          onChange={(e) => handleChange('jobType', e.target.value)}
          className="form-select"
        >
          {jobTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Experience Level Filter */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={15} style={{ color: 'var(--text-muted)' }} /> Experience Level
        </label>
        <select
          value={localFilters.experienceLevel || 'All'}
          onChange={(e) => handleChange('experienceLevel', e.target.value)}
          className="form-select"
        >
          {experienceLevels.map((exp) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>
      </div>

      {/* Salary Range Filter */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <DollarSign size={15} style={{ color: 'var(--text-muted)' }} /> Salary Range (USD)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min ($)"
            value={localFilters.minSalary || ''}
            onChange={(e) => handleChange('minSalary', e.target.value)}
            className="form-input"
            min="0"
          />
          <input
            type="number"
            placeholder="Max ($)"
            value={localFilters.maxSalary || ''}
            onChange={(e) => handleChange('maxSalary', e.target.value)}
            className="form-input"
            min="0"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingTop: '0.5rem' }}>
        <button type="submit" className="btn btn-primary btn-block">
          Apply Filters
        </button>
        <button type="button" onClick={handleClear} className="btn btn-secondary btn-block">
          Reset All
        </button>
      </div>
    </form>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 2500,
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <div style={{
          width: '85%',
          maxWidth: '340px',
          backgroundColor: 'var(--bg-surface)',
          height: '100%',
          overflowY: 'auto',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-xl)',
        }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.75rem', height: 'fit-content' }}>
      {content}
    </div>
  );
};

export default JobFilters;

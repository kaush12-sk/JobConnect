import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobService } from '../services/jobService';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Briefcase,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import Pagination from '../components/Pagination';
import SkeletonCard from '../components/SkeletonCard';
import Alert from '../components/Alert';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query param initializers
  const initialSearch = searchParams.get('q') || searchParams.get('search') || '';
  const initialLocation = searchParams.get('loc') || searchParams.get('location') || '';
  const initialJobType = searchParams.get('jobType') || 'All';
  const initialExp = searchParams.get('experienceLevel') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  // Search input state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);

  // Filters state
  const [filters, setFilters] = useState({
    location: initialLocation,
    jobType: initialJobType,
    experienceLevel: initialExp,
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
  });

  // Sorting and Pagination
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // API Data state
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mobile Filter Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch jobs from backend with query parameters
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        limit: 9,
        sort: sortBy,
        ...(activeSearch && { search: activeSearch }),
        ...(filters.location && { location: filters.location }),
        ...(filters.jobType && filters.jobType !== 'All' && { jobType: filters.jobType }),
        ...(filters.experienceLevel && filters.experienceLevel !== 'All' && { experienceLevel: filters.experienceLevel }),
        ...(filters.minSalary && { minSalary: filters.minSalary }),
        ...(filters.maxSalary && { maxSalary: filters.maxSalary }),
      };

      // Synchronize URL parameters
      const urlParams = {};
      if (activeSearch) urlParams.q = activeSearch;
      if (filters.location) urlParams.location = filters.location;
      if (filters.jobType && filters.jobType !== 'All') urlParams.jobType = filters.jobType;
      if (filters.experienceLevel && filters.experienceLevel !== 'All') urlParams.experienceLevel = filters.experienceLevel;
      if (sortBy !== 'newest') urlParams.sort = sortBy;
      if (currentPage > 1) urlParams.page = currentPage;
      setSearchParams(urlParams, { replace: true });

      const data = await jobService.getJobs(params);
      setJobs(data.jobs || []);
      setTotalPages(data.totalPages || 1);
      setTotalJobs(data.totalJobs || 0);
    } catch (err) {
      setError(err.message || 'Failed to retrieve jobs.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, activeSearch, filters, setSearchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Search submission handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchQuery.trim());
  };

  // Filter application handler
  const handleFilterChange = (newFilters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveSearch('');
    setCurrentPage(1);
    setFilters({
      location: '',
      jobType: 'All',
      experienceLevel: 'All',
      minSalary: '',
      maxSalary: '',
    });
    setSortBy('newest');
  };

  // Active filter count for badge
  const activeFilterCount = [
    activeSearch,
    filters.location,
    filters.jobType !== 'All' ? filters.jobType : null,
    filters.experienceLevel !== 'All' ? filters.experienceLevel : null,
    filters.minSalary,
    filters.maxSalary,
  ].filter(Boolean).length;

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-primary">
              <Sparkles size={13} /> Active Opportunities
            </span>
          </div>
          <h1>Explore Job Opportunities</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Search, filter, and discover verified roles backed by real-time MongoDB queries
          </p>
        </div>

        {/* Global Search Bar Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 300px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by job title, description, skills (e.g. React, Node.js, Mongoose)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                id="job-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveSearch('');
                    setCurrentPage(1);
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary" id="search-jobs-btn" style={{ padding: '0.7rem 1.5rem' }}>
              <Search size={16} /> Search
            </button>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="btn btn-secondary mobile-filter-btn"
              style={{ display: 'none' }}
            >
              <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </form>
        </div>

        {/* Main Grid: Filters Sidebar + Job Listings */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '2rem',
          alignItems: 'start',
        }} className="jobs-layout-grid">
          {/* Desktop Filters Sidebar */}
          <aside className="desktop-filters-sidebar">
            <JobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Mobile Filters Drawer */}
          <JobFilters
            isMobile
            isOpen={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Jobs Listing Column */}
          <div>
            {/* Controls Bar: Total Count + Sorting Dropdown */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{jobs.length}</strong> of <strong>{totalJobs}</strong> open position{totalJobs === 1 ? '' : 's'}
                {activeFilterCount > 0 && (
                  <span style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                    ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied)
                  </span>
                )}
              </div>

              {/* Sorting Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.875rem' }}
                  id="sort-select"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="salary_desc">Salary: High to Low</option>
                  <option value="salary_asc">Salary: Low to High</option>
                  <option value="title_asc">Job Title: A-Z</option>
                  <option value="title_desc">Job Title: Z-A</option>
                </select>
              </div>
            </div>

            {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

            {/* Job Cards Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              /* Empty State */
              <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
                <div className="empty-state-icon">
                  <Briefcase size={32} />
                </div>
                <h3 className="empty-state-title">No Jobs Found</h3>
                <p className="empty-state-desc">
                  We couldn't find any job requisitions matching your search criteria. Try modifying your keywords or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <RotateCcw size={16} /> Reset Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}>
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .jobs-layout-grid {
              grid-template-columns: 1fr !important;
            }
            .desktop-filters-sidebar {
              display: none !important;
            }
            .mobile-filter-btn {
              display: inline-flex !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Jobs;

import api from './api';

/**
 * Get comprehensive platform statistics for admin dashboard
 */
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

/**
 * Get users with pagination, role filter, search
 * @param {Object} params { page, limit, role, search }
 */
export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

/**
 * Delete a user
 * @param {string} id User ID
 */
export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

/**
 * Get all jobs for moderation
 * @param {Object} params { page, limit, status, search }
 */
export const getAdminJobs = async (params = {}) => {
  const response = await api.get('/admin/jobs', { params });
  return response.data;
};

/**
 * Delete a job
 * @param {string} id Job ID
 */
export const deleteAdminJob = async (id) => {
  const response = await api.delete(`/admin/jobs/${id}`);
  return response.data;
};

/**
 * Get all companies
 * @param {Object} params { page, limit, search }
 */
export const getAdminCompanies = async (params = {}) => {
  const response = await api.get('/admin/companies', { params });
  return response.data;
};

/**
 * Delete a company
 * @param {string} id Company ID
 */
export const deleteAdminCompany = async (id) => {
  const response = await api.delete(`/admin/companies/${id}`);
  return response.data;
};

/**
 * Get all applications
 * @param {Object} params { page, limit, status }
 */
export const getAdminApplications = async (params = {}) => {
  const response = await api.get('/admin/applications', { params });
  return response.data;
};

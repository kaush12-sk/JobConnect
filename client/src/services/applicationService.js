import api from './api';

/**
 * Submit job application with resume file and cover letter
 * @param {FormData} formData
 */
export const submitApplication = async (formData) => {
  const response = await api.post('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get all applications submitted by logged-in job seeker
 */
export const getMyApplications = async () => {
  const response = await api.get('/applications/my-applications');
  return response.data;
};

/**
 * Get single application by ID
 * @param {string} id
 */
export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

/**
 * Withdraw an application
 * @param {string} id
 */
export const withdrawApplication = async (id) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

/**
 * Get applicants for a job (Recruiter only)
 * @param {string} jobId
 */
export const getJobApplications = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

/**
 * Download candidate resume file (Protected blob download)
 * @param {string} applicationId
 * @param {string} filename
 */
export const downloadResume = async (applicationId, filename = 'resume.pdf') => {
  const response = await api.get(`/applications/${applicationId}/resume`, {
    responseType: 'blob',
  });

  // Create temporary URL to trigger browser download
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * Get job seeker application counts & stats
 */
export const getApplicationStats = async () => {
  const response = await api.get('/applications/stats');
  return response.data;
};

/**
 * Check if logged-in user has already applied for a specific job
 * @param {string} jobId
 */
export const checkApplicationStatus = async (jobId) => {
  const response = await api.get(`/applications/check/${jobId}`);
  return response.data;
};

/**
 * Update applicant status (Recruiter who owns the job or Admin)
 * @param {string} id Application ID
 * @param {string} status 'Applied' | 'Reviewing' | 'Shortlisted' | 'Rejected' | 'Selected'
 */
export const updateApplicationStatus = async (id, status) => {
  const response = await api.patch(`/applications/${id}/status`, { status });
  return response.data;
};


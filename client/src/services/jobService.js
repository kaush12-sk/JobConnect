import api from './api';

// Fetch active jobs with search, filters, sorting, and pagination
export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

// Fetch single job by ID
export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

// Recruiter: Create new job
export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

// Recruiter: Update job
export const updateJob = async (id, jobData) => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data;
};

// Recruiter: Delete job
export const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};

// Recruiter: Change job status
export const changeJobStatus = async (id, status) => {
  const response = await api.patch(`/jobs/${id}/status`, { status });
  return response.data;
};

// Recruiter: Fetch posted jobs & live stats
export const getRecruiterJobs = async () => {
  const response = await api.get('/jobs/recruiter/my-jobs');
  return response.data;
};

export const jobService = {
  getJobs,
  getAllJobs: getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  changeJobStatus,
  getRecruiterJobs,
};

export default jobService;


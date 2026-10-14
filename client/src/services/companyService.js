import api from './api';

export const companyService = {
  // Recruiter: Get own company profile
  getMyCompany: async () => {
    const response = await api.get('/companies/recruiter/my-company');
    return response.data;
  },

  // Recruiter: Create company profile
  createCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  // Recruiter: Update company profile
  updateCompany: async (id, companyData) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  // Recruiter: Delete company profile
  deleteCompany: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },

  // Public/All: Get all companies (e.g. for dropdown selection)
  getAllCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  },

  // Public/All: Get company by ID
  getCompanyById: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
};

export default companyService;

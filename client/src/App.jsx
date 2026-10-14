import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Shared Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Recruiter Pages
import CompanyDetail from './pages/company/CompanyDetail';
import CompanyForm from './pages/company/CompanyForm';
import JobForm from './pages/jobs/JobForm';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';

// Day 3 Job Application System Pages
import ApplyJob from './pages/jobs/ApplyJob';
import MyApplications from './pages/applications/MyApplications';
import ApplicationDetail from './pages/applications/ApplicationDetail';
import JobApplicants from './pages/recruiter/JobApplicants';

// Admin Console
import AdminDashboard from './pages/admin/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route element={<MainLayout />}>

            {/* Public Marketplace & Auth Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Recruiter-Only Company Routes */}
            <Route
              path="/company"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CompanyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/create"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CompanyForm isEdit={false} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/edit"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CompanyForm isEdit={true} />
                </ProtectedRoute>
              }
            />

            {/* Recruiter-Only Job Management Routes */}
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs/:jobId/applications"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <JobApplicants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/create"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <JobForm isEdit={false} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <JobForm isEdit={true} />
                </ProtectedRoute>
              }
            />

            {/* Job Seeker Application Routes */}
            <Route
              path="/jobs/:id/apply"
              element={
                <ProtectedRoute allowedRoles={['jobseeker', 'admin']}>
                  <ApplyJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['jobseeker', 'admin']}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/:id"
              element={
                <ProtectedRoute>
                  <ApplicationDetail />
                </ProtectedRoute>
              }
            />

            {/* Admin-Only Management Console */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;


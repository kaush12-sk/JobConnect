/**
 * Automated Verification Script - Day 5 Final Integration Test Suite
 * Uses native fetch (Node.js 18+) for zero external dependency execution.
 * Tests:
 * - Auth, roles, JWT
 * - Job Seeker workflows
 * - Recruiter pipeline & candidate status updates
 * - Admin analytics & resource moderation
 * - Security constraints & role barriers
 */

const BASE_URL = 'http://localhost:5000/api';
let testsPassed = 0;
let testsFailed = 0;

const assert = (condition, description) => {
  if (condition) {
    console.log(`  [PASS] ${description}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${description}`);
    testsFailed++;
  }
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { status: response.status, data, ok: response.ok };
};

const runSuite = async () => {
  console.log('====================================================');
  console.log('  JobConnect MERN Portal - Day 5 Full Integration Test');
  console.log('====================================================\n');

  try {
    // TEST 1: Health check
    console.log('TEST 1: API Server Health Check');
    const health = await apiRequest('/health');
    assert(health.status === 200 && health.data?.success === true, 'Health check returns online status 200');

    // TEST 2: Authentication & Role Sign-ins
    console.log('\nTEST 2: Authentication & Role Sign-ins');

    // Admin login
    const adminLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'admin@jobconnect.com', password: 'admin123' },
    });
    assert(adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin', 'Admin logs in with admin role');
    const adminToken = adminLogin.data?.token;

    // Recruiter 1 (Sarah) login
    const recruiter1Login = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'sarah.talent@techcorp.com', password: 'password123' },
    });
    assert(recruiter1Login.status === 200 && recruiter1Login.data?.user?.role === 'recruiter', 'Recruiter 1 logs in successfully');
    const recruiter1Token = recruiter1Login.data?.token;

    // Recruiter 2 (David) login
    const recruiter2Login = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'david.hr@nexusai.com', password: 'password123' },
    });
    assert(recruiter2Login.status === 200 && recruiter2Login.data?.user?.role === 'recruiter', 'Recruiter 2 logs in successfully');
    const recruiter2Token = recruiter2Login.data?.token;

    // Job Seeker (John) login
    const seekerLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'john.seeker@example.com', password: 'password123' },
    });
    assert(seekerLogin.status === 200 && seekerLogin.data?.user?.role === 'jobseeker', 'Job Seeker logs in successfully');
    const seekerToken = seekerLogin.data?.token;

    // TEST 3: Invalid login & Duplicate email rejection
    console.log('\nTEST 3: Auth Security & Edge Case Rejections');
    const wrongPass = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'john.seeker@example.com', password: 'wrongpassword' },
    });
    assert(wrongPass.status === 401, 'Invalid password correctly rejected with 401');

    const duplicateEmail = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Seeker',
        email: 'john.seeker@example.com',
        password: 'password123',
        role: 'jobseeker',
      },
    });
    assert(duplicateEmail.status === 400 || duplicateEmail.status === 409, 'Duplicate email correctly rejected with 400/409');

    // TEST 4: Role-Based Authorization Barriers
    console.log('\nTEST 4: Role-Based Authorization Enforcement');
    const seekerAccessAdmin = await apiRequest('/admin/stats', { token: seekerToken });
    assert(seekerAccessAdmin.status === 403, 'Job Seeker strictly forbidden (403) from accessing admin routes');

    const recruiterAccessAdmin = await apiRequest('/admin/stats', { token: recruiter1Token });
    assert(recruiterAccessAdmin.status === 403, 'Recruiter strictly forbidden (403) from accessing admin routes');

    // TEST 5: Admin Platform Analytics
    console.log('\nTEST 5: Admin Real MongoDB Statistics & Overview');
    const adminStats = await apiRequest('/admin/stats', { token: adminToken });
    const s = adminStats.data?.stats;
    assert(adminStats.status === 200, 'Admin successfully accesses /api/admin/stats');
    assert(s && s.users?.total >= 5, `Real MongoDB user count verified (${s?.users?.total} users)`);
    assert(s && s.companies?.total >= 2, `Real MongoDB companies count verified (${s?.companies?.total} companies)`);
    assert(s && s.jobs?.total >= 6, `Real MongoDB jobs count verified (${s?.jobs?.total} jobs)`);
    assert(s && s.applications?.total >= 4, `Real MongoDB applications count verified (${s?.applications?.total} applications)`);

    // TEST 6: Recruiter Pipeline & Candidate Status Management
    console.log('\nTEST 6: Recruiter Candidate Pipeline & Status Transitions');
    const recruiterJobs = await apiRequest('/jobs/recruiter/my-jobs', { token: recruiter1Token });
    assert(recruiterJobs.status === 200 && recruiterJobs.data?.jobs?.length > 0, 'Recruiter fetches own jobs with application counts');
    const targetJob = recruiterJobs.data.jobs.find((j) => (j.applicationCount || 0) > 0) || recruiterJobs.data.jobs[0];

    const applicants = await apiRequest(`/applications/job/${targetJob._id}`, { token: recruiter1Token });
    assert(applicants.status === 200 && applicants.data?.applications?.length > 0, 'Recruiter fetches applicants for job');
    const targetApp = applicants.data.applications[0];


    const updateStatus = await apiRequest(`/applications/${targetApp._id}/status`, {
      method: 'PATCH',
      token: recruiter1Token,
      body: { status: 'Shortlisted' },
    });
    assert(updateStatus.status === 200 && updateStatus.data?.application?.status === 'Shortlisted', 'Recruiter successfully transitions candidate status to Shortlisted');

    // TEST 7: Cross-Recruiter Ownership Protection
    console.log('\nTEST 7: Cross-Recruiter Ownership Enforcement');
    const crossUpdate = await apiRequest(`/applications/${targetApp._id}/status`, {
      method: 'PATCH',
      token: recruiter2Token,
      body: { status: 'Rejected' },
    });
    assert(crossUpdate.status === 403, 'Recruiter 2 forbidden (403) from updating Recruiter 1 candidate status');

    const crossView = await apiRequest(`/applications/job/${targetJob._id}`, { token: recruiter2Token });
    assert(crossView.status === 403, 'Recruiter 2 forbidden (403) from viewing Recruiter 1 applicant pipeline');

    // TEST 8: Resume Download Authorization
    console.log('\nTEST 8: Protected Resume Stream & Authorization');
    const recruiterDownload = await apiRequest(`/applications/${targetApp._id}/resume`, { token: recruiter1Token });
    assert(recruiterDownload.status === 200, 'Authorized Recruiter successfully downloads candidate resume stream');

    const seeker2Login = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'emily.dev@example.com', password: 'password123' },
    });
    const seeker2Token = seeker2Login.data?.token;

    if (targetApp.applicant?._id !== seeker2Login.data?.user?._id) {
      const unauthorizedDownload = await apiRequest(`/applications/${targetApp._id}/resume`, { token: seeker2Token });
      assert(unauthorizedDownload.status === 403, 'Unrelated user forbidden (403) from downloading candidate resume');
    }

    // TEST 9: Job Seeker Withdrawal Restrictions
    console.log('\nTEST 9: Seeker Withdrawal Rules & Status Consistency');
    const myApps = await apiRequest('/applications/my-applications', { token: seekerToken });
    assert(myApps.status === 200 && myApps.data?.applications?.length > 0, 'Seeker fetches their active applications');

    const selectedApp = myApps.data.applications.find((a) => a.status === 'Selected');
    if (selectedApp) {
      const withdrawSelected = await apiRequest(`/applications/${selectedApp._id}`, {
        method: 'DELETE',
        token: seekerToken,
      });
      assert(withdrawSelected.status === 400, 'Withdrawal of Selected application rejected with 400');
    }

    // TEST 10: Admin Management & Moderation
    console.log('\nTEST 10: Admin Management (Users, Jobs, Companies, Self-Delete Barrier)');
    const adminUsers = await apiRequest('/admin/users', { token: adminToken });
    assert(adminUsers.status === 200 && adminUsers.data?.users?.length > 0, 'Admin fetches paginated user directory');

    const adminJobs = await apiRequest('/admin/jobs', { token: adminToken });
    assert(adminJobs.status === 200 && adminJobs.data?.jobs?.length > 0, 'Admin fetches all job requisitions');

    const adminCompanies = await apiRequest('/admin/companies', { token: adminToken });
    assert(adminCompanies.status === 200 && adminCompanies.data?.companies?.length > 0, 'Admin fetches all company profiles');

    const adminApps = await apiRequest('/admin/applications', { token: adminToken });
    assert(adminApps.status === 200 && adminApps.data?.applications?.length > 0, 'Admin fetches all applications across the platform');

    // Admin self-deletion prevention
    const selfDelete = await apiRequest(`/admin/users/${adminLogin.data?.user?._id}`, {
      method: 'DELETE',
      token: adminToken,
    });
    assert(selfDelete.status === 400, 'Admin self-deletion strictly prohibited (400)');

    console.log('\n====================================================');
    console.log(`  Test Suite Completed: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('====================================================\n');

    if (testsFailed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (fatalErr) {
    console.error('[Fatal Test Error]', fatalErr);
    process.exit(1);
  }
};

runSuite();

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function api(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function verifyAll() {
  console.log('====================================================');
  console.log('  JobConnect Day 3: Complete 20-Point Test Suite    ');
  console.log('====================================================\n');

  // TEST 1: Register job seeker
  console.log('TEST 1: Register new job seeker...');
  const randomSuffix = Math.floor(Math.random() * 10000);
  const seekerEmail = `applicant_${randomSuffix}@test.com`;
  const regRes = await api('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Candidate ${randomSuffix}`,
      email: seekerEmail,
      password: 'password123',
      role: 'jobseeker',
      location: 'Austin, TX',
      phone: '+1 512 555 0199',
      skills: ['React', 'Node.js', 'Express', 'MongoDB'],
      bio: 'Enthusiastic full-stack engineer seeking new challenges.',
    }),
  });
  console.log(` -> Status: ${regRes.status}. Registered user: ${regRes.data?.user?.email}`);
  if (regRes.status !== 201) throw new Error('TEST 1 failed: Registration failed.');

  // TEST 2: Login
  console.log('\nTEST 2: Login as job seeker...');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: seekerEmail, password: 'password123' }),
  });
  console.log(` -> Status: ${loginRes.status}. Token issued.`);
  if (loginRes.status !== 200 || !loginRes.data?.token) throw new Error('TEST 2 failed: Login failed.');
  const seekerToken = loginRes.data.token;
  const seekerUser = loginRes.data.user;

  // TEST 3: Browse active jobs
  console.log('\nTEST 3: Browse active jobs...');
  const jobsRes = await api('/jobs');
  console.log(` -> Status: ${jobsRes.status}. Found ${jobsRes.data?.jobs?.length} active jobs.`);
  if (!jobsRes.data?.jobs || jobsRes.data.jobs.length === 0) throw new Error('TEST 3 failed: No active jobs found.');
  const testJob = jobsRes.data.jobs[0];

  // TEST 4: Open job details
  console.log(`\nTEST 4: Open job details for "${testJob.title}"...`);
  const jobDetailRes = await api(`/jobs/${testJob._id}`);
  console.log(` -> Status: ${jobDetailRes.status}. Job title verified: ${jobDetailRes.data?.job?.title}`);
  if (jobDetailRes.status !== 200) throw new Error('TEST 4 failed: Could not fetch job details.');

  // TEST 5: Apply to job (with PDF resume and cover letter)
  console.log('\nTEST 5: Apply to job with multipart FormData resume and cover letter...');
  const testPdfPath = path.join(__dirname, 'temp_test_resume.pdf');
  fs.writeFileSync(testPdfPath, '%PDF-1.4 %Test candidate resume binary bytes for JobConnect');
  const pdfBlob = new Blob([fs.readFileSync(testPdfPath)], { type: 'application/pdf' });

  const formData = new FormData();
  formData.append('jobId', testJob._id);
  formData.append('coverLetter', 'I am excited to apply for this role. My background in React and Node.js makes me a strong fit.');
  formData.append('resume', pdfBlob, 'Candidate_Resume.pdf');

  const applyRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${seekerToken}` },
    body: formData,
  });
  const applyData = await applyRes.json();
  console.log(` -> Status: ${applyRes.status}. Message: ${applyData.message}`);
  if (applyRes.status !== 201 || !applyData.application) throw new Error('TEST 5 failed: Apply failed.');
  const createdApp = applyData.application;

  // TEST 6: Verify application exists in MongoDB & physical file exists
  console.log('\nTEST 6: Verify application exists in MongoDB and resume on disk...');
  const physicalPath = path.join(__dirname, 'uploads/resumes', createdApp.resume.storedName);
  const fileOnDisk = fs.existsSync(physicalPath);
  console.log(` -> MongoDB record: ID ${createdApp._id}, Status: ${createdApp.status}`);
  console.log(` -> Disk file exists: ${fileOnDisk} at ${createdApp.resume.storedName}`);
  if (!fileOnDisk) throw new Error('TEST 6 failed: Physical resume file missing on server disk.');

  // TEST 7: Try applying again -> Duplicate application rejected (409)
  console.log('\nTEST 7: Try applying again to same job (Duplicate Protection)...');
  const dupFormData = new FormData();
  dupFormData.append('jobId', testJob._id);
  dupFormData.append('coverLetter', 'Trying to apply a second time.');
  dupFormData.append('resume', pdfBlob, 'Candidate_Resume.pdf');

  const dupRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${seekerToken}` },
    body: dupFormData,
  });
  const dupData = await dupRes.json();
  console.log(` -> Status: ${dupRes.status}. Message: "${dupData.message}"`);
  if (dupRes.status !== 409) throw new Error('TEST 7 failed: Duplicate application was NOT rejected with 409.');

  // TEST 8: Open My Applications
  console.log('\nTEST 8: Open My Applications (/api/applications/my-applications)...');
  const myAppsRes = await api('/applications/my-applications', {
    headers: { Authorization: `Bearer ${seekerToken}` },
  });
  console.log(` -> Status: ${myAppsRes.status}. Count: ${myAppsRes.data?.count}`);
  if (myAppsRes.status !== 200 || myAppsRes.data.count < 1) throw new Error('TEST 8 failed: My applications empty.');

  // TEST 9: Open application details
  console.log(`\nTEST 9: Open application details (/api/applications/${createdApp._id})...`);
  const appDetailRes = await api(`/applications/${createdApp._id}`, {
    headers: { Authorization: `Bearer ${seekerToken}` },
  });
  console.log(` -> Status: ${appDetailRes.status}. Status: ${appDetailRes.data?.application?.status}`);
  if (appDetailRes.status !== 200) throw new Error('TEST 9 failed: Application details failed.');

  // TEST 10: Withdraw application
  console.log(`\nTEST 10: Withdraw application (/api/applications/${createdApp._id})...`);
  const withdrawRes = await api(`/applications/${createdApp._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${seekerToken}` },
  });
  console.log(` -> Status: ${withdrawRes.status}. Message: "${withdrawRes.data?.message}"`);
  if (withdrawRes.status !== 200) throw new Error('TEST 10 failed: Withdrawal failed.');

  // TEST 11: Verify withdrawal
  console.log('\nTEST 11: Verify application record has been removed...');
  const verifyWithdrawRes = await api(`/applications/${createdApp._id}`, {
    headers: { Authorization: `Bearer ${seekerToken}` },
  });
  console.log(` -> Status: ${verifyWithdrawRes.status} (Expected 404).`);
  if (verifyWithdrawRes.status !== 404) throw new Error('TEST 11 failed: Application still exists after withdrawal.');

  // TEST 12: Try accessing another user's application (403/404)
  console.log('\nTEST 12: Unauthorized user attempts to view private application...');
  // Re-apply so we have a live application to test
  const reApplyRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${seekerToken}` },
    body: formData,
  });
  const reApplyData = await reApplyRes.json();
  const activeAppId = reApplyData.application._id;

  // Register a second job seeker (intruder)
  const intruderRes = await api('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Intruder User',
      email: `intruder_${randomSuffix}@test.com`,
      password: 'password123',
      role: 'jobseeker',
    }),
  });
  const intruderToken = intruderRes.data.token;

  const intruderCheckRes = await api(`/applications/${activeAppId}`, {
    headers: { Authorization: `Bearer ${intruderToken}` },
  });
  console.log(` -> Intruder access status: ${intruderCheckRes.status} (Expected 403 Forbidden).`);
  if (intruderCheckRes.status !== 403) throw new Error('TEST 12 failed: Unauthorized access was not forbidden.');

  // TEST 13: Login as recruiter
  console.log('\nTEST 13: Login as Recruiter...');
  const recLoginRes = await api('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah.talent@techcorp.com', password: 'password123' }),
  });
  console.log(` -> Status: ${recLoginRes.status}. Recruiter authenticated.`);
  if (recLoginRes.status !== 200) throw new Error('TEST 13 failed: Recruiter login failed.');
  const recruiterToken = recLoginRes.data.token;

  // TEST 14: Open recruiter jobs
  console.log('\nTEST 14: Open recruiter jobs (/api/jobs/recruiter/my-jobs)...');
  const recJobsRes = await api('/jobs/recruiter/my-jobs', {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  console.log(` -> Status: ${recJobsRes.status}. Recruiter has ${recJobsRes.data?.jobs?.length} jobs.`);
  if (recJobsRes.status !== 200) throw new Error('TEST 14 failed: Recruiter jobs query failed.');

  // TEST 15: View applications for own job
  console.log(`\nTEST 15: Recruiter views applicants for own job (${testJob._id})...`);
  const recViewAppsRes = await api(`/applications/job/${testJob._id}`, {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  console.log(` -> Status: ${recViewAppsRes.status}. Found ${recViewAppsRes.data?.applications?.length} applicants.`);
  if (recViewAppsRes.status !== 200) throw new Error('TEST 15 failed: Recruiter applicant view failed.');

  // TEST 16: Attempt to access another recruiter's job applications -> 403 Access Denied
  console.log('\nTEST 16: Recruiter B attempts to view Recruiter A\'s applicants...');
  // Register Recruiter B
  const recBRes = await api('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Competitor Recruiter',
      email: `recruiterB_${randomSuffix}@other.com`,
      password: 'password123',
      role: 'recruiter',
    }),
  });
  const recBToken = recBRes.data.token;

  const recBAccessRes = await api(`/applications/job/${testJob._id}`, {
    headers: { Authorization: `Bearer ${recBToken}` },
  });
  console.log(` -> Recruiter B access status: ${recBAccessRes.status} (Expected 403 Forbidden). Message: "${recBAccessRes.data?.message}"`);
  if (recBAccessRes.status !== 403) throw new Error('TEST 16 failed: Cross-recruiter applicant access was not denied.');

  // TEST 17: Try applying to a closed job -> Rejected (400)
  console.log('\nTEST 17: Candidate attempts to apply to a Closed job...');
  // Create a closed job using recruiter
  const closedJobRes = await api('/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${recruiterToken}`,
    },
    body: JSON.stringify({
      title: `Archived Test Job ${randomSuffix}`,
      description: 'This is an archived job position that should reject applications.',
      company: testJob.company?._id || testJob.company,
      location: 'Remote',
      jobType: 'Full Time',
      experienceLevel: 'Senior',
      salaryMin: 120000,
      salaryMax: 150000,
      deadline: '2028-12-31',
      status: 'Closed',
    }),
  });
  const closedJobId = closedJobRes.data.job._id;

  const applyClosedFormData = new FormData();
  applyClosedFormData.append('jobId', closedJobId);
  applyClosedFormData.append('coverLetter', 'Trying to apply to a closed job.');
  applyClosedFormData.append('resume', pdfBlob, 'Candidate_Resume.pdf');

  const applyClosedRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${seekerToken}` },
    body: applyClosedFormData,
  });
  const applyClosedData = await applyClosedRes.json();
  console.log(` -> Status: ${applyClosedRes.status}. Message: "${applyClosedData.message}"`);
  if (applyClosedRes.status !== 400) throw new Error('TEST 17 failed: Application to closed job was not rejected.');

  // TEST 18: Try applying after deadline -> Rejected (400)
  console.log('\nTEST 18: Candidate attempts to apply after deadline has passed...');
  const expiredJobRes = await api('/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${recruiterToken}`,
    },
    body: JSON.stringify({
      title: `Expired Deadline Job ${randomSuffix}`,
      description: 'This job deadline is in the past.',
      company: testJob.company?._id || testJob.company,
      location: 'Remote',
      jobType: 'Full Time',
      experienceLevel: 'Senior',
      salaryMin: 100000,
      salaryMax: 130000,
      deadline: '2020-01-01',
      status: 'Active',
    }),
  });
  const expiredJobId = expiredJobRes.data.job._id;

  const applyExpiredFormData = new FormData();
  applyExpiredFormData.append('jobId', expiredJobId);
  applyExpiredFormData.append('coverLetter', 'Trying to apply after deadline.');
  applyExpiredFormData.append('resume', pdfBlob, 'Candidate_Resume.pdf');

  const applyExpiredRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${seekerToken}` },
    body: applyExpiredFormData,
  });
  const applyExpiredData = await applyExpiredRes.json();
  console.log(` -> Status: ${applyExpiredRes.status}. Message: "${applyExpiredData.message}"`);
  if (applyExpiredRes.status !== 400) throw new Error('TEST 18 failed: Expired deadline application was not rejected.');

  // TEST 19: File size limit check (> 5 MB rejected)
  console.log('\nTEST 19: Attempt to upload file exceeding 5 MB limit...');
  const bigBuffer = Buffer.alloc(6 * 1024 * 1024); // 6 MB
  const bigBlob = new Blob([bigBuffer], { type: 'application/pdf' });
  const bigFormData = new FormData();
  bigFormData.append('jobId', testJob._id);
  bigFormData.append('coverLetter', 'Attempting 6 MB file upload.');
  bigFormData.append('resume', bigBlob, 'Huge_Resume.pdf');

  const bigRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${seekerToken}` },
    body: bigFormData,
  });
  const bigData = await bigRes.json();
  console.log(` -> Status: ${bigRes.status}. Message: "${bigData.message}"`);
  if (bigRes.status !== 400) throw new Error('TEST 19 failed: Oversize file was not rejected.');

  // TEST 20: Test protected resume download endpoint
  console.log('\nTEST 20: Protected resume download authorization check...');
  const downloadRes = await fetch(`${BASE_URL}/applications/${activeAppId}/resume`, {
    headers: { Authorization: `Bearer ${seekerToken}` },
  });
  console.log(` -> Candidate download status: ${downloadRes.status}, Content-Type: ${downloadRes.headers.get('content-type')}`);
  if (downloadRes.status !== 200) throw new Error('TEST 20 failed: Candidate could not download own resume.');

  // Intruder download should be 403
  const intruderDownloadRes = await fetch(`${BASE_URL}/applications/${activeAppId}/resume`, {
    headers: { Authorization: `Bearer ${intruderToken}` },
  });
  console.log(` -> Intruder download status: ${intruderDownloadRes.status} (Expected 403 Forbidden).`);
  if (intruderDownloadRes.status !== 403) throw new Error('TEST 20 failed: Intruder was able to download resume.');

  // Cleanup temp files
  if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);

  console.log('\n====================================================');
  console.log('  ALL 20 DAY 3 VERIFICATION TESTS PASSED SUCCESSFULLY!  ');
  console.log('====================================================');
}

verifyAll().catch((err) => {
  console.error('\n*** TEST FAILURE ***:', err);
  process.exit(1);
});

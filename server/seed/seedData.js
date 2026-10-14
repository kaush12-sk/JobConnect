const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // 0. Ensure uploads/resumes directory exists and has sample resumes
    const uploadsDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sampleResume1Path = path.join(uploadsDir, 'sample_john_resume.pdf');
    if (!fs.existsSync(sampleResume1Path)) {
      fs.writeFileSync(
        sampleResume1Path,
        '%PDF-1.4\n%Demo PDF Resume Content for John Seeker (Full-Stack Engineer)\n1 0 obj\n<< /Title (John Seeker Resume) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
      );
    }

    const sampleResume2Path = path.join(uploadsDir, 'sample_emily_resume.pdf');
    if (!fs.existsSync(sampleResume2Path)) {
      fs.writeFileSync(
        sampleResume2Path,
        '%PDF-1.4\n%Demo PDF Resume Content for Emily Dev (Frontend Specialist)\n1 0 obj\n<< /Title (Emily Dev Resume) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
      );
    }

    // 1. Clean existing records for a pristine demo baseline
    console.log('[Seed] Clearing existing collections...');
    await Application.deleteMany({});
    await Job.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});

    // 2. Create Users
    console.log('[Seed] Creating demo users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@jobconnect.com',
      password: 'admin123',
      role: 'admin',
      location: 'San Francisco, CA',
      bio: 'Platform super administrator with moderation, analytics, and data management privileges.',
    });

    const recruiter1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.talent@techcorp.com',
      password: 'password123',
      role: 'recruiter',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      bio: 'Senior Technical Talent Lead at TechCorp Global focusing on engineering and architecture hiring.',
    });

    const recruiter2 = await User.create({
      name: 'David Vance',
      email: 'david.hr@nexusai.com',
      password: 'password123',
      role: 'recruiter',
      phone: '+1 (555) 876-5432',
      location: 'San Francisco, CA',
      bio: 'Head of People at Nexus AI Labs sourcing leading AI researchers and frontend architects.',
    });

    const seeker1 = await User.create({
      name: 'John Seeker',
      email: 'john.seeker@example.com',
      password: 'password123',
      role: 'jobseeker',
      phone: '+1 (555) 987-6543',
      location: 'New York, NY',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'REST APIs'],
      bio: 'Passionate Full Stack Developer with 4 years building reactive, high-performance web applications using the MERN stack.',
    });

    const seeker2 = await User.create({
      name: 'Emily Davis',
      email: 'emily.dev@example.com',
      password: 'password123',
      role: 'jobseeker',
      phone: '+1 (555) 456-7890',
      location: 'Austin, TX',
      skills: ['React', 'CSS3', 'TypeScript', 'UI/UX', 'Figma', 'HTML5'],
      bio: 'Frontend engineer with an eye for pixel-perfect user interfaces, fluid animations, and accessibility.',
    });

    console.log('[Seed] Users created:');
    console.log(' - Admin: admin@jobconnect.com / admin123');
    console.log(' - Recruiter 1: sarah.talent@techcorp.com / password123');
    console.log(' - Recruiter 2: david.hr@nexusai.com / password123');
    console.log(' - Job Seeker 1: john.seeker@example.com / password123');
    console.log(' - Job Seeker 2: emily.dev@example.com / password123');

    // 3. Create Companies
    console.log('[Seed] Creating companies...');
    const company1 = await Company.create({
      name: 'TechCorp Global',
      description: 'Global cloud solutions and high-throughput enterprise architectures powering Fortune 500 tech platforms.',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      website: 'https://techcorp-example.com',
      location: 'New York, NY',
      industry: 'Enterprise Software & Cloud',
      recruiter: recruiter1._id,
    });

    const company2 = await Company.create({
      name: 'Nexus AI Labs',
      description: 'Pioneering multimodal machine learning models, real-time developer tooling, and modern web application platforms.',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      website: 'https://nexusai-example.com',
      location: 'San Francisco, CA',
      industry: 'Artificial Intelligence & SaaS',
      recruiter: recruiter2._id,
    });

    // 4. Create Jobs
    console.log('[Seed] Creating job requisitions...');
    const job1 = await Job.create({
      title: 'Senior Full Stack React Developer',
      description: 'Lead frontend and API integration for our high-throughput enterprise dashboard using React 18, Vite, and Node.js REST microservices. You will architect reusable component systems and collaborate with data teams.',
      company: company1._id,
      recruiter: recruiter1._id,
      location: 'New York, NY',
      jobType: 'Full Time',
      experienceLevel: 'Senior',
      salaryMin: 140000,
      salaryMax: 175000,
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      status: 'Active',
    });

    const job2 = await Job.create({
      title: 'Backend Node.js & Mongoose Architect',
      description: 'Design robust database schemas, query optimization, high-security JWT authentication, and Express middleware architectures. Requires deep understanding of MongoDB indexes and aggregation pipelines.',
      company: company1._id,
      recruiter: recruiter1._id,
      location: 'Remote',
      jobType: 'Remote',
      experienceLevel: 'Lead',
      salaryMin: 160000,
      salaryMax: 195000,
      skills: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'System Design'],
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'Active',
    });

    const job3 = await Job.create({
      title: 'Junior Frontend Developer',
      description: 'Build responsive web interfaces, implement sleek UI design tokens, component libraries, and client state management. Excellent opportunity to learn production React practices from senior mentors.',
      company: company2._id,
      recruiter: recruiter2._id,
      location: 'San Francisco, CA',
      jobType: 'Full Time',
      experienceLevel: 'Junior',
      salaryMin: 85000,
      salaryMax: 105000,
      skills: ['JavaScript', 'React', 'CSS3', 'Git', 'HTML5'],
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'Active',
    });

    const job4 = await Job.create({
      title: 'Cloud DevOps & Platform Engineer',
      description: 'Maintain high-availability MongoDB clusters, automate CI/CD pipelines, containerize microservices, and ensure sub-second latency across global infrastructure.',
      company: company2._id,
      recruiter: recruiter2._id,
      location: 'Remote',
      jobType: 'Contract',
      experienceLevel: 'Mid Level',
      salaryMin: 110000,
      salaryMax: 140000,
      skills: ['Docker', 'MongoDB', 'AWS', 'Linux', 'CI/CD'],
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'Active',
    });

    const job5 = await Job.create({
      title: 'Frontend UI/UX Engineering Intern',
      description: 'Work closely with staff product designers to build micro-interactions, responsive navigation, and accessible form components.',
      company: company1._id,
      recruiter: recruiter1._id,
      location: 'New York, NY',
      jobType: 'Internship',
      experienceLevel: 'Entry Level',
      salaryMin: 45000,
      salaryMax: 60000,
      skills: ['React', 'CSS', 'JavaScript', 'Figma'],
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Active',
    });

    const jobClosed = await Job.create({
      title: 'Legacy API Migration Lead (Closed)',
      description: 'Completed migration requisition. Position successfully filled.',
      company: company1._id,
      recruiter: recruiter1._id,
      location: 'New York, NY',
      jobType: 'Full Time',
      experienceLevel: 'Senior',
      salaryMin: 150000,
      salaryMax: 180000,
      skills: ['Node.js', 'MongoDB', 'Legacy APIs'],
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired
      status: 'Closed',
    });

    const jobDraft = await Job.create({
      title: 'AI Prompt & Tools Specialist (Draft)',
      description: 'Internal requisition draft under executive budget review.',
      company: company2._id,
      recruiter: recruiter2._id,
      location: 'San Francisco, CA',
      jobType: 'Part Time',
      experienceLevel: 'Mid Level',
      salaryMin: 70000,
      salaryMax: 90000,
      skills: ['Python', 'AI Prompts', 'Evaluation'],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'Draft',
    });

    // 5. Create Applications
    console.log('[Seed] Creating demo candidate applications...');
    await Application.create({
      job: job1._id,
      applicant: seeker1._id,
      resume: {
        originalName: 'John_Seeker_Resume.pdf',
        storedName: 'sample_john_resume.pdf',
        path: '/uploads/resumes/sample_john_resume.pdf',
        mimeType: 'application/pdf',
        size: 10240,
      },
      coverLetter: 'I have extensive experience building scalable MERN stack web applications and micro-frontend architectures. I am excited to apply my React 18 expertise to TechCorp Global.',
      status: 'Shortlisted',
      appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      job: job1._id,
      applicant: seeker2._id,
      resume: {
        originalName: 'Emily_Davis_Resume.pdf',
        storedName: 'sample_emily_resume.pdf',
        path: '/uploads/resumes/sample_emily_resume.pdf',
        mimeType: 'application/pdf',
        size: 12400,
      },
      coverLetter: 'As a passionate UI engineer with strong React and CSS design token background, I would love the chance to elevate TechCorp’s enterprise user experience.',
      status: 'Reviewing',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      job: job2._id,
      applicant: seeker1._id,
      resume: {
        originalName: 'John_Seeker_Resume.pdf',
        storedName: 'sample_john_resume.pdf',
        path: '/uploads/resumes/sample_john_resume.pdf',
        mimeType: 'application/pdf',
        size: 10240,
      },
      coverLetter: 'I have spent years crafting bulletproof Node.js Express APIs, custom middleware, and complex MongoDB aggregations. Looking forward to architecting high-availability backends.',
      status: 'Selected',
      appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      job: job3._id,
      applicant: seeker2._id,
      resume: {
        originalName: 'Emily_Davis_Resume.pdf',
        storedName: 'sample_emily_resume.pdf',
        path: '/uploads/resumes/sample_emily_resume.pdf',
        mimeType: 'application/pdf',
        size: 12400,
      },
      coverLetter: 'Nexus AI Labs is at the forefront of tech, and I am eager to contribute clean, accessible React components and contribute to the developer experience.',
      status: 'Applied',
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seed] Seed completed successfully!');
    console.log('[Seed] Database populated with:');
    console.log(` - 5 Users (1 Admin, 2 Recruiters, 2 Job Seekers)`);
    console.log(` - 2 Companies (TechCorp Global, Nexus AI Labs)`);
    console.log(` - 7 Jobs (5 Active, 1 Closed, 1 Draft)`);
    console.log(` - 4 Applications with sample resumes & realistic statuses`);

    await mongoose.connection.close();
    console.log('[Seed] Database connection closed gracefully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();

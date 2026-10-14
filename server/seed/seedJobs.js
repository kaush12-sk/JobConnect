const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const sampleJobs = [
  {
    title: 'React Frontend Developer',
    description: 'Build responsive web experiences with React, JavaScript, HTML, and CSS. Work with designers and backend engineers to deliver accessible, production-ready features.',
    location: 'Remote',
    jobType: 'Remote',
    experienceLevel: 'Mid Level',
    salaryMin: 85000,
    salaryMax: 115000,
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Accessibility'],
    daysUntilDeadline: 30,
  },
  {
    title: 'Node.js Backend Engineer',
    description: 'Develop REST APIs and backend services with Node.js, Express, and MongoDB. Improve database performance, write automated tests, and collaborate on secure application architecture.',
    location: 'New York, NY',
    jobType: 'Full Time',
    experienceLevel: 'Mid Level',
    salaryMin: 110000,
    salaryMax: 145000,
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Testing'],
    daysUntilDeadline: 30,
  },
  {
    title: 'Full Stack MERN Developer',
    description: 'Create end-to-end features using MongoDB, Express, React, and Node.js. Build reusable interfaces and APIs for a growing web product.',
    location: 'Austin, TX',
    jobType: 'Full Time',
    experienceLevel: 'Junior',
    salaryMin: 90000,
    salaryMax: 120000,
    skills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'],
    daysUntilDeadline: 35,
  },
  {
    title: 'Data Analyst',
    description: 'Analyze product and business data, build dashboards, and share actionable insights with cross-functional teams. Use SQL, Python, and visualization tools.',
    location: 'Chicago, IL',
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    salaryMin: 70000,
    salaryMax: 90000,
    skills: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Statistics'],
    daysUntilDeadline: 28,
  },
  {
    title: 'Product Designer (UI/UX)',
    description: 'Design intuitive web and mobile workflows from discovery through delivery. Create wireframes and prototypes, and partner with engineers to refine the user experience.',
    location: 'San Francisco, CA',
    jobType: 'Full Time',
    experienceLevel: 'Mid Level',
    salaryMin: 100000,
    salaryMax: 135000,
    skills: ['UI/UX', 'Figma', 'Prototyping', 'User Research', 'Design Systems'],
    daysUntilDeadline: 30,
  },
  {
    title: 'DevOps Engineer',
    description: 'Automate cloud infrastructure and CI/CD pipelines, improve observability, and help teams ship reliable services using containers and modern cloud platforms.',
    location: 'Remote',
    jobType: 'Remote',
    experienceLevel: 'Senior',
    salaryMin: 125000,
    salaryMax: 165000,
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    daysUntilDeadline: 40,
  },
  {
    title: 'Software Engineering Intern',
    description: 'Join a product engineering team to build and test customer-facing features. Ideal for students interested in JavaScript, React, and collaborative software development.',
    location: 'Seattle, WA',
    jobType: 'Internship',
    experienceLevel: 'Entry Level',
    salaryMin: 45000,
    salaryMax: 60000,
    skills: ['JavaScript', 'React', 'Git', 'Problem Solving'],
    daysUntilDeadline: 25,
  },
  {
    title: 'Python Machine Learning Engineer',
    description: 'Build and evaluate machine learning services using Python. Collaborate with data scientists to deploy dependable models and monitor their performance.',
    location: 'Boston, MA',
    jobType: 'Full Time',
    experienceLevel: 'Senior',
    salaryMin: 135000,
    salaryMax: 175000,
    skills: ['Python', 'Machine Learning', 'Data Science', 'APIs', 'TensorFlow'],
    daysUntilDeadline: 45,
  },
];

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const recruiterEmail = 'demo.recruiter@jobconnect.com';
    let recruiter = await User.findOne({ email: recruiterEmail });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'JobConnect Sample Recruiter',
        email: recruiterEmail,
        password: crypto.randomBytes(32).toString('hex'),
        role: 'recruiter',
        location: 'United States',
        bio: 'Recruiter profile for sample searchable job listings.',
      });
    } else if (recruiter.role !== 'recruiter') {
      throw new Error(`${recruiterEmail} exists but is not a recruiter; no jobs were added.`);
    }

    const companyName = 'JobConnect Sample Careers';
    let company = await Company.findOne({ name: companyName, recruiter: recruiter._id });
    if (!company) {
      company = await Company.create({
        name: companyName,
        description: 'Sample listings across software, data, design, and cloud engineering.',
        location: 'United States',
        industry: 'Technology',
        recruiter: recruiter._id,
      });
    }

    let added = 0;
    for (const { daysUntilDeadline, ...job } of sampleJobs) {
      const existingJob = await Job.findOne({ title: job.title, company: company._id });
      if (existingJob) {
        continue;
      }

      await Job.create({
        ...job,
        company: company._id,
        recruiter: recruiter._id,
        deadline: new Date(Date.now() + daysUntilDeadline * 24 * 60 * 60 * 1000),
        status: 'Active',
      });
      added += 1;
    }

    const totalActiveJobs = await Job.countDocuments({ status: 'Active' });
    console.log(`[Seed] Added ${added} sample jobs; ${totalActiveJobs} active jobs are now available.`);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedJobs();

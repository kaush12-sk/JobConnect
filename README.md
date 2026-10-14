# JobConnect — Production MERN Stack Job Portal

A modern, full-featured recruitment platform built strictly using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Engineered to simulate real-world hiring workflows between **Job Seekers**, **Recruiters / Hiring Managers**, and **Platform Administrators**.

---

## 🚀 Key Highlights & Architecture

- **100% Pure MERN Stack**: Zero third-party cloud backends, zero external database services (no Firebase, Supabase, AWS S3, Cloudinary, SQL, Python, or Java).
- **Strict Role-Based Access Control (RBAC)**: Enforced via JWT authentication and Express middleware (`jobseeker`, `recruiter`, `admin`).
- **Disk-Based Resume Storage**: Handled via `multer` storing files in `server/uploads/resumes/` with MIME type enforcement (`.pdf`, `.doc`, `.docx`), 5 MB file size limit, orphan file cleanup on failure, and authorized streaming downloads via `GET /api/applications/:id/resume`.
- **Dynamic Application Lifecycle**: State machine transitions (`Applied` ➔ `Reviewing` ➔ `Shortlisted` ➔ `Selected` / `Rejected`) with visual timeline tracking and real-time candidate status updates by recruiters.
- **Enterprise Administrative Console**: Real MongoDB aggregation metrics, platform overview, and moderation tools for Users, Jobs, Companies, and Applications.
- **Real-Time Database Aggregations**: Dynamic counters for applications per job, applicant breakdowns, and job seeker completion metrics without mock data.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Database** | MongoDB (Local) + Mongoose ODM | Data modeling, indexing, schema validations, compound unique constraints, and aggregation pipelines |
| **Backend API** | Node.js + Express.js | RESTful API, JWT auth, custom middleware, Multer file processing, and centralized error handling |
| **Frontend UI** | React 18 (Vite) + Vanilla CSS Tokens | Component-based SPA architecture, CSS design tokens, responsive cards/tables, and micro-interactions |
| **Icons & Media** | Lucide React | Minimalist, professional iconography matching modern design systems |

---

## 📂 Project Structure

```
jobconnect/
├── client/                     # Frontend Single Page Application (React + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Modal, StatusBadge, etc.)
│   │   ├── context/            # Global state (AuthContext)
│   │   ├── layouts/            # Page layouts (MainLayout, Navigation, Footer)
│   │   ├── pages/              # View screens
│   │   │   ├── admin/          # Admin console (AdminDashboard.jsx)
│   │   │   ├── applications/   # Seeker views (MyApplications, ApplicationDetail)
│   │   │   ├── company/        # Recruiter company profile & forms
│   │   │   ├── jobs/           # Public search, JobDetail, ApplyJob, JobForm
│   │   │   ├── recruiter/      # Recruiter dashboard & candidate review pipeline
│   │   │   ├── Home.jsx        # Landing page with live metrics and search
│   │   │   ├── Login.jsx       # User authentication
│   │   │   ├── Register.jsx    # Role-based onboarding
│   │   │   └── Profile.jsx     # Talent profile with dynamic completion bar
│   │   ├── services/           # Axios HTTP service layer (api, job, application, admin)
│   │   ├── App.jsx             # React Router v6 route configuration
│   │   └── main.jsx            # DOM entry point
│   └── package.json
│
├── server/                     # Backend REST API Server (Node.js + Express)
│   ├── config/                 # Database connection (db.js)
│   ├── controllers/            # Route business logic (auth, company, job, application, admin)
│   ├── middleware/             # Express middleware (auth, role, upload, error)
│   ├── models/                 # Mongoose schemas (User, Company, Job, Application)
│   ├── routes/                 # Express route definitions
│   ├── seed/                   # Database seeder (seedData.js)
│   ├── uploads/                # Local server disk storage
│   │   └── resumes/            # Candidate uploaded resume attachments
│   ├── verify-all-day5.js      # Zero-dependency automated test verification suite
│   ├── server.js               # Express application entry point
│   └── package.json
│
├── .gitignore                  # Git exclusions (.env, uploads/resumes/*, node_modules)
└── README.md                   # Project documentation
```

---

## ⚙️ Prerequisites & Setup

### Requirements
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **MongoDB**: Local MongoDB Community Server running on `mongodb://localhost:27017` or MongoDB Atlas URI

### Environment Variables

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/jobconnect
JWT_SECRET=jobconnect_super_secret_jwt_key_2026_production_ready
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Run with Docker Compose
Start Docker Desktop, then run this from the `jobconnect` directory:
```bash
docker compose up --build
```
Open the frontend at `http://localhost:5173`; the API is available at `http://localhost:5000`. Compose starts MongoDB automatically and keeps database data and uploaded resumes in named volumes. Stop the containers with `Ctrl+C`, or run `docker compose down` in another terminal.

To load the demo accounts and sample data, run this after the services start:
```bash
docker compose exec server npm run seed
```

The Compose setup uses a development-only JWT secret by default. Before sharing the app beyond local development, set `JWT_SECRET` in a `.env` file next to `docker-compose.yml`.

### Jenkins CI

The root `Jenkinsfile` validates the Compose configuration, builds the images, starts the services, and smoke-tests the API and frontend. Run it on a Linux Jenkins agent with Docker Compose v2 and `curl` installed. The pipeline uses a build-specific Compose project name and removes its containers and volumes after each run.

### 1. Start MongoDB
Ensure your local MongoDB service is running:
```bash
# Windows (PowerShell / Command Prompt)
net start MongoDB
```

### 2. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 3. Seed Database with Realistic Demo Data
From the `server` directory:
```bash
node seed/seedData.js
```
*Populates the database with demo Admin, Recruiters, Job Seekers, Companies, Active/Closed Job requisitions, and sample applications.*

### 4. Start Backend Server
```bash
cd server
npm run dev
```
*Server starts at `http://localhost:5000` with automated hot-reloading.*

### 5. Start Frontend Client
In a separate terminal:
```bash
cd client
npm run dev -- --host
```
*Frontend opens at `http://localhost:5173`.*

---

## 🔑 Demo Accounts

All demo accounts are ready out of the box with safe development credentials:

| Role | Email | Password | Description |
|---|---|---|---|
| **Administrator** | `admin@jobconnect.com` | `admin123` | Full platform analytics, moderation, and user/job/company deletion |
| **Recruiter** | `sarah.talent@techcorp.com` | `password123` | TechCorp Global hiring lead; manages requisitions & candidate pipeline |
| **Recruiter** | `david.hr@nexusai.com` | `password123` | Nexus AI Labs recruiter; reviews junior and contract applicants |
| **Job Seeker** | `john.seeker@example.com` | `password123` | Senior Full-Stack developer with active applications and resume |
| **Job Seeker** | `emily.dev@example.com` | `password123` | Frontend engineer candidate exploring open design & engineering roles |

---

## 📡 API Overview

### Authentication (`/api/auth`)
- `POST /register` — Register user (`jobseeker` or `recruiter`)
- `POST /login` — Authenticate and receive JWT Bearer token
- `GET /me` — Retrieve current authenticated user profile
- `PUT /profile` — Update user profile details (bio, location, phone, skills)

### Companies (`/api/companies`)
- `POST /` — Create company profile (Recruiter/Admin)
- `GET /my-company` — Get company profile owned by logged-in recruiter
- `PUT /` — Update recruiter company profile
- `GET /:id` — Public view of company details and job postings

### Jobs (`/api/jobs`)
- `GET /` — Search and filter active jobs (keyword, location, jobType, experience, salary, sort, pagination)
- `GET /:id` — Get single job details with company and recruiter population
- `POST /` — Create new job requisition (Recruiter/Admin)
- `PUT /:id` — Edit job requisition (Owner Recruiter/Admin)
- `DELETE /:id` — Delete job requisition (Owner Recruiter/Admin)
- `GET /recruiter/my-jobs` — Recruiter dashboard job list with real application counts

### Applications (`/api/applications`)
- `POST /` — Submit job application with Multer resume file upload and cover letter
- `GET /my-applications` — Job seeker view of all their applications
- `GET /stats` — Job seeker aggregated application metrics
- `GET /check/:jobId` — Check if logged-in user applied for a job
- `GET /job/:jobId` — Recruiter view of candidates for a specific requisition
- `PATCH /:id/status` — Recruiter or Admin updates candidate status (`Applied`, `Reviewing`, `Shortlisted`, `Rejected`, `Selected`)
- `GET /:id/resume` — Protected resume download with ownership validation
- `GET /:id` — Single application details with timeline
- `DELETE /:id` — Withdraw application (Allowed only before `Selected`/`Rejected`)

### Admin Management (`/api/admin`)
- `GET /stats` — Real-time platform analytics (users, companies, jobs, applications)
- `GET /users` — Paginated user directory with role and search filters
- `DELETE /users/:id` — Delete user and cascade dependent records (self-deletion blocked)
- `GET /jobs` — Job moderation table with application counters
- `DELETE /jobs/:id` — Remove any job and associated applications
- `GET /companies` — Company directory with active job counters
- `DELETE /companies/:id` — Remove company and associated postings
- `GET /applications` — Complete platform application audit log

---

## 🔒 Security & Quality Measures

1. **Password Protection**: Passwords hashed using `bcryptjs` with salt rounds = 10; passwords excluded (`select: false`) by default from queries.
2. **Strict Ownership Verification**: Recruiters cannot view or modify applications for jobs owned by other recruiters.
3. **Resume Access Control**: Resumes are stored outside public static directories. Downloads verify that the requesting user is the applicant, the job's recruiter, or an administrator.
4. **File Integrity & Sanitization**: Multer filters validate file extensions and MIME types (`.pdf`, `.doc`, `.docx`) up to 5 MB. If validation or MongoDB insertion fails, orphan files are removed from disk immediately.
5. **Git Hygiene**: Environment variables (`.env`) and uploaded user files (`server/uploads/resumes/*`) are explicitly excluded from Git version control.

---

## 🧪 Testing

The repository includes a zero-dependency automated integration test suite:
```bash
cd server
node verify-all-day5.js
```

### Coverage:
- **27 Automated Tests**: Health check, authentication, duplicate prevention, role restrictions, real MongoDB statistics, candidate pipeline transitions, cross-recruiter isolation, protected resume streams, seeker withdrawal rules, and administrative self-deletion protections.
- **Frontend Production Build**: Run `npm run build` in `client/` to verify zero bundling or JSX errors.

---

## 🎓 College & Interview Demo Walkthrough

1. **Open Landing Page (`/`)**: Observe live active position counts, clean search bar, and role cards.
2. **Explore Marketplace (`/jobs`)**: Filter by location, job type, experience level, and sort by newest or salary.
3. **Log In as Job Seeker (`john.seeker@example.com` / `password123`)**:
   - View `/dashboard` showing real application stats and profile completion widget.
   - Inspect `/applications` showing timeline statuses and view applied jobs.
   - Click "Apply Now" on an active requisition, upload a PDF resume, and submit.
4. **Log In as Recruiter (`sarah.talent@techcorp.com` / `password123`)**:
   - View `/recruiter/jobs` with real applicant counters.
   - Click "View Applicants" on 'Senior Full Stack React Developer'.
   - Change a candidate's status inline to `Shortlisted` or `Selected`.
   - Download the candidate's uploaded resume securely.
5. **Log In as Admin (`admin@jobconnect.com` / `admin123`)**:
   - Access `/admin` to view live MongoDB breakdown graphs and metric cards.
   - Search the User Directory, moderate jobs, view companies, and inspect applications.

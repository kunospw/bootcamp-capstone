# Job Hive 🐝

> AI-powered job portal connecting job seekers and recruiters with smart CV optimization, real-time updates, and personalized job matching.

[![GitHub stars](https://img.shields.io/github/stars/kunospw/bootcamp-capstone?style=social)](https://github.com/kunospw/bootcamp-capstone/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/kunospw/bootcamp-capstone?style=social)](https://github.com/kunospw/bootcamp-capstone/network/members)
[![GitHub issues](https://img.shields.io/github/issues/kunospw/bootcamp-capstone)](https://github.com/kunospw/bootcamp-capstone/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 About the Project

The job market can be messy — job seekers struggle to stand out while recruiters are drowning in manual reviews. **Job Hive** is here to bridge that gap with:

- 🤖 AI CV analysis (GPT-4o) for improvement suggestions
- 🎯 Intelligent job matching based on skills and goals  
- ⚡ Real-time application tracking for both candidates and recruiters
- 📊 Smart analytics and insights

## 🎯 Target Users

### Primary Users
- **Job Seekers** (Age 22-35)
  - Recent graduates entering the job market
  - Career changers seeking new opportunities
  - Professionals looking for better application management

### Secondary Users  
- **HR Recruiters & Companies**
  - Need efficient application management systems
  - Seeking better candidate evaluation tools
  - Looking for streamlined recruitment processes

## 🎯 Mission

To revolutionize job hunting by making the process smart, efficient, and personalized for everyone — as easy as scrolling your favorite social app.

## ✨ Features

### For Job Seekers 👤
- 🔐 **Secure Authentication** - JWT-based login system
- 🔍 **Advanced Job Search** - Filter by Major, Level, Type, Location, and Salary range
- 🤖 **AI CV Analyzer** - GPT-4o powered resume optimization with job matching
- 🎯 **Smart Job Recommendations** - AI-powered job matching with skill analysis and scoring
- 📊 **Personalized Scoring** - Get improvement tips and match ratings (up to 100% compatibility)
- 📝 **One-click Applications** - Apply to jobs with automatic pre-filled information
- 💾 **Job Bookmarking** - Save jobs with custom notes for future reference
- 📈 **Application Tracking** - Monitor your application status in real-time
- ⚡ **Real-time Notifications** - Socket.io powered instant status updates

### For Companies/Recruiters 🏢
- 📋 **Company Profile Management** - Create detailed profiles with logo, industry, and location
- 🏗️ **Job Posting & Management** - Easy CRUD operations for job listings
- 👥 **Advanced Applicant Management** - Smart CV analysis with skill matching and scoring
- 🧠 **AI-Powered Candidate Screening** - Automated CV analysis with percentage-based matching
- 📊 **Skills Gap Analysis** - Visual skill matching with green (matching) and yellow (missing) indicators
- 🎯 **Smart Sorting & Filtering** - Sort candidates by overall score, skills match, or experience level
- 🔄 **Status Management** - Update application statuses with automated notifications
- 👁 **Enhanced Candidate Profiles** - Access detailed CV insights and compatibility scores
- � **Recruitment Analytics** - Track hiring metrics with smart analysis statistics
- 🔍 **Dual View Modes** - Toggle between regular and AI-powered smart analysis views

## 🧠 AI CV Analysis System

Our cutting-edge AI CV Analysis system revolutionizes how companies evaluate candidates and how job seekers optimize their applications.

### 🎯 For Job Seekers
- **Smart Job Matching**: AI analyzes your CV and recommends jobs with compatibility scores
- **Skill Gap Analysis**: Identifies missing skills and provides improvement suggestions
- **Interactive Carousel**: Browse recommended jobs with click-to-view functionality
- **Real-time Scoring**: Get instant feedback on how well you match job requirements

### 🏢 For Companies
- **Automated CV Screening**: AI analyzes all applications and scores them automatically
- **Smart Analysis Toggle**: Switch between regular view and AI-powered analysis
- **Comprehensive Statistics**: 
  - Total applications count
  - High match candidates (80%+ score)
  - Medium match candidates (60-79% score)
  - Average compatibility score
- **Visual Skill Matching**:
  - 🟢 **Green badges** for matching skills
  - 🟡 **Yellow badges** for missing skills
  - Skill count indicators with expandable views
- **Advanced Sorting Options**:
  - Overall match score (recommended)
  - Skills compatibility percentage
  - Experience level match
  - Application date
- **Color-coded Scoring**:
  - 🟢 Green (80%+): Excellent match
  - 🟡 Yellow (60-79%): Good match
  - 🟠 Orange (40-59%): Fair match
  - 🔴 Red (<40%): Poor match

### 🔧 Technical Implementation
- **PDF Parsing**: Extracts text content from uploaded CV files
- **Skill Extraction**: Identifies 50+ technical and soft skills using regex patterns
- **Weighted Scoring Algorithm**: 70% skills match + 30% experience level compatibility
- **Flexible Major Mapping**: Maps related fields (e.g., Statistics → Data Science)
- **Real-time Analysis**: Processes CVs instantly with caching for performance

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React.js, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **AI Integration** | OpenAI GPT-4o |
| **File Processing** | pdf-parse, Multer |
| **Real-time** | Socket.io |
| **Authentication** | JWT, bcrypt |
| **Version Control** | Git, GitHub |

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key (GPT-4o access)
- Git

### 1️⃣ Clone the repository
```bash
git clone https://github.com/kunospw/bootcamp-capstone.git
cd bootcamp-capstone
```

### 2️⃣ Setup environment variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI=your_mongodb_connection_string
# - JWT_SECRET=your_jwt_secret_key
# - OPENAI_API_KEY=your_openai_api_key
# - NODE_ENV=development
# - PORT=5000 (optional, defaults to 5000)
```

### 3️⃣ Install dependencies

**Backend setup:**
```bash
cd backend
npm install
```

**Frontend setup:**
```bash
cd frontend
npm install
```

### 4️⃣ Run the application

**Start the backend server:**
```bash
cd backend
npm start
```

**Start the frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 🚀 Usage

1. **Register/Login** to your account
2. **Job Seekers**: Upload your CV, search for jobs, and get AI-powered recommendations
3. **Recruiters**: Post jobs, review applications, and manage candidates
4. **Track Progress**: Monitor applications and recruitment metrics in real-time

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

### API Documentation

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **Authentication** |
| `POST` | `/api/v1/auth/register` | User registration |
| `POST` | `/api/v1/auth/login` | User authentication |
| `GET` | `/api/v1/auth/profile` | Get user profile |
| `PUT` | `/api/v1/auth/profile` | Update user profile |
| **Job Management** |
| `GET` | `/api/v1/jobs` | Get all jobs with filters |
| `POST` | `/api/v1/jobs` | Create new job posting |
| `GET` | `/api/v1/jobs/:id` | Get specific job details |
| `PUT` | `/api/v1/jobs/:id` | Update job posting |
| `DELETE` | `/api/v1/jobs/:id` | Delete job posting |
| **Applications** |
| `POST` | `/api/v1/applications` | Submit job application |
| `GET` | `/api/v1/applications` | Get user applications |
| `PUT` | `/api/v1/applications/:id/status` | Update application status |
| **AI CV Analysis** |
| `POST` | `/api/v1/cv-analyzer/upload` | Upload and analyze CV |
| `GET` | `/api/v1/cv-analyzer/results/:id` | Get analysis results |
| **Saved Jobs** |
| `POST` | `/api/v1/saved-jobs` | Save/unsave job |
| `GET` | `/api/v1/saved-jobs` | Get saved jobs |
| **Notifications** |
| `GET` | `/api/v1/notifications` | Get user notifications |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark notification as read |

## 📊 Project Structure

```
bootcamp-capstone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context (AuthContext, NotificationContext)
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware (auth, validation)
│   ├── models/             # Mongoose models (7 collections)
│   │   ├── User.js         # User authentication
│   │   ├── Company.js      # Company profiles
│   │   ├── Job.js          # Job postings
│   │   ├── Application.js  # Job applications
│   │   ├── CVAnalysis.js   # AI CV analysis results
│   │   ├── SavedJob.js     # Bookmarked jobs
│   │   └── Category.js     # Job categories
│   ├── routes/             # API routes (18+ endpoints)
│   └── utils/              # Utility functions
├── docs/                   # Documentation
└── README.md
```

## 🐛 Known Issues & Limitations

- CV upload currently supports PDF format only
- Real-time notifications require WebSocket connection
- Mobile responsiveness needs improvement for company dashboard
- AI analysis processing time depends on OpenAI API response
- File upload size limited to 10MB for CV files

## 🔮 Roadmap

### Phase 1 (Current)
- [x] Core MERN stack implementation
- [x] AI-powered CV analysis
- [x] Real-time notifications
- [x] Complete user authentication

### Phase 2 (Next Quarter)
- [ ] Mobile app development (React Native)
- [ ] Video interview integration
- [ ] Advanced ML job matching algorithms
- [ ] Email notification system

### Phase 3 (Future)
- [ ] Multi-language support
- [ ] Company profiles and reviews
- [ ] Salary insights and analytics
- [ ] Integration with LinkedIn and other job boards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Filbert Sembiring M.** - *Initial work* - *AI & Backend Developer* - [@FilbertSM](https://github.com/FilbertSM)
- **Dyah Puspo Rini** - *Initial work* - *Backend Developer* - [@kunospw](https://github.com/kunospw)
- **Mika Rahmat Ramadhan** - *Initial work* - *Frontend Developer* - [@NvZ4](https://github.com/NvZ4)
- **Haris Muhyidin Shofar** - *Initial work* - *UI/UX Designer* - [@rahmatramadhanmika](https://github.com/rahmatramadhanmika)

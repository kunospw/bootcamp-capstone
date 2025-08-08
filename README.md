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

## 🎯 Mission

To revolutionize job hunting by making the process smart, efficient, and personalized for everyone — as easy as scrolling your favorite social app.

## ✨ Features

### For Job Seekers 👤
- 🔐 **Secure Authentication** - JWT-based login system
- 🔍 **Advanced Job Search** - Filter by location, salary, skills, and more
- 🤖 **AI CV Analyzer** - GPT-4o powered resume optimization
- 📊 **Personalized Scoring** - Get improvement tips and match ratings
- 📝 **One-click Applications** - Apply to jobs instantly
- 💾 **Job Bookmarking** - Save jobs with personal notes
- 📈 **Application Tracking** - Monitor your application status in real-time

### For Recruiters 🏢
- 📋 **Job Management** - Post and manage job listings effortlessly
- 👥 **Centralized Dashboard** - View all applications in one place
- 🔄 **Status Updates** - Automated notifications for applicants
- 👁 **AI-Enhanced Profiles** - View candidate profiles with CV insights
- 📊 **Recruitment Analytics** - Track hiring metrics and performance
- 🎯 **Smart Filtering** - Find the perfect candidates faster

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React.js, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **AI Integration** | OpenAI GPT-4o |
| **Authentication** | JWT |
| **Version Control** | Git, GitHub |

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key

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
# - MONGODB_URI
# - JWT_SECRET
# - OPENAI_API_KEY
# - PORT (optional, defaults to 5000)
```

### 3️⃣ Install dependencies

**Backend setup:**
```bash
cd server
npm install
```

**Frontend setup:**
```bash
cd client
npm install
```

### 4️⃣ Run the application

**Start the backend server:**
```bash
cd server
npm start
```

**Start the frontend (in a new terminal):**
```bash
cd client
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

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Job Endpoints
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job (recruiters only)
- `GET /api/jobs/:id` - Get specific job
- `PUT /api/jobs/:id` - Update job (recruiters only)

### Application Endpoints
- `POST /api/applications` - Apply to job
- `GET /api/applications` - Get user applications
- `PUT /api/applications/:id` - Update application status

For detailed API documentation, visit our [API Docs](docs/api.md).

## 📊 Project Structure

```
bootcamp-capstone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
├── docs/                   # Documentation
└── README.md
```

## 🐛 Known Issues

- CV upload currently supports PDF format only
- Real-time notifications require WebSocket connection
- Mobile responsiveness needs improvement for dashboard views

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Video interview integration
- [ ] Advanced ML job matching
- [ ] Multi-language support
- [ ] Company profiles and reviews
- [ ] Salary insights and analytics

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Filbert Sembiring M.** - *Initial work* - [@FilbertSM](https://github.com/FilbertSM)
- **Dyah Puspo Rini** - *Initial work* - [@kunospw](https://github.com/kunospw)
- **Mika Rahmat Ramadhan** - *Initial work* - [@NvZ4](https://github.com/NvZ4)
- **Haris Muhyidin Shofar** - *Initial work* - [@rahmatramadhanmika](https://github.com/rahmatramadhanmika)

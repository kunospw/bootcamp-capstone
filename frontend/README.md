# Job Hive Frontend

A modern React.js frontend for the Job Hive platform, featuring AI-powered CV analysis, smart job matching, and comprehensive job portal functionality.

## 🚀 Features

### 🎯 For Job Seekers
- **Smart Job Recommendations**: AI-powered job matching with compatibility scores
- **Interactive CV Analyzer**: Upload and analyze CV with GPT-4o powered insights
- **Job Recommendation Carousel**: Browse recommended jobs with click-to-view functionality
- **Advanced Job Search**: Filter by major, level, type, location, and salary
- **One-click Applications**: Apply to jobs with pre-filled information
- **Job Bookmarking**: Save jobs with custom notes for future reference
- **Application Tracking**: Real-time status updates and progress monitoring
- **Skill Gap Analysis**: Visual indicators for matching and missing skills

### 🏢 For Companies/Recruiters
- **Smart Candidate Screening**: AI-powered CV analysis and ranking
- **Dual View Modes**: Toggle between regular and AI-powered analysis
- **Statistics Dashboard**: Track high/medium matches and average scores
- **Visual Skill Matching**: Green badges for matching skills, yellow for gaps
- **Advanced Sorting**: Sort by compatibility score, skills, experience, or date
- **Comprehensive Job Management**: Create, edit, and manage job postings
- **Application Management**: Track and update application statuses
- **Candidate Profiles**: Detailed candidate information with CV insights

### 🎨 UI/UX Features
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Real-time Updates**: Socket.io integration for live notifications
- **Interactive Components**: Modern UI with smooth animations
- **Accessibility**: WCAG compliant design principles
- **Dark/Light Mode**: User preference based theming (coming soon)

## 🛠 Tech Stack

- **Framework**: React.js 18+ with Vite
- **Styling**: TailwindCSS for responsive design
- **Routing**: React Router for SPA navigation
- **State Management**: React Hooks and Context API
- **HTTP Client**: Fetch API with custom service layer
- **Icons**: React Icons (FontAwesome)
- **File Upload**: Custom drag-and-drop components
- **Real-time**: Socket.io client integration

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### 1️⃣ Install Dependencies
```bash
cd frontend
npm install
```

### 2️⃣ Environment Configuration
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=Job Hive
```

### 3️⃣ Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4️⃣ Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── Components/           # Reusable UI components
│   ├── FloatingDecorations.jsx
│   ├── NavBar.jsx
│   ├── SideBar.jsx
│   ├── Footer.jsx
│   └── ...
├── pages/               # Page components
│   ├── user/           # Job seeker pages
│   │   ├── SignIn.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CvAnalyzer.jsx
│   │   └── ...
│   └── company/        # Company/recruiter pages
│       ├── Applications.jsx
│       ├── JobDetail.jsx
│       ├── Jobs.jsx
│       └── ...
├── services/           # API service layer
│   └── api.js
├── assets/            # Static assets
├── App.jsx           # Main application component
└── main.jsx         # Application entry point
```

## 🧠 Smart CV Analysis Features

### Job Seeker Experience
```jsx
// CV Analysis with Job Recommendations
const CvAnalyzer = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  
  // Smart job matching carousel
  return (
    <div className="job-recommendations-carousel">
      {jobRecommendations.map(job => (
        <JobCard 
          key={job._id}
          job={job}
          matchScore={job.matchScore}
          matchingSkills={job.matchingSkills}
          onClick={() => navigate(`/jobs/${job._id}`)}
        />
      ))}
    </div>
  );
};
```

### Company Dashboard
```jsx
// Smart Analysis Toggle
const Applications = () => {
  const [useSmartAnalysis, setUseSmartAnalysis] = useState(false);
  const [applications, setApplications] = useState([]);
  
  return (
    <div className="applications-dashboard">
      {/* Smart Analysis Toggle */}
      <button onClick={() => setUseSmartAnalysis(!useSmartAnalysis)}>
        {useSmartAnalysis ? '🧠 Smart Analysis ON' : '🧠 Smart Analysis OFF'}
      </button>
      
      {/* Statistics Cards */}
      {useSmartAnalysis && (
        <StatsGrid 
          totalApplications={stats.totalApplications}
          highMatches={stats.highScoreCount}
          mediumMatches={stats.mediumScoreCount}
          averageScore={stats.averageScore}
        />
      )}
    </div>
  );
};
```

## 🎨 Component Examples

### Score Badge Component
```jsx
const ScoreBadge = ({ score }) => {
  const getColorClass = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getColorClass(score)}`}>
      {score}%
    </span>
  );
};
```

### Skill Badges Component
```jsx
const SkillBadges = ({ matchingSkills, missingSkills }) => (
  <div className="skills-analysis">
    {/* Matching Skills */}
    <div className="matching-skills">
      <p className="text-sm font-medium text-gray-700 mb-2">
        ✅ Matching Skills ({matchingSkills.length})
      </p>
      {matchingSkills.map(skill => (
        <span key={skill} className="bg-green-100 text-green-800 px-2 py-1 rounded mr-1">
          {skill}
        </span>
      ))}
    </div>
    
    {/* Missing Skills */}
    <div className="missing-skills">
      <p className="text-sm font-medium text-gray-700 mb-2">
        ⚠️ Skills Gap ({missingSkills.length})
      </p>
      {missingSkills.map(skill => (
        <span key={skill} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-1">
          {skill}
        </span>
      ))}
    </div>
  </div>
);
```

## 🔗 API Integration

### Service Layer Example
```javascript
// services/api.js
class APIService {
  static async getJobRecommendations(userId) {
    const response = await fetch(`${API_BASE_URL}/jobs/recommendations/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
  
  static async getApplicationsWithAnalysis(params) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/applications/company-applications-with-analysis?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
}
```

## 🚀 Deployment

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables for Production
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com
VITE_APP_NAME=Job Hive
```

## 🧪 Testing

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Run tests (when added)
npm run test
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🔧 Development

### ESLint Configuration
```javascript
// eslint.config.js
export default {
  extends: ['eslint:recommended', '@vitejs/eslint-config-react'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'warn',
    // Custom rules...
  }
};
```

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

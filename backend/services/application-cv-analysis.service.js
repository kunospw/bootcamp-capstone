import Application from '../models/application.model.js';
import Job from '../models/job.model.js';
import PDFParserService from './pdf-parser.service.js';

/**
 * Application CV Analysis Service
 * Analyzes applicant CVs and matches them with job requirements
 */
class ApplicationCVAnalysisService {
  constructor() {
    this.pdfParserService = new PDFParserService();
  }

  /**
   * Calculate skill match percentage between applicant and job
   * @param {string[]} applicantSkills - Skills from applicant's CV
   * @param {string[]} jobRequiredSkills - Skills required for the job
   * @param {string[]} jobSkills - Job's skill list
   * @returns {Object} - Match analysis
   */
  calculateSkillMatch(applicantSkills, jobRequiredSkills, jobSkills) {
    // Normalize skills to lowercase for comparison
    const normalizeSkills = (skills) => skills.map(skill => skill.toLowerCase().trim());
    
    const applicantSkillsNorm = normalizeSkills(applicantSkills);
    const allJobSkills = [...(jobRequiredSkills || []), ...(jobSkills || [])];
    const jobSkillsNorm = normalizeSkills(allJobSkills);
    
    // Find matching skills
    const matchingSkills = applicantSkills.filter(skill => 
      jobSkillsNorm.some(jobSkill => 
        jobSkill.includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(jobSkill)
      )
    );
    
    // Find missing critical skills
    const missingSkills = allJobSkills.filter(jobSkill => 
      !applicantSkillsNorm.some(appSkill => 
        appSkill.includes(jobSkill.toLowerCase()) || 
        jobSkill.toLowerCase().includes(appSkill)
      )
    );
    
    // Calculate match percentage
    const totalRequiredSkills = allJobSkills.length;
    const matchPercentage = totalRequiredSkills > 0 
      ? Math.round((matchingSkills.length / totalRequiredSkills) * 100) 
      : 0;
    
    return {
      matchPercentage,
      matchingSkills,
      missingSkills: missingSkills.slice(0, 5), // Limit to top 5 missing skills
      totalRequiredSkills,
      matchingSkillsCount: matchingSkills.length
    };
  }

  /**
   * Extract skills from applicant's resume text
   * @param {string} resumeText - Text content from CV
   * @returns {string[]} - Extracted skills
   */
  extractSkillsFromCV(resumeText) {
    // Common skill keywords to look for
    const skillKeywords = [
      // Programming Languages
      'javascript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go', 'swift', 'kotlin',
      'typescript', 'scala', 'rust', 'r', 'matlab', 'sql', 'html', 'css',
      
      // Frameworks & Libraries
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'bootstrap', 'tailwind', 'jquery', 'laravel', 'codeigniter', 'symfony',
      
      // Databases
      'mongodb', 'mysql', 'postgresql', 'oracle', 'sqlite', 'redis', 'cassandra',
      
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'gitlab',
      'github', 'terraform', 'ansible', 'linux', 'ubuntu', 'centos',
      
      // Data & Analytics
      'excel', 'tableau', 'powerbi', 'spss', 'sas', 'pandas', 'numpy', 'tensorflow',
      'pytorch', 'scikit-learn', 'machine learning', 'data analysis', 'statistics',
      
      // Design & Creative
      'photoshop', 'illustrator', 'figma', 'sketch', 'indesign', 'after effects',
      'premiere pro', 'ui/ux', 'user experience', 'user interface',
      
      // Business & Marketing
      'google analytics', 'google ads', 'facebook ads', 'seo', 'sem', 'content marketing',
      'social media', 'project management', 'scrum', 'agile', 'kanban',
      
      // Soft Skills
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'adaptability', 'creativity', 'research', 'analysis'
    ];
    
    const text = resumeText.toLowerCase();
    const extractedSkills = [];
    
    skillKeywords.forEach(skill => {
      if (text.includes(skill)) {
        // Use original case for display
        const skillWords = skill.split(' ');
        const capitalizedSkill = skillWords.map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        extractedSkills.push(capitalizedSkill);
      }
    });
    
    return [...new Set(extractedSkills)]; // Remove duplicates
  }

  /**
   * Analyze a single application's CV against job requirements
   * @param {Object} application - Application document with populated job
   * @returns {Object} - Analysis result
   */
  async analyzeApplicationCV(application) {
    try {
      // Get job requirements
      const job = application.jobId;
      const jobRequiredSkills = job.requirements || [];
      const jobSkills = job.skills || [];
      
      // Parse CV to extract text
      let cvText = '';
      let extractedSkills = [];
      
      if (application.resume) {
        try {
          cvText = await this.pdfParserService.parseFile(application.resume);
          extractedSkills = this.extractSkillsFromCV(cvText);
        } catch (error) {
          console.warn(`Could not parse CV for application ${application._id}:`, error.message);
        }
      }
      
      // Also include skills from application form if available
      if (application.skills) {
        const formSkills = application.skills.split(',').map(s => s.trim());
        extractedSkills = [...extractedSkills, ...formSkills];
        extractedSkills = [...new Set(extractedSkills)]; // Remove duplicates
      }
      
      // Calculate skill match
      const skillMatch = this.calculateSkillMatch(extractedSkills, jobRequiredSkills, jobSkills);
      
      // Calculate experience level match
      const experienceLevelMatch = this.calculateExperienceLevelMatch(
        application.experienceLevel, 
        job.experienceLevel
      );
      
      // Calculate overall score (weighted)
      const overallScore = Math.round(
        (skillMatch.matchPercentage * 0.7) + 
        (experienceLevelMatch * 0.3)
      );
      
      return {
        applicationId: application._id,
        applicantName: application.fullName,
        jobTitle: job.title,
        skillMatch,
        experienceLevelMatch,
        overallScore,
        extractedSkills,
        analysisDate: new Date()
      };
    } catch (error) {
      console.error(`Error analyzing application ${application._id}:`, error);
      return {
        applicationId: application._id,
        applicantName: application.fullName,
        jobTitle: application.jobId?.title || 'Unknown',
        skillMatch: { matchPercentage: 0, matchingSkills: [], missingSkills: [] },
        experienceLevelMatch: 0,
        overallScore: 0,
        extractedSkills: [],
        error: error.message,
        analysisDate: new Date()
      };
    }
  }

  /**
   * Calculate experience level match percentage
   * @param {string} applicantLevel - Applicant's experience level
   * @param {string} jobLevel - Job's required experience level
   * @returns {number} - Match percentage
   */
  calculateExperienceLevelMatch(applicantLevel, jobLevel) {
    const levels = {
      'entry': 1,
      'mid': 2,
      'senior': 3,
      'lead': 4,
      'executive': 5
    };
    
    const appLevel = levels[applicantLevel?.toLowerCase()] || 0;
    const jobLevelNum = levels[jobLevel?.toLowerCase()] || 0;
    
    if (appLevel === 0 || jobLevelNum === 0) return 50; // Neutral if unknown
    
    if (appLevel === jobLevelNum) return 100;
    if (Math.abs(appLevel - jobLevelNum) === 1) return 80;
    if (Math.abs(appLevel - jobLevelNum) === 2) return 60;
    return 40;
  }

  /**
   * Analyze multiple applications and return sorted results
   * @param {Array} applications - Array of application documents
   * @returns {Array} - Sorted analysis results
   */
  async analyzeApplications(applications) {
    const analyses = await Promise.all(
      applications.map(app => this.analyzeApplicationCV(app))
    );
    
    // Sort by overall score (highest first)
    return analyses.sort((a, b) => b.overallScore - a.overallScore);
  }
}

export default ApplicationCVAnalysisService;

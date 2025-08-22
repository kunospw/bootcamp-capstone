import Job from '../models/job.model.js';

/**
 * Job Matching Service
 * Finds active jobs that match candidate skills/keywords
 */
class JobMatchingService {
  /**
   * Find matching jobs using text search and skill comparison
   * @param {string[]} keywords - Extracted skills/keywords from CV
   * @param {Object} jobContext - Optional job context (major, experienceLevel)
   * @returns {Promise<Object>} - Match results
   */
  async findMatches(keywords = [], jobContext = {}) {
    try {
      console.log('JobMatchingService: Starting job matching with:', { keywords, jobContext });
      
      const uniqueKeywords = Array.from(new Set(keywords.filter(Boolean)));
      const searchText = uniqueKeywords.join(' ');

      // Base query for active jobs
      const baseQuery = { isActive: true };
      
      // Create flexible major matching - include related majors
      const majorMappings = {
        'Statistics': ['Data Science', 'Statistics', 'Computer Science', 'Finance'],
        'Informatics': ['Computer Science', 'Software Engineering', 'Informatics', 'Web Development'],
        'Data Science': ['Data Science', 'Statistics', 'Computer Science'],
        'Computer Science': ['Computer Science', 'Software Engineering', 'Web Development', 'Informatics']
      };
      
      let majorQuery = {};
      if (jobContext.major && majorMappings[jobContext.major]) {
        majorQuery = { major: { $in: majorMappings[jobContext.major] } };
      } else if (jobContext.major) {
        majorQuery = { major: jobContext.major };
      }
      
      // Experience level can be flexible too
      let experienceQuery = {};
      if (jobContext.experienceLevel) {
        experienceQuery = { experienceLevel: jobContext.experienceLevel };
      }

      // Build search criteria
      const textCriteria = searchText ? { $text: { $search: searchText } } : {};
      const skillCriteria = uniqueKeywords.length > 0 ? {
        $or: [
          { requirements: { $regex: new RegExp(uniqueKeywords.join('|'), 'i') } },
          { skills: { $in: uniqueKeywords.map(k => new RegExp(k, 'i')) } },
          { tags: { $in: uniqueKeywords.map(k => new RegExp(k, 'i')) } },
          { description: { $regex: new RegExp(uniqueKeywords.join('|'), 'i') } }
        ]
      } : {};

      // Try with all filters first
      let jobs = await Job.find({ 
        ...baseQuery, 
        ...majorQuery, 
        ...experienceQuery, 
        ...textCriteria, 
        ...skillCriteria 
      }).limit(10).lean();
      
      // If no results, try without major filtering
      if (jobs.length === 0 && Object.keys(majorQuery).length > 0) {
        console.log('No jobs found with major filter, trying without major...');
        jobs = await Job.find({ 
          ...baseQuery, 
          ...experienceQuery, 
          ...textCriteria, 
          ...skillCriteria 
        }).limit(10).lean();
      }
      
      // If still no results, try with just skill matching
      if (jobs.length === 0 && uniqueKeywords.length > 0) {
        console.log('No jobs found with text search, trying skill-only matching...');
        jobs = await Job.find({ 
          ...baseQuery, 
          ...skillCriteria 
        }).limit(10).lean();
      }
      
      console.log(`Found ${jobs.length} potential job matches`);

      const matches = jobs.map(job => {
        const jobSkills = (job.skills || []).map(s => s.toLowerCase());
        const keywordLower = uniqueKeywords.map(k => k.toLowerCase());
        const matchingSkills = uniqueKeywords.filter(kw => 
          jobSkills.some(js => js.includes(kw.toLowerCase()) || kw.toLowerCase().includes(js))
        );
        const missingSkills = jobSkills.filter(s => 
          !keywordLower.some(k => k.includes(s) || s.includes(k))
        );
        const score = jobSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 0;
        return {
          jobId: job._id,
          title: job.title,
          companyId: job.companyId,
          score,
          matchingSkills,
          missingSkills
        };
      }).sort((a, b) => b.score - a.score);

      console.log(`Returning ${matches.length} job matches with scores:`, matches.map(m => ({ title: m.title, score: m.score })));
      return { matches };
    } catch (error) {
      console.error('Job matching failed:', error);
      return { matches: [] };
    }
  }
}

export default JobMatchingService;
import OpenAIService from './services/openai.service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing GPT-4o model with CV Analysis...');

async function testGPT4oModel() {
  try {
    // Create OpenAI service instance
    const openAIService = new OpenAIService();
    
    // Sample CV text for testing
    const sampleCVText = `
John Doe
Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567

EXPERIENCE:
Senior Software Engineer, Tech Corp (2020-2024)
- Developed scalable web applications using React and Node.js
- Led a team of 5 developers on multiple projects
- Improved application performance by 40%
- Implemented CI/CD pipelines reducing deployment time by 60%

Software Engineer, StartupXYZ (2018-2020)
- Built REST APIs using Python and Django
- Worked with PostgreSQL and Redis for data management
- Collaborated with cross-functional teams

EDUCATION:
Bachelor of Computer Science, University of Technology (2014-2018)
GPA: 3.8/4.0

SKILLS:
Programming: JavaScript, Python, Java, C++
Frameworks: React, Node.js, Django, Express
Databases: PostgreSQL, MongoDB, Redis
Tools: Git, Docker, Kubernetes, AWS
    `;

    // Sample job data
    const jobData = {
      experienceLevel: 'senior',
      major: 'Computer Science',
      targetJobTitle: 'Senior Full Stack Developer'
    };

    console.log('Starting CV analysis with GPT-4o...');
    console.log('Model configuration:');
    console.log(`- Model: ${openAIService.model}`);
    console.log(`- Supports JSON: ${openAIService.supportsJsonFormat}`);
    console.log('---');

    const startTime = Date.now();
    
    // Perform CV analysis
    const result = await openAIService.analyzeCV(sampleCVText, jobData);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log('✅ CV Analysis completed successfully!');
    console.log(`⏱️  Processing time: ${processingTime}ms`);
    console.log('📊 Analysis Results:');
    console.log(`- Overall Score: ${result.analysis.overallScore}/100`);
    console.log(`- Strengths: ${result.analysis.summary.strengths}`);
    console.log(`- Areas for Improvement: ${result.analysis.summary.areasOfImprovement}`);
    console.log(`- Recommendations Count: ${result.recommendations.length}`);
    console.log('🤖 OpenAI Processing Info:');
    console.log(`- Model Used: ${result.openaiProcessing.model}`);
    console.log(`- Tokens Used: ${result.openaiProcessing.tokensUsed}`);
    console.log(`- Estimated Cost: $${result.openaiProcessing.cost}`);

    // Show first recommendation as example
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('💡 Sample Recommendation:');
      const firstRec = result.recommendations[0];
      console.log(`- Priority: ${firstRec.priority}`);
      console.log(`- Category: ${firstRec.category}`);
      console.log(`- Suggestion: ${firstRec.suggestion}`);
    }

    console.log('\n🎉 GPT-4o model test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing GPT-4o model:', error.message);
    if (error.originalError) {
      console.error('Original error:', error.originalError.message);
    }
  }
}

// Run the test
testGPT4oModel();

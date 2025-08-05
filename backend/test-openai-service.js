import OpenAIService from './services/openai.service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing OpenAIService model support...');

const service = new OpenAIService();

console.log('Service configuration:');
console.log('- Model:', service.model);
console.log('- Supports JSON format:', service.supportsJsonFormat);

// Test model support method directly
const testModels = [
  'gpt-4',
  'gpt-4-turbo-preview',
  'gpt-4-turbo',
  'gpt-3.5-turbo'
];

console.log('\nTesting model support for various models:');
testModels.forEach(model => {
  const supports = service.modelSupportsJsonFormat(model);
  console.log(`- ${model}: ${supports}`);
});

// Test a simple analysis
async function testAnalysis() {
  try {
    console.log('\nTesting CV analysis with current configuration...');
    const result = await service.analyzeCV(
      'John Doe, Software Engineer, 5 years experience in JavaScript, React, Node.js',
      {
        experienceLevel: 'mid',
        major: 'Computer Science',
        targetJobTitle: 'Senior Software Engineer'
      }
    );
    
    console.log('Analysis successful!');
    console.log('Result structure:', Object.keys(result));
    
  } catch (error) {
    console.error('Analysis failed:', error.message);
    if (error.originalError) {
      console.error('Original error:', error.originalError.message);
    }
  }
}

testAnalysis();

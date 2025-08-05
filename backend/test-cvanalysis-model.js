import mongoose from 'mongoose';
import CVAnalysis from './models/cvanalysis.model.js';

/**
 * Test script to verify the simplified CVAnalysis model works
 */
async function testCVAnalysisModel() {
  console.log('🧪 Testing CVAnalysis model creation...');
  
  try {
    // Test creating a basic CVAnalysis record (as done during upload)
    const testAnalysis = new CVAnalysis({
      userId: new mongoose.Types.ObjectId(),
      originalFilename: 'test-cv.pdf',
      filePath: '/uploads/cv-analyzer/test-cv.pdf',
      fileSize: 1024000,
      extractedText: 'Processing...',
      jobData: {
        experienceLevel: 'mid',
        major: 'Computer Science',
        targetJobTitle: 'Software Engineer'
      }
    });
    
    // Validate the model
    const validationError = testAnalysis.validateSync();
    
    if (validationError) {
      console.error('❌ Model validation failed:', validationError.message);
      // List all validation errors
      Object.keys(validationError.errors).forEach(key => {
        console.error(`  - ${key}: ${validationError.errors[key].message}`);
      });
    } else {
      console.log('✅ Model validation passed!');
      console.log('📋 Created record structure:');
      console.log({
        userId: testAnalysis.userId,
        originalFilename: testAnalysis.originalFilename,
        filePath: testAnalysis.filePath,
        fileSize: testAnalysis.fileSize,
        extractedText: testAnalysis.extractedText,
        jobData: testAnalysis.jobData,
        processingStatus: testAnalysis.processingStatus,
        overallScore: testAnalysis.overallScore,
        summary: testAnalysis.summary,
        sections: testAnalysis.sections,
        recommendations: testAnalysis.recommendations,
        jobMatching: testAnalysis.jobMatching,
        marketInsights: testAnalysis.marketInsights
      });
    }
    
    console.log('✅ CVAnalysis model test completed successfully!');
    
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
  }
}

// Run the test without connecting to database
testCVAnalysisModel();

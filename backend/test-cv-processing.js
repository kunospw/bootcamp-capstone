import fs from 'fs/promises';
import path from 'path';
import PDFParserService from './services/pdf-parser.service.js';

/**
 * Test script to verify CV file processing workflow
 */
async function testCVProcessing() {
  console.log('🔍 Testing CV processing workflow...');
  
  const uploadsDir = path.join(process.cwd(), 'uploads', 'cv-analyzer');
  
  try {
    // Check if uploads directory exists
    console.log('📁 Checking uploads directory:', uploadsDir);
    await fs.access(uploadsDir);
    console.log('✅ Uploads directory exists');
    
    // List existing files in the directory
    const files = await fs.readdir(uploadsDir);
    console.log('📋 Files in uploads/cv-analyzer:', files.length);
    
    if (files.length > 0) {
      console.log('📄 Sample files:', files.slice(0, 3));
      
      // Test PDF parsing on the first PDF file found
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      if (pdfFiles.length > 0) {
        const testFile = path.join(uploadsDir, pdfFiles[0]);
        console.log('🧪 Testing PDF parsing on:', pdfFiles[0]);
        
        try {
          const pdfParser = new PDFParserService();
          const result = await pdfParser.extractTextFromPDF(testFile);
          console.log('✅ PDF parsing successful!');
          console.log('📊 Text length:', result.text.length);
          console.log('📖 Preview:', result.text.substring(0, 200) + '...');
        } catch (parseError) {
          console.error('❌ PDF parsing failed:', parseError.message);
        }
      } else {
        console.log('ℹ️  No PDF files found for testing');
      }
    } else {
      console.log('ℹ️  Directory is empty - no files to test');
    }
    
    console.log('✅ CV processing workflow test completed');
    
  } catch (error) {
    console.error('❌ CV processing test failed:', error.message);
    
    // Try to create directory if it doesn't exist
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    } catch (createError) {
      console.error('❌ Failed to create uploads directory:', createError.message);
    }
  }
}

// Run the test
testCVProcessing();

import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

/**
 * Test script to verify pdf-parse is working
 */
async function testPdfParse() {
  console.log('🧪 Testing pdf-parse functionality...');
  
  try {
    // Check if pdf-parse is a function
    console.log('📋 pdf-parse type:', typeof pdfParse);
    
    if (typeof pdfParse !== 'function') {
      throw new Error('pdf-parse is not a function');
    }
    
    console.log('✅ pdf-parse loaded successfully as function');
    
    // Check if there are any PDF files to test with
    const uploadsDir = path.join(process.cwd(), 'uploads', 'cv-analyzer');
    
    try {
      const files = await fs.readdir(uploadsDir);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      
      if (pdfFiles.length > 0) {
        const testFile = path.join(uploadsDir, pdfFiles[0]);
        console.log('🔍 Testing with file:', pdfFiles[0]);
        
        // Read the file buffer
        const buffer = await fs.readFile(testFile);
        console.log('📄 File buffer size:', buffer.length, 'bytes');
        
        // Test pdf-parse
        const result = await pdfParse(buffer);
        console.log('✅ PDF parsing successful!');
        console.log('📊 Extracted text length:', result.text.length);
        console.log('📑 Number of pages:', result.numpages);
        console.log('ℹ️  PDF info:', result.info);
        
        if (result.text.length > 0) {
          console.log('📖 Text preview (first 200 chars):');
          console.log(result.text.substring(0, 200) + '...');
        }
        
      } else {
        console.log('ℹ️  No PDF files found for testing');
      }
      
    } catch (dirError) {
      console.log('ℹ️  No uploads directory or files found:', dirError.message);
    }
    
    console.log('✅ pdf-parse test completed successfully!');
    
  } catch (error) {
    console.error('❌ pdf-parse test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testPdfParse();

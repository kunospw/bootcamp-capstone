import fs from 'fs/promises';
import path from 'path';

/**
 * Simple test script to verify CV upload directory and file operations
 */
async function testCVUpload() {
  console.log('Testing CV upload functionality...');
  
  const uploadsDir = path.join(process.cwd(), 'uploads', 'cv-analyzer');
  
  try {
    // Check if directory exists
    console.log('Checking uploads directory:', uploadsDir);
    const dirStats = await fs.stat(uploadsDir);
    console.log('Directory exists:', dirStats.isDirectory());
    
    // Test file creation
    const testFilePath = path.join(uploadsDir, 'test.txt');
    await fs.writeFile(testFilePath, 'This is a test file');
    console.log('Test file created successfully');
    
    // Test file reading
    const content = await fs.readFile(testFilePath, 'utf8');
    console.log('Test file content:', content);
    
    // Test file deletion
    await fs.unlink(testFilePath);
    console.log('Test file deleted successfully');
    
    console.log('✅ CV upload directory test passed!');
    
  } catch (error) {
    console.error('❌ CV upload directory test failed:', error.message);
    
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
testCVUpload();

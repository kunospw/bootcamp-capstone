import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/job.model.js';
import Company from './models/company.model.js';
import Category from './models/category.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing Job Views System...');

async function testJobViews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the first job to test with
    const job = await Job.findOne().populate('companyId');
    
    if (!job) {
      console.log('❌ No jobs found in database');
      return;
    }

    console.log(`📋 Testing with job: ${job.title} (ID: ${job._id})`);
    console.log(`📊 Current views: ${job.views}`);

    // Test the incrementViews method multiple times
    console.log('\n🧪 Testing incrementViews method:');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\n--- Test ${i} ---`);
      console.log(`Before increment: ${job.views} views`);
      
      const updatedJob = await job.incrementViews();
      
      console.log(`After increment: ${updatedJob.views} views`);
      console.log(`Expected: ${job.views + 1}, Actual: ${updatedJob.views}`);
      
      // Update our job object with the new values
      job.views = updatedJob.views;
      
      // Small delay to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✅ Job views test completed');
    console.log(`📊 Final view count: ${job.views}`);

  } catch (error) {
    console.error('❌ Error testing job views:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testJobViews();

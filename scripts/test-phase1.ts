import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runTests() {
  console.log('🚀 Starting Phase 1: Environment & Infrastructure Test...\n');

  // 1. Environment Variables Check
  console.log('--- 1. Environment Variables ---');
  const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  let envPassed = true;
  for (const v of envVars) {
    if (process.env[v]) {
      console.log(`✅ ${v} is set`);
    } else {
      console.log(`❌ ${v} is MISSING`);
      envPassed = false;
    }
  }

  if (!envPassed) {
    console.error('\n❌ Environment check failed. Cannot proceed.');
    process.exit(1);
  }

  // Initialize Supabase Admin Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. Database State & Tables
  console.log('\n--- 2. Database Tables Check ---');
  const tablesToCheck = ['users', 'gems', 'jewellery', 'orders', 'payments', 'audit_logs'];
  let dbPassed = true;

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ Table '${table}' DOES NOT EXIST`);
      } else {
        console.log(`⚠️ Table '${table}' error: ${error.message}`);
      }
      dbPassed = false;
    } else {
      console.log(`✅ Table '${table}' exists and is accessible`);
    }
  }

  // 3. Storage Infrastructure
  console.log('\n--- 3. Storage Buckets Check ---');
  const requiredBuckets = ['gems', 'jewellery', 'avatars'];
  
  const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
  
  let storagePassed = true;
  if (storageError) {
    console.log(`❌ Failed to fetch storage buckets: ${storageError.message}`);
    storagePassed = false;
  } else {
    const existingBuckets = buckets.map(b => b.name);
    
    for (const reqBucket of requiredBuckets) {
      if (existingBuckets.includes(reqBucket)) {
        console.log(`✅ Bucket '${reqBucket}' exists`);
        
        // Let's check bucket public status if possible
        const bucketInfo = buckets.find(b => b.name === reqBucket);
        console.log(`   - Public: ${bucketInfo?.public ? 'Yes' : 'No'}`);
      } else {
        console.log(`❌ Bucket '${reqBucket}' DOES NOT EXIST`);
        storagePassed = false;
      }
    }
  }

  console.log('\n--- Test Summary ---');
  if (envPassed && dbPassed && storagePassed) {
    console.log('✅ Phase 1 Tests Passed Successfully!');
  } else {
    console.log('❌ Phase 1 Tests Completed with Errors. Fix the issues above.');
  }
}

runTests().catch(console.error);

require('dotenv').config();
const { verifyBucket, listFiles } = require('./src/services/s3Service');

async function testS3Connection() {
  console.log('=== AWS S3 Connection Test ===\n');
  
  console.log('Configuration:');
  console.log(`- Access Key: ${process.env.AWS_ACCESS_KEY_ID}`);
  console.log(`- Region: ${process.env.AWS_REGION}`);
  console.log(`- Bucket: ${process.env.AWS_S3_BUCKET}\n`);
  
  console.log('Testing bucket access...');
  const result = await verifyBucket();
  
  if (result.success) {
    console.log('✓ SUCCESS: S3 bucket is accessible!\n');
    
    // Try to list files
    console.log('Listing files in bucket...');
    try {
      const files = await listFiles('');
      console.log(`Found ${files.files.length} files in bucket`);
      if (files.files.length > 0) {
        console.log('\nRecent files:');
        files.files.slice(0, 5).forEach(file => {
          console.log(`  - ${file.key} (${(file.size / 1024).toFixed(2)} KB)`);
        });
      }
    } catch (error) {
      console.log('Note: Could not list files -', error.message);
    }
  } else {
    console.log('✗ FAILED:', result.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify the bucket "farmer-app-documents" exists in AWS S3');
    console.log('2. Check that your AWS credentials are correct');
    console.log('3. Ensure the IAM user has S3 permissions (s3:GetObject, s3:PutObject, s3:ListBucket)');
    console.log('4. Verify the region matches your bucket region');
  }
}

testS3Connection().catch(console.error);

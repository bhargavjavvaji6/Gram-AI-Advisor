# AWS S3 Setup Guide for Farmer App

## Current Issue
The S3 bucket test failed with "Access denied to bucket". This means either:
1. The bucket `farmer-app-documents` doesn't exist
2. Your IAM user lacks the necessary permissions

## Step-by-Step Setup

### 1. Create S3 Bucket

1. Go to AWS Console: https://console.aws.amazon.com/s3/
2. Click "Create bucket"
3. Bucket name: `farmer-app-documents`
4. Region: `us-east-1` (must match your .env file)
5. Uncheck "Block all public access" (if you want files to be publicly accessible)
6. Click "Create bucket"

### 2. Configure IAM User Permissions

Your IAM user needs these permissions. Go to IAM Console:

1. Navigate to: https://console.aws.amazon.com/iam/
2. Click "Users" → Find your user (the one with access key AKIA5FTY6HFQZKE26M5G)
3. Click "Add permissions" → "Attach policies directly"
4. Attach one of these policies:

**Option A: Use AWS Managed Policy (Easiest)**
- Search and attach: `AmazonS3FullAccess`

**Option B: Create Custom Policy (More Secure)**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::farmer-app-documents",
        "arn:aws:s3:::farmer-app-documents/*"
      ]
    }
  ]
}
```

### 3. Configure Bucket CORS (for frontend uploads)

1. Go to your bucket → Permissions tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 4. Test the Setup

After completing the above steps, run:

```bash
cd backend
node test-s3.js
```

You should see: ✓ SUCCESS: S3 bucket is accessible!

### 5. Security Best Practices

⚠️ **IMPORTANT**: Your AWS credentials were shared publicly. You should:

1. Go to IAM Console → Users → Security credentials
2. Delete the current access key (AKIA5FTY6HFQZKE26M5G)
3. Create a new access key
4. Update your `.env` file with the new credentials
5. Never commit `.env` to version control

### 6. Alternative: Create Bucket via AWS CLI

If you have AWS CLI installed:

```bash
aws s3 mb s3://farmer-app-documents --region us-east-1
aws s3api put-public-access-block --bucket farmer-app-documents --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

## Folder Structure in S3

The app will organize files like this:
```
farmer-app-documents/
├── soil-reports/
│   └── 1234567890-report.pdf
├── land-documents/
│   └── 1234567890-deed.pdf
└── farmer-photos/
    └── 1234567890-photo.jpg
```

## Testing File Upload

Once setup is complete, you can test file upload through the API:

```bash
# Start the backend server
npm start

# Test S3 health endpoint
curl http://localhost:5000/health/s3
```

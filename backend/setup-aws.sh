#!/bin/bash

# AWS S3 Setup Script for Farmer App
echo "=== AWS S3 Setup for Farmer App ==="
echo ""

# Load environment variables
source .env 2>/dev/null || true

BUCKET_NAME="farmer-app-documents"
REGION="us-east-1"

echo "Configuration:"
echo "- Bucket: $BUCKET_NAME"
echo "- Region: $REGION"
echo ""

# Configure AWS CLI with credentials
echo "Configuring AWS CLI..."
aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
aws configure set default.region "$REGION"

echo "✓ AWS CLI configured"
echo ""

# Check if bucket exists
echo "Checking if bucket exists..."
if aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
    echo "✓ Bucket already exists"
else
    echo "Creating bucket..."
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✓ Bucket created"
fi

echo ""

# Configure bucket for public access
echo "Configuring bucket permissions..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo "✓ Public access configured"
echo ""

# Add bucket policy for public read
echo "Setting bucket policy..."
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
echo "✓ Bucket policy set"
echo ""

# Add CORS configuration
echo "Configuring CORS..."
cat > /tmp/cors-config.json <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration file:///tmp/cors-config.json
echo "✓ CORS configured"
echo ""

# Test the setup
echo "Testing S3 connection..."
node test-s3.js

echo ""
echo "=== Setup Complete ==="
echo "Your S3 bucket is ready to use!"

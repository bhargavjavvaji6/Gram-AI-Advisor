# AWS S3 Setup Script for Farmer App (PowerShell)
Write-Host "=== AWS S3 Setup for Farmer App ===" -ForegroundColor Cyan
Write-Host ""

$BUCKET_NAME = "farmer-app-documents"
$REGION = "us-east-1"

# Load environment variables from .env
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$AWS_ACCESS_KEY = $env:AWS_ACCESS_KEY_ID
$AWS_SECRET_KEY = $env:AWS_SECRET_ACCESS_KEY

Write-Host "Configuration:"
Write-Host "- Bucket: $BUCKET_NAME"
Write-Host "- Region: $REGION"
Write-Host "- Access Key: $AWS_ACCESS_KEY"
Write-Host ""

# Configure AWS CLI
Write-Host "Configuring AWS CLI..." -ForegroundColor Yellow
aws configure set aws_access_key_id $AWS_ACCESS_KEY
aws configure set aws_secret_access_key $AWS_SECRET_KEY
aws configure set default.region $REGION
Write-Host "AWS CLI configured" -ForegroundColor Green
Write-Host ""

# Check if bucket exists
Write-Host "Checking if bucket exists..." -ForegroundColor Yellow
$null = aws s3 ls "s3://$BUCKET_NAME" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Bucket already exists" -ForegroundColor Green
} else {
    Write-Host "Creating bucket..." -ForegroundColor Yellow
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Bucket created" -ForegroundColor Green
    } else {
        Write-Host "Failed to create bucket" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Test the setup
Write-Host "Testing S3 connection..." -ForegroundColor Yellow
node test-s3.js

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan

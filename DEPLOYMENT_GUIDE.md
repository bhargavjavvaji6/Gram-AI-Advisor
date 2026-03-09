# Gram AI Advisor - Deployment Guide

## Table of Contents
1. [Quick Deploy (Recommended)](#quick-deploy-recommended)
2. [Manual Deployment](#manual-deployment)
3. [Environment Variables](#environment-variables)
4. [Post-Deployment Steps](#post-deployment-steps)
5. [Troubleshooting](#troubleshooting)

---

## Quick Deploy (Recommended)

### Option 1: Vercel (Frontend) + Render (Backend) - FREE ⭐

This is the easiest and completely free option.

#### A. Deploy Backend to Render

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +"** → Select "Web Service"
4. **Connect your GitHub repository**: `bhargavjavvaji6/Gram-AI-Advisor`
5. **Configure:**
   - Name: `gram-ai-advisor-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

6. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   AWS_ACCESS_KEY_ID=your_aws_access_key_here
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=farmer-app-documents
   ```
   
   **Note**: Use your actual AWS credentials from the `.env` file

7. **Click "Create Web Service"**
8. **Wait 5-10 minutes** for deployment
9. **Copy your backend URL**: `https://gram-ai-advisor-backend.onrender.com`

#### B. Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New"** → "Project"
4. **Import** your GitHub repository: `bhargavjavvaji6/Gram-AI-Advisor`
5. **Configure:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. **Add Environment Variable:**
   ```
   VITE_API_URL=https://gram-ai-advisor-backend.onrender.com
   ```

7. **Click "Deploy"**
8. **Wait 2-3 minutes**
9. **Your app is live!** 🎉

#### C. Update Frontend API URL

Before deploying, update the API URL in your frontend code:

**File: `frontend/src/pages/*.jsx`**

Replace all instances of:
```javascript
http://localhost:5000/api
```

With:
```javascript
${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api
```

Or create a config file:

**File: `frontend/src/config.js`**
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Then use it:
```javascript
import { API_URL } from '../config';
axios.get(`${API_URL}/api/farmers/${farmerId}`);
```

---

## Option 2: Netlify (Frontend) + Railway (Backend) - FREE

### A. Deploy Backend to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select** your repository
5. **Configure:**
   - Root Directory: `backend`
   - Start Command: `npm start`

6. **Add Environment Variables** (same as Render)
7. **Deploy** and copy your backend URL

### B. Deploy Frontend to Netlify

1. **Go to Netlify**: https://netlify.com
2. **Sign up/Login** with GitHub
3. **Click "Add new site"** → "Import an existing project"
4. **Connect to GitHub** and select your repo
5. **Configure:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

6. **Add Environment Variable:**
   ```
   VITE_API_URL=your-railway-backend-url
   ```

7. **Deploy**

---

## Option 3: AWS (Full Stack) - PAID but Professional

### Prerequisites
- AWS Account
- AWS CLI installed
- Basic AWS knowledge

### A. Deploy Backend to AWS Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize:**
```bash
cd backend
eb init -p node.js gram-ai-advisor
```

3. **Create Environment:**
```bash
eb create gram-ai-advisor-env
```

4. **Set Environment Variables:**
```bash
eb setenv NODE_ENV=production AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx
```

5. **Deploy:**
```bash
eb deploy
```

### B. Deploy Frontend to AWS S3 + CloudFront

1. **Build Frontend:**
```bash
cd frontend
npm run build
```

2. **Create S3 Bucket:**
```bash
aws s3 mb s3://gram-ai-advisor-frontend
```

3. **Upload Files:**
```bash
aws s3 sync dist/ s3://gram-ai-advisor-frontend --acl public-read
```

4. **Enable Static Website Hosting:**
```bash
aws s3 website s3://gram-ai-advisor-frontend --index-document index.html
```

5. **Setup CloudFront** (optional, for HTTPS and CDN)

---

## Option 4: Heroku (Full Stack) - PAID

### A. Deploy Backend

1. **Install Heroku CLI**
2. **Login:**
```bash
heroku login
```

3. **Create App:**
```bash
cd backend
heroku create gram-ai-advisor-backend
```

4. **Set Environment Variables:**
```bash
heroku config:set AWS_ACCESS_KEY_ID=xxx
heroku config:set AWS_SECRET_ACCESS_KEY=xxx
```

5. **Deploy:**
```bash
git push heroku main
```

### B. Deploy Frontend

1. **Create App:**
```bash
cd frontend
heroku create gram-ai-advisor-frontend
```

2. **Add Buildpack:**
```bash
heroku buildpacks:set heroku/nodejs
```

3. **Deploy:**
```bash
git push heroku main
```

---

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=farmer-app-documents

# MongoDB (Optional)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmer-app

# CORS
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Post-Deployment Steps

### 1. Update CORS Settings

**File: `backend/src/server.js`**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### 2. Update API URLs in Frontend

Create a centralized config:

**File: `frontend/src/config.js`**
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
```

### 3. Setup MongoDB Atlas (Recommended)

1. **Go to**: https://www.mongodb.com/cloud/atlas
2. **Create Free Cluster**
3. **Get Connection String**
4. **Add to Environment Variables**

### 4. Configure S3 CORS

Your S3 bucket already has CORS configured, but verify:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-frontend-url.vercel.app"],
    "ExposeHeaders": []
  }
]
```

### 5. Test Your Deployment

1. **Test Backend:**
```bash
curl https://your-backend-url.onrender.com/health
```

2. **Test Frontend:**
- Open your Vercel URL
- Try signup/login
- Test all features

---

## Troubleshooting

### Issue: CORS Errors

**Solution:**
```javascript
// backend/src/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

### Issue: API Not Connecting

**Check:**
1. Backend URL is correct in frontend
2. Backend is running (check Render logs)
3. Environment variables are set
4. No typos in URLs

### Issue: Build Fails

**Common Fixes:**
1. Check `package.json` scripts
2. Verify Node version compatibility
3. Check build logs for errors
4. Ensure all dependencies are in `package.json`

### Issue: S3 Upload Fails

**Check:**
1. AWS credentials are correct
2. S3 bucket exists
3. Bucket policy allows uploads
4. CORS is configured

---

## Cost Breakdown

### Free Tier (Recommended for Start)
- **Render**: Free (backend)
- **Vercel**: Free (frontend)
- **MongoDB Atlas**: Free (512MB)
- **AWS S3**: ~$0.50/month (for small usage)
- **Total**: ~$0.50/month

### Paid Tier (For Production)
- **Render**: $7/month (backend)
- **Vercel**: $20/month (frontend)
- **MongoDB Atlas**: $9/month (2GB)
- **AWS S3**: $2-5/month
- **Total**: ~$40/month

---

## Performance Optimization

### 1. Enable Caching
```javascript
// backend/src/server.js
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

### 2. Compress Responses
```javascript
const compression = require('compression');
app.use(compression());
```

### 3. Use CDN for Static Assets
- Upload images to S3
- Use CloudFront for distribution

### 4. Optimize Images
```bash
npm install sharp
```

---

## Security Checklist

- [ ] Environment variables are not in code
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] API rate limiting is enabled
- [ ] Input validation is implemented
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Password hashing (bcrypt)
- [ ] JWT tokens for authentication

---

## Monitoring & Logs

### Render
- Dashboard → Your Service → Logs
- Real-time log streaming
- Error tracking

### Vercel
- Dashboard → Your Project → Deployments
- Function logs
- Analytics

### AWS CloudWatch
- Automatic logging
- Custom metrics
- Alarms

---

## Backup Strategy

### 1. Database Backups
- MongoDB Atlas: Automatic daily backups
- Manual exports: `mongodump`

### 2. S3 Versioning
```bash
aws s3api put-bucket-versioning \
  --bucket farmer-app-documents \
  --versioning-configuration Status=Enabled
```

### 3. Code Backups
- GitHub repository (already done ✅)
- Regular commits
- Tagged releases

---

## Custom Domain Setup

### 1. Buy Domain
- Namecheap, GoDaddy, or Google Domains
- Example: `gramaiadvisor.com`

### 2. Configure DNS

**For Vercel:**
- Add CNAME record: `www` → `cname.vercel-dns.com`
- Add A record: `@` → Vercel IP

**For Render:**
- Add CNAME record: `api` → `your-app.onrender.com`

### 3. Enable SSL
- Both Vercel and Render provide free SSL
- Automatic HTTPS redirect

---

## Continuous Deployment

### Auto-Deploy on Git Push

**Vercel:**
- Automatically deploys on push to `main`
- Preview deployments for PRs

**Render:**
- Auto-deploy enabled by default
- Configure in dashboard

**GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod
```

---

## Support & Resources

### Documentation
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

### Community
- Stack Overflow
- GitHub Issues
- Discord communities

---

## Quick Commands Reference

```bash
# Build frontend
cd frontend && npm run build

# Test backend locally
cd backend && npm start

# Check logs (Render)
render logs -s your-service-name

# Deploy to Vercel
vercel --prod

# Update environment variables
vercel env add VITE_API_URL

# Check deployment status
vercel ls
```

---

**Last Updated**: 2024
**Deployment Status**: Ready for Production ✅
**Estimated Setup Time**: 30-60 minutes


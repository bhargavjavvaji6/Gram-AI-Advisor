# Quick Deploy Guide - 15 Minutes ⚡

## Step 1: Deploy Backend (5 minutes)

1. Go to **Render.com** → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect repository: `bhargavjavvaji6/Gram-AI-Advisor`
4. Settings:
   ```
   Name: gram-ai-advisor-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
5. Add Environment Variables:
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key_here
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=farmer-app-documents
   ```
   **Note**: Get these from your backend `.env` file
6. Click **"Create Web Service"**
7. **Copy your backend URL**: `https://gram-ai-advisor-backend.onrender.com`

## Step 2: Deploy Frontend (5 minutes)

1. Go to **Vercel.com** → Sign up with GitHub
2. Click **"Add New"** → **"Project"**
3. Import: `bhargavjavvaji6/Gram-AI-Advisor`
4. Settings:
   ```
   Framework: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
5. Add Environment Variable:
   ```
   VITE_API_URL=https://gram-ai-advisor-backend.onrender.com
   ```
6. Click **"Deploy"**
7. **Your app is live!** 🎉

## Step 3: Test (5 minutes)

1. Open your Vercel URL
2. Click "Get Started"
3. Sign up with test account
4. Complete the flow
5. Check if everything works

## Done! ✅

Your app is now live and accessible worldwide!

**Frontend URL**: `https://your-app.vercel.app`
**Backend URL**: `https://gram-ai-advisor-backend.onrender.com`

---

## Troubleshooting

### Backend not responding?
- Check Render logs
- Verify environment variables
- Wait 2-3 minutes for cold start

### Frontend showing errors?
- Check browser console
- Verify VITE_API_URL is correct
- Clear browser cache

### Need help?
- Check DEPLOYMENT_GUIDE.md for detailed instructions
- Review Render/Vercel documentation

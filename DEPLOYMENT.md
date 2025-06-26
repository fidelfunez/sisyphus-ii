# 🚀 Deployment Guide - Sisyphus II

This guide will walk you through deploying Sisyphus II to GitHub and Render for free!

## 📋 Prerequisites

- GitHub account
- Render account (free tier)
- Git installed locally

## 🔧 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Sisyphus II Task Management App"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `sisyphus-ii` or similar
3. Make it public (for portfolio visibility)
4. Don't initialize with README (we already have one)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/sisyphus-ii.git
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy to Render

### 2.1 Sign Up for Render
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### 2.2 Deploy Using Blueprint (Recommended)

1. **Connect GitHub Repository**
   - Click "New +" → "Blueprint"
   - Connect your GitHub account
   - Select your `sisyphus-ii` repository

2. **Configure Services**
   - Render will automatically detect the `render.yaml` file
   - It will create:
     - Backend API service
     - Frontend static site
     - PostgreSQL database

3. **Environment Variables**
   - Render will automatically set up the database connection
   - JWT_SECRET will be auto-generated
   - CORS origins will be configured automatically

### 2.3 Manual Deployment (Alternative)

If you prefer manual setup:

#### Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `sisyphus-backend`
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - **Root Directory**: `server`

#### Database
1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `sisyphus-db`
   - **Database**: `sisyphus_db`
   - **User**: `sisyphus_user`

#### Frontend Service
1. Click "New +" → "Static Site"
2. Configure:
   - **Name**: `sisyphus-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `client`

## 🔐 Step 3: Environment Variables

### Backend Environment Variables
Set these in your Render backend service:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
REDIS_ENABLED=false
```

### Frontend Environment Variables
Set these in your Render frontend service:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

## 🎯 Step 4: Update Your README

Once deployed, update your README with:

```markdown
## 🚀 Live Demo

- **Frontend**: https://sisyphus-frontend.onrender.com
- **Backend API**: https://sisyphus-backend.onrender.com
- **API Docs**: https://sisyphus-backend.onrender.com/docs

## 🧪 Demo Credentials
- Username: `demo`
- Password: `demo1234`
```

## 🔍 Step 5: Verify Deployment

### 5.1 Check Backend
- Visit your backend URL + `/health`
- Should return: `{"status": "healthy", "service": "sisyphus-api"}`

### 5.2 Check Frontend
- Visit your frontend URL
- Should load the login page
- Try the demo credentials

### 5.3 Test API
- Visit your backend URL + `/docs`
- Test the authentication endpoints

## 🛠️ Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure `ALLOWED_ORIGINS` includes your frontend URL
- Check that URLs match exactly (including https://)

#### 2. Database Connection
- Verify `DATABASE_URL` is correct
- Check that database service is running

#### 3. Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in requirements.txt/package.json

#### 4. Environment Variables
- Verify all required variables are set
- Check for typos in variable names

### Debug Commands

```bash
# Check backend logs
curl https://your-backend.onrender.com/health

# Check frontend build
curl https://your-frontend.onrender.com

# Test API endpoint
curl https://your-backend.onrender.com/api/auth/me
```

## 📈 Step 6: Monitor & Optimize

### 6.1 Performance Monitoring
- Check Render dashboard for performance metrics
- Monitor response times and error rates

### 6.2 Cost Optimization
- Free tier includes:
  - 750 hours/month for web services
  - 1GB PostgreSQL database
  - 100GB bandwidth

### 6.3 Scaling (Future)
- Upgrade to paid plans for:
  - Custom domains
  - SSL certificates
  - Higher resource limits
  - Better performance

## 🎉 Success!

Your Sisyphus II app is now live and accessible to:
- **Recruiters** - Professional portfolio piece
- **Users** - Functional productivity app
- **Developers** - Open source contribution opportunity

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [GitHub Pages](https://pages.github.com) (Alternative hosting)
- [Vercel](https://vercel.com) (Alternative hosting)
- [Netlify](https://netlify.com) (Alternative hosting)

---

**Happy Deploying! 🚀** 
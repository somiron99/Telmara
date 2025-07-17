# 🚀 Vercel Deployment Guide

Quick guide to deploy your Workplace Reviews Platform to Vercel.

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run the database script in Supabase SQL Editor
- [ ] Verify all tables are created (companies, reviews, comments, reactions)
- [ ] Test database connections work
- [ ] Note your Supabase URL and anon key

### 2. Environment Variables
- [ ] Have your Supabase project URL ready
- [ ] Have your Supabase anon key ready
- [ ] Create `.env.local` file locally (optional)

### 3. Code Preparation
- [ ] All features tested locally
- [ ] Build works: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`

## 🌐 Deployment Methods

### Method 1: GitHub + Vercel (Recommended)

#### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Workplace Reviews Platform"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/workplace-reviews.git

# Push to GitHub
git push -u origin main
```

#### Step 2: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. **Import** your `workplace-reviews` repository
5. Vercel auto-detects Next.js settings ✅
6. Click **"Deploy"**

#### Step 3: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Method 2: Vercel CLI (Direct)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
# From your project directory
cd workplace-reviews

# Deploy (follow prompts)
vercel --prod
```

#### Step 3: Configure during deployment
- Project name: `workplace-reviews`
- Directory: `./` (current directory)
- Override settings: `N` (use auto-detected)

## 🔧 Configuration Files

### Vercel Configuration (`vercel.json`)
✅ Already created with:
- Security headers
- CORS configuration
- Redirects and rewrites
- Performance optimizations

### Next.js Configuration (`next.config.js`)
✅ Already created with:
- Image optimization
- Security headers
- Bundle optimization
- Production settings

## 🌍 Environment Variables Setup

### Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Optional Variables
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn
```

### How to Add in Vercel
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environments**: Production, Preview, Development

## 🚀 Quick Deployment Script

Use the provided deployment script:

```bash
# Make script executable (Mac/Linux)
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

Or manually:
```bash
# Install dependencies
npm install

# Test build
npm run build

# Deploy to Vercel
vercel --prod
```

## 🔍 Post-Deployment Verification

### 1. Test Core Features
- [ ] Homepage loads correctly
- [ ] Can create reviews (with beautiful modal)
- [ ] Pagination works (15 reviews per page)
- [ ] Likes and comments work
- [ ] Search and filtering work
- [ ] Company pages load

### 2. Check Performance
- [ ] Page load speed < 3 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] Mobile responsive

### 3. Database Connectivity
- [ ] Reviews display from database
- [ ] Can create new reviews
- [ ] Comments and likes persist
- [ ] No database connection errors

## 🎯 Expected Results

After successful deployment:

✅ **Live URL**: `https://workplace-reviews-xxx.vercel.app`  
✅ **Custom domain**: Configure in Vercel dashboard  
✅ **Automatic deployments**: Every push to main branch  
✅ **Preview deployments**: For pull requests  
✅ **Analytics**: Built-in Vercel analytics  

## 🔧 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variables Not Working
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Check spelling and values in Vercel dashboard
- Redeploy after adding variables

#### Database Connection Issues
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Test connection locally first

#### 404 Errors
- Check file paths and routing
- Ensure all pages are in correct `app/` directory
- Verify dynamic routes are properly named

### Getting Help
1. Check Vercel deployment logs
2. Review browser console for errors
3. Test locally with `npm run build && npm start`
4. Check Vercel documentation

## 📈 Performance Optimization

### Already Configured
✅ **Image optimization** with Next.js Image component  
✅ **Bundle splitting** for faster loading  
✅ **Compression** enabled  
✅ **Security headers** configured  
✅ **Static optimization** enabled  

### Additional Optimizations
- [ ] Add custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up monitoring (Sentry)
- [ ] Configure CDN caching
- [ ] Add sitemap.xml

## 🎉 Success!

Your Workplace Reviews Platform should now be live on Vercel with:

🌟 **Beautiful UI** with modals and animations  
🌟 **Pagination** system working  
🌟 **Database** fully functional  
🌟 **Responsive design** on all devices  
🌟 **Production-ready** performance  

**Share your live URL and start collecting workplace reviews! 🚀**

---

**Need help?** Check the main README.md or create an issue on GitHub.

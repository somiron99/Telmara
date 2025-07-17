# 🚀 Deployment Guide

This guide covers deploying the Workplace Reviews Platform to various hosting providers.

## 📋 Pre-deployment Checklist

### ✅ Code Preparation
- [ ] All features tested locally
- [ ] Database scripts run successfully
- [ ] Environment variables configured
- [ ] Build process works (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)

### ✅ Database Setup
- [ ] Supabase project created
- [ ] Database scripts executed in order
- [ ] Sample data populated (optional)
- [ ] Database connections tested

### ✅ Environment Variables
- [ ] Production environment variables ready
- [ ] Supabase URLs and keys configured
- [ ] Authentication secrets set

## 🌐 Vercel Deployment (Recommended)

### Why Vercel?
- Optimized for Next.js applications
- Automatic deployments from Git
- Built-in performance monitoring
- Edge functions support
- Free tier available

### Step-by-Step Deployment

#### 1. Prepare Your Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your repository
5. Configure project settings

#### 3. Environment Variables
Add these in Vercel dashboard under Settings > Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 4. Build Settings
Vercel auto-detects Next.js projects. Default settings should work:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test your deployed application

### Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

## 🐳 Docker Deployment

### Dockerfile
Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

### Deploy with Docker
```bash
# Build the image
docker build -t workplace-reviews .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  workplace-reviews
```

## ☁️ Other Hosting Providers

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy

### Railway
1. Connect your GitHub repository
2. Railway auto-detects Next.js
3. Add environment variables
4. Deploy automatically

### DigitalOcean App Platform
1. Create new app from GitHub
2. Configure build settings
3. Add environment variables
4. Deploy

## 🔧 Production Configuration

### Next.js Configuration
Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker deployments
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

### Performance Optimizations
- Enable image optimization
- Configure caching headers
- Use CDN for static assets
- Enable compression
- Monitor Core Web Vitals

## 🗄️ Database Production Setup

### Supabase Production
1. **Upgrade to Pro plan** for production features
2. **Enable Point-in-Time Recovery**
3. **Set up database backups**
4. **Configure connection pooling**
5. **Enable Row Level Security**

### Security Considerations
```sql
-- Enable RLS for production
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Public companies are viewable by everyone" 
ON companies FOR SELECT 
USING (true);

CREATE POLICY "Users can insert reviews" 
ON reviews FOR INSERT 
WITH CHECK (auth.uid() = author_id OR is_anonymous = true);
```

## 📊 Monitoring & Analytics

### Error Monitoring
- Set up Sentry for error tracking
- Configure error boundaries
- Monitor API endpoints
- Track user interactions

### Performance Monitoring
- Use Vercel Analytics
- Monitor Core Web Vitals
- Track page load times
- Monitor database performance

### Analytics
- Google Analytics 4
- Supabase Analytics
- Custom event tracking
- User behavior analysis

## 🔒 Security Checklist

### Application Security
- [ ] Environment variables secured
- [ ] API routes protected
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSRF protection configured

### Database Security
- [ ] Row Level Security enabled
- [ ] Proper authentication policies
- [ ] Database backups configured
- [ ] Connection encryption enabled
- [ ] Regular security updates

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Environment Variable Issues
- Check variable names match exactly
- Ensure NEXT_PUBLIC_ prefix for client-side variables
- Verify values are properly escaped

#### Database Connection Issues
- Verify Supabase URL and keys
- Check network connectivity
- Ensure database is running
- Review connection limits

### Debugging Production Issues
1. Check deployment logs
2. Monitor error tracking
3. Review database logs
4. Test with production data
5. Use staging environment

## 📈 Scaling Considerations

### Application Scaling
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries
- Consider serverless functions

### Database Scaling
- Monitor connection usage
- Implement connection pooling
- Consider read replicas
- Optimize query performance

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

### Getting Help
- Check deployment logs first
- Review this guide thoroughly
- Search existing GitHub issues
- Create detailed issue reports

### Useful Resources
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform/going-into-prod)

---

**Ready to deploy? Follow this guide step by step for a successful production deployment! 🚀**

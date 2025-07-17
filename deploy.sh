#!/bin/bash

# Workplace Reviews Platform - Deployment Script
# This script prepares and deploys the application to Vercel

echo "🚀 Starting deployment process for Workplace Reviews Platform..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Environment checks passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run type checking
echo "🔍 Running TypeScript type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ Error: TypeScript type check failed"
    exit 1
fi

echo "✅ Type check passed"

# Run linting
echo "🧹 Running ESLint..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Linting issues found, but continuing..."
fi

# Test build
echo "🏗️  Testing build process..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "✅ Build successful"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check for environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "📝 Please ensure you have the following environment variables set in Vercel:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "📋 Please follow the prompts to configure your deployment"
echo ""

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "✅ Your Workplace Reviews Platform is now live on Vercel"
    echo ""
    echo "📝 Next steps:"
    echo "1. Configure your custom domain (optional)"
    echo "2. Set up environment variables in Vercel dashboard"
    echo "3. Test all features on the live site"
    echo "4. Set up monitoring and analytics"
    echo ""
    echo "🔗 Useful links:"
    echo "   - Vercel Dashboard: https://vercel.com/dashboard"
    echo "   - Project Settings: https://vercel.com/[your-username]/workplace-reviews/settings"
    echo "   - Environment Variables: https://vercel.com/[your-username]/workplace-reviews/settings/environment-variables"
else
    echo "❌ Deployment failed"
    echo "💡 Troubleshooting tips:"
    echo "1. Check your internet connection"
    echo "2. Verify Vercel CLI is properly authenticated"
    echo "3. Ensure all environment variables are set"
    echo "4. Check the Vercel dashboard for error details"
    exit 1
fi

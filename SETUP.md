# Quick Setup Guide

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- npm, yarn, or pnpm
- A Supabase account (optional for demo)

### 2. Installation
```bash
cd workplace-reviews
npm install
```

### 3. Environment Setup
The app works out of the box with mock data. For full functionality with Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor

### 4. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📱 Features Available

### ✅ Working Features (with mock data)
- **Home Page** - Browse latest reviews
- **Companies Page** - Search and filter IT companies
- **Reviews Page** - View all reviews with sorting
- **Create Review** - Submit new company reviews
- **Authentication Pages** - Login/Register forms
- **Interactive Features** - Like, comment, share reviews
- **Responsive Design** - Works on all devices

### 🔧 Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🎨 Design Features
- **Modern Minimalistic UI** - Clean, professional design
- **Blue & Yellow Theme** - Following the provided mockup
- **Responsive Layout** - Mobile-first approach
- **Smooth Animations** - Hover effects and transitions
- **Accessibility** - ARIA labels and keyboard navigation

## 🔒 Security Features
- **Anonymous Posting** - Privacy-focused reviews
- **Input Validation** - Form validation with Zod
- **Type Safety** - Full TypeScript implementation
- **Secure Authentication** - Supabase Auth integration

## 📊 Performance
- **Fast Loading** - Optimized with Next.js 15
- **Lazy Loading** - Components loaded on demand
- **Code Splitting** - Automatic bundle optimization
- **SEO Friendly** - Server-side rendering

## 🚀 Production Ready
- **Error Handling** - Comprehensive error boundaries
- **Loading States** - Skeleton loaders and spinners
- **Form Validation** - Client and server-side validation
- **Responsive Design** - Works on all screen sizes

## 📝 Next Steps
1. Set up Supabase for full functionality
2. Add real company data
3. Implement email notifications
4. Add advanced search filters
5. Deploy to Vercel or your preferred platform

---

**The application is fully functional and ready to use! 🎉**

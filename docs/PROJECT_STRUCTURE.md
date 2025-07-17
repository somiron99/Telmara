# 📁 Project Structure

This document provides a comprehensive overview of the Workplace Reviews Platform project structure.

## 🏗️ Root Directory

```
workplace-reviews/
├── .github/                    # GitHub workflows and templates
├── .next/                      # Next.js build output (auto-generated)
├── database/                   # Database setup scripts
├── docs/                       # Project documentation
├── node_modules/               # Dependencies (auto-generated)
├── public/                     # Static assets
├── src/                        # Source code
├── .env.example               # Environment variables template
├── .env.local                 # Local environment variables (gitignored)
├── .gitignore                 # Git ignore rules
├── CONTRIBUTING.md            # Contribution guidelines
├── DEPLOYMENT.md              # Deployment instructions
├── LICENSE                    # MIT License
├── README.md                  # Project overview
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 📂 Source Code Structure (`src/`)

```
src/
├── app/                       # Next.js 15 App Router
│   ├── (auth)/               # Authentication routes group
│   ├── companies/            # Company-related pages
│   ├── create-review/        # Review creation page
│   ├── profile/              # User profile pages
│   ├── reviews/              # Reviews listing and details
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout component
│   ├── loading.tsx           # Global loading component
│   ├── not-found.tsx         # 404 page
│   └── page.tsx              # Homepage
├── components/               # Reusable UI components
│   ├── admin/               # Admin-specific components
│   ├── layout/              # Layout components
│   ├── profile/             # Profile-related components
│   ├── review/              # Review-specific components
│   ├── test/                # Testing components
│   └── ui/                  # Base UI components
├── contexts/                # React contexts
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and configurations
└── types/                   # TypeScript type definitions (if separate)
```

## 🎨 Components Structure

### Base UI Components (`src/components/ui/`)
```
ui/
├── badge.tsx                 # Badge component
├── button.tsx               # Button component
├── card.tsx                 # Card component
├── input.tsx                # Input component
├── notification-dropdown.tsx # Notification system
├── notification-toast.tsx   # Toast notifications
├── notification.tsx         # Basic notifications
├── pagination.tsx           # Pagination component
├── select.tsx               # Select dropdown
├── success-modal.tsx        # Success modal
├── tabs.tsx                 # Tabs component
└── textarea.tsx             # Textarea component
```

### Layout Components (`src/components/layout/`)
```
layout/
├── header.tsx               # Main header/navigation
├── sidebar.tsx              # Sidebar navigation
└── footer.tsx               # Footer component (if exists)
```

### Review Components (`src/components/review/`)
```
review/
├── comment-section.tsx      # Comment system
├── review-card.tsx          # Individual review display
├── review-form.tsx          # Review creation form
├── review-skeleton.tsx      # Loading skeleton
└── share-modal.tsx          # Social sharing modal
```

### Profile Components (`src/components/profile/`)
```
profile/
├── avatar-upload.tsx        # Avatar upload functionality
├── profile-form.tsx         # Profile editing form
├── profile-stats.tsx        # User statistics
└── user-reviews.tsx         # User's reviews display
```

## 🔧 App Router Structure (`src/app/`)

### Page Structure
```
app/
├── page.tsx                 # Homepage (/)
├── layout.tsx               # Root layout
├── loading.tsx              # Global loading UI
├── error.tsx                # Global error UI
├── not-found.tsx            # 404 page
└── globals.css              # Global styles
```

### Route Groups and Pages
```
app/
├── (auth)/                  # Authentication group
│   ├── login/
│   │   └── page.tsx         # Login page
│   └── signup/
│       └── page.tsx         # Signup page
├── companies/               # Companies section
│   ├── page.tsx             # Companies listing
│   └── [slug]/
│       └── page.tsx         # Individual company page
├── create-review/
│   └── page.tsx             # Review creation
├── profile/
│   └── page.tsx             # User profile
└── reviews/
    ├── page.tsx             # Reviews listing
    └── [id]/
        └── page.tsx         # Individual review page
```

## 🗄️ Database Structure (`database/`)

```
database/
├── README.md                # Database setup guide
├── 01-initial-setup.sql     # Initial schema creation
├── 02-fix-relationships.sql # Foreign key relationships
└── 03-complete-fix.sql      # Final fixes and sample data
```

## 🔗 Contexts (`src/contexts/`)

```
contexts/
├── AuthContext.tsx          # Authentication state
├── ReviewContext.tsx        # Reviews state management
└── NotificationContext.tsx  # Notifications (if exists)
```

## 🎣 Custom Hooks (`src/hooks/`)

```
hooks/
├── useAuth.ts               # Authentication hook
├── useReviewActions.ts      # Review operations
├── useLocalStorage.ts       # Local storage utilities
└── useDebounce.ts           # Debouncing utility
```

## 🛠️ Utilities (`src/lib/`)

```
lib/
├── supabase/
│   ├── client.ts            # Supabase client configuration
│   ├── server.ts            # Server-side Supabase client
│   └── middleware.ts        # Supabase middleware
├── auth.ts                  # Authentication utilities
├── profile.ts               # Profile management
├── reviews.ts               # Review operations
├── setup-database.ts       # Database setup utilities
├── types.ts                 # TypeScript type definitions
└── utils.ts                 # General utilities
```

## 📄 Configuration Files

### Next.js Configuration (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
}

module.exports = nextConfig
```

### TypeScript Configuration (`tsconfig.json`)
- Strict type checking enabled
- Path aliases configured
- Next.js optimizations

### Tailwind Configuration (`tailwind.config.js`)
- Custom color palette
- Component-specific utilities
- Responsive breakpoints

## 🔄 Data Flow

### Authentication Flow
1. User interacts with auth components
2. AuthContext manages state
3. Supabase handles authentication
4. Protected routes check auth status

### Review Management Flow
1. User creates/views reviews
2. ReviewContext manages state
3. Components consume context
4. Supabase stores/retrieves data

### UI State Management
1. Local component state for UI
2. Context for shared state
3. Custom hooks for reusable logic
4. Supabase for persistence

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized navigation

## 🎨 Styling Architecture

### Tailwind CSS Structure
- Utility-first approach
- Custom component classes
- Consistent spacing scale
- Color system integration

### Component Styling
- Styled with Tailwind utilities
- Variant-based styling with CVA
- Responsive design patterns
- Dark mode support (if implemented)

## 🧪 Testing Structure (Future)

```
__tests__/
├── components/              # Component tests
├── pages/                   # Page tests
├── utils/                   # Utility tests
└── setup.js                 # Test configuration
```

## 📦 Build Output

### Production Build (`.next/`)
```
.next/
├── static/                  # Static assets
├── server/                  # Server-side code
└── cache/                   # Build cache
```

## 🔒 Security Considerations

### File Organization
- Environment variables in `.env.local`
- Sensitive configs in server-side only
- Client-side code assumes public visibility
- Database credentials secured

### Access Patterns
- Public components in `components/`
- Protected routes in appropriate groups
- Server actions in secure contexts
- API routes with proper validation

---

This structure provides a scalable foundation for the Workplace Reviews Platform while maintaining clear separation of concerns and following Next.js 15 best practices.

# WorkplaceReviews - Anonymous IT Company Review Platform

A modern, minimalistic web application for sharing and discovering anonymous workplace reviews for IT and software companies. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Anonymous Reviews**: Post workplace reviews anonymously or with your profile
- **Company Profiles**: Browse and search IT companies with detailed information
- **Interactive Reviews**: Like, comment, and share reviews with other users
- **Modern UI**: Clean, minimalistic design following modern design principles
- **Responsive Design**: Fully responsive across all devices
- **Real-time Updates**: Live updates for likes, comments, and new reviews
- **Search & Filter**: Advanced search and filtering capabilities
- **User Authentication**: Secure authentication with Supabase Auth
- **Performance Optimized**: Lazy loading, caching, and optimized for speed

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- A Supabase account (for database and authentication)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd workplace-reviews
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy the SQL schema from `supabase-schema.sql` and run it in your Supabase SQL editor

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── companies/         # Company listing and details
│   ├── create-review/     # Review creation form
│   ├── reviews/           # Reviews listing
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── review/           # Review-related components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions and configurations
│   ├── supabase/         # Supabase client configuration
│   ├── auth.ts           # Authentication utilities
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # General utilities
└── middleware.ts         # Next.js middleware for auth
```

## 🎨 Design System

The application follows a modern, minimalistic design approach with:

- **Color Palette**: Blue and yellow accents on neutral grays
- **Typography**: Inter font family for clean readability
- **Components**: Consistent spacing, rounded corners, and subtle shadows
- **Responsive**: Mobile-first design with breakpoints for all screen sizes

## 🔧 Key Components

### ReviewCard
The main component for displaying reviews with:
- Star ratings
- Company information
- Like/comment/share functionality
- Anonymous posting indicators

### CommentSection
Interactive commenting system with:
- Anonymous commenting option
- Real-time comment display
- User authentication integration

### ShareModal
Social sharing functionality supporting:
- Direct link copying
- Social media platforms (Twitter, Facebook, LinkedIn)
- Email sharing

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## 🔒 Security Features

- Row Level Security (RLS) enabled on all Supabase tables
- User authentication and authorization
- Anonymous posting with privacy protection
- Input validation and sanitization
- CSRF protection via Next.js middleware

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📈 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting by Next.js
- **Caching**: Supabase query caching and Next.js static generation
- **Bundle Analysis**: Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for the styling system
- The open-source community for inspiration and tools

---

**Happy Reviewing! 🎉**

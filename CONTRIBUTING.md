# Contributing to Workplace Reviews Platform

Thank you for your interest in contributing to the Workplace Reviews Platform! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm, yarn, or pnpm
- Git
- A Supabase account for database setup

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/workplace-reviews.git`
3. Install dependencies: `npm install`
4. Set up environment variables (see README.md)
5. Run the development server: `npm run dev`

## 📋 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed information about the bug or feature request
- Include steps to reproduce for bugs
- Add screenshots if applicable

### Submitting Changes
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes thoroughly
4. Commit with clear messages: `git commit -m "Add: new feature description"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request

### Pull Request Guidelines
- Provide a clear description of changes
- Reference any related issues
- Ensure all tests pass
- Follow the existing code style
- Update documentation if needed

## 🎨 Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use proper prop types

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design

### File Organization
```
src/
├── app/           # Next.js pages
├── components/    # Reusable components
├── lib/          # Utilities and configurations
├── hooks/        # Custom React hooks
└── types/        # TypeScript type definitions
```

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript checks
```

### Writing Tests
- Write tests for new features
- Update tests when modifying existing code
- Use descriptive test names
- Test both success and error cases

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for functions and components
- Document complex logic
- Keep comments up to date

### README Updates
- Update README.md for new features
- Add examples for new functionality
- Keep installation instructions current

## 🔒 Security

### Reporting Security Issues
- Do not create public issues for security vulnerabilities
- Email security concerns to the maintainers
- Provide detailed information about the vulnerability

### Security Best Practices
- Validate all user inputs
- Use proper authentication checks
- Follow Supabase security guidelines
- Keep dependencies updated

## 🎯 Feature Requests

### Before Submitting
- Check if the feature already exists
- Search existing issues and discussions
- Consider if it fits the project scope

### Submitting Requests
- Use the feature request template
- Provide clear use cases
- Explain the expected behavior
- Consider implementation complexity

## 🐛 Bug Reports

### Information to Include
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots or error messages
- Relevant code snippets

### Bug Report Template
```
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
```

## 🏗️ Development Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow conventional commits:
- `feat: add new review filtering`
- `fix: resolve pagination issue`
- `docs: update API documentation`
- `style: improve button styling`
- `refactor: optimize database queries`

### Code Review Process
1. All changes require review
2. Address reviewer feedback
3. Ensure CI checks pass
4. Maintainer approval required for merge

## 📦 Release Process

### Versioning
- Follow semantic versioning (SemVer)
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Release Notes
- Document all changes
- Include migration instructions
- Highlight breaking changes

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Follow GitHub community guidelines

### Communication
- Use clear, professional language
- Be patient with new contributors
- Provide helpful feedback
- Ask questions when unclear

## 📞 Getting Help

### Resources
- README.md for setup instructions
- GitHub Discussions for questions
- Issue tracker for bugs
- Documentation in `/docs` folder

### Contact
- Create an issue for bugs or features
- Use discussions for general questions
- Email maintainers for security issues

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to the Workplace Reviews Platform! 🎉

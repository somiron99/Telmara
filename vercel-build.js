// Special build script for Vercel deployment
const { execSync } = require('child_process');

console.log('🚀 Starting custom Vercel build script...');

// Define global polyfill for self
global.self = global.self || global;

// Set environment variables to skip checks
process.env.SKIP_TYPE_CHECK = 'true';
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NEXT_TELEMETRY_DISABLED = '1';

try {
  // Clear any existing build
  console.log('🧹 Cleaning previous build...');
  try {
    execSync('rm -rf .next', { stdio: 'inherit' });
  } catch (e) {
    // Ignore if .next doesn't exist
  }

  // Run the build with special flags
  console.log('📦 Building Next.js app with special configuration...');
  execSync('npx next build', {
    env: {
      ...process.env,
      NODE_OPTIONS: '--max_old_space_size=4096 --no-warnings',
      NEXT_TELEMETRY_DISABLED: '1',
      SKIP_TYPE_CHECK: 'true',
      DISABLE_ESLINT_PLUGIN: 'true',
      NODE_ENV: 'production'
    },
    stdio: 'inherit'
  });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('🔄 Trying alternative build approach...');

  // Try with different approach
  try {
    execSync('NODE_OPTIONS="--max_old_space_size=4096" npx next build', {
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NODE_ENV: 'production'
      },
      stdio: 'inherit'
    });
    console.log('✅ Alternative build succeeded!');
  } catch (altError) {
    console.error('❌ Alternative build also failed:', altError.message);
    process.exit(1);
  }
}

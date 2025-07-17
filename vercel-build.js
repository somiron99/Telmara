// Special build script for Vercel deployment
const { execSync } = require('child_process');

console.log('🚀 Starting custom Vercel build script...');

// Set environment variables to skip checks
process.env.SKIP_TYPE_CHECK = 'true';
process.env.DISABLE_ESLINT_PLUGIN = 'true';

try {
  // Run the build with special flags
  console.log('📦 Building Next.js app with special configuration...');
  execSync('next build', {
    env: {
      ...process.env,
      NODE_OPTIONS: '--max_old_space_size=4096',
      NEXT_TELEMETRY_DISABLED: '1',
      SKIP_TYPE_CHECK: 'true',
      DISABLE_ESLINT_PLUGIN: 'true'
    },
    stdio: 'inherit'
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

import SupabaseTest from '@/components/test/supabase-test'

export default function TestSupabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supabase Connection Test
          </h1>
          <p className="text-gray-600">
            Test your Supabase database connection and configuration
          </p>
        </div>
        
        <SupabaseTest />
        
        <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Instructions</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">1.</span>
              <div>
                <p className="font-medium">Create Supabase Project</p>
                <p className="text-gray-600">Go to supabase.com and create a new project</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">2.</span>
              <div>
                <p className="font-medium">Get API Keys</p>
                <p className="text-gray-600">Copy your Project URL and Anon Key from Settings → API</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">3.</span>
              <div>
                <p className="font-medium">Update .env.local</p>
                <p className="text-gray-600">Replace the placeholder values with your actual credentials</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">4.</span>
              <div>
                <p className="font-medium">Run Database Schema</p>
                <p className="text-gray-600">Execute the SQL from supabase-schema.sql in your Supabase SQL Editor</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">5.</span>
              <div>
                <p className="font-medium">Add Sample Data (Optional)</p>
                <p className="text-gray-600">Run sample-data.sql to add test companies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

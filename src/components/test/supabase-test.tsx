'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setupDatabase, seedCompanies } from '@/lib/setup-database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ConnectionStatus {
  connected: boolean
  error?: string
  companies?: Array<{
    id: string
    name: string
    slug: string
    industry: string | null
    location: string | null
  }>
  loading: boolean
}

export default function SupabaseTest() {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false, loading: true })
  const supabase = createClient()

  const testConnection = async () => {
    setStatus({ connected: false, loading: true })

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, industry')
        .limit(5)

      if (error) {
        setStatus({
          connected: false,
          loading: false,
          error: `Database Error: ${error.message}`
        })
        return
      }

      setStatus({
        connected: true,
        loading: false,
        companies: (data || []).map((company: { id: string; name: string; slug?: string; industry?: string; location?: string }) => ({
          id: company.id,
          name: company.name,
          slug: company.slug || '',
          industry: company.industry || null,
          location: company.location || null
        }))
      })
    } catch (err) {
      setStatus({
        connected: false,
        loading: false,
        error: `Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      })
    }
  }

  const testCompanyCreation = async () => {
    try {
      console.log('Testing company creation...')
      const testCompanyName = 'Moses and Sears Trading Test ' + Date.now()

      const companyData = {
        name: testCompanyName,
        slug: testCompanyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: 'Test company for Moses and Sears Trading',
        website: 'https://test.com',
        industry: 'Trading',
        size: '1-50',
        location: 'Test Location',
        founded: '2024'
      }

      console.log('Inserting company data:', companyData)

      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select('*')
        .single()

      console.log('Company creation result:', { data, error })

      if (error) {
        console.error('❌ Company creation failed:', error)
        alert(`Company creation failed: ${error.message}`)
      } else {
        console.log('✅ Company created successfully:', data)
        alert(`Company created successfully: ${data.name}`)
      }
    } catch (err) {
      console.error('💥 Company creation error:', err)
      alert(`Exception: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  useEffect(() => {
    testConnection()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🔗</span>
          <span>Supabase Connection Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            status.loading ? 'bg-yellow-500 animate-pulse' : 
            status.connected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="font-medium">
            {status.loading ? 'Testing connection...' : 
             status.connected ? 'Connected to Supabase!' : 'Connection failed'}
          </span>
        </div>

        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{status.error}</p>
          </div>
        )}

        {status.connected && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm mb-2">
              ✅ Successfully connected to Supabase database!
            </p>
            <p className="text-green-600 text-xs">
              Found {status.companies?.length || 0} companies in the database
            </p>
            {status.companies && status.companies.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Sample companies:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {status.companies.slice(0, 3).map((company) => (
                    <li key={company.id} className="flex items-center space-x-2">
                      <span>•</span>
                      <span>{company.name}</span>
                      {company.industry && (
                        <span className="text-gray-500">({company.industry})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={testConnection}
            disabled={status.loading}
            className="w-full"
          >
            {status.loading ? 'Testing...' : 'Test Connection Again'}
          </Button>

          <Button
            onClick={testCompanyCreation}
            disabled={status.loading}
            variant="outline"
            className="w-full"
          >
            Test Company Creation
          </Button>

          <Button
            onClick={async () => {
              const success = await setupDatabase()
              if (success) {
                await seedCompanies()
                testConnection() // Refresh the connection test
              }
            }}
            disabled={status.loading}
            variant="secondary"
            className="w-full"
          >
            Setup Database & Seed Companies
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Environment:</strong></p>
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}</p>
          <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured ✅' : 'Not configured ❌'}</p>
        </div>
      </CardContent>
    </Card>
  )
}

import { createClient } from '@/lib/supabase/client'

export async function setupDatabase() {
  const supabase = createClient()
  
  try {
    console.log('Setting up database tables...')
    
    // Check if companies table exists by trying to select from it
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    
    if (error && error.message.includes('relation "companies" does not exist')) {
      console.error('Companies table does not exist. Please create it using the Supabase dashboard.')
      console.log('Go to your Supabase dashboard > SQL Editor and run the schema from supabase-schema.sql')
      return false
    }
    
    if (error) {
      console.error('Database error:', error)
      return false
    }
    
    console.log('Database tables exist and are accessible!')
    return true
    
  } catch (err) {
    console.error('Setup error:', err)
    return false
  }
}

export async function seedCompanies() {
  const supabase = createClient()
  
  const companies = [
    {
      name: 'TechCorp Inc.',
      slug: 'techcorp',
      description: 'Leading software company specializing in enterprise solutions and cloud infrastructure.',
      website: 'https://techcorp.com',
      industry: 'Technology',
      size: '1000-5000',
      location: 'San Francisco, CA',
      founded: '2010'
    },
    {
      name: 'StartupXYZ',
      slug: 'startupxyz',
      description: 'Fast-growing startup in the fintech space, revolutionizing digital payments.',
      website: 'https://startupxyz.com',
      industry: 'Financial Technology',
      size: '50-200',
      location: 'New York, NY',
      founded: '2018'
    },
    {
      name: 'DataFlow Systems',
      slug: 'dataflow',
      description: 'Big data analytics and machine learning solutions for enterprise clients.',
      website: 'https://dataflow.com',
      industry: 'Data Analytics',
      size: '200-500',
      location: 'Seattle, WA',
      founded: '2015'
    }
  ]
  
  try {
    for (const company of companies) {
      const { error } = await supabase
        .from('companies')
        .upsert(company, { onConflict: 'slug' })
      
      if (error) {
        console.error(`Error seeding company ${company.name}:`, error)
      } else {
        console.log(`Seeded company: ${company.name}`)
      }
    }
    
    return true
  } catch (err) {
    console.error('Error seeding companies:', err)
    return false
  }
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SampleDataCreator() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')
  const supabase = createClient()

  const createSampleData = async () => {
    try {
      setLoading(true)
      setStatus('Creating sample data...')

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('❌ Please sign in first')
        return
      }

      // Create sample companies
      setStatus('Creating companies...')
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .insert([
          {
            name: 'TechCorp Inc.',
            slug: 'techcorp-inc',
            description: 'Leading software development company specializing in web applications',
            website: 'https://techcorp.com',
            industry: 'Software Development',
            size: '100-500',
            location: 'San Francisco, CA'
          },
          {
            name: 'DataSoft Solutions',
            slug: 'datasoft-solutions',
            description: 'Data analytics and machine learning solutions provider',
            website: 'https://datasoft.com',
            industry: 'Data Analytics',
            size: '50-100',
            location: 'New York, NY'
          },
          {
            name: 'CloudTech Systems',
            slug: 'cloudtech-systems',
            description: 'Cloud infrastructure and DevOps services',
            website: 'https://cloudtech.com',
            industry: 'Cloud Computing',
            size: '200-1000',
            location: 'Seattle, WA'
          }
        ])
        .select('id, name')

      if (companiesError) {
        console.error('Error creating companies:', companiesError)
        setStatus('❌ Error creating companies: ' + companiesError.message)
        return
      }

      if (!companies || companies.length === 0) {
        setStatus('❌ No companies were created')
        return
      }

      // Create sample reviews
      setStatus('Creating reviews...')
      const reviewsToCreate = [
        {
          company_id: companies[0].id,
          author_id: user.id,
          title: 'Amazing workplace culture and growth opportunities',
          content: 'I have been working at TechCorp for over 2 years now and it has been an incredible journey. The company culture is fantastic, with a strong emphasis on work-life balance and professional development. The team is supportive and collaborative, and management is very understanding. There are excellent opportunities for career growth and the benefits package is competitive.',
          rating: 5,
          position: 'Senior Software Engineer',
          department: 'Engineering',
          employment_type: 'Full-time',
          work_location: 'Remote',
          is_anonymous: false,
          is_current_employee: true,
          pros: 'Great work-life balance, competitive salary, excellent benefits, supportive team, growth opportunities',
          cons: 'Sometimes the workload can be intense during product launches, limited parking at the office',
          advice_to_management: 'Keep up the great work! Maybe consider more team building activities and flexible working hours.'
        },
        {
          company_id: companies[1].id,
          author_id: user.id,
          title: 'Good company with room for improvement',
          content: 'DataSoft is a solid company with interesting projects in the data analytics space. The work is challenging and you get to work with cutting-edge technologies. However, there are some areas that could be improved, particularly in terms of communication and project management.',
          rating: 3,
          position: 'Data Scientist',
          department: 'Analytics',
          employment_type: 'Full-time',
          work_location: 'Hybrid',
          is_anonymous: false,
          is_current_employee: true,
          pros: 'Interesting projects, modern tech stack, good learning opportunities',
          cons: 'Communication could be better, sometimes unclear project requirements, limited career advancement',
          advice_to_management: 'Improve communication between teams and provide clearer project guidelines.'
        },
        {
          company_id: companies[2].id,
          author_id: user.id,
          title: 'Excellent place for cloud engineers',
          content: 'CloudTech Systems is an excellent place to work if you are passionate about cloud technologies and DevOps. The company is at the forefront of cloud innovation and provides great opportunities to work with the latest tools and technologies. The team is knowledgeable and always willing to help.',
          rating: 4,
          position: 'DevOps Engineer',
          department: 'Infrastructure',
          employment_type: 'Full-time',
          work_location: 'Office',
          is_anonymous: false,
          is_current_employee: true,
          pros: 'Cutting-edge technology, knowledgeable team, good compensation, excellent learning environment',
          cons: 'Fast-paced environment can be stressful, on-call rotations, limited remote work options',
          advice_to_management: 'Consider offering more flexible remote work options and better work-life balance during on-call periods.'
        }
      ]

      const { error: reviewsError } = await supabase
        .from('reviews')
        .insert(reviewsToCreate)

      if (reviewsError) {
        console.error('Error creating reviews:', reviewsError)
        setStatus('❌ Error creating reviews: ' + reviewsError.message)
        return
      }

      setStatus('✅ Sample data created successfully! Refresh the page to see the reviews.')
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Error creating sample data:', error)
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sample Data Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          No reviews found? Create some sample data to test the like functionality.
        </p>
        
        {status && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">{status}</p>
          </div>
        )}

        <Button 
          onClick={createSampleData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Sample Data'}
        </Button>
      </CardContent>
    </Card>
  )
}

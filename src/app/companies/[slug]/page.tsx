'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, MapPin, Users, Star, ArrowLeft, ExternalLink } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import ReviewCard from '@/components/review/review-card'
import { useReviewActions } from '@/hooks/useReviewActions'
import { fetchCompanyBySlug, fetchReviewsByCompanySlug } from '@/lib/reviews'
import { ReviewWithCompany } from '@/lib/types'

// Mock company data
const mockCompanies = {
  'techcorp': {
    id: '1',
    name: 'TechCorp Inc.',
    slug: 'techcorp',
    description: 'Leading software company specializing in enterprise solutions and cloud infrastructure.',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: '1000-5000',
    location: 'San Francisco, CA',
    founded: '2010',
  },
  'startupxyz': {
    id: '2',
    name: 'StartupXYZ',
    slug: 'startupxyz',
    description: 'Fast-growing startup in the fintech space, revolutionizing digital payments.',
    website: 'https://startupxyz.com',
    industry: 'Financial Technology',
    size: '50-200',
    location: 'New York, NY',
    founded: '2018',
  },
  'dataflow': {
    id: '3',
    name: 'DataFlow Systems',
    slug: 'dataflow',
    description: 'Big data analytics and machine learning solutions for enterprise clients.',
    website: 'https://dataflow.com',
    industry: 'Data Analytics',
    size: '200-500',
    location: 'Seattle, WA',
    founded: '2015',
  }
}

export default function CompanyPage() {
  const params = useParams()
  const slug = params.slug as string
  const [sortBy, setSortBy] = useState('newest')
  const [company, setCompany] = useState<{
    id: string
    name: string
    slug: string
    description: string | null
    website: string | null
    industry: string | null
    size: string | null
    location: string | null
    founded?: string
  } | null>(null)
  const [companyReviews, setCompanyReviews] = useState<ReviewWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const { likeReview, addComment } = useReviewActions()

  // Fetch company and reviews data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch company data
        const companyData = await fetchCompanyBySlug(slug)
        if (!companyData) {
          // Fallback to mock data if company not found in database
          const mockCompany = mockCompanies[slug as keyof typeof mockCompanies]
          setCompany(mockCompany || null)
        } else {
          setCompany(companyData)
        }

        // Fetch reviews for this company
        const reviewsData = await fetchReviewsByCompanySlug(slug)
        setCompanyReviews(reviewsData)
      } catch (error) {
        console.error('Error fetching company data:', error)
        // Fallback to mock data
        const mockCompany = mockCompanies[slug as keyof typeof mockCompanies]
        setCompany(mockCompany || null)
        setCompanyReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // Sort reviews
  const sortedReviews = [...companyReviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'highest-rated':
        return b.rating - a.rating
      case 'lowest-rated':
        return a.rating - b.rating
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  // Calculate average rating
  const averageRating = companyReviews.length > 0 
    ? companyReviews.reduce((sum, review) => sum + review.rating, 0) / companyReviews.length 
    : 0

  const handleLike = (reviewId: string) => {
    likeReview(reviewId)
  }

  const handleComment = (reviewId: string) => {
    console.log('Toggle comments for review:', reviewId)
  }

  const handleShare = (reviewId: string) => {
    console.log('Share review:', reviewId)
  }

  const handleAddComment = async (reviewId: string, content: string, isAnonymous: boolean) => {
    await addComment(reviewId, content, isAnonymous)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <>
        <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40" />
        <div className="flex-1 lg:ml-72">
          <div className="text-center py-16 px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading company information...</p>
          </div>
        </div>
      </>
    )
  }

  if (!company) {
    return (
      <>
        <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40" />
        <div className="flex-1 lg:ml-72">
          <div className="text-center py-16 px-6">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Company not found</h3>
            <p className="text-gray-500 text-sm mb-4">The company you&apos;re looking for doesn&apos;t exist</p>
            <Link href="/companies">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40" />
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <Link href="/companies">
            <Button variant="ghost" size="sm" className="mb-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">{company.industry}</p>
              </div>
            </div>
            
            <Link href={`/create-review?company=${company.slug}`}>
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                Write Review
              </Button>
            </Link>
          </div>
        </div>

        {/* Company Info */}
        <div className="px-6 pb-6">
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">{company.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Location</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-900">{company.location}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Size</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-900">{company.size}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Founded</span>
                  <p className="text-gray-900 mt-1">{company.founded}</p>
                </div>
                <div>
                  <span className="text-gray-500">Website</span>
                  <a
                    href={company.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 mt-1 text-blue-600 hover:text-blue-800"
                  >
                    <span className="text-sm">Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900">
                Reviews ({companyReviews.length})
              </h2>
              {companyReviews.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(averageRating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} average
                  </span>
                </div>
              )}
            </div>
            
            {companyReviews.length > 0 && (
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 text-sm border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest-rated">Highest Rated</SelectItem>
                  <SelectItem value="lowest-rated">Lowest Rated</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Reviews List */}
          {sortedReviews.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
              <p className="text-gray-500 text-sm mb-4">Be the first to review {company.name}</p>
              <Link href={`/create-review?company=${company.slug}`}>
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                  Write First Review
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pb-8">
              {sortedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onAddComment={handleAddComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

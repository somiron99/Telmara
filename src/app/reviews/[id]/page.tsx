'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, Calendar, MapPin, Briefcase } from 'lucide-react'
import { ReviewWithCompany } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import ReviewCard from '@/components/review/review-card'
import { useReviewActions } from '@/hooks/useReviewActions'

export default function IndividualReviewPage() {
  const params = useParams()
  const router = useRouter()
  const reviewId = params.id as string
  const [review, setReview] = useState<ReviewWithCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { likeReview, addComment } = useReviewActions()
  const supabase = createClient()

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('reviews')
          .select(`
            *,
            companies (
              id,
              name,
              slug,
              logo_url,
              industry,
              location,
              size
            ),
            reactions (
              id,
              type,
              user_id
            ),
            comments (
              id,
              content,
              is_anonymous,
              created_at,
              author_id
            )
          `)
          .eq('id', reviewId)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Review not found')
          } else {
            setError('Failed to load review')
          }
          return
        }

        if (data) {
          setReview(data as ReviewWithCompany)
        }
      } catch (err) {
        console.error('Error fetching review:', err)
        setError('Failed to load review')
      } finally {
        setLoading(false)
      }
    }

    if (reviewId) {
      fetchReview()
    }
  }, [reviewId, supabase])

  const handleLike = (reviewId: string) => {
    likeReview(reviewId)
  }

  const handleComment = (reviewId: string) => {
    console.log('Comment on review:', reviewId)
  }

  const handleShare = (reviewId: string) => {
    console.log('Share review:', reviewId)
  }

  const handleAddComment = async (reviewId: string, content: string, isAnonymous: boolean) => {
    await addComment(reviewId, content, isAnonymous)
  }

  if (loading) {
    return (
      <div className="flex-1 w-full px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="flex-1 w-full px-8 py-6">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Review not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The review you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button 
            onClick={() => router.push('/reviews')}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reviews
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Review of {review.companies.name}
          </h1>
        </div>
        
        <p className="text-gray-600">
          Shared review • {formatRelativeTime(review.created_at)}
        </p>
      </div>

      {/* Review Card */}
      <div className="max-w-4xl">
        <ReviewCard
          review={review}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onAddComment={handleAddComment}
        />
      </div>

      {/* Company Info */}
      <div className="mt-8 max-w-4xl">
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {review.companies.name}
                  </h3>
                  <p className="text-gray-600">{review.companies.industry}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => router.push(`/companies/${review.companies.slug}`)}
                size="sm" 
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                View Company
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{review.companies.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>{review.companies.size} employees</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Industry: {review.companies.industry}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

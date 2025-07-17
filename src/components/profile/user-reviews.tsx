'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Building2, Calendar, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ReviewWithCompany } from '@/lib/types'

interface UserReviewsProps {
  userId: string
}

export default function UserReviews({ userId }: UserReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnonymous, setShowAnonymous] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            companies (
              id,
              name,
              slug,
              logo_url,
              industry,
              location
            )
          `)
          .eq('author_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        setReviews(data || [])
      } catch (error) {
        console.error('Error fetching user reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserReviews()
  }, [userId, supabase])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const filteredReviews = showAnonymous 
    ? reviews 
    : reviews.filter(review => !review.is_anonymous)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Reviews ({reviews.length})</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnonymous(!showAnonymous)}
            className="flex items-center gap-2"
          >
            {showAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnonymous ? 'Hide Anonymous' : 'Show Anonymous'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showAnonymous ? 'No reviews found' : 'No public reviews'}
            </h3>
            <p className="text-gray-500 mb-4">
              {showAnonymous 
                ? "You haven't written any reviews yet." 
                : "You haven't written any public reviews yet."
              }
            </p>
            <Button>Write Your First Review</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                {/* Company Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded flex items-center justify-center">
                    {review.companies?.logo_url ? (
                      <img 
                        src={review.companies.logo_url} 
                        alt={review.companies.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.companies?.name || 'Unknown Company'}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{review.position}</span>
                      {review.is_anonymous && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          Anonymous
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating and Title */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {review.rating}/5
                    </span>
                  </div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    {review.title}
                  </h5>
                </div>

                {/* Review Content */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {review.content}
                </p>

                {/* Pros and Cons */}
                {(review.pros || review.cons) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {review.pros && (
                      <div>
                        <h6 className="text-sm font-medium text-green-700 mb-1">Pros</h6>
                        <p className="text-sm text-gray-600">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div>
                        <h6 className="text-sm font-medium text-red-700 mb-1">Cons</h6>
                        <p className="text-sm text-gray-600">{review.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {review.employment_type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {review.work_location}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

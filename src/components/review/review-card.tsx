'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, Star } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { ReviewWithCompany, CommentWithAuthor } from '@/lib/types'
import CommentSection from './comment-section'
import { useShareModal } from '@/contexts/ShareModalContext'
import { createClient } from '@/lib/supabase/client'

interface ReviewCardProps {
  review: ReviewWithCompany
  onLike?: (reviewId: string) => Promise<void> | void
  onComment?: (reviewId: string) => void
  onShare?: (reviewId: string) => void
  onAddComment?: (reviewId: string, content: string, isAnonymous: boolean) => Promise<void> | void
}

export default function ReviewCard({ review, onLike, onComment, onShare, onAddComment }: ReviewCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { openShareModal } = useShareModal()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)
      } catch (error) {
        console.error('Error getting current user:', error)
        setCurrentUserId(null)
      }
    }

    getCurrentUser()
  }, [supabase])

  // Calculate like state from props (real-time updates)
  const isLiked = currentUserId ? review.reactions?.some(r => r.type === 'like' && r.user_id === currentUserId) || false : false
  const likeCount = review.reactions?.filter(r => r.type === 'like').length || 0

  const handleLike = async () => {
    if (!currentUserId) {
      const shouldSignIn = confirm('You need to sign in to like reviews. Would you like to go to the sign in page?')
      if (shouldSignIn) {
        window.location.href = '/auth/login'
      }
      return
    }

    if (onLike) {
      try {
        await onLike(review.id)
      } catch (error) {
        console.error('Error liking review:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to like review'

        if (errorMessage.includes('Database permission error')) {
          alert('Database setup required. Please contact the administrator to run the database setup script.')
        } else if (errorMessage.includes('Permission denied')) {
          alert('Permission denied. Please make sure you are properly signed in.')
        } else if (errorMessage.includes('does not exist')) {
          alert('Database table missing. Please contact the administrator.')
        } else {
          alert(`Failed to like review: ${errorMessage}`)
        }
      }
    }
  }

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

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border border-gray-100/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center flex-1 mr-4">
              <h3 className="text-xl font-semibold text-gray-900 leading-tight">{review.title}</h3>
              {review.author_id === 'current-user' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Your Post
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {renderStars(review.rating)}
              <span className="ml-1 text-base text-gray-600">{review.rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-base text-gray-600">
              <span className="font-medium">{review.companies.name}</span>
              {review.position && <span>• {review.position}</span>}
              <span>• {formatRelativeTime(review.created_at)}</span>
            </div>

            <div className="flex items-center space-x-2">
              {review.is_current_employee && (
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                  Current
                </span>
              )}
              {review.is_anonymous && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                  Anonymous
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed text-base">
            {review.content.length > 200
              ? `${review.content.substring(0, 200)}...`
              : review.content
            }
          </p>
        </div>

        {/* Minimalistic Read More Button */}
        {review.content.length > 200 && (
          <div className="mb-4">
            <button
              onClick={() => router.push(`/reviews/${review.id}`)}
              className="text-blue-500 hover:text-blue-700 text-sm font-normal underline decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-200"
            >
              Read More
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!currentUserId}
              className={`flex items-center space-x-1 text-sm ${
                isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              } ${!currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!currentUserId ? 'Sign in to like reviews' : isLiked ? 'Unlike this review' : 'Like this review'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowComments(!showComments)
                onComment?.(review.id)
              }}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Comments</span>
              {review.comments && review.comments.length > 0 && (
                <span className="text-xs">({review.comments.length})</span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                openShareModal({
                  reviewId: review.id,
                  reviewTitle: review.title,
                  companyName: review.companies.name
                })
                onShare?.(review.id)
              }}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {review.employment_type && <span>{review.employment_type}</span>}
            {review.work_location && <span>• {review.work_location}</span>}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && onAddComment && (
          <CommentSection
            reviewId={review.id}
            comments={(review.comments as CommentWithAuthor[]) || []}
            onAddComment={onAddComment}
          />
        )}


      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Star, 
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ReviewWithCompany } from '@/lib/types'
import { useReviewActions } from '@/hooks/useReviewActions'
import CommentSection from '@/components/review/comment-section'
import { SuccessModal } from '@/components/ui/success-modal'

export default function SingleReviewPage() {
  const params = useParams()
  const router = useRouter()
  const reviewId = params.id as string
  const [review, setReview] = useState<ReviewWithCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { likeReview, addComment } = useReviewActions()
  const supabase = createClient()

  useEffect(() => {
    fetchReview()
    getCurrentUser()
  }, [reviewId])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    } catch (error) {
      console.error('Error getting current user:', error)
      setCurrentUserId(null)
    }
  }

  const fetchReview = async () => {
    try {
      setLoading(true)
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
            location,
            size,
            description,
            website,
            created_at,
            updated_at
          ),
          reactions (
            id,
            type,
            user_id,
            created_at
          ),
          comments (
            id,
            content,
            is_anonymous,
            created_at,
            updated_at,
            author_id
          )
        `)
        .eq('id', reviewId)
        .single()

      if (error) {
        throw error
      }

      setReview(data)
    } catch (error) {
      console.error('Error fetching review:', error)
      setError('Failed to load review')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!review) return
    
    try {
      await likeReview(review.id, currentUserId || undefined)
      setSuccessMessage('Thank you for your feedback!')
      setShowSuccessModal(true)
      await fetchReview()
    } catch (error) {
      console.error('Error liking review:', error)
    }
  }

  const handleAddComment = async (reviewId: string, content: string, isAnonymous: boolean, parentCommentId?: string) => {
    if (!review) return
    
    try {
      await addComment(
        reviewId, 
        content, 
        isAnonymous, 
        currentUserId || undefined,
        parentCommentId
      )
      
      setSuccessMessage(parentCommentId ? 'Reply added successfully!' : 'Comment added successfully!')
      setShowSuccessModal(true)
      
      await fetchReview()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setSuccessMessage('Review link copied to clipboard!')
    setShowSuccessModal(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading review...</div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The review you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button 
            onClick={() => router.push('/reviews')} 
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Back to Reviews
          </button>
        </div>
      </div>
    )
  }

  const isLiked = review.reactions?.some(r => r.type === 'like' && r.user_id === currentUserId)
  const likeCount = review.reactions?.filter(r => r.type === 'like').length || 0
  const commentCount = review.comments?.length || 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl px-4 py-6">
        {/* Simple Back Link */}
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-700 text-sm mb-6 flex items-center cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to reviews
        </button>

        {/* Perfectly Centered Review Content */}
        <div className="bg-white rounded-lg shadow-sm border mx-auto max-w-2xl">
          <div className="p-8">
          {/* Company Name */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{review.companies.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{review.companies.location}</span>
              <span>•</span>
              <span>{review.companies.industry}</span>
            </div>
          </div>

          {/* Review Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{review.title}</h2>

          {/* Rating */}
          <div className="flex items-center mb-6">
            {renderStars(review.rating)}
            <span className="text-lg font-medium text-gray-900 ml-2">{review.rating}.0</span>
          </div>

          {/* Employment Info */}
          <div className="flex items-center space-x-3 mb-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
              {review.employment_type || 'Not specified'}
            </span>
            <span className="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full">
              {review.work_location || 'Not specified'}
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
              {review.is_current_employee ? 'Current Employee' : 'Former Employee'}
            </span>
          </div>

          {/* Review Content */}
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
              {review.content}
            </p>
          </div>



          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-6 border-t">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                isLiked
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-6 pt-4 border-t">
            <span>
              {review.is_anonymous ? 'Anonymous' : 'Verified Employee'}
              {review.position && ` • ${review.position}`}
              {review.department && ` • ${review.department}`}
            </span>
            <span>{formatDate(review.created_at)}</span>
          </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm border mx-auto max-w-2xl mt-6">
          <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Comments ({commentCount})
          </h3>
          
          <CommentSection
            reviewId={review.id}
            comments={review.comments || []}
            onAddComment={handleAddComment}
          />
          </div>
        </div>

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Success! 🎉"
          message={successMessage}
          actionText="Continue"
          onAction={() => setShowSuccessModal(false)}
        />
      </div>
    </div>
  )
}

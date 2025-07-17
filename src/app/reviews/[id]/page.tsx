'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  Heart,
  MessageSquare,
  Share2,
  ArrowLeft,
  User,
  Briefcase,
  Clock,
  ThumbsUp,
  ThumbsDown,
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
  const [showComments, setShowComments] = useState(false)
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
      // Refresh the review to get updated like count
      await fetchReview()
    } catch (error) {
      console.error('Error liking review:', error)
    }
  }

  const handleAddComment = async (reviewId: string, content: string, isAnonymous: boolean) => {
    if (!review) return

    try {
      await addComment(reviewId, content, isAnonymous, currentUserId || undefined)
      setSuccessMessage('Comment added successfully!')
      setShowSuccessModal(true)
      // Refresh the review to get updated comments
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

  const getEmploymentTypeColor = (type: string | null) => {
    if (!type) return 'bg-gray-100 text-gray-800'
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800'
      case 'part-time':
        return 'bg-blue-100 text-blue-800'
      case 'contract':
        return 'bg-purple-100 text-purple-800'
      case 'internship':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getWorkLocationColor = (location: string | null) => {
    if (!location) return 'bg-gray-100 text-gray-800'
    switch (location.toLowerCase()) {
      case 'remote':
        return 'bg-blue-100 text-blue-800'
      case 'office':
        return 'bg-gray-100 text-gray-800'
      case 'hybrid':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="flex-1 max-w-4xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'The review you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Button onClick={() => router.push('/reviews')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reviews
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLiked = review.reactions?.some(r => r.type === 'like' && r.user_id === currentUserId)
  const likeCount = review.reactions?.filter(r => r.type === 'like').length || 0
  const commentCount = review.comments?.length || 0

  return (
    <div className="flex-1 max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6 hover:bg-gray-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Main Review Card */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          {/* Company Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{review.companies.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {review.companies.location}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {review.companies.size} employees
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {review.companies.industry}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={`${isLiked ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                {commentCount}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          {/* Review Title and Rating */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{review.title}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
                <span className="text-lg font-semibold text-gray-900 ml-2">
                  {review.rating}.0
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getEmploymentTypeColor(review.employment_type)}>
                  {review.employment_type}
                </Badge>
                <Badge className={getWorkLocationColor(review.work_location)}>
                  {review.work_location}
                </Badge>
                {review.is_current_employee ? (
                  <Badge className="bg-green-100 text-green-800">Current Employee</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Former Employee</Badge>
                )}
              </div>
            </div>
          </div>
          {/* Author and Date Info */}
          <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {review.is_anonymous ? 'Anonymous' : 'Verified Employee'}
              </span>
              {review.position && (
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {review.position}
                </span>
              )}
              {review.department && (
                <span>• {review.department}</span>
              )}
            </div>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(review.created_at)}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {/* Main Review Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed">{review.content}</p>
          </div>

          {/* Pros and Cons */}
          {(review.pros || review.cons) && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {review.pros && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="flex items-center font-semibold text-green-800 mb-2">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Pros
                  </h3>
                  <p className="text-green-700">{review.pros}</p>
                </div>
              )}

              {review.cons && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="flex items-center font-semibold text-red-800 mb-2">
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Cons
                  </h3>
                  <p className="text-red-700">{review.cons}</p>
                </div>
              )}
            </div>
          )}

          {/* Advice to Management */}
          {review.advice_to_management && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="flex items-center font-semibold text-blue-800 mb-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                Advice to Management
              </h3>
              <p className="text-blue-700">{review.advice_to_management}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      {showComments && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Comments ({commentCount})</h3>
          </CardHeader>
          <CardContent>
            <CommentSection
              reviewId={review.id}
              comments={review.comments || []}
              onAddComment={handleAddComment}
            />
          </CardContent>
        </Card>
      )}

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
  )
}

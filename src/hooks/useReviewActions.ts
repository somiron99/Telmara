'use client'

import { useReviews } from '@/contexts/ReviewContext'
import { useNotifications } from '@/contexts/NotificationContext'

export function useReviewActions() {
  const { reviews, likeReview: originalLikeReview, addComment: originalAddComment, addReview, updateReview, deleteReview } = useReviews()
  const { addNotification } = useNotifications()

  const likeReview = async (reviewId: string, userId?: string) => {
    // Find the review being liked
    const review = reviews.find(r => r.id === reviewId)
    if (!review) return

    // Call the original like function (it will handle user authentication)
    await originalLikeReview(reviewId, userId)
  }

  const addComment = async (reviewId: string, content: string, isAnonymous: boolean, userId?: string) => {
    // Find the review being commented on
    const review = reviews.find(r => r.id === reviewId)
    if (!review) return

    // Skip notifications for now since we don't have proper user management
    // TODO: Implement proper notification system with real user IDs

    // Call the original add comment function
    await originalAddComment(reviewId, content, isAnonymous, userId)
  }

  // Helper function to get user display name
  const getUserDisplayName = (userId: string | null | undefined) => {
    if (!userId) return 'Anonymous'
    if (userId.length > 10) return `User ${userId.slice(-6)}`
    return 'User'
  }

  return {
    reviews,
    likeReview,
    addComment,
    addReview,
    updateReview,
    deleteReview
  }
}

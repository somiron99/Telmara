'use client'

import { useEffect } from 'react'
import { useReviews } from '@/contexts/ReviewContext'
import { useNotifications } from '@/contexts/NotificationContext'

export function useNotificationSimulation() {
  const { reviews, likeReview, addComment: originalAddComment } = useReviews()
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Simulate other users interacting with current user's posts
    const simulateInteractions = () => {
      // Find reviews by current user
      const currentUserReviews = reviews.filter(review => 
        review.author_id === 'current-user' && 
        review.reactions.length < 3 // Don't spam likes
      )

      if (currentUserReviews.length === 0) return

      const randomReview = currentUserReviews[Math.floor(Math.random() * currentUserReviews.length)]
      const actions = ['like', 'comment']
      const randomAction = actions[Math.floor(Math.random() * actions.length)]

      const simulatedUsers = [
        { id: 'user-1', name: 'Alex Johnson' },
        { id: 'user-2', name: 'Sarah Chen' },
        { id: 'user-3', name: 'Mike Rodriguez' },
        { id: 'user-4', name: 'Emily Davis' },
        { id: 'user-5', name: 'David Kim' }
      ]

      const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)]

      if (randomAction === 'like') {
        // Check if this user already liked this review
        const alreadyLiked = randomReview.reactions.some(r => 
          r.type === 'like' && r.user_id === randomUser.id
        )

        if (!alreadyLiked) {
          // Add notification first
          addNotification({
            type: 'like',
            message: 'liked your review',
            reviewId: randomReview.id,
            reviewTitle: randomReview.title,
            actorName: randomUser.name,
            isRead: false
          })

          // Then add the like
          likeReview(randomReview.id, randomUser.id)
        }
      } else if (randomAction === 'comment') {
        const comments = [
          'Great insights! Thanks for sharing.',
          'I had a similar experience at my company.',
          'This is really helpful for job seekers.',
          'Thanks for the honest review!',
          'Very detailed and informative.',
          'I appreciate your perspective on this.',
          'This matches what I\'ve heard from other employees.',
          'Helpful review, thank you!'
        ]

        const randomComment = comments[Math.floor(Math.random() * comments.length)]

        // Add notification first
        addNotification({
          type: 'comment',
          message: 'commented on your review',
          reviewId: randomReview.id,
          reviewTitle: randomReview.title,
          actorName: randomUser.name,
          isRead: false
        })

        // Then add the comment
        originalAddComment(randomReview.id, randomComment, false, randomUser.id)
      }
    }

    // Start simulation after 5 seconds, then every 20-30 seconds
    const initialTimeout = setTimeout(() => {
      simulateInteractions()
      
      const interval = setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance to trigger
          simulateInteractions()
        }
      }, 20000 + Math.random() * 10000) // 20-30 seconds

      return () => clearInterval(interval)
    }, 5000)

    return () => clearTimeout(initialTimeout)
  }, [reviews, likeReview, originalAddComment, addNotification])
}

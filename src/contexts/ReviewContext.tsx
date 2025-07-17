'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ReviewWithCompany } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

// No mock data - all reviews come from database

interface ReviewContextType {
  reviews: ReviewWithCompany[]
  loading: boolean
  totalReviews: number
  currentPage: number
  totalPages: number
  itemsPerPage: number
  addReview: (review: Omit<ReviewWithCompany, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateReview: (reviewId: string, updates: Partial<ReviewWithCompany>) => Promise<void>
  likeReview: (reviewId: string, userId?: string) => Promise<void>
  addComment: (reviewId: string, content: string, isAnonymous: boolean, userId?: string, parentCommentId?: string) => Promise<void>
  deleteReview: (reviewId: string) => Promise<void>
  fetchReviews: (page?: number, limit?: number) => Promise<void>
  setPage: (page: number) => void
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [totalReviews, setTotalReviews] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const supabase = createClient()

  const totalPages = Math.ceil(totalReviews / itemsPerPage)

  // Sort reviews by creation date (newest first)
  const sortedReviews = [...reviews].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Fetch reviews from Supabase with pagination
  const fetchReviews = async (page: number = 1, limit: number = itemsPerPage) => {
    try {
      setLoading(true)

      // First, get the total count
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })

      setTotalReviews(count || 0)

      // Then fetch the paginated data
      const from = (page - 1) * limit
      const to = from + limit - 1

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
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
      } else {
        setReviews(data || [])
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewById = async (reviewId: string) => {
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
        console.error('Error fetching review:', error)
        return
      }

      if (data) {
        // Update the specific review in the state
        setReviews(prev =>
          prev.map(review =>
            review.id === reviewId ? data : review
          )
        )
      }
    } catch (err) {
      console.error('Error fetching review:', err)
    }
  }

  // Load reviews on mount
  useEffect(() => {
    fetchReviews()
  }, [])

  // Simulation disabled - no automatic reviews

  const addReview = async (newReview: Omit<ReviewWithCompany, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Extract company data and review data
      const { companies, reactions, comments, ...reviewData } = newReview

      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
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
          )
        `)
        .single()

      if (error) {
        console.error('❌ Error adding review:', error)
        console.error('📋 Error details:', JSON.stringify(error, null, 2))
        console.error('📝 Review data sent:', reviewData)

        // More specific error messages
        if (error.code === '23502') {
          throw new Error(`Missing required field: ${error.details || 'Unknown field'}`)
        } else if (error.code === '23503') {
          throw new Error(`Invalid reference: ${error.details || 'Foreign key constraint failed'}`)
        } else if (error.code === '42501') {
          throw new Error('Permission denied. Please check your authentication.')
        } else {
          throw new Error(`Database error: ${error.message || error.code || 'Unknown error'}`)
        }
      }

      // Add the new review with empty reactions and comments
      const reviewWithRelations: ReviewWithCompany = {
        ...data,
        reactions: [],
        comments: []
      }

      setReviews(prev => [reviewWithRelations, ...prev])
    } catch (err) {
      console.error('❌ Exception in addReview:', err)
      if (err instanceof Error) {
        throw err // Re-throw the specific error
      } else {
        throw new Error('Failed to save review to database')
      }
    }
  }

  const updateReview = async (reviewId: string, updates: Partial<ReviewWithCompany>) => {
    try {
      // Extract only the fields that exist in the database table
      const { companies, reactions, comments, ...updateData } = updates

      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)

      if (error) {
        console.error('Error updating review:', error)
      }

      // Update local state regardless of database success/failure
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? { ...review, ...updates, updated_at: new Date().toISOString() }
            : review
        )
      )
    } catch (err) {
      console.error('Error updating review:', err)
      // Update local state as fallback
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? { ...review, ...updates, updated_at: new Date().toISOString() }
            : review
        )
      )
    }
  }

  const likeReview = async (reviewId: string, userId?: string) => {
    try {
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        throw new Error('User not authenticated')
      }

      // Always use the authenticated user's ID for RLS compliance
      const actualUserId = user.id
      console.log('Using authenticated user ID:', actualUserId)

      const currentReview = reviews.find(r => r.id === reviewId)
      if (!currentReview) {
        console.error('Review not found:', reviewId)
        throw new Error('Review not found')
      }

      const isCurrentlyLiked = currentReview.reactions.some(r => r.type === 'like' && r.user_id === actualUserId)

      if (isCurrentlyLiked) {
        // Remove like from database
        console.log('Attempting to remove reaction for:', {
          review_id: reviewId,
          user_id: actualUserId,
          type: 'like'
        })

        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', actualUserId)
          .eq('type', 'like')

        if (error) {
          console.error('Error removing like:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          throw new Error(`Failed to remove like: ${error.message || 'Unknown error'}`)
        }

        console.log('Like removed successfully')
      } else {
        // Add like to database
        console.log('Attempting to insert reaction:', {
          review_id: reviewId,
          user_id: actualUserId,
          type: 'like'
        })

        const { data, error } = await supabase
          .from('reactions')
          .insert([{
            review_id: reviewId,
            user_id: actualUserId,
            type: 'like'
          }])
          .select()

        if (error) {
          console.error('Error adding like:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))

          // Check if it's an RLS policy error (empty error object)
          if (!error.message && Object.keys(error).length === 0) {
            throw new Error('Database permission error. Please run the fix-reactions-table.sql script in your Supabase dashboard.')
          } else if (error.message?.includes('policy')) {
            throw new Error('Permission denied. Please check your database policies.')
          } else if (error.message?.includes('does not exist')) {
            throw new Error('Reactions table does not exist. Please run the database setup script.')
          } else {
            throw new Error(`Failed to add like: ${error.message || 'Unknown database error'}`)
          }
        }

        console.log('Like added successfully:', data)
      }

      // Refresh the specific review from database to get updated reactions
      await fetchReviewById(reviewId)
    } catch (err) {
      console.error('Error toggling like:', err)
      throw err
    }
  }

  const addComment = async (reviewId: string, content: string, isAnonymous: boolean, userId?: string, parentCommentId?: string) => {
    try {
      console.log('🔄 Adding comment:', { reviewId, content, isAnonymous, userId })

      // First, verify the review exists
      console.log('🔍 Checking if review exists:', reviewId)
      const { data: reviewExists, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('id', reviewId)
        .single()

      if (reviewError || !reviewExists) {
        console.error('Review not found:', { reviewId, reviewError, reviewExists })
        console.warn('⚠️ Review verification failed. This might be a data sync issue.')

        // Try to refresh reviews data to sync with database
        console.log('🔄 Attempting to refresh reviews data...')
        try {
          await fetchReviews()
          console.log('✅ Reviews data refreshed')
        } catch (refreshError) {
          console.error('❌ Failed to refresh reviews:', refreshError)
        }

        // For now, proceed anyway since we removed foreign key constraints
        console.warn('⚠️ Proceeding with comment insertion despite review verification failure...')
      } else {
        console.log('✅ Review exists, proceeding with comment')
      }

      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        throw new Error('User not authenticated')
      }

      const actualUserId = userId || user.id
      console.log('👤 Using user ID:', actualUserId)

      // Insert comment
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          review_id: reviewId,
          author_id: isAnonymous ? null : actualUserId,
          content,
          is_anonymous: isAnonymous,
          parent_comment_id: parentCommentId || null
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error adding comment:', error)
        console.error('📋 Error details:', JSON.stringify(error, null, 2))
        console.error('🔍 Review ID:', reviewId)
        console.error('👤 User ID:', actualUserId)
        console.error('📝 Content:', content)

        // More specific error handling
        if (error.code === '23503') {
          throw new Error(`Database constraint error: The review (${reviewId}) may not exist in the database. Please refresh the page and try again.`)
        } else if (error.message?.includes('foreign key constraint')) {
          throw new Error(`Foreign key constraint error: Review ${reviewId} not found in database.`)
        } else if (error.message?.includes('policy')) {
          throw new Error('Permission denied. Please check your authentication.')
        } else if (error.code === '42501') {
          throw new Error('Insufficient permissions. Please sign in and try again.')
        } else {
          throw new Error(`Failed to add comment: ${error.message || error.code || 'Unknown error'}`)
        }
      }

      console.log('✅ Comment added to database:', data)

      // Refresh the specific review from database to get updated comments
      try {
        await fetchReviewById(reviewId)
        console.log('✅ Review data refreshed with new comment')
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh review data, but comment was added:', refreshError)
        // Don't throw error here, comment was successfully added
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err // Re-throw the error instead of fallback to avoid inconsistency

    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        console.error('Error deleting review:', error)
      }

      // Update local state regardless of database success/failure
      setReviews(prev => prev.filter(review => review.id !== reviewId))
    } catch (err) {
      console.error('Error deleting review:', err)
      // Update local state as fallback
      setReviews(prev => prev.filter(review => review.id !== reviewId))
    }
  }

  const setPage = (page: number) => {
    setCurrentPage(page)
    fetchReviews(page, itemsPerPage)
  }

  const value: ReviewContextType = {
    reviews: sortedReviews,
    loading,
    totalReviews,
    currentPage,
    totalPages,
    itemsPerPage,
    addReview,
    updateReview,
    likeReview,
    addComment,
    deleteReview,
    fetchReviews,
    setPage
  }

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewContext)
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider')
  }
  return context
}

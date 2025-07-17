'use client'

import React, { Suspense, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Sidebar from '@/components/layout/sidebar'
import ReviewSkeleton from '@/components/review/review-skeleton'
import SampleDataCreator from '@/components/admin/sample-data-creator'





import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { useReviewActions } from '@/hooks/useReviewActions'
import Notification from '@/components/ui/notification'
import { Pagination } from '@/components/ui/pagination'
import { useReviews } from '@/contexts/ReviewContext'
import {
  Search
} from 'lucide-react'

// Lazy load the ReviewCard component for better performance
const ReviewCard = dynamic(() => import('@/components/review/review-card'), {
  loading: () => <ReviewSkeleton />
})



export default function Home() {
  const [sortBy, setSortBy] = useState('newest')
  const [filterBy, setFilterBy] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState<string | null>(null)
  const [previousReviewCount, setPreviousReviewCount] = useState(0)
  const { reviews, likeReview, addComment } = useReviewActions()
  const {
    totalReviews,
    currentPage,
    totalPages,
    itemsPerPage,
    setPage
  } = useReviews()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])





  // Filter and sort reviews
  const filteredAndSortedReviews = React.useMemo(() => {
    let filtered = [...reviews]

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.companies.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.position?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply filters
    switch (filterBy) {
      case 'current':
        filtered = filtered.filter(review => review.is_current_employee)
        break
      case 'former':
        filtered = filtered.filter(review => !review.is_current_employee)
        break
      case 'high-rated':
        filtered = filtered.filter(review => review.rating >= 4)
        break
      case 'recent':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(review => new Date(review.created_at) > thirtyDaysAgo)
        break
      default:
        // 'all' - no filtering
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'highest-rated':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest-rated':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case 'most-helpful':
        filtered.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0))
        break
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    return filtered
  }, [reviews, filterBy, sortBy, searchTerm])

  // Show notification when new reviews are added
  useEffect(() => {
    if (previousReviewCount > 0 && reviews.length > previousReviewCount) {
      const newReviewsCount = reviews.length - previousReviewCount
      setNotification(`${newReviewsCount} new review${newReviewsCount > 1 ? 's' : ''} added!`)
    }
    setPreviousReviewCount(reviews.length)
  }, [reviews.length, previousReviewCount])

  const handleLike = async (reviewId: string) => {
    await likeReview(reviewId)
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

  if (loading) {
    return (
      <>
        <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40" />
        <div className="flex-1 lg:ml-72">
          <div className="text-center py-16 px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {notification && (
        <Notification
          message={notification}
          type="success"
          onClose={() => setNotification(null)}
        />
      )}
      <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40" />
      <div className="flex-1 lg:ml-72">
        <div className="w-full px-8 py-6">
          {/* Minimal Hero Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Workplace Reviews
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Read authentic employee experiences and share your workplace insights.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <Link href="/create-review">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                    Write Review
                  </Button>
                </Link>
                <Link href="/companies">
                  <Button variant="outline" className="px-6 py-2 border-gray-300">
                    Browse Companies
                  </Button>
                </Link>
              </div>
            </div>

          </div>



          {/* Reviews Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Latest Reviews</h2>
              <Link href="/reviews">
                <Button variant="outline" size="sm" className="text-sm">
                  View All
                </Button>
              </Link>
            </div>

            <div className="flex gap-3 mb-4">
              {/* Simple Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              {/* Simple Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="highest-rated">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>


          </div>

          {/* Reviews List */}
          <Suspense fallback={<div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReviewSkeleton key={i} />
            ))}
          </div>}>
            {filteredAndSortedReviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No reviews found</p>

                {/* Show sample data creator if no reviews at all */}
                {reviews.length === 0 && !searchTerm && (
                  <div className="mb-4">
                    <SampleDataCreator />
                  </div>
                )}

                <div className="flex items-center justify-center space-x-3">
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  )}
                  <Link href="/create-review">
                    <Button size="sm">
                      Write Review
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onAddComment={handleAddComment}
                  />
                ))}

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={totalReviews}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </>
  )
}

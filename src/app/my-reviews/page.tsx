'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  Building2, 
  Calendar, 
  Edit3, 
  Trash2, 
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Plus
} from 'lucide-react'
import { ReviewWithCompany } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import Sidebar from '@/components/layout/sidebar'
import Link from 'next/link'

export default function MyReviewsPage() {
  const [myReviews, setMyReviews] = useState<ReviewWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchMyReviews()
  }, [])

  const fetchMyReviews = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch user's reviews
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
            author_id
          )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching my reviews:', error)
        setMyReviews([])
      } else {
        setMyReviews(data || [])
      }
    } catch (err) {
      console.error('Error fetching my reviews:', err)
      setMyReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        console.error('Error deleting review:', error)
        alert('Failed to delete review. Please try again.')
      } else {
        // Remove from local state
        setMyReviews(prev => prev.filter(review => review.id !== reviewId))
        alert('Review deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      alert('Failed to delete review. Please try again.')
    }
  }

  const getFilteredReviews = () => {
    switch (activeTab) {
      case 'recent':
        return myReviews.filter(review => {
          const reviewDate = new Date(review.created_at)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return reviewDate >= thirtyDaysAgo
        })
      case 'popular':
        return myReviews.filter(review => review.reactions.length > 0)
      default:
        return myReviews
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
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
            <p className="text-gray-600">Loading your reviews...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40" />
      <div className="flex-1 lg:ml-72">
        <div className="w-full px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
                <p className="text-gray-600 mt-1">
                  Manage and track your workplace reviews
                </p>
              </div>
              <Link href="/create-review">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Write New Review
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{myReviews.length}</p>
                      <p className="text-sm text-gray-600">Total Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {myReviews.reduce((total, review) => total + review.reactions.length, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Likes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Set(myReviews.map(review => review.company_id)).size}
                      </p>
                      <p className="text-sm text-gray-600">Companies Reviewed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {getFilteredReviews().length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === 'all' ? 'No reviews yet' : `No ${activeTab} reviews`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'all' 
                      ? 'Start sharing your workplace experiences by writing your first review.'
                      : `You don't have any ${activeTab} reviews at the moment.`
                    }
                  </p>
                  <Link href="/create-review">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Write Your First Review
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {getFilteredReviews().map((review) => (
                    <Card key={review.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {/* Review Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{review.companies.name}</h3>
                                <p className="text-sm text-gray-600">{review.companies.industry}</p>
                              </div>
                            </div>
                            
                            <h4 className="text-lg font-medium text-gray-900 mb-2">{review.title}</h4>
                            
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-600 ml-1">{review.rating}/5</span>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>{formatRelativeTime(review.created_at)}</span>
                              </div>
                              
                              {review.position && (
                                <Badge variant="secondary" className="text-xs">
                                  {review.position}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/reviews/${review.id}`)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/reviews/${review.id}`)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Review Content Preview */}
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {review.content}
                        </p>

                        {/* Review Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{review.reactions.length} likes</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{review.comments.length} comments</span>
                            </div>
                          </div>
                          
                          <Link 
                            href={`/companies/${review.companies.slug}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Company →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReviewCard from '@/components/review/review-card'
import Sidebar from '@/components/layout/sidebar'
import {
  Search,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Star,
  Building2,
  MapPin,
  Users,
  Briefcase,
  X,
  BarChart3,
  Plus
} from 'lucide-react'
import { useReviewActions } from '@/hooks/useReviewActions'
import { ReviewWithCompany } from '@/lib/types'
import Link from 'next/link'
import { Pagination } from '@/components/ui/pagination'
import { useReviews } from '@/contexts/ReviewContext'

interface FilterState {
  rating: number[]
  industry: string[]
  location: string[]
  employmentType: string[]
  workLocation: string[]
  companySize: string[]
}

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithCompany[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [activeTab, setActiveTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    rating: [],
    industry: [],
    location: [],
    employmentType: [],
    workLocation: [],
    companySize: []
  })
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
    // Set loading to false once reviews are loaded
    if (reviews.length > 0) {
      setLoading(false)
    } else {
      // Set a timeout to handle empty state
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [reviews])

  // Get unique filter options from reviews
  const getFilterOptions = () => {
    const industries = [...new Set(reviews.map(r => r.companies.industry).filter(Boolean))] as string[]
    const locations = [...new Set(reviews.map(r => r.companies.location).filter(Boolean))] as string[]
    const employmentTypes = [...new Set(reviews.map(r => r.employment_type).filter(Boolean))] as string[]
    const workLocations = [...new Set(reviews.map(r => r.work_location).filter(Boolean))] as string[]
    const companySizes = [...new Set(reviews.map(r => r.companies.size).filter(Boolean))] as string[]

    return { industries, locations, employmentTypes, workLocations, companySizes }
  }

  // Apply all filters and search
  useEffect(() => {
    let filtered = [...reviews]

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.companies.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.companies.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply rating filter
    if (filters.rating.length > 0) {
      filtered = filtered.filter(review => filters.rating.includes(review.rating))
    }

    // Apply industry filter
    if (filters.industry.length > 0) {
      filtered = filtered.filter(review =>
        review.companies.industry && filters.industry.includes(review.companies.industry)
      )
    }

    // Apply location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(review =>
        review.companies.location && filters.location.includes(review.companies.location)
      )
    }

    // Apply employment type filter
    if (filters.employmentType.length > 0) {
      filtered = filtered.filter(review =>
        review.employment_type && filters.employmentType.includes(review.employment_type)
      )
    }

    // Apply work location filter
    if (filters.workLocation.length > 0) {
      filtered = filtered.filter(review =>
        review.work_location && filters.workLocation.includes(review.work_location)
      )
    }

    // Apply company size filter
    if (filters.companySize.length > 0) {
      filtered = filtered.filter(review =>
        review.companies.size && filters.companySize.includes(review.companies.size)
      )
    }

    // Apply tab filter
    switch (activeTab) {
      case 'recent':
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        filtered = filtered.filter(review => new Date(review.created_at) >= sevenDaysAgo)
        break
      case 'popular':
        filtered = filtered.filter(review => review.reactions.length > 0)
        break
      case 'high-rated':
        filtered = filtered.filter(review => review.rating >= 4)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'highest-rated':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest-rated':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case 'most-liked':
        filtered.sort((a, b) => b.reactions.length - a.reactions.length)
        break
    }

    setFilteredReviews(filtered)
  }, [reviews, searchTerm, filters, activeTab, sortBy])

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentFilter = prev[filterType] as string[]
      return {
        ...prev,
        [filterType]: currentFilter.includes(value)
          ? currentFilter.filter(item => item !== value)
          : [...currentFilter, value]
      }
    })
  }

  const clearAllFilters = () => {
    setFilters({
      rating: [],
      industry: [],
      location: [],
      employmentType: [],
      workLocation: [],
      companySize: []
    })
    setSearchTerm('')
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0) +
           (searchTerm.trim() ? 1 : 0)
  }

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

  const { industries, locations, employmentTypes, workLocations, companySizes } = getFilterOptions()

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
      <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40" />
      <div className="flex-1 lg:ml-72">
        <div className="w-full px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Workplace Reviews
                </h1>
                <p className="text-lg text-gray-600">
                  Discover authentic workplace experiences from professionals across industries
                </p>
              </div>
              <Link href="/create-review">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Write Review
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                      <p className="text-sm text-gray-600">Total Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Set(reviews.map(r => r.company_id)).size}
                      </p>
                      <p className="text-sm text-gray-600">Companies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0'}
                      </p>
                      <p className="text-sm text-gray-600">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {reviews.filter(r => {
                          const weekAgo = new Date()
                          weekAgo.setDate(weekAgo.getDate() - 7)
                          return new Date(r.created_at) >= weekAgo
                        }).length}
                      </p>
                      <p className="text-sm text-gray-600">This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by company, title, position, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 border-gray-300"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest-rated">Highest Rated</option>
                  <option value="lowest-rated">Lowest Rated</option>
                  <option value="most-liked">Most Liked</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Card className="mb-6 border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Clear All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Rating Filter */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Rating
                      </h4>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => (
                          <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.rating.includes(rating)}
                              onChange={() => handleFilterChange('rating', rating.toString())}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: rating }, (_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                              <span className="text-sm text-gray-600">& up</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Industry Filter */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        Industry
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {industries.map(industry => (
                          <label key={industry} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.industry.includes(industry)}
                              onChange={() => handleFilterChange('industry', industry)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{industry}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Location
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {locations.map(location => (
                          <label key={location} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.location.includes(location)}
                              onChange={() => handleFilterChange('location', location)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{location}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Employment Type Filter */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Employment Type
                      </h4>
                      <div className="space-y-2">
                        {employmentTypes.map(type => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.employmentType.includes(type)}
                              onChange={() => handleFilterChange('employmentType', type)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Work Location Filter */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Work Location
                      </h4>
                      <div className="space-y-2">
                        {workLocations.map(location => (
                          <label key={location} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.workLocation.includes(location)}
                              onChange={() => handleFilterChange('workLocation', location)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{location}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Company Size Filter */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Company Size
                      </h4>
                      <div className="space-y-2">
                        {companySizes.map(size => (
                          <label key={size} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.companySize.includes(size)}
                              onChange={() => handleFilterChange('companySize', size)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs for Quick Filtering */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>All</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Recent</span>
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Popular</span>
              </TabsTrigger>
              <TabsTrigger value="high-rated" className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Top Rated</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary">
                      {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  {activeTab === 'all' && 'Showing all reviews'}
                  {activeTab === 'recent' && 'Reviews from the last 7 days'}
                  {activeTab === 'popular' && 'Reviews with likes'}
                  {activeTab === 'high-rated' && 'Reviews rated 4+ stars'}
                </div>
              </div>

              {/* Reviews List */}
              {filteredReviews.length > 0 ? (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
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
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {getActiveFilterCount() > 0
                      ? "Try adjusting your filters or search terms to find more reviews."
                      : "Be the first to share your workplace experience!"
                    }
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    {getActiveFilterCount() > 0 && (
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Link href="/create-review">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Write First Review
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

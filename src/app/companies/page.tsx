'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Building2,
  MapPin,
  Users,
  Star,
  TrendingUp,
  Filter,
  Globe,
  Award,
  BarChart3,
  Plus,
  ArrowRight,
  ExternalLink,
  Briefcase
} from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/client'

interface Company {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  logo_url: string | null
  industry: string | null
  size: string | null
  location: string | null
  created_at: string
  updated_at: string
  reviewCount?: number
  averageRating?: number
  recentReviews?: number
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [industryFilter, setIndustryFilter] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchCompanies()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCompanies = async () => {
    try {
      setLoading(true)

      // Fetch companies with review statistics
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name')

      if (companiesError) {
        console.error('Error fetching companies:', companiesError)
        return
      }

      // Fetch review statistics for each company
      const companiesWithStats = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating, created_at')
            .eq('company_id', company.id)

          if (reviewsError) {
            console.error('Error fetching reviews for company:', company.name, reviewsError)
            return {
              ...company,
              reviewCount: 0,
              averageRating: 0,
              recentReviews: 0
            }
          }

          const reviewCount = reviews?.length || 0
          const averageRating = reviewCount > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0

          // Count recent reviews (last 30 days)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const recentReviews = reviews?.filter(review =>
            new Date(review.created_at) >= thirtyDaysAgo
          ).length || 0

          return {
            ...company,
            reviewCount,
            averageRating,
            recentReviews
          }
        })
      )

      setCompanies(companiesWithStats)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique filter options
  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))] as string[]
  const sizes = [...new Set(companies.map(c => c.size).filter(Boolean))] as string[]

  // Filter and sort companies
  const filteredAndSortedCompanies = React.useMemo(() => {
    let filtered = [...companies]

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply industry filter
    if (industryFilter) {
      filtered = filtered.filter(company => company.industry === industryFilter)
    }

    // Apply size filter
    if (sizeFilter) {
      filtered = filtered.filter(company => company.size === sizeFilter)
    }

    // Apply tab filter
    switch (activeTab) {
      case 'trending':
        filtered = filtered.filter(company => (company.recentReviews || 0) > 0)
        break
      case 'top-rated':
        filtered = filtered.filter(company => (company.averageRating || 0) >= 4)
        break
      case 'most-reviewed':
        filtered = filtered.filter(company => (company.reviewCount || 0) > 0)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        break
      case 'reviews':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      case 'recent':
        filtered.sort((a, b) => (b.recentReviews || 0) - (a.recentReviews || 0))
        break
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [companies, searchTerm, industryFilter, sizeFilter, activeTab, sortBy])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getCompanyStats = () => {
    const totalCompanies = companies.length
    const avgRating = companies.length > 0
      ? companies.reduce((sum, c) => sum + (c.averageRating || 0), 0) / companies.length
      : 0
    const totalReviews = companies.reduce((sum, c) => sum + (c.reviewCount || 0), 0)
    const trendingCount = companies.filter(c => (c.recentReviews || 0) > 0).length

    return { totalCompanies, avgRating, totalReviews, trendingCount }
  }

  const stats = getCompanyStats()

  if (loading) {
    return (
      <>
        <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40" />
        <div className="flex-1 lg:ml-72">
          <div className="text-center py-16 px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading companies...</p>
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
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Company Directory
                </h1>
                <p className="text-lg text-gray-600">
                  Explore companies, read authentic reviews, and make informed career decisions
                </p>
              </div>
              <Link href="/create-review">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalCompanies}</p>
                      <p className="text-sm text-gray-600 font-medium">Total Companies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                      <p className="text-sm text-gray-600 font-medium">Total Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
                      <p className="text-sm text-gray-600 font-medium">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.trendingCount}</p>
                      <p className="text-sm text-gray-600 font-medium">Trending</p>
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
                  placeholder="Search companies by name, industry, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center space-x-3">
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>

                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sizes</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="reviews">Sort by Reviews</option>
                  <option value="recent">Sort by Recent Activity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs for Quick Filtering */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>All</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="top-rated" className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Top Rated</span>
              </TabsTrigger>
              <TabsTrigger value="most-reviewed" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Most Reviewed</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {filteredAndSortedCompanies.length} compan{filteredAndSortedCompanies.length !== 1 ? 'ies' : 'y'} found
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {activeTab === 'all' && 'Showing all companies'}
                  {activeTab === 'trending' && 'Companies with recent reviews'}
                  {activeTab === 'top-rated' && 'Companies rated 4+ stars'}
                  {activeTab === 'most-reviewed' && 'Companies with reviews'}
                </div>
              </div>

              {/* Companies Grid */}
              {filteredAndSortedCompanies.length > 0 ? (
                <div className="space-y-4">
                  {filteredAndSortedCompanies.map((company) => (
                    <Card key={company.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                                  {company.recentReviews && company.recentReviews > 0 && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      Trending
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 mb-3 line-clamp-2">{company.description || 'No description available'}</p>

                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                  {company.industry && (
                                    <div className="flex items-center space-x-1">
                                      <Briefcase className="w-4 h-4" />
                                      <span>{company.industry}</span>
                                    </div>
                                  )}
                                  {company.location && (
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{company.location}</span>
                                    </div>
                                  )}
                                  {company.size && (
                                    <div className="flex items-center space-x-1">
                                      <Users className="w-4 h-4" />
                                      <span>{company.size} employees</span>
                                    </div>
                                  )}
                                  {company.website && (
                                    <a
                                      href={company.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                                    >
                                      <Globe className="w-4 h-4" />
                                      <span>Website</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-4">
                            {/* Rating and Reviews */}
                            <div className="text-right">
                              {company.reviewCount && company.reviewCount > 0 ? (
                                <>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className="flex items-center space-x-1">
                                      {renderStars(company.averageRating || 0)}
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                      {(company.averageRating || 0).toFixed(1)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {company.reviewCount} review{company.reviewCount !== 1 ? 's' : ''}
                                  </p>
                                </>
                              ) : (
                                <div className="text-center">
                                  <p className="text-gray-400 text-sm mb-1">No reviews yet</p>
                                  <p className="text-xs text-gray-400">Be the first to review</p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3">
                              <Link href={`/companies/${company.slug}`}>
                                <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-500 hover:text-blue-600">
                                  <ArrowRight className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/create-review?company=${company.slug}`}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                  <Plus className="w-4 h-4 mr-1" />
                                  Write Review
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm || industryFilter || sizeFilter
                      ? "Try adjusting your search terms or filters to find more companies."
                      : "Be the first to add a company and share your experience!"
                    }
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    {(searchTerm || industryFilter || sizeFilter) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('')
                          setIndustryFilter('')
                          setSizeFilter('')
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Link href="/create-review">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Company
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

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star, ThumbsUp, Building2, TrendingUp } from 'lucide-react'

interface ProfileStatsProps {
  stats: {
    reviewsCount: number
    helpfulVotes: number
    companiesReviewed: number
    averageRating: number
  }
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      title: 'Reviews Written',
      value: stats.reviewsCount,
      description: 'Total reviews',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Helpful Votes',
      value: stats.helpfulVotes,
      description: 'Received on reviews',
      icon: ThumbsUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Companies Reviewed',
      value: stats.companiesReviewed,
      description: 'Unique companies',
      icon: Building2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0',
      description: 'Given to companies',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.description}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

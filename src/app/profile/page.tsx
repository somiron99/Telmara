'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Sidebar from '@/components/layout/sidebar'
import ProfileForm from '@/components/profile/profile-form'
import ProfileStats from '@/components/profile/profile-stats'
import { User, Edit3, Mail, Calendar, MapPin } from 'lucide-react'
import {
  getCurrentUserProfile,
  updateUserProfile,
  getUserProfileStats,
  validateProfileData,
  type UserProfile,
  type ProfileUpdateData,
  type ProfileStats as ProfileStatsType
} from '@/lib/profile'

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStatsType>({
    reviewsCount: 0,
    helpfulVotes: 0,
    companiesReviewed: 0,
    averageRating: 0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfile = await getCurrentUserProfile()

        if (!userProfile) {
          router.push('/auth/login')
          return
        }

        setUser(userProfile)

        // Load user stats
        const userStats = await getUserProfileStats(userProfile.id)
        setStats(userStats)

      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSave = async (formData: ProfileUpdateData) => {
    if (!user) return

    setSaving(true)
    try {
      // Validate form data
      const validation = validateProfileData(formData)
      if (!validation.isValid) {
        alert(validation.errors.join('\n'))
        return
      }

      // Update user profile
      const updatedUser = await updateUserProfile(formData)
      if (updatedUser) {
        setUser(updatedUser)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (loading) {
    return (
      <>
        <Sidebar className="hidden lg:block fixed left-0 top-20 h-[calc(100vh-5rem)] z-40" />
        <div className="flex-1 lg:ml-72 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Sidebar className="hidden lg:block fixed left-0 top-20 h-[calc(100vh-5rem)] z-40" />
      <div className="flex-1 lg:ml-72 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Content */}
          {isEditing ? (
            <ProfileForm
              initialData={{
                username: user.user_metadata?.username || '',
                full_name: user.user_metadata?.full_name || '',
                bio: user.user_metadata?.bio || '',
                location: user.user_metadata?.location || '',
                website: user.user_metadata?.website || '',
                avatar_url: user.user_metadata?.avatar_url
              }}
              onSave={handleSave}
              onCancel={handleCancel}
              loading={saving}
            />
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {user.user_metadata?.full_name || 'Anonymous User'}
                    </h2>
                    <p className="text-gray-600 mb-2">
                      @{user.user_metadata?.username || 'username'}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      {user.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {user.user_metadata?.bio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700">{user.user_metadata.bio}</p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.user_metadata?.location && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Location</h4>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {user.user_metadata.location}
                      </div>
                    </div>
                  )}

                  {user.user_metadata?.website && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Website</h4>
                      <div className="text-gray-600">
                        <a
                          href={user.user_metadata.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.user_metadata.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Stats */}
          <ProfileStats stats={stats} />
        </div>
      </div>
    </>
  )
}

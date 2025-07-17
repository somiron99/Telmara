import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  user_metadata: {
    username?: string
    full_name?: string
    avatar_url?: string
    bio?: string
    location?: string
    website?: string
  }
  created_at: string
}

export interface ProfileUpdateData {
  username?: string
  full_name?: string
  bio?: string
  location?: string
  website?: string
  avatar_url?: string
}

export interface ProfileStats {
  reviewsCount: number
  helpfulVotes: number
  companiesReviewed: number
  averageRating: number
}

/**
 * Get the current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    return user as UserProfile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updates: ProfileUpdateData): Promise<UserProfile | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })
    
    if (error) throw error
    
    return data.user as UserProfile
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Get user profile statistics
 */
export async function getUserProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = createClient()
  
  try {
    // Get reviews count and average rating
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('author_id', userId)
    
    if (reviewsError) throw reviewsError
    
    // Get helpful votes count
    const { data: reactionsData, error: reactionsError } = await supabase
      .from('reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'helpful')
    
    if (reactionsError) throw reactionsError
    
    // Get unique companies reviewed
    const { data: companiesData, error: companiesError } = await supabase
      .from('reviews')
      .select('company_id')
      .eq('author_id', userId)
    
    if (companiesError) throw companiesError
    
    const reviewsCount = reviewsData?.length || 0
    const helpfulVotes = reactionsData?.length || 0
    const uniqueCompanies = new Set(companiesData?.map(r => r.company_id) || [])
    const companiesReviewed = uniqueCompanies.size
    
    const averageRating = reviewsCount > 0 
      ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
      : 0
    
    return {
      reviewsCount,
      helpfulVotes,
      companiesReviewed,
      averageRating
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      reviewsCount: 0,
      helpfulVotes: 0,
      companiesReviewed: 0,
      averageRating: 0
    }
  }
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  const supabase = createClient()
  
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`
    
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return null
  }
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(avatarUrl: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // Extract file path from URL
    const url = new URL(avatarUrl)
    const filePath = url.pathname.split('/').slice(-2).join('/')
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath])
    
    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error deleting avatar:', error)
    return false
  }
}

/**
 * Validate profile data
 */
export function validateProfileData(data: ProfileUpdateData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Username validation
  if (data.username) {
    if (data.username.length < 3) {
      errors.push('Username must be at least 3 characters long')
    }
    if (data.username.length > 30) {
      errors.push('Username must be less than 30 characters')
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.push('Username can only contain letters, numbers, hyphens, and underscores')
    }
  }
  
  // Full name validation
  if (data.full_name) {
    if (data.full_name.length > 100) {
      errors.push('Full name must be less than 100 characters')
    }
  }
  
  // Bio validation
  if (data.bio && data.bio.length > 500) {
    errors.push('Bio must be less than 500 characters')
  }
  
  // Website validation
  if (data.website) {
    try {
      new URL(data.website)
    } catch {
      errors.push('Please enter a valid website URL')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

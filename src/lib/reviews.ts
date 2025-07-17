import { createClient } from '@/lib/supabase/client'
import { ReviewWithCompany, Company, Comment } from '@/lib/types'

/**
 * Find or create a company by name
 */
export async function findOrCreateCompany(companyName: string): Promise<Company | null> {
  const supabase = createClient()

  try {
    const cleanName = companyName.trim()
    if (!cleanName) {
      console.error('❌ Company name is empty')
      return null
    }

    console.log('🔍 Searching for company:', cleanName)

    // First, try to find existing company (case insensitive)
    const { data: existingCompanies, error: findError } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', cleanName)

    console.log('🔍 Find result:', { existingCompanies, findError })

    // If we found companies, return the first one
    if (existingCompanies && existingCompanies.length > 0 && !findError) {
      console.log('✅ Found existing company:', existingCompanies[0].name)
      return existingCompanies[0]
    }

    // If there was an error other than "not found", log it but continue to create
    if (findError) {
      console.log('⚠️ Find error (will try to create):', findError)
    }

    // Create new company
    const baseSlug = cleanName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

    // Add timestamp to make slug unique if needed
    const slug = baseSlug || `company-${Date.now()}`

    console.log('🏗️ Creating new company with slug:', slug)

    const companyData = {
      name: cleanName,
      slug,
      description: `${cleanName} - Company profile`,
      website: `https://${slug}.com`,
      industry: 'Not specified',
      size: 'Not specified',
      location: 'Not specified'
    }

    console.log('🏗️ Company data to insert:', companyData)

    const { data: newCompany, error: createError } = await supabase
      .from('companies')
      .insert([companyData])
      .select('*')
      .single()

    console.log('🏗️ Create result:', { newCompany, createError })

    if (createError) {
      console.error('❌ Error creating company:', createError)

      // If slug conflict, try with timestamp
      if (createError.code === '23505') { // Unique constraint violation
        const uniqueSlug = `${baseSlug}-${Date.now()}`
        console.log('🔄 Retrying with unique slug:', uniqueSlug)

        const retryData = { ...companyData, slug: uniqueSlug }
        const { data: retryCompany, error: retryError } = await supabase
          .from('companies')
          .insert([retryData])
          .select('*')
          .single()

        if (retryError) {
          console.error('❌ Retry failed:', retryError)
          return null
        }

        console.log('✅ Successfully created company on retry:', retryCompany.name)
        return retryCompany
      }

      return null
    }

    console.log('✅ Successfully created company:', newCompany.name)
    return newCompany
  } catch (err) {
    console.error('💥 Exception in findOrCreateCompany:', err)
    return null
  }
}

/**
 * Fetch all reviews with company and reaction data
 */
export async function fetchAllReviews(): Promise<ReviewWithCompany[]> {
  const supabase = createClient()
  
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
          author_id,
          profiles (
            id,
            username,
            email,
            created_at,
            updated_at
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching reviews:', err)
    return []
  }
}

/**
 * Fetch a single review by ID
 */
export async function fetchReviewById(reviewId: string): Promise<ReviewWithCompany | null> {
  const supabase = createClient()
  
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
          author_id,
          profiles (
            id,
            username,
            email,
            created_at,
            updated_at
          )
        )
      `)
      .eq('id', reviewId)
      .single()

    if (error) {
      console.error('Error fetching review:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error fetching review:', err)
    return null
  }
}

/**
 * Create a new review
 */
export async function createReview(reviewData: Omit<ReviewWithCompany, 'id' | 'created_at' | 'updated_at' | 'companies' | 'reactions' | 'comments'>): Promise<ReviewWithCompany | null> {
  const supabase = createClient()
  
  try {
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
      console.error('Error creating review:', error)
      return null
    }

    // Return with empty reactions and comments
    return {
      ...data,
      reactions: [],
      comments: []
    }
  } catch (err) {
    console.error('Error creating review:', err)
    return null
  }
}

/**
 * Update a review
 */
export async function updateReview(reviewId: string, updates: Partial<Omit<ReviewWithCompany, 'id' | 'created_at' | 'companies' | 'reactions' | 'comments'>>): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)

    if (error) {
      console.error('Error updating review:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error updating review:', err)
    return false
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      console.error('Error deleting review:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error deleting review:', err)
    return false
  }
}

/**
 * Toggle like on a review
 */
export async function toggleReviewLike(reviewId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // Check if user already liked this review
    const { data: existingLike, error: checkError } = await supabase
      .from('reactions')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .eq('type', 'like')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing like:', checkError)
      return false
    }

    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .eq('type', 'like')

      if (error) {
        console.error('Error removing like:', error)
        return false
      }
    } else {
      // Add like
      const { error } = await supabase
        .from('reactions')
        .insert([{
          review_id: reviewId,
          user_id: userId,
          type: 'like'
        }])

      if (error) {
        console.error('Error adding like:', error)
        return false
      }
    }

    return true
  } catch (err) {
    console.error('Error toggling like:', err)
    return false
  }
}

/**
 * Add a comment to a review
 */
export async function addReviewComment(reviewId: string, content: string, isAnonymous: boolean, userId: string): Promise<Comment | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        review_id: reviewId,
        author_id: isAnonymous ? null : userId,
        content,
        is_anonymous: isAnonymous
      }])
      .select(`
        *,
        profiles (
          id,
          username,
          email,
          created_at,
          updated_at
        )
      `)
      .single()

    if (error) {
      console.error('Error adding comment:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error adding comment:', err)
    return null
  }
}

/**
 * Fetch company by slug
 */
export async function fetchCompanyBySlug(slug: string): Promise<Company | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error fetching company:', err)
    return null
  }
}

/**
 * Fetch reviews for a specific company
 */
export async function fetchReviewsByCompanySlug(slug: string): Promise<ReviewWithCompany[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        companies!inner (
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
          author_id,
          profiles (
            id,
            username,
            email,
            created_at,
            updated_at
          )
        )
      `)
      .eq('companies.slug', slug)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching company reviews:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching company reviews:', err)
    return []
  }
}

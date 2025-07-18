import { createClient } from './supabase/client'

function isSupabaseConfigured() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project') && !supabaseAnonKey.includes('placeholder')
}

export async function signUp(email: string, password: string, username?: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Authentication service is not configured. Please contact support.')
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    })

    if (error) {
      // Provide more user-friendly error messages
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long.')
      } else if (error.message.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.')
      } else {
        throw new Error(error.message || 'Sign-up failed. Please try again.')
      }
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during sign-up. Please try again.')
  }
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Authentication service is not configured. Please contact support.')
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Provide more user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.')
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Too many sign-in attempts. Please wait a few minutes and try again.')
      } else {
        throw new Error(error.message || 'Sign-in failed. Please try again.')
      }
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during sign-in. Please try again.')
  }
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    return
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}





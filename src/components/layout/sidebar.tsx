'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { User as UserIcon, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface SidebarProps {
  className?: string
}

const navigationItems = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Companies', href: '/companies', icon: '🏢' },
  { name: 'Reviews', href: '/reviews', icon: '⭐' },
  { name: 'My Reviews', href: '/my-reviews', icon: '📝' },
]

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch {
        setUser(null)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <aside className={cn('w-72 bg-white border-r border-gray-100 h-full overflow-y-auto flex flex-col', className)}>
      {/* Main Navigation */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150 group',
                'hover:bg-gray-50 hover:text-gray-900',
                pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              )}
            >
              <span className="mr-4 text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Section at Bottom */}
      {user && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="space-y-2">
            {/* Profile Button */}
            <Button
              variant="ghost"
              onClick={() => router.push('/profile')}
              className="w-full justify-start px-3 py-3 h-auto text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-semibold text-gray-900">My Profile</div>
                  <div className="text-xs text-gray-500 truncate max-w-[140px]">{user.email}</div>
                </div>
              </div>
            </Button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start px-3 py-2.5 h-auto text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <span>Sign Out</span>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Sign In Section for Non-Authenticated Users */}
      {!user && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="space-y-2">
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-200 shadow-sm"
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/auth/register')}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 text-sm font-medium py-2.5 rounded-lg transition-all duration-200"
            >
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </aside>
  )
}

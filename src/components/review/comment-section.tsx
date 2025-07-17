'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { User, Send } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { CommentWithAuthor } from '@/lib/types'

interface CommentSectionProps {
  reviewId: string
  comments: CommentWithAuthor[]
  onAddComment: (reviewId: string, content: string, isAnonymous: boolean) => void
}

export default function CommentSection({ reviewId, comments, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error getting current user:', error)
        setCurrentUser(null)
      }
    }

    getCurrentUser()
  }, [supabase])

  // Helper function to get user display name
  const getUserDisplayName = (userId: string | null) => {
    if (!userId) return 'Anonymous'
    if (currentUser && userId === currentUser.id) return 'You'

    // For real user IDs, show a shortened version
    if (userId.length > 10) {
      return `User ${userId.slice(-6)}`
    }

    // Fallback for any other cases
    return 'User'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    if (!currentUser) {
      const shouldSignIn = confirm('You need to sign in to add comments. Would you like to go to the sign in page?')
      if (shouldSignIn) {
        window.location.href = '/auth/login'
      }
      return
    }

    setIsSubmitting(true)
    try {
      await onAddComment(reviewId, newComment.trim(), isAnonymous)
      setNewComment('')
      setIsAnonymous(false)
    } catch (error) {
      console.error('Error adding comment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment'
      alert(`Failed to add comment: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Comments ({comments.length})
      </h4>

      {/* Add Comment Form */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder={currentUser ? "Add a comment..." : "Sign in to add a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting || !currentUser}
              rows={3}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`anonymous-${reviewId}`}
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`anonymous-${reviewId}`} className="text-sm text-gray-600">
                  Comment anonymously
                </label>
              </div>
              
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || isSubmitting || !currentUser}
                className="flex items-center space-x-2"
                title={!currentUser ? 'Sign in to post comments' : ''}
              >
                <Send className="w-4 h-4" />
                <span>
                  {!currentUser ? 'Sign In to Comment' : isSubmitting ? 'Posting...' : 'Post Comment'}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.is_anonymous
                          ? 'Anonymous'
                          : comment.profiles?.username || getUserDisplayName(comment.author_id || '')
                        }
                      </span>
                      {comment.is_anonymous && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          Anonymous
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

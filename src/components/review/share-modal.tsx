'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Facebook, Twitter, Linkedin, Mail, Check, X } from 'lucide-react'

interface ShareModalProps {
  reviewId: string
  reviewTitle: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ reviewId, reviewTitle, companyName, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/reviews/${reviewId}` : `/reviews/${reviewId}`
  const shareText = `Check out this review of ${companyName}: "${reviewTitle}"`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleSocialShare = (platform: string) => {
    let url = ''

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`Review: ${companyName}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
        break
      default:
        return
    }

    if (platform === 'email') {
      window.location.href = url
    } else {
      window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
      onClick={onClose}
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <Card
        className="w-full max-w-md bg-white shadow-xl my-8 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Share Review</CardTitle>
            <CardDescription>Share this review with others</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Copy Link
            </label>
            <div className="flex space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600">Link copied to clipboard!</p>
            )}
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Share on Social Media
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleSocialShare('twitter')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                <span>Twitter</span>
              </Button>
              <Button
                onClick={() => handleSocialShare('facebook')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                <span>Facebook</span>
              </Button>
              <Button
                onClick={() => handleSocialShare('linkedin')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                <span>LinkedIn</span>
              </Button>
              <Button
                onClick={() => handleSocialShare('email')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4 text-gray-600" />
                <span>Email</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

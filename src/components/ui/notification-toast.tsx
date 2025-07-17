'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Heart, MessageCircle, X, AlertCircle, Info } from 'lucide-react'

interface NotificationToastProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'info' | 'like' | 'comment'
  title: string
  message: string
  duration?: number
}

export function NotificationToast({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  message, 
  duration = 4000 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'like':
        return 'bg-red-50 border-red-200'
      case 'comment':
        return 'bg-blue-50 border-blue-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`transform transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className={`max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${getColors()} p-4`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleClose}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for easy toast management
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'like' | 'comment'
    title: string
    message: string
    duration?: number
  }>>([])

  const showToast = (
    type: 'success' | 'error' | 'info' | 'like' | 'comment',
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, title, message, duration }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (title: string, message: string) => 
    showToast('success', title, message)
  
  const showError = (title: string, message: string) => 
    showToast('error', title, message)
  
  const showInfo = (title: string, message: string) => 
    showToast('info', title, message)
  
  const showLike = (title: string, message: string) => 
    showToast('like', title, message, 2000)
  
  const showComment = (title: string, message: string) => 
    showToast('comment', title, message, 3000)

  return {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showLike,
    showComment
  }
}

// Toast container component
export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      {toasts.map(toast => (
        <NotificationToast
          key={toast.id}
          isOpen={true}
          onClose={() => removeToast(toast.id)}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
        />
      ))}
    </>
  )
}

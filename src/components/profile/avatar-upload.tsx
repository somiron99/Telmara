'use client'

import { useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AvatarUploadProps {
  currentAvatar?: string
  username?: string
  fullName?: string
  onAvatarChange: (file: File) => Promise<void>
  onAvatarRemove?: () => Promise<void>
  uploading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function AvatarUpload({
  currentAvatar,
  username,
  fullName,
  onAvatarChange,
  onAvatarRemove,
  uploading = false,
  size = 'md'
}: AvatarUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const buttonIconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (username) {
      return username.slice(0, 2).toUpperCase()
    }
    return '?'
  }

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    await onAvatarChange(file)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleRemoveAvatar = async () => {
    if (onAvatarRemove) {
      await onAvatarRemove()
      setPreview(null)
    }
  }

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center relative cursor-pointer transition-all duration-200 ${
          dragOver ? 'ring-4 ring-blue-300 ring-opacity-50' : ''
        } ${uploading ? 'opacity-50' : 'hover:shadow-lg'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`text-white font-bold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'}`}>
            {getInitials()}
          </span>
        )}

        {/* Upload overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <label className={`absolute -bottom-1 -right-1 ${buttonSizes[size]} bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-lg`}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
        <Camera className={buttonIconSizes[size]} />
      </label>

      {/* Remove button */}
      {preview && onAvatarRemove && (
        <button
          onClick={handleRemoveAvatar}
          className={`absolute -top-1 -right-1 ${buttonSizes[size]} bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors shadow-lg`}
          disabled={uploading}
        >
          <X className={buttonIconSizes[size]} />
        </button>
      )}

      {/* Upload instructions */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Click or drag to upload
        </p>
        <p className="text-xs text-gray-400">
          JPG, PNG • Max 5MB
        </p>
      </div>
    </div>
  )
}

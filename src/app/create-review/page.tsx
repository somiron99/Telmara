'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { useReviewActions } from '@/hooks/useReviewActions'
import { findOrCreateCompany } from '@/lib/reviews'
import { createClient } from '@/lib/supabase/client'
import { SuccessModal } from '@/components/ui/success-modal'

export default function CreateReviewPage() {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    content: '',
    rating: 0,
    position: '',
    department: '',
    employmentType: 'Full-time',
    workLocation: 'Office',
    isAnonymous: false,
    isCurrentEmployee: true,
    pros: '',
    cons: '',
    adviceToManagement: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()
  const { addReview } = useReviewActions()

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.companyName.trim() || !formData.title.trim() || !formData.content.trim() || formData.rating === 0) {
        throw new Error('Please fill in all required fields')
      }

      // Find or create company in database
      console.log('🚀 Starting company creation for:', formData.companyName.trim())
      const company = await findOrCreateCompany(formData.companyName.trim())
      console.log('🚀 Company creation result:', company)

      if (!company) {
        console.error('💥 Company creation failed - no company returned')
        throw new Error(`Unable to create company "${formData.companyName.trim()}". This might be due to:
        • Database connection issues
        • Invalid company name
        • Permission problems

        Please try again or contact support.`)
      }

      console.log('✅ Company ready:', company.name)

      // Get current user for author_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user && !formData.isAnonymous) {
        throw new Error('You must be signed in to create a non-anonymous review')
      }

      // Create the review object with correct column names matching the type definition
      const newReview = {
        company_id: company.id,
        author_id: formData.isAnonymous ? null : (user?.id || null),
        title: formData.title.trim(),
        content: formData.content.trim(),
        rating: formData.rating,
        position: formData.position.trim() || null,
        department: formData.department.trim() || null,
        employment_type: formData.employmentType,
        work_location: formData.workLocation,
        is_anonymous: formData.isAnonymous,
        is_current_employee: formData.isCurrentEmployee,
        pros: formData.pros.trim() || null,
        cons: formData.cons.trim() || null,
        advice_to_management: formData.adviceToManagement.trim() || null,
        companies: company,
        reactions: [],
        comments: []
      }

      // Add review to database and global state
      console.log('🚀 Attempting to create review with data:', newReview)
      await addReview(newReview)

      // Show success modal
      setShowSuccessModal(true)
    } catch (error) {
      console.error('❌ Error submitting review:', error)
      // Note: newReview is only available in the try block, so we can't log it here

      // Show more specific error message
      if (error instanceof Error) {
        setError(`Failed to save review: ${error.message}`)
      } else {
        setError('Failed to save review to database')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => handleInputChange('rating', i + 1)}
        className="focus:outline-none"
      >
        <Star
          className={`w-6 h-6 ${
            i < formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors`}
        />
      </button>
    ))
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Write a Review
        </h1>
        <p className="text-gray-600">
          Share your workplace experience to help others make informed decisions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Review</CardTitle>
          <CardDescription>
            Your review will help other professionals learn about this company&apos;s culture and work environment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Company Name */}
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Review Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Review Title *
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Summarize your experience in one line"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Overall Rating *
              </label>
              <div className="flex items-center space-x-1">
                {renderStars()}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'Click to rate'}
                </span>
              </div>
            </div>

            {/* Position and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium text-gray-700">
                  Position
                </label>
                <Input
                  id="position"
                  type="text"
                  placeholder="Your job title"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium text-gray-700">
                  Department
                </label>
                <Input
                  id="department"
                  type="text"
                  placeholder="Engineering, Marketing, etc."
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Employment Type and Work Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="employmentType" className="text-sm font-medium text-gray-700">
                  Employment Type
                </label>
                <select
                  id="employmentType"
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="workLocation" className="text-sm font-medium text-gray-700">
                  Work Location
                </label>
                <select
                  id="workLocation"
                  value={formData.workLocation}
                  onChange={(e) => handleInputChange('workLocation', e.target.value)}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Office">Office</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Review Content */}
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium text-gray-700">
                Review Content *
              </label>
              <Textarea
                id="content"
                placeholder="Share your overall experience working at this company..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                required
                disabled={isLoading}
                rows={4}
              />
            </div>

            {/* Pros */}
            <div className="space-y-2">
              <label htmlFor="pros" className="text-sm font-medium text-gray-700">
                Pros
              </label>
              <Textarea
                id="pros"
                placeholder="What are the best things about working here?"
                value={formData.pros}
                onChange={(e) => handleInputChange('pros', e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Cons */}
            <div className="space-y-2">
              <label htmlFor="cons" className="text-sm font-medium text-gray-700">
                Cons
              </label>
              <Textarea
                id="cons"
                placeholder="What could be improved?"
                value={formData.cons}
                onChange={(e) => handleInputChange('cons', e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Advice to Management */}
            <div className="space-y-2">
              <label htmlFor="adviceToManagement" className="text-sm font-medium text-gray-700">
                Advice to Management
              </label>
              <Textarea
                id="adviceToManagement"
                placeholder="What advice would you give to management?"
                value={formData.adviceToManagement}
                onChange={(e) => handleInputChange('adviceToManagement', e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCurrentEmployee"
                  checked={formData.isCurrentEmployee}
                  onChange={(e) => handleInputChange('isCurrentEmployee', e.target.checked)}
                  disabled={isLoading}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isCurrentEmployee" className="text-sm text-gray-700">
                  I am a current employee
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                  disabled={isLoading}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                  Post anonymously
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || formData.rating === 0}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Review Submitted Successfully! 🎉"
        message="Thank you for sharing your experience! Your review will help others make informed decisions about this company."
        actionText="View Homepage"
        onAction={() => router.push('/')}
      />
    </div>
  )
}

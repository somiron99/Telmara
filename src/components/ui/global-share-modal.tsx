'use client'

import { useShareModal } from '@/contexts/ShareModalContext'
import ShareModal from '@/components/review/share-modal'

export default function GlobalShareModal() {
  const { isOpen, modalData, closeShareModal } = useShareModal()

  if (!isOpen || !modalData) return null

  return (
    <ShareModal
      reviewId={modalData.reviewId}
      reviewTitle={modalData.reviewTitle}
      companyName={modalData.companyName}
      isOpen={isOpen}
      onClose={closeShareModal}
    />
  )
}

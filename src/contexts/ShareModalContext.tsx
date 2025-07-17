'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ShareModalData {
  reviewId: string
  reviewTitle: string
  companyName: string
}

interface ShareModalContextType {
  isOpen: boolean
  modalData: ShareModalData | null
  openShareModal: (data: ShareModalData) => void
  closeShareModal: () => void
}

const ShareModalContext = createContext<ShareModalContextType | undefined>(undefined)

export function ShareModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalData, setModalData] = useState<ShareModalData | null>(null)

  const openShareModal = (data: ShareModalData) => {
    setModalData(data)
    setIsOpen(true)
  }

  const closeShareModal = () => {
    setIsOpen(false)
    setModalData(null)
  }

  const value: ShareModalContextType = {
    isOpen,
    modalData,
    openShareModal,
    closeShareModal
  }

  return (
    <ShareModalContext.Provider value={value}>
      {children}
    </ShareModalContext.Provider>
  )
}

export function useShareModal() {
  const context = useContext(ShareModalContext)
  if (context === undefined) {
    throw new Error('useShareModal must be used within a ShareModalProvider')
  }
  return context
}

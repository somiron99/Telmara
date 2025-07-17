'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from './button'

export default function FloatingActionButton() {
  return (
    <Link href="/create-review">
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-110 transition-all duration-300"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Write Review</span>
      </Button>
    </Link>
  )
}

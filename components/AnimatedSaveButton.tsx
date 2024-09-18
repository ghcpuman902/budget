'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'

interface AnimatedSaveButtonProps {
  onSave: () => void
  disabled?: boolean
}

export function AnimatedSaveButton({ onSave, disabled = false }: AnimatedSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false)

  const handleClick = () => {
    onSave()
    setIsSaved(true)
  }

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSaved])

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isSaved}
      className={`transition-colors duration-300 ${
        isSaved ? 'bg-green-500 hover:bg-green-600' : ''
      }`}
    >
      {isSaved ? (
        <Check className="h-4 w-4 mr-2" />
      ) : null}
      {isSaved ? 'Saved!' : 'Save Progress'}
    </Button>
  )
}
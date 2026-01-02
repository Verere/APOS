'use client'

import { useEffect, useState } from 'react'

export function useResponsiveCart() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const handleChange = () => {
      setIsDesktop(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Ensure cart is never "closed" on desktop
  useEffect(() => {
    if (isDesktop) {
      setIsOpen(true)
    }
  }, [isDesktop])

  return {
    isDesktop,
    isCartOpen: isDesktop || isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    toggleCart: () => setIsOpen(prev => !prev),
  }
}

'use client'
import ThemeSwitch from '@/app/switch'

export default function ThemeSwitcherClient() {
  return (
    <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors text-2xl">
      <ThemeSwitch />
    </button>
  )
}

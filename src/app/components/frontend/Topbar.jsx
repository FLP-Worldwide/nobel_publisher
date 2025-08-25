import React from 'react'

export default function Topbar() {
  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900">
    <div className="flex justify-between items-center max-w-full mx-auto px-8 py-2 text-sm">
      {/* Left */}
      <a href="#" className="text-gray-500 dark:text-white hover:underline">Support</a>
  
      {/* Right */}
      <a href="/login" className="text-blue-900 dark:text-white hover:underline">
       Login / Signup 
      </a>
    </div>
  </nav>
  )
}

import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden transform transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with gradient accent */}
        <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200/50 px-8 py-5">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {title}
            </h3>
            <button 
              onClick={onClose}
              className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white border border-orange-200/50 shadow-sm transition-all hover:shadow-md hover:scale-110 active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-orange-600 transition-colors" />
            </button>
          </div>
          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50"></div>
        </div>

        {/* Content area with custom scrollbar */}
        <div className="p-8 overflow-y-auto max-h-[calc(85vh-5rem)] scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50 hover:scrollbar-thumb-orange-400">
          {children}
        </div>
      </div>
    </div>
  )
}

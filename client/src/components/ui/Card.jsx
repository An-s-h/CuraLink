import React from 'react'

export default function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <div className={`relative group ${className}`}>
      {/* Glass morphism background with gradient border */}
      <div className="relative bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl rounded-2xl border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-300/70 overflow-hidden">
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 to-transparent pointer-events-none" />
        
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        
        {/* Content container */}
        <div className="relative z-10 p-6">
          {/* Title section */}
          {title && (
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                {title}
              </h3>
              {/* Optional decorative icon */}
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-300 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Children content */}
          {children && (
            <div className="mt-4 text-sm text-slate-700 leading-relaxed">
              {children}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="mt-6 flex gap-3 flex-wrap">
              {actions}
            </div>
          )}
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-orange-300/10 to-transparent rounded-tr-2xl pointer-events-none" />
      </div>
    </div>
  )
}
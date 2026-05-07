'use client'

/**
 * CopyEditorSearch — Search input with debounce for filtering copy entries.
 * SVG icon, focus ring, animated clear button.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface CopyEditorSearchProps {
  onSearch: (query: string) => void
}

export function CopyEditorSearch({ onSearch }: CopyEditorSearchProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(value), 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, onSearch])

  const handleClear = useCallback(() => {
    setValue('')
    onSearch('')
  }, [onSearch])

  return (
    <div style={{
      position: 'relative',
      transition: 'box-shadow 200ms ease',
      borderRadius: 10,
      boxShadow: isFocused ? '0 0 0 3px rgba(38, 66, 51, 0.08)' : 'none',
    }}>
      {/* Search icon — SVG */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: isFocused ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
          pointerEvents: 'none',
          transition: 'color 200ms ease',
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Buscar por texto o etiqueta..."
        style={{
          width: '100%',
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 14,
          color: 'var(--color-text-primary)',
          background: 'var(--color-bg-primary)',
          border: `1px solid ${isFocused ? 'rgba(38, 66, 51, 0.25)' : 'rgba(30, 19, 16, 0.10)'}`,
          borderRadius: 10,
          padding: '11px 16px',
          paddingLeft: 42,
          paddingRight: value ? 40 : 16,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 200ms ease',
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(30, 19, 16, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            transition: 'background 150ms ease',
          }}
          aria-label="Limpiar busqueda"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </button>
      )}
    </div>
  )
}

'use client'

/**
 * CopyEditorSubsection — Accordion group for a subsection of copy entries.
 *
 * Clickable header with chevron, subsection name, and stats ("2 de 8 editados").
 * Expands to show CopyEditorField for each entry.
 */

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import type { CopyEntry } from './types'
import { SUBSECTION_LABELS } from './types'
import { CopyEditorField } from './CopyEditorField'

interface CopyEditorSubsectionProps {
  subsection: string
  entries: CopyEntry[]
  defaultOpen: boolean
  searchQuery: string
  onValueChange: (key: string, value: string) => void
  onSaved: (key: string, isCustomized: boolean) => void
}

function CopyEditorSubsectionInner({
  subsection,
  entries,
  defaultOpen,
  searchQuery,
  onValueChange,
  onSaved,
}: CopyEditorSubsectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const customizedCount = entries.filter((e) => e.isCustomized).length
  const label = SUBSECTION_LABELS[subsection] ?? subsection

  // Measure real content height for smooth animation
  useEffect(() => {
    if (contentRef.current && open) {
      const measure = () => setContentHeight(contentRef.current?.scrollHeight ?? 0)
      measure()
      // Re-measure after a tick (textareas may resize)
      const timer = setTimeout(measure, 50)
      return () => clearTimeout(timer)
    }
  }, [open, entries.length])

  // Auto-open when search query matches entries in this subsection
  useEffect(() => {
    if (searchQuery && entries.length > 0) {
      setOpen(true)
    }
  }, [searchQuery, entries.length])

  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  return (
    <div style={{
      border: '1px solid rgba(30, 19, 16, 0.06)',
      borderRadius: 12,
      overflow: 'hidden',
      background: 'var(--color-bg-primary)',
      transition: 'border-color 200ms ease, box-shadow 200ms ease',
      boxShadow: open ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
    }}>
      {/* Header */}
      <button
        onClick={toggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 24px',
          background: open ? 'rgba(30, 19, 16, 0.015)' : 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 200ms ease',
        }}
      >
        {/* Chevron — smooth SVG */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            flexShrink: 0,
            opacity: 0.4,
          }}
        >
          <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Subsection name */}
        <span style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          flex: 1,
          letterSpacing: '-0.01em',
        }}>
          {label}
        </span>

        {/* Entry count pill */}
        <span style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 12,
          fontWeight: 500,
          color: customizedCount > 0 ? '#CD796C' : 'var(--color-text-tertiary)',
          background: customizedCount > 0 ? 'rgba(205,121,108,0.08)' : 'rgba(30, 19, 16, 0.04)',
          borderRadius: 9999,
          padding: '3px 12px',
          flexShrink: 0,
          transition: 'all 200ms ease',
        }}>
          {customizedCount > 0
            ? `${customizedCount}/${entries.length} editados`
            : `${entries.length} campo${entries.length !== 1 ? 's' : ''}`}
        </span>
      </button>

      {/* Content — real measured height for smooth animation */}
      <div style={{
        maxHeight: open ? contentHeight || 9999 : 0,
        overflow: 'hidden',
        transition: 'max-height 350ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div
          ref={contentRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '4px 24px 24px',
          }}
        >
          {entries.map((entry) => (
            <CopyEditorField
              key={entry.id}
              entry={entry}
              searchQuery={searchQuery}
              onValueChange={onValueChange}
              onSaved={onSaved}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const CopyEditorSubsection = memo(CopyEditorSubsectionInner)

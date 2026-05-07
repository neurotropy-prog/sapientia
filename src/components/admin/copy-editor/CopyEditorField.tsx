'use client'

/**
 * CopyEditorField — Individual editable copy field with manual save.
 *
 * Shows label, hint tooltip, input (sized by fieldType), "Editado" badge,
 * restore button, original text, dirty indicator, and save button.
 * Supports Ctrl+S / Cmd+S to save. Shows character count for medium/long fields.
 */

import { useState, useCallback, useRef, useEffect, memo } from 'react'
import type { CopyEntry, SaveStatus } from './types'
import { useCopySave } from './useCopyAutoSave'

interface CopyEditorFieldProps {
  entry: CopyEntry
  searchQuery: string
  onValueChange: (key: string, value: string) => void
  onSaved: (key: string, isCustomized: boolean) => void
}

function CopyEditorFieldInner({
  entry,
  searchQuery,
  onValueChange,
  onSaved,
}: CopyEditorFieldProps) {
  const [value, setValue] = useState(entry.currentValue)
  const [showOriginal, setShowOriginal] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [savedValue, setSavedValue] = useState(entry.currentValue)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { status, save } = useCopySave()

  const isCustomized = value !== entry.defaultValue
  const isDirty = value !== savedValue

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue)
      onValueChange(entry.id, newValue)
    },
    [entry.id, onValueChange],
  )

  const handleSave = useCallback(async () => {
    const ok = await save(entry.id, value)
    if (ok) {
      setSavedValue(value)
      onSaved(entry.id, value !== entry.defaultValue)
    }
  }, [save, entry.id, entry.defaultValue, value, onSaved])

  // Ctrl+S / Cmd+S to save when field is focused
  useEffect(() => {
    if (!isFocused || !isDirty) return
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFocused, isDirty, handleSave])

  const handleRestore = useCallback(async () => {
    if (!confirmRestore) {
      setConfirmRestore(true)
      return
    }
    setValue(entry.defaultValue)
    onValueChange(entry.id, entry.defaultValue)
    const ok = await save(entry.id, entry.defaultValue)
    if (ok) {
      setSavedValue(entry.defaultValue)
      onSaved(entry.id, false)
    }
    setConfirmRestore(false)
  }, [confirmRestore, entry.defaultValue, entry.id, onValueChange, save, onSaved])

  const renderHighlighted = (text: string) => {
    if (!searchQuery) return text
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(180, 90, 50, 0.2)', borderRadius: '2px', padding: '0 1px' }}>
          {text.slice(idx, idx + searchQuery.length)}
        </mark>
        {text.slice(idx + searchQuery.length)}
      </>
    )
  }

  const rows = entry.fieldType === 'short' ? 0 : entry.fieldType === 'medium' ? 3 : 6
  const showCharCount = rows > 0

  // Dynamic focus border
  const borderColor = isFocused
    ? 'rgba(38, 66, 51, 0.35)'
    : isCustomized
      ? 'rgba(180, 90, 50, 0.15)'
      : 'rgba(30, 19, 16, 0.06)'

  return (
    <div style={{
      padding: '16px 20px',
      background: isCustomized ? 'rgba(180, 90, 50, 0.03)' : 'rgba(30, 19, 16, 0.015)',
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      transition: 'all 200ms ease',
    }}>
      {/* Label row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        flexWrap: 'wrap',
      }}>
        <label style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 14,
          fontWeight: 550,
          color: 'var(--color-text-primary)',
          flex: 1,
          minWidth: 0,
          letterSpacing: '-0.01em',
        }}>
          {renderHighlighted(entry.label)}
        </label>

        {/* Hint tooltip */}
        {entry.hint && (
          <span
            title={entry.hint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(30, 19, 16, 0.05)',
              color: 'var(--color-text-tertiary)',
              fontSize: '11px',
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 600,
              cursor: 'help',
              flexShrink: 0,
            }}
          >
            ?
          </span>
        )}

        {/* Dirty indicator */}
        {isDirty && (
          <span style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 10,
            fontWeight: 600,
            color: '#B45A32',
            background: 'rgba(180, 90, 50, 0.10)',
            borderRadius: 9999,
            padding: '2px 10px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}>
            Sin guardar
          </span>
        )}

        {/* Editado badge */}
        {isCustomized && !isDirty && (
          <span style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 10,
            fontWeight: 600,
            color: '#CD796C',
            background: 'rgba(205, 121, 108, 0.08)',
            borderRadius: 9999,
            padding: '2px 10px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}>
            Editado
          </span>
        )}
      </div>

      {/* Input */}
      {rows === 0 ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyle}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          style={{ ...inputStyle, resize: 'vertical', minHeight: rows * 24 }}
        />
      )}

      {/* Footer row: character count left, save/restore right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        minHeight: 28,
        gap: 8,
      }}>
        {/* Left side: char count + save indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showCharCount && (
            <span style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              opacity: isFocused ? 0.8 : 0.4,
              transition: 'opacity 200ms ease',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {value.length} chars
            </span>
          )}

          {/* Save button */}
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 12,
                fontWeight: 600,
                color: '#FFFFFF',
                background: status === 'saving' ? 'rgba(38, 66, 51, 0.5)' : '#264233',
                border: 'none',
                borderRadius: 9999,
                padding: '5px 16px',
                cursor: status === 'saving' ? 'wait' : 'pointer',
                transition: 'background 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {status === 'saving' ? 'Guardando...' : 'Guardar'}
              {status !== 'saving' && (
                <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>
                  {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent ?? '') ? '\u2318S' : 'Ctrl+S'}
                </span>
              )}
            </button>
          )}

          <SaveIndicator status={status} />
        </div>

        {/* Right side: restore */}
        {isCustomized && (
          <button
            onClick={handleRestore}
            onBlur={() => setConfirmRestore(false)}
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 12,
              fontWeight: 500,
              color: confirmRestore ? 'var(--color-error)' : 'var(--color-text-tertiary)',
              background: confirmRestore ? 'rgba(220,50,50,0.06)' : 'none',
              border: confirmRestore ? '1px solid rgba(220,50,50,0.15)' : '1px solid transparent',
              borderRadius: 6,
              cursor: 'pointer',
              padding: '3px 10px',
              transition: 'all 150ms ease',
            }}
          >
            {confirmRestore ? 'Confirmar restaurar' : 'Restaurar original'}
          </button>
        )}
      </div>

      {/* Original text (when customized) */}
      {isCustomized && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 12,
              color: 'var(--color-text-tertiary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 150ms ease',
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              style={{
                transition: 'transform 200ms ease',
                transform: showOriginal ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ver original
          </button>
          {showOriginal && (
            <p style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 13,
              color: 'var(--color-text-tertiary)',
              margin: '8px 0 0 0',
              lineHeight: 1.6,
              fontStyle: 'italic',
              padding: '10px 14px',
              background: 'rgba(30, 19, 16, 0.025)',
              borderRadius: 8,
              borderLeft: '3px solid rgba(30, 19, 16, 0.06)',
            }}>
              {entry.defaultValue}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export const CopyEditorField = memo(CopyEditorFieldInner)

// ── Save indicator ──────────────────────────────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return <span />

  const config = {
    saving: { text: 'Guardando...', color: 'var(--color-text-tertiary)' },
    saved: { text: 'Guardado', color: '#4ADE80' },
    error: { text: 'Error al guardar', color: 'var(--color-error)' },
  }[status]

  return (
    <span style={{
      fontFamily: 'var(--font-host-grotesk)',
      fontSize: 12,
      fontWeight: 500,
      color: config.color,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      transition: 'opacity 150ms ease',
    }}>
      {status === 'saved' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === 'error' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6 4V6.5M6 8V8.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
      {config.text}
    </span>
  )
}

// ── Shared input style ──────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 14,
  color: 'var(--color-text-primary)',
  background: 'var(--color-bg-primary)',
  border: '1px solid rgba(30, 19, 16, 0.10)',
  borderRadius: 8,
  padding: '10px 14px',
  lineHeight: 1.6,
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 200ms ease, box-shadow 200ms ease',
}

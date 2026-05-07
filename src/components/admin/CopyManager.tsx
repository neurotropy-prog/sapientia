'use client'

/**
 * CopyManager — Admin page for editing all copy.
 *
 * Full-width editor with preview as a slide-out drawer.
 * Tabs (Landing|Gateway|Mapa) + search + accordion editor.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { CopySectionName } from '@/lib/copy-defaults'
import type { CopyData, CopyEntry } from './copy-editor/types'
import { TABS, groupBySubsection } from './copy-editor/types'
import { CopyEditorSearch } from './copy-editor/CopyEditorSearch'
import { CopyEditorSubsection } from './copy-editor/CopyEditorSubsection'
import { CopyEditorSectionRestore } from './copy-editor/CopyEditorSectionRestore'
import { CopyEditorSkeleton, CopyEditorError, CopyEditorEmpty } from './copy-editor/CopyEditorStates'
import { GatewayFlowMap } from './copy-editor/GatewayFlowMap'
import { GatewayMindMap } from './copy-editor/GatewayMindMap'
import { CopyPreviewLanding } from './copy-editor/CopyPreviewLanding'
import { CopyPreviewGateway } from './copy-editor/CopyPreviewGateway'
import { CopyPreviewMapa } from './copy-editor/CopyPreviewMapa'
import CopyEditorHistory from './copy-editor/CopyEditorHistory'

export default function CopyManager() {
  const [activeTab, setActiveTab] = useState<CopySectionName>('landing')
  const [data, setData] = useState<CopyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [localValues, setLocalValues] = useState<Record<string, string>>({})
  const [activeSubsection, setActiveSubsection] = useState<string | undefined>()
  const [showHistory, setShowHistory] = useState(false)
  const [gatewayView, setGatewayView] = useState<'list' | 'mindmap'>('list')
  const [showPreview, setShowPreview] = useState(false)

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/copy')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json: CopyData = await res.json()
      setData(json)
      const vals: Record<string, string> = {}
      for (const section of Object.values(json.sections)) {
        for (const entry of section) {
          vals[entry.id] = entry.currentValue
        }
      }
      setLocalValues(vals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Close drawer with Escape ──
  useEffect(() => {
    if (!showPreview) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowPreview(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showPreview])

  // ── Filter entries by search ──
  const entries = data?.sections[activeTab] ?? []
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter((e) =>
      e.label.toLowerCase().includes(q) ||
      e.currentValue.toLowerCase().includes(q) ||
      e.defaultValue.toLowerCase().includes(q)
    )
  }, [entries, searchQuery])

  const grouped = useMemo(() => groupBySubsection(filteredEntries), [filteredEntries])
  const totalCustomized = data?.stats[activeTab] ?? 0
  const totalFields = entries.length

  // ── Callbacks ──
  const handleValueChange = useCallback((key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSaved = useCallback((key: string, isCustomized: boolean) => {
    setData((prev) => {
      if (!prev) return prev
      const updated = { ...prev, sections: { ...prev.sections }, stats: { ...prev.stats } }
      for (const section of Object.keys(updated.sections)) {
        const entries = updated.sections[section]
        const idx = entries.findIndex((e) => e.id === key)
        if (idx !== -1) {
          const entry = entries[idx]
          const wasCustomized = entry.isCustomized
          updated.sections[section] = [...entries]
          updated.sections[section][idx] = { ...entry, isCustomized, currentValue: localValues[key] ?? entry.currentValue }
          if (wasCustomized && !isCustomized) {
            updated.stats[section] = Math.max(0, (updated.stats[section] ?? 0) - 1)
          } else if (!wasCustomized && isCustomized) {
            updated.stats[section] = (updated.stats[section] ?? 0) + 1
          }
          break
        }
      }
      return updated
    })
  }, [localValues])

  const handleSearch = useCallback((q: string) => { setSearchQuery(q) }, [])
  const handleSectionRestore = useCallback(() => { fetchData() }, [fetchData])
  const handleSubsectionFocus = useCallback((sub: string) => { setActiveSubsection(sub) }, [])

  const handleFlowNavigate = useCallback((subsection: string) => {
    const el = document.querySelector(`[data-subsection="${subsection}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const btn = el.querySelector('button[aria-expanded="false"]')
    if (btn instanceof HTMLElement) setTimeout(() => btn.click(), 350)
    setActiveSubsection(subsection)
  }, [])

  const PreviewComponent = activeTab === 'landing'
    ? CopyPreviewLanding
    : activeTab === 'gateway'
      ? CopyPreviewGateway
      : CopyPreviewMapa

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-h2)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}>
          Copy
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Preview drawer toggle */}
          <HeaderBtn
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></svg>}
            label="Vista previa"
            active={showPreview}
            onClick={() => setShowPreview(!showPreview)}
          />
          <HeaderBtn
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Historial"
            active={showHistory}
            onClick={() => setShowHistory(!showHistory)}
          />
        </div>
      </div>

      {/* ── HISTORY VIEW ── */}
      {showHistory && <CopyEditorHistory />}

      {/* ── EDITOR VIEW ── */}
      {!showHistory && <>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid rgba(30, 19, 16, 0.08)',
          marginBottom: 20,
        }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const count = data?.stats[tab.key] ?? 0
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchQuery(''); setActiveSubsection(undefined) }}
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#CD796C' : 'var(--color-text-secondary)',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #CD796C' : '2px solid transparent',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'color 150ms ease, border-color 150ms ease',
                }}
              >
                {tab.label}
                {count > 0 && <TabBadge count={count} />}
              </button>
            )
          })}
        </div>

        {/* Search + Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <CopyEditorSearch onSearch={handleSearch} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 13,
              color: 'var(--color-text-tertiary)',
            }}>
              {totalCustomized} de {totalFields} personalizado{totalFields !== 1 ? 's' : ''}
            </span>
            <CopyEditorSectionRestore
              section={activeTab}
              sectionLabel={TABS.find((t) => t.key === activeTab)?.label ?? activeTab}
              customizedCount={totalCustomized}
              onRestore={handleSectionRestore}
            />
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && <CopyEditorSkeleton />}
        {error && <CopyEditorError message={error} onRetry={fetchData} />}
        {!loading && !error && filteredEntries.length === 0 && searchQuery && <NoResults query={searchQuery} />}
        {!loading && !error && entries.length === 0 && !searchQuery && <CopyEditorEmpty />}

        {/* ── CONTENT ── */}
        {!loading && !error && filteredEntries.length > 0 && (
          <>
            {/* Gateway visual navigator — full width */}
            {activeTab === 'gateway' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8, gap: 4 }}>
                  <ViewToggle label="Navegador" active={gatewayView === 'list'} onClick={() => setGatewayView('list')} />
                  <ViewToggle label="Mapa mental" active={gatewayView === 'mindmap'} onClick={() => setGatewayView('mindmap')} />
                </div>
                {gatewayView === 'list'
                  ? <GatewayFlowMap entries={entries} onNavigate={handleFlowNavigate} />
                  : <GatewayMindMap entries={entries} onNavigate={handleFlowNavigate} />
                }
              </div>
            )}

            {/* Accordions — FULL WIDTH */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(grouped).map(([subsection, items], idx) => (
                <div key={subsection} data-subsection={subsection} onFocus={() => handleSubsectionFocus(subsection)}>
                  <CopyEditorSubsection
                    subsection={subsection}
                    entries={items}
                    defaultOpen={idx === 0}
                    searchQuery={searchQuery}
                    onValueChange={handleValueChange}
                    onSaved={handleSaved}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </>}

      {/* ── PREVIEW DRAWER ── */}
      {/* Backdrop */}
      <div
        onClick={() => setShowPreview(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 400,
          opacity: showPreview ? 1 : 0,
          pointerEvents: showPreview ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 420,
        maxWidth: '90vw',
        background: '#0B0F0E',
        zIndex: 401,
        transform: showPreview ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: showPreview ? '-8px 0 40px rgba(0,0,0,0.2)' : 'none',
      }}>
        {/* Drawer header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Vista previa
          </span>
          <button
            onClick={() => setShowPreview(false)}
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              padding: '4px 10px',
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 150ms ease',
            }}
          >
            Cerrar
            <span style={{ fontSize: 10, opacity: 0.5 }}>Esc</span>
          </button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <PreviewComponent
            localValues={localValues}
            activeSubsection={activeSubsection}
          />
        </div>
      </div>

      {/* ── FLOATING PREVIEW BUTTON (when drawer is closed) ── */}
      {!showPreview && !loading && !error && filteredEntries.length > 0 && !showHistory && (
        <button
          onClick={() => setShowPreview(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 13,
            fontWeight: 600,
            color: '#FFFFFF',
            background: '#264233',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '10px 20px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 150ms ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Vista previa
        </button>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function HeaderBtn({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-host-grotesk)',
      fontSize: 13,
      fontWeight: 500,
      color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
      background: active ? 'rgba(205,121,108,0.08)' : 'none',
      border: active ? '1px solid rgba(205,121,108,0.2)' : '1px solid rgba(38,66,51,0.10)',
      borderRadius: 'var(--radius-pill)',
      padding: '6px 14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      transition: 'all 150ms ease',
    }}>
      {icon}
      {label}
    </button>
  )
}

function TabBadge({ count }: { count: number }) {
  return (
    <span style={{
      fontFamily: 'var(--font-host-grotesk)',
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--color-text-inverse)',
      background: '#CD796C',
      borderRadius: '9999px',
      padding: '1px 8px',
      lineHeight: 1.6,
    }}>
      {count}
    </span>
  )
}

function ViewToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-host-grotesk)',
      fontSize: 12,
      fontWeight: active ? 600 : 400,
      color: active ? '#264233' : 'var(--color-text-tertiary)',
      background: active ? 'rgba(38,66,51,0.08)' : 'none',
      border: active ? '1px solid rgba(38,66,51,0.15)' : '1px solid transparent',
      borderRadius: 'var(--radius-pill)',
      padding: '5px 14px',
      cursor: 'pointer',
      transition: 'all 120ms ease',
    }}>
      {label}
    </button>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p style={{
        fontFamily: 'var(--font-host-grotesk)',
        fontSize: 15,
        color: 'var(--color-text-tertiary)',
      }}>
        No se encontraron resultados para &ldquo;{query}&rdquo;
      </p>
    </div>
  )
}

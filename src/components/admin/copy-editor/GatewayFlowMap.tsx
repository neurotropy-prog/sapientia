'use client'

/**
 * GatewayFlowMap — Visual flowchart of the gateway journey for copy editors.
 *
 * Pure React + inline CSS. Zero external deps. All data in-memory.
 * Click any node → smooth-scroll to that accordion section.
 */

import { useState, useMemo, useCallback, type CSSProperties } from 'react'
import type { CopyEntry } from './types'
import { SUBSECTION_LABELS } from './types'

// ─── Flow definition ────────────────────────────────────────────────────────

interface FlowNode {
  key: string
  label: string
  short: string
  zone: 1 | 2 | 3
}

const GATEWAY_FLOW: FlowNode[] = [
  { key: 'p1role', label: 'Rol Profesional', short: 'P1a', zone: 1 },
  { key: 'p1',     label: '¿Qué te trajo aquí?', short: 'P1b', zone: 1 },
  { key: 'p2',     label: 'Sueño', short: 'P2', zone: 1 },
  { key: 'primeraverdad', label: 'Primera Verdad', short: 'PV', zone: 1 },
  { key: 'p3',     label: 'Síntomas cognitivos', short: 'P3', zone: 1 },
  { key: 'p4',     label: 'Síntomas emocionales', short: 'P4', zone: 1 },
  { key: 'microespejo1', label: 'Micro-espejo 1', short: 'ME1', zone: 1 },
  { key: 'p5',     label: 'Alegría de vivir', short: 'P5', zone: 2 },
  { key: 'p6',     label: 'Frase identitaria', short: 'P6', zone: 2 },
  { key: 'microespejo2', label: 'Micro-espejo 2', short: 'ME2', zone: 2 },
  { key: 'p7',     label: 'Sliders', short: 'P7', zone: 2 },
  { key: 'p8',     label: 'Duración', short: 'P8', zone: 2 },
  { key: 'bisagra', label: 'Bisagra + Revelación', short: 'BIS', zone: 3 },
]

const ZONE_LABELS: Record<number, string> = {
  1: 'RECONOCIMIENTO',
  2: 'PROFUNDIZACIÓN',
  3: 'REVELACIÓN',
}

const ZONE_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'rgba(38,66,51,0.06)', border: 'rgba(38,66,51,0.12)', text: '#264233' },
  2: { bg: 'rgba(205,121,108,0.06)', border: 'rgba(205,121,108,0.12)', text: '#CD796C' },
  3: { bg: 'rgba(205,121,108,0.06)', border: 'rgba(205,121,108,0.12)', text: '#CD796C' },
}

// ─── Stats helper ───────────────────────────────────────────────────────────

interface NodeStats {
  total: number
  customized: number
}

function computeNodeStats(
  entries: CopyEntry[],
): Record<string, NodeStats> {
  const stats: Record<string, NodeStats> = {}
  for (const e of entries) {
    if (!stats[e.subsection]) stats[e.subsection] = { total: 0, customized: 0 }
    stats[e.subsection].total++
    if (e.isCustomized) stats[e.subsection].customized++
  }
  return stats
}

type StatusColor = 'complete' | 'partial' | 'untouched'

function getStatus(s: NodeStats | undefined): StatusColor {
  if (!s || s.total === 0) return 'untouched'
  if (s.customized >= s.total) return 'complete'
  if (s.customized > 0) return 'partial'
  return 'untouched'
}

const STATUS_STYLES: Record<StatusColor, { dot: string; ring: string }> = {
  complete:  { dot: '#4ADE80', ring: 'rgba(74,222,128,0.25)' },
  partial:   { dot: '#CD796C', ring: 'rgba(205,121,108,0.25)' },
  untouched: { dot: '#9CA3AF', ring: 'rgba(156,163,175,0.15)' },
}

// ─── Component ──────────────────────────────────────────────────────────────

interface GatewayFlowMapProps {
  entries: CopyEntry[]
  onNavigate: (subsection: string) => void
}

export function GatewayFlowMap({ entries, onNavigate }: GatewayFlowMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const stats = useMemo(() => computeNodeStats(entries), [entries])

  // Group nodes by zone
  const zones = useMemo(() => {
    const map = new Map<number, FlowNode[]>()
    for (const node of GATEWAY_FLOW) {
      if (!map.has(node.zone)) map.set(node.zone, [])
      map.get(node.zone)!.push(node)
    }
    return Array.from(map.entries()).map(([zone, nodes]) => ({ zone, nodes }))
  }, [])

  // Summary stats
  const totalFields = entries.length
  const totalCustomized = entries.filter((e) => e.isCustomized).length
  const completionPct = totalFields > 0 ? Math.round((totalCustomized / totalFields) * 100) : 0

  const handleClick = useCallback((key: string) => {
    onNavigate(key)
  }, [onNavigate])

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#264233" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span style={headerTitleStyle}>Mapa del Gateway</span>
        </div>
        <div style={headerStatsStyle}>
          <div style={progressBarBgStyle}>
            <div style={{ ...progressBarFillStyle, width: `${completionPct}%` }} />
          </div>
          <span style={headerStatTextStyle}>
            {totalCustomized}/{totalFields} editados ({completionPct}%)
          </span>
        </div>
      </div>

      {/* Flow zones */}
      <div style={flowContainerStyle}>
        {zones.map(({ zone, nodes }, zoneIdx) => {
          const zc = ZONE_COLORS[zone]
          return (
            <div key={zone} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Zone label */}
              <span style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: zc.text,
                opacity: 0.7,
              }}>
                {ZONE_LABELS[zone]}
              </span>

              {/* Nodes row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '8px 10px',
                background: zc.bg,
                border: `1px solid ${zc.border}`,
                borderRadius: 10,
              }}>
                {nodes.map((node, nodeIdx) => {
                  const s = stats[node.key]
                  const status = getStatus(s)
                  const sc = STATUS_STYLES[status]
                  const isHovered = hoveredNode === node.key
                  const isSpecial = node.key === 'primeraverdad' || node.key === 'microespejo1' || node.key === 'microespejo2' || node.key === 'bisagra'

                  return (
                    <div key={node.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {/* Connector arrow */}
                      {nodeIdx > 0 && (
                        <svg width="14" height="10" viewBox="0 0 14 10" style={{ flexShrink: 0, opacity: 0.3 }}>
                          <path d="M0 5 L10 5 M7 2 L10 5 L7 8" stroke={zc.text} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}

                      {/* Node */}
                      <button
                        onClick={() => handleClick(node.key)}
                        onMouseEnter={() => setHoveredNode(node.key)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 10px',
                          background: isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
                          border: isSpecial
                            ? `1.5px solid ${isHovered ? zc.text : zc.border}`
                            : `1px solid ${isHovered ? 'rgba(38,66,51,0.2)' : 'rgba(38,66,51,0.08)'}`,
                          borderRadius: isSpecial ? 8 : 6,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-host-grotesk)',
                          fontSize: 11,
                          fontWeight: isHovered ? 600 : 500,
                          color: isHovered ? '#264233' : 'var(--color-text-secondary)',
                          transition: 'all 120ms ease-out',
                          transform: isHovered ? 'translateY(-1px)' : 'none',
                          boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.2,
                          flexShrink: 0,
                        }}
                        title={`${SUBSECTION_LABELS[node.key] ?? node.label}${s ? ` — ${s.customized}/${s.total} editados` : ''}`}
                      >
                        {/* Status dot */}
                        <span style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: sc.dot,
                          boxShadow: `0 0 0 3px ${sc.ring}`,
                          flexShrink: 0,
                        }} />
                        {node.short}
                        {s && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 400,
                            color: 'var(--color-text-tertiary)',
                            opacity: isHovered ? 1 : 0.7,
                          }}>
                            {s.customized}/{s.total}
                          </span>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={legendStyle}>
        {([
          ['complete', 'Todo editado'],
          ['partial', 'Parcial'],
          ['untouched', 'Sin editar'],
        ] as [StatusColor, string][]).map(([status, label]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: STATUS_STYLES[status].dot,
              boxShadow: `0 0 0 2px ${STATUS_STYLES[status].ring}`,
            }} />
            <span style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const containerStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(38,66,51,0.08)',
  borderRadius: 14,
  padding: '16px 20px 12px',
  marginBottom: 20,
}

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 14,
}

const headerTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 13,
  fontWeight: 700,
  color: '#264233',
}

const headerStatsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}

const progressBarBgStyle: CSSProperties = {
  width: 80,
  height: 4,
  borderRadius: 2,
  background: 'rgba(38,66,51,0.08)',
  overflow: 'hidden',
}

const progressBarFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 2,
  background: '#4ADE80',
  transition: 'width 300ms ease',
}

const headerStatTextStyle: CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--color-text-tertiary)',
}

const flowContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const legendStyle: CSSProperties = {
  display: 'flex',
  gap: 16,
  marginTop: 12,
  paddingTop: 10,
  borderTop: '1px solid rgba(38,66,51,0.06)',
}

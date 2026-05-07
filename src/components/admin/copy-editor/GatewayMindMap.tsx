'use client'

/**
 * GatewayMindMap — Interactive mind map of gateway branching logic.
 *
 * Horizontal tree: root left, branches expand right.
 * Click to expand/collapse. Drag to pan. Scroll to zoom.
 * Fullscreen mode fills viewport.
 * Pure SVG + React — zero dependencies.
 */

import {
  useState, useMemo, useRef, useCallback, useEffect,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import type { CopyEntry } from './types'

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface MindNode {
  id: string
  label: string
  detail?: string
  zone: 1 | 2 | 3
  subsection?: string
  badge?: string
  children?: MindNode[]
}

interface LayoutNode {
  id: string
  x: number
  y: number
  depth: number
  node: MindNode
  children?: LayoutNode[]
}

interface Pos { x: number; y: number }

// ─── LAYOUT CONSTANTS ───────────────────────────────────────────────────────

const NODE_H = 38
const V_GAP = 6
const H_GAP = 56

function nodeW(depth: number): number {
  if (depth === 0) return 160
  if (depth === 1) return 240
  if (depth === 2) return 220
  return 240
}

// ─── COLORS ─────────────────────────────────────────────────────────────────

const CLR = {
  root:   { bg: '#E2DBED', text: '#4A3B6B', border: '#C8BDE0' },
  zone1:  { bg: '#DCE8EF', text: '#1E3A2B', border: '#C2D5E0' },
  zone2:  { bg: '#EDE1DC', text: '#6B3F32', border: '#DBC8C0' },
  zone3:  { bg: '#E4DDD9', text: '#5C4A42', border: '#CFC3BC' },
  leaf:   { bg: '#D4EDE0', text: '#1A3326', border: '#B4D9C4' },
  conn:   '#A0B0C0',
  status: { complete: '#4ADE80', partial: '#CD796C', untouched: '#C4CAD0' },
}

function nodeColors(node: MindNode, depth: number, isLeaf: boolean) {
  if (depth === 0) return CLR.root
  if (isLeaf) return CLR.leaf
  if (node.zone === 2) return CLR.zone2
  if (node.zone === 3) return CLR.zone3
  return CLR.zone1
}

// ─── GATEWAY TREE DATA ─────────────────────────────────────────────────────

const TREE: MindNode = {
  id: 'root', label: 'Gateway LARS', zone: 1,
  children: [
    {
      id: 'p1', label: 'P1 — ¿Qué te trajo aquí?', zone: 1, subsection: 'p1', badge: '5 opciones',
      children: [
        { id: 'p1a', label: 'Agotamiento que no se va', zone: 1 },
        { id: 'p1b', label: 'Rendimiento en caída', zone: 1 },
        { id: 'p1c', label: 'El cuerpo habla', zone: 1 },
        { id: 'p1d', label: 'Alguien me lo sugirió', zone: 1 },
        { id: 'p1e', label: 'Curiosidad', zone: 1 },
      ],
    },
    {
      id: 'p2', label: 'P2 — Sueño', zone: 1, subsection: 'p2', badge: '5 opciones',
      children: [
        { id: 'p2a', label: 'Mente no se apaga', zone: 1 },
        { id: 'p2b', label: 'Despierto a las 3-4am', zone: 1 },
        { id: 'p2c', label: 'Duermo pero sigo cansado', zone: 1 },
        { id: 'p2d', label: 'Poco sueño, funciono', zone: 1 },
        { id: 'p2e', label: 'Mi sueño es bueno', zone: 1 },
      ],
    },
    {
      id: 'pv', label: 'Primera Verdad', detail: 'P1 × P2 = 25 variantes', zone: 1, subsection: 'primeraverdad', badge: '25 textos',
      children: [
        {
          id: 'pv_a', label: 'P1 = Agotamiento', zone: 1, badge: '5',
          children: [
            { id: 'pv_aa', label: '× Mente no se apaga', zone: 1 },
            { id: 'pv_ab', label: '× Despierto 3-4am', zone: 1 },
            { id: 'pv_ac', label: '× Duermo pero cansado', zone: 1 },
            { id: 'pv_ad', label: '× Poco sueño', zone: 1 },
            { id: 'pv_ae', label: '× Sueño bueno', zone: 1 },
          ],
        },
        {
          id: 'pv_b', label: 'P1 = Rendimiento', zone: 1, badge: '5',
          children: [
            { id: 'pv_ba', label: '× Mente no se apaga', zone: 1 },
            { id: 'pv_bb', label: '× Despierto 3-4am', zone: 1 },
            { id: 'pv_bc', label: '× Duermo pero cansado', zone: 1 },
            { id: 'pv_bd', label: '× Poco sueño', zone: 1 },
            { id: 'pv_be', label: '× Sueño bueno', zone: 1 },
          ],
        },
        {
          id: 'pv_c', label: 'P1 = El cuerpo habla', zone: 1, badge: '5',
          children: [
            { id: 'pv_ca', label: '× Mente no se apaga', zone: 1 },
            { id: 'pv_cb', label: '× Despierto 3-4am', zone: 1 },
            { id: 'pv_cc', label: '× Duermo pero cansado', zone: 1 },
            { id: 'pv_cd', label: '× Poco sueño', zone: 1 },
            { id: 'pv_ce', label: '× Sueño bueno', zone: 1 },
          ],
        },
        {
          id: 'pv_d', label: 'P1 = Alguien me lo sugirió', zone: 1, badge: '5',
          children: [
            { id: 'pv_da', label: '× Mente no se apaga', zone: 1 },
            { id: 'pv_db', label: '× Despierto 3-4am', zone: 1 },
            { id: 'pv_dc', label: '× Duermo pero cansado', zone: 1 },
            { id: 'pv_dd', label: '× Poco sueño', zone: 1 },
            { id: 'pv_de', label: '× Sueño bueno', zone: 1 },
          ],
        },
        {
          id: 'pv_e', label: 'P1 = Curiosidad', zone: 1, badge: '5',
          children: [
            { id: 'pv_ea', label: '× Mente no se apaga', zone: 1 },
            { id: 'pv_eb', label: '× Despierto 3-4am', zone: 1 },
            { id: 'pv_ec', label: '× Duermo pero cansado', zone: 1 },
            { id: 'pv_ed', label: '× Poco sueño', zone: 1 },
            { id: 'pv_ee', label: '× Sueño bueno', zone: 1 },
          ],
        },
      ],
    },
    {
      id: 'p3', label: 'P3 — Síntomas cognitivos', zone: 1, subsection: 'p3', badge: '6 multi-select',
      children: [
        { id: 'p3a', label: 'Saturación mental', zone: 1 },
        { id: 'p3b', label: 'Concentración y decisiones', zone: 1 },
        { id: 'p3c', label: 'Falta de foco', zone: 1 },
        { id: 'p3d', label: 'No me viene la palabra', zone: 1 },
        { id: 'p3e', label: 'Agotamiento decisional', zone: 1 },
        { id: 'p3f', label: 'Ninguna de estas', zone: 1 },
      ],
    },
    {
      id: 'p4', label: 'P4 — Síntomas emocionales', zone: 1, subsection: 'p4', badge: '6 opciones',
      children: [
        { id: 'p4a', label: 'Irritabilidad', zone: 1 },
        { id: 'p4b', label: 'Vacío emocional', zone: 1 },
        { id: 'p4c', label: 'Explosiones de culpa', zone: 1 },
        { id: 'p4d', label: 'Anestesia emocional', zone: 1 },
        { id: 'p4e', label: 'Rumiación constante', zone: 1 },
        { id: 'p4f', label: 'Razonablemente bien', zone: 1 },
      ],
    },
    {
      id: 'me1', label: 'Micro-espejo 1', detail: 'según P3 × P4', zone: 1, subsection: 'microespejo1', badge: '5 variantes',
      children: [
        { id: 'me1a', label: 'Vacío (P3<3 + P4=Vacío)', zone: 1 },
        { id: 'me1b', label: 'Explosiones (P3≥3 + P4=Explosiones)', zone: 1 },
        { id: 'me1c', label: 'Anestesia (P3≥3 + P4=Anestesia)', zone: 1 },
        { id: 'me1d', label: 'Rumiación (P3<3 + P4=Rumiación)', zone: 1 },
        { id: 'me1e', label: 'Default (combinación más frecuente)', zone: 1 },
      ],
    },
    {
      id: 'p5', label: 'P5 — Alegría de vivir', zone: 2, subsection: 'p5', badge: '5 opciones',
      children: [
        { id: 'p5a', label: 'No lo recuerdo', zone: 2 },
        { id: 'p5b', label: 'Hace semanas o meses', zone: 2 },
        { id: 'p5c', label: 'Puedo, pero no suelto la cabeza', zone: 2 },
        { id: 'p5d', label: 'Disfruto con culpa', zone: 2 },
        { id: 'p5e', label: 'Disfruto con frecuencia', zone: 2 },
      ],
    },
    {
      id: 'p6', label: 'P6 — Frase identitaria', zone: 2, subsection: 'p6', badge: '→ perfil',
      children: [
        { id: 'p6a', label: '"No puedo parar" → Productivo Colapsado', zone: 2 },
        { id: 'p6b', label: '"Puedo con todo" → Fuerte Invisible', zone: 2 },
        { id: 'p6c', label: '"Si yo caigo, todos caen" → Cuidador Exhausto', zone: 2 },
        { id: 'p6d', label: '"Necesito entender" → Controlador Paralizado', zone: 2 },
        { id: 'p6e', label: '"He probado de todo"', zone: 2 },
      ],
    },
    {
      id: 'me2', label: 'Micro-espejo 2', detail: '1:1 con P6', zone: 2, subsection: 'microespejo2', badge: '5 variantes',
      children: [
        { id: 'me2a', label: 'Para "No puedo parar"', zone: 2 },
        { id: 'me2b', label: 'Para "Puedo con todo"', zone: 2 },
        { id: 'me2c', label: 'Para "Si yo caigo..."', zone: 2 },
        { id: 'me2d', label: 'Para "Necesito entender"', zone: 2 },
        { id: 'me2e', label: 'Para "He probado de todo"', zone: 2 },
      ],
    },
    {
      id: 'p7', label: 'P7 — Sliders autoevaluación', zone: 2, subsection: 'p7', badge: '5 dimensiones',
      children: [
        { id: 'p7a', label: 'D1: Capacidad de descansar', zone: 2 },
        { id: 'p7b', label: 'D2: Calidad de sueño', zone: 2 },
        { id: 'p7c', label: 'D3: Claridad para pensar', zone: 2 },
        { id: 'p7d', label: 'D4: Estabilidad emocional', zone: 2 },
        { id: 'p7e', label: 'D5: Ilusión por lo que haces', zone: 2 },
      ],
    },
    {
      id: 'p8', label: 'P8 — Duración', zone: 2, subsection: 'p8', badge: '4 opciones',
      children: [
        { id: 'p8a', label: 'Semanas (emergente)', zone: 2 },
        { id: 'p8b', label: 'Meses (instalado)', zone: 2 },
        { id: 'p8c', label: 'Más de un año (cronificado)', zone: 2 },
        { id: 'p8d', label: 'Años — no recuerdo estar bien', zone: 2 },
      ],
    },
    {
      id: 'scoring', label: 'Scoring', detail: '5 dimensiones → puntuación', zone: 3, subsection: 'bisagra', badge: 'algoritmo',
      children: [
        { id: 'sc1', label: 'D1: Regulación Nerviosa (30%)', zone: 3 },
        { id: 'sc2', label: 'D2: Calidad de Sueño (20%)', zone: 3 },
        { id: 'sc3', label: 'D3: Claridad Cognitiva (20%)', zone: 3 },
        { id: 'sc4', label: 'D4: Equilibrio Emocional (15%)', zone: 3 },
        { id: 'sc5', label: 'D5: Alegría de Vivir (15%)', zone: 3 },
      ],
    },
    {
      id: 'result', label: 'Resultado', detail: 'Perfil + mapa', zone: 3, badge: '4 perfiles',
      children: [
        { id: 'res1', label: 'Productivo Colapsado (P6=A)', zone: 3 },
        { id: 'res2', label: 'Fuerte Invisible (P6=B)', zone: 3 },
        { id: 'res3', label: 'Cuidador Exhausto (P6=C)', zone: 3 },
        { id: 'res4', label: 'Controlador Paralizado (P6=D)', zone: 3 },
      ],
    },
  ],
}

// ─── LAYOUT ─────────────────────────────────────────────────────────────────

function subtreeH(node: MindNode, exp: Set<string>): number {
  if (!node.children || !exp.has(node.id)) return NODE_H
  const hh = node.children.map((c) => subtreeH(c, exp))
  return Math.max(NODE_H, hh.reduce((a, b) => a + b, 0) + (node.children.length - 1) * V_GAP)
}

function doLayout(node: MindNode, exp: Set<string>, x: number, yC: number, depth: number): LayoutNode {
  const r: LayoutNode = { id: node.id, x, y: yC, depth, node }
  if (!node.children || !exp.has(node.id)) return r
  const total = subtreeH(node, exp)
  let yStart = yC - total / 2
  const cx = x + nodeW(depth) + H_GAP
  r.children = node.children.map((child) => {
    const ch = subtreeH(child, exp)
    const cc = yStart + ch / 2
    const lr = doLayout(child, exp, cx, cc, depth + 1)
    yStart += ch + V_GAP
    return lr
  })
  return r
}

function flattenAll(node: LayoutNode): LayoutNode[] {
  const arr: LayoutNode[] = [node]
  if (node.children) for (const c of node.children) arr.push(...flattenAll(c))
  return arr
}

// ─── EDIT STATUS ────────────────────────────────────────────────────────────

function computeStats(entries: CopyEntry[]): Record<string, { total: number; customized: number }> {
  const s: Record<string, { total: number; customized: number }> = {}
  for (const e of entries) {
    if (!s[e.subsection]) s[e.subsection] = { total: 0, customized: 0 }
    s[e.subsection].total++
    if (e.isCustomized) s[e.subsection].customized++
  }
  return s
}

function statusColor(st: { total: number; customized: number } | undefined): string {
  if (!st || st.total === 0) return CLR.status.untouched
  if (st.customized >= st.total) return CLR.status.complete
  if (st.customized > 0) return CLR.status.partial
  return CLR.status.untouched
}

function findParentSub(childId: string, node: MindNode = TREE): string | undefined {
  if (node.children) {
    for (const c of node.children) {
      if (c.id === childId) return node.subsection
      const r = findParentSub(childId, c)
      if (r) return r
    }
  }
  return undefined
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

interface Props {
  entries: CopyEntry[]
  onNavigate: (subsection: string) => void
}

export function GatewayMindMap({ entries, onNavigate }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']))
  const [hovered, setHovered] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [pan, setPan] = useState<Pos>({ x: 0, y: 0 })
  const [scale, setScale] = useState(0.95)
  const dragging = useRef(false)
  const dragOrigin = useRef<Pos>({ x: 0, y: 0 })
  const panOrigin = useRef<Pos>({ x: 0, y: 0 })

  const stats = useMemo(() => computeStats(entries), [entries])

  const tree = useMemo(() => {
    const total = subtreeH(TREE, expanded)
    return doLayout(TREE, expanded, 30, total / 2 + 30, 0)
  }, [expanded])

  const nodes = useMemo(() => flattenAll(tree), [tree])

  const bounds = useMemo(() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const n of nodes) {
      const w = nodeW(n.depth)
      x0 = Math.min(x0, n.x)
      y0 = Math.min(y0, n.y - NODE_H / 2)
      x1 = Math.max(x1, n.x + w)
      y1 = Math.max(y1, n.y + NODE_H / 2)
    }
    return { x: x0 - 30, y: y0 - 30, w: x1 - x0 + 60, h: y1 - y0 + 60 }
  }, [nodes])

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const handleClick = useCallback((node: MindNode) => {
    if (node.children?.length) { toggle(node.id) }
    else {
      const sub = node.subsection || findParentSub(node.id)
      if (sub) onNavigate(sub)
    }
  }, [toggle, onNavigate])

  const onDown = useCallback((e: ReactMouseEvent) => {
    if (e.button !== 0) return
    dragging.current = true
    dragOrigin.current = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }
  }, [pan])

  const onMove = useCallback((e: ReactMouseEvent) => {
    if (!dragging.current) return
    setPan({ x: panOrigin.current.x + (e.clientX - dragOrigin.current.x), y: panOrigin.current.y + (e.clientY - dragOrigin.current.y) })
  }, [])

  const onUp = useCallback(() => { dragging.current = false }, [])

  const onWheel = useCallback((e: ReactWheelEvent) => {
    e.preventDefault()
    setScale((s) => Math.min(3, Math.max(0.2, s * (e.deltaY > 0 ? 0.93 : 1.07))))
  }, [])

  const resetView = useCallback(() => { setPan({ x: 0, y: 0 }); setScale(0.95); setExpanded(new Set(['root'])) }, [])

  const expandAll = useCallback(() => {
    const ids = new Set<string>()
    function walk(n: MindNode) { if (n.children?.length) { ids.add(n.id); n.children.forEach(walk) } }
    walk(TREE)
    setExpanded(ids)
  }, [])

  // Escape exits fullscreen
  useEffect(() => {
    if (!fullscreen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [fullscreen])

  const inner = (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: fullscreen ? '100vh' : 'auto',
      background: '#F8F9FB',
      borderRadius: fullscreen ? 0 : 14,
      border: fullscreen ? 'none' : '1px solid rgba(38,66,51,0.08)',
      overflow: 'hidden',
    }}>
      {/* TOOLBAR */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', borderBottom: '1px solid rgba(38,66,51,0.06)',
        background: 'white', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#264233" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4m-7.07-2.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" /></svg>
          <span style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 13, fontWeight: 700, color: '#264233' }}>Mapa mental del Gateway</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ToolBtn label="Expandir todo" onClick={expandAll} />
          <ToolBtn label="Resetear" onClick={resetView} />
          <Sep />
          <ZoomBtn label="−" onClick={() => setScale((s) => Math.max(0.2, s * 0.85))} />
          <span style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 11, color: '#8B9AA8', minWidth: 40, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
          <ZoomBtn label="+" onClick={() => setScale((s) => Math.min(3, s * 1.15))} />
          <Sep />
          <ToolBtn label={fullscreen ? '✕ Salir' : '⛶ Pantalla completa'} onClick={() => setFullscreen((f) => !f)} accent={fullscreen} />
        </div>
      </div>

      {/* CANVAS */}
      <div
        style={{ flex: 1, height: fullscreen ? undefined : 560, cursor: dragging.current ? 'grabbing' : 'grab', overflow: 'hidden', userSelect: 'none' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        /* onWheel disabled — Javi feedback G2: zoom solo con botones +/- */
      >
        <svg width="100%" height="100%" viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`} preserveAspectRatio="xMidYMid meet"
          style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${scale})`, transformOrigin: 'center center', transition: dragging.current ? 'none' : 'transform 150ms ease-out' }}>

          {/* CONNECTIONS */}
          {nodes.map((n) => {
            if (!n.children) return null
            const pw = nodeW(n.depth); const px = n.x + pw; const py = n.y
            return n.children.map((ch) => {
              const mx = (px + ch.x) / 2
              return <path key={`c-${n.id}-${ch.id}`} d={`M${px},${py} C${mx},${py} ${mx},${ch.y} ${ch.x},${ch.y}`} fill="none" stroke={CLR.conn} strokeWidth={1.3} opacity={0.4} />
            })
          })}

          {/* NODES */}
          {nodes.map((n) => {
            const w = nodeW(n.depth)
            const isLeaf = !n.node.children?.length
            const isExp = expanded.has(n.id)
            const isHov = hovered === n.id
            const col = nodeColors(n.node, n.depth, isLeaf)
            const sub = n.node.subsection
            const st = sub ? stats[sub] : undefined
            const dot = sub ? statusColor(st) : null
            const statTxt = st ? `${st.customized}/${st.total}` : null
            const ry = n.y - NODE_H / 2

            return (
              <g key={n.id} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleClick(n.node) }}
                onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}>
                {isHov && <rect x={n.x - 2} y={ry - 2} width={w + 4} height={NODE_H + 4} rx={10} fill="none" stroke={col.border} strokeWidth={2} opacity={0.6} />}
                <rect x={n.x} y={ry} width={w} height={NODE_H} rx={8} fill={col.bg} stroke={col.border} strokeWidth={0.8} />
                {dot && <circle cx={n.x + 14} cy={n.y} r={4.5} fill={dot} />}
                <text x={n.x + (dot ? 26 : 12)} y={n.node.detail && !isExp ? n.y - 4 : n.y + 1} fill={col.text} fontSize={n.depth === 0 ? 13 : 11.5} fontWeight={n.depth <= 1 ? 600 : 450} fontFamily="var(--font-host-grotesk)" dominantBaseline="central" style={{ pointerEvents: 'none' }}>
                  {n.node.label}
                </text>
                {n.node.detail && !isExp && (
                  <text x={n.x + (dot ? 26 : 12)} y={n.y + 10} fill={col.text} fontSize={9.5} fontFamily="var(--font-host-grotesk)" dominantBaseline="central" opacity={0.5} style={{ pointerEvents: 'none' }}>
                    {n.node.detail}
                  </text>
                )}
                {n.node.badge && !isExp && <BadgePill x={n.x + w} y={n.y} text={n.node.badge} />}
                {statTxt && isExp && (
                  <text x={n.x + w - 10} y={n.y + 1} fill="#CD796C" fontSize={10} fontWeight={600} fontFamily="var(--font-host-grotesk)" dominantBaseline="central" textAnchor="end" style={{ pointerEvents: 'none' }}>{statTxt}</text>
                )}
                {!isLeaf && <text x={n.x + w + 8} y={n.y + 1} fill={CLR.conn} fontSize={14} dominantBaseline="central" style={{ pointerEvents: 'none' }}>{isExp ? '‹' : '›'}</text>}
              </g>
            )
          })}
        </svg>
      </div>

      {/* FOOTER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '8px 16px', borderTop: '1px solid rgba(38,66,51,0.06)', background: 'white', flexShrink: 0 }}>
        <StatusDot color={CLR.status.complete} label="Todo editado" />
        <StatusDot color={CLR.status.partial} label="Parcial" />
        <StatusDot color={CLR.status.untouched} label="Sin editar" />
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 10, color: '#A0AAB4' }}>Click para expandir · Arrastra para mover · Scroll para zoom · Esc para salir</span>
      </div>
    </div>
  )

  if (fullscreen) return <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#F8F9FB' }}>{inner}</div>
  return <div style={{ marginBottom: 16 }}>{inner}</div>
}

// ─── SVG HELPERS ────────────────────────────────────────────────────────────

function BadgePill({ x, y, text }: { x: number; y: number; text: string }) {
  const w = text.length * 6 + 14
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={x - w - 6} y={y - 9} width={w} height={18} rx={9} fill="rgba(38,66,51,0.05)" stroke="rgba(38,66,51,0.08)" strokeWidth={0.5} />
      <text x={x - w / 2 - 6} y={y + 1} fill="#7B8D9A" fontSize={9} fontFamily="var(--font-host-grotesk)" textAnchor="middle" dominantBaseline="central">{text}</text>
    </g>
  )
}

// ─── HTML HELPERS ───────────────────────────────────────────────────────────

function ToolBtn({ label, onClick, accent }: { label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-host-grotesk)', fontSize: 11, fontWeight: 500,
      color: accent ? '#CD796C' : '#5A6B78', background: accent ? 'rgba(205,121,108,0.08)' : 'rgba(38,66,51,0.04)',
      border: '1px solid ' + (accent ? 'rgba(205,121,108,0.2)' : 'rgba(38,66,51,0.08)'),
      borderRadius: 6, padding: '4px 10px', cursor: 'pointer', transition: 'all 100ms ease',
    }}>{label}</button>
  )
}

function ZoomBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 6, border: '1px solid rgba(38,66,51,0.1)', background: 'white',
      cursor: 'pointer', fontFamily: 'var(--font-host-grotesk)', fontSize: 14, fontWeight: 600, color: '#264233', lineHeight: 1,
    }}>{label}</button>
  )
}

function Sep() { return <div style={{ width: 1, height: 20, background: 'rgba(38,66,51,0.08)' }} /> }

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
      <span style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 11, color: '#8B9AA8' }}>{label}</span>
    </div>
  )
}

/**
 * copy.ts — Helper functions for reading copy with overrides.
 *
 * Three access patterns:
 * 1. getCopyServer(key) — async, for server components (direct Supabase query)
 * 2. useCopy() — React hook for client components (fetches /api/copy)
 * 3. getCopySync(key, overrides?) — pure sync, for data files (in copy-sync.ts)
 *
 * Public components use useCopy() for dynamic overrides.
 * Gateway data files use getCopySync() for backward-compatible overrides.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { COPY_DEFAULTS_MAP } from '@/lib/copy-defaults'

// Re-export getCopySync from server-safe module for backward compat
export { getCopySync } from '@/lib/copy-sync'

// ─── React hook (for client components) ──────────────────────────────────────

interface UseCopyReturn {
  getCopy: (key: string) => string
  loading: boolean
}

// Module-level cache so multiple components share the same fetch
let cachedOverrides: Record<string, string> | null = null
let fetchPromise: Promise<void> | null = null
let lastFetchTime = 0
const CACHE_TTL = 10_000 // Re-fetch if older than 10 seconds

function fetchOverrides(force = false): Promise<void> {
  const now = Date.now()
  if (!force && fetchPromise && cachedOverrides && (now - lastFetchTime) < CACHE_TTL) {
    return fetchPromise
  }
  fetchPromise = fetch('/api/copy', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : {}))
    .then((data: Record<string, string>) => {
      cachedOverrides = data
      lastFetchTime = Date.now()
    })
    .catch(() => {
      cachedOverrides = cachedOverrides ?? {}
    })
  return fetchPromise
}

/**
 * Hook for client components. Fetches overrides on mount, refreshes if stale.
 *
 * Usage:
 *   const { getCopy, loading } = useCopy()
 *   return <h1>{getCopy('hero.headline')}</h1>
 */
export function useCopy(): UseCopyReturn {
  const [loading, setLoading] = useState(cachedOverrides === null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const stale = !cachedOverrides || (Date.now() - lastFetchTime) >= CACHE_TTL
    if (stale) {
      fetchOverrides(true).then(() => {
        setLoading(false)
        setTick((t) => t + 1) // force re-render with fresh data
      })
    }
  }, [])

  // tick in deps ensures getCopy reference changes when overrides load,
  // so any useMemo([getCopy]) downstream re-computes with fresh data.
  const getCopy = useCallback((key: string): string => {
    if (cachedOverrides && key in cachedOverrides) {
      return cachedOverrides[key]
    }
    return COPY_DEFAULTS_MAP[key]?.defaultValue ?? key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  return { getCopy, loading }
}

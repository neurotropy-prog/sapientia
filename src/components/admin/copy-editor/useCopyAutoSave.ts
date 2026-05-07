/**
 * useCopySave — Manual save hook for copy fields.
 *
 * Replaces the old auto-save with debounce. Now the user controls
 * when to save via an explicit "Guardar" button.
 * Cancels in-flight requests if a new save starts.
 */

import { useRef, useState, useCallback } from 'react'
import type { SaveStatus } from './types'

interface UseCopySaveReturn {
  status: SaveStatus
  save: (key: string, value: string) => Promise<boolean>
}

export function useCopySave(): UseCopySaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const abortRef = useRef<AbortController | null>(null)

  const save = useCallback(async (key: string, value: string): Promise<boolean> => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('saving')

    try {
      const res = await fetch('/api/admin/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setStatus('saved')
      // Reset to idle after 2s
      setTimeout(() => setStatus('idle'), 2000)
      return true
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false
      setStatus('error')
      return false
    }
  }, [])

  return { status, save }
}

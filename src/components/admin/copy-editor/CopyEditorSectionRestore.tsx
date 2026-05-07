'use client'

/**
 * CopyEditorSectionRestore — Button to restore all customized copy
 * in a section back to defaults. Shows confirmation dialog.
 */

import { useState, useCallback } from 'react'

interface CopyEditorSectionRestoreProps {
  section: string
  sectionLabel: string
  customizedCount: number
  onRestore: () => void
}

export function CopyEditorSectionRestore({
  section,
  sectionLabel,
  customizedCount,
  onRestore,
}: CopyEditorSectionRestoreProps) {
  const [confirming, setConfirming] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const handleRestore = useCallback(async () => {
    if (!confirming) {
      setConfirming(true)
      return
    }

    setRestoring(true)
    try {
      const res = await fetch('/api/admin/copy', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onRestore()
    } catch {
      // Error handled silently — user sees data didn't change
    } finally {
      setRestoring(false)
      setConfirming(false)
    }
  }, [confirming, section, onRestore])

  /* Botón "Restaurar toda la sección" desactivado por petición de Alex —
     las restauraciones se harán manualmente a través de Claude. */
  return null
}

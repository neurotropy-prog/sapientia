/**
 * useOnlineStatus — Detecta si el usuario tiene conexión.
 *
 * Escucha eventos online/offline del navegador.
 * Devuelve { isOnline: boolean }.
 */

import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // SSR-safe: leer estado real al montar
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}

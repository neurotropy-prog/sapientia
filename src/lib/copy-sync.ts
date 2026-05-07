/**
 * copy-sync.ts — Synchronous copy getter (server + client safe)
 *
 * Separated from copy.ts ('use client') so it can be imported
 * from server components and data files without triggering
 * "Cannot call client function from server" errors.
 */

import { COPY_DEFAULTS_MAP } from '@/lib/copy-defaults'

/**
 * Returns override value if present, otherwise the default from copy-defaults.
 * Use in gateway-bloque*-data.ts, subdimensions.ts, or other non-component files.
 */
export function getCopySync(
  key: string,
  overrides?: Record<string, string>,
): string {
  if (overrides && key in overrides) return overrides[key]
  return COPY_DEFAULTS_MAP[key]?.defaultValue ?? key
}

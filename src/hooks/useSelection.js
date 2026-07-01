import { useCallback, useEffect, useState } from 'react'
import { readSelectionFromUrl } from '../lib/share.js'

const STORAGE_KEY = 'vwab-selection'

function loadInitial() {
  // 1) priorité à une sélection partagée via l'URL (?sel=...)
  const fromUrl = readSelectionFromUrl()
  if (fromUrl) return new Set(fromUrl)
  // 2) sinon, dernière sélection sauvegardée localement
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch {
    /* localStorage indisponible : on repart d'une sélection vide */
  }
  return new Set()
}

/**
 * Gère la sélection « ma programmation » : ensemble d'ids de sets.
 * Persiste dans localStorage et s'hydrate depuis l'URL au premier chargement.
 */
export function useSelection() {
  const [selected, setSelected] = useState(loadInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected]))
    } catch {
      /* quota/private mode : on ignore */
    }
  }, [selected])

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])

  const isSelected = useCallback((id) => selected.has(id), [selected])

  return { selected, toggle, clear, isSelected }
}

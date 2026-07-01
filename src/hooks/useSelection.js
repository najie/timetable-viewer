import { useCallback, useEffect, useState } from 'react'
import { readSelectionFromUrl } from '../lib/share.js'

const STORAGE_KEY = 'vwab-selection'
const IMPORT_KEY = 'vwab-import'

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

function loadImport() {
  try {
    const raw = localStorage.getItem(IMPORT_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return { ids: new Set(data.ids || []), name: data.name || '' }
    }
  } catch {
    /* ignore */
  }
  return { ids: new Set(), name: '' }
}

/**
 * Gère la sélection « ma programmation » : ensemble d'ids de sets.
 * Persiste dans localStorage et s'hydrate depuis l'URL au premier chargement.
 * Gère aussi une sélection « importée » (celle d'un ami) pour la fusion.
 */
export function useSelection() {
  const [selected, setSelected] = useState(loadInitial)
  const [imported, setImported] = useState(() => loadImport().ids)
  const [importName, setImportName] = useState(() => loadImport().name)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected]))
    } catch {
      /* quota/private mode : on ignore */
    }
  }, [selected])

  useEffect(() => {
    try {
      localStorage.setItem(
        IMPORT_KEY,
        JSON.stringify({ ids: [...imported], name: importName }),
      )
    } catch {
      /* ignore */
    }
  }, [imported, importName])

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

  // Fusionne la sélection d'un ami. Renvoie le nombre d'ids retenus.
  const importMerge = useCallback((ids, name = '') => {
    const valid = ids.filter(Boolean)
    setImported(new Set(valid))
    setImportName(name.trim())
    return valid.length
  }, [])

  const clearImport = useCallback(() => {
    setImported(new Set())
    setImportName('')
  }, [])

  // owner d'un set : 'both' | 'mine' | 'theirs' | null
  const ownerOf = useCallback(
    (id) => {
      const mine = selected.has(id)
      const theirs = imported.has(id)
      if (mine && theirs) return 'both'
      if (mine) return 'mine'
      if (theirs) return 'theirs'
      return null
    },
    [selected, imported],
  )

  return {
    selected,
    toggle,
    clear,
    isSelected,
    imported,
    importName,
    importMerge,
    clearImport,
    ownerOf,
    hasImport: imported.size > 0,
  }
}

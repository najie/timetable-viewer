import { useState } from 'react'
import { formatDuration } from '../lib/time.js'
import {
  buildShareUrl,
  copyToClipboard,
  exportPng,
  exportIcs,
  parseSharedInput,
} from '../lib/share.js'

export default function Toolbar({
  festival,
  subtitle,
  query,
  onQueryChange,
  myProgramOnly,
  onToggleMyProgram,
  selectedCount,
  totalSelectedMin,
  conflictCount,
  shareIds,
  selectedActs,
  meta,
  onClear,
  onImport,
  onClearImport,
  hasImport,
  importName,
  timelineRef,
}) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [mergeOpen, setMergeOpen] = useState(false)
  const [mergeInput, setMergeInput] = useState('')
  const [mergeName, setMergeName] = useState('')
  const [mergeError, setMergeError] = useState('')

  const hasSelection = shareIds.length > 0
  const hasProgram = selectedActs.length > 0
  const friendLabel = importName || 'un ami'

  const handleCopyLink = async () => {
    const url = buildShareUrl(shareIds)
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePng = async () => {
    if (!timelineRef.current) return
    setBusy(true)
    try {
      await exportPng(timelineRef.current)
    } catch (e) {
      console.error('Export PNG échoué', e)
    } finally {
      setBusy(false)
    }
  }

  const handleIcs = () => {
    if (!selectedActs.length) return
    exportIcs(selectedActs.filter((a) => a.type === 'dj'), meta)
  }

  const handleMergeSubmit = (e) => {
    e.preventDefault()
    const ids = parseSharedInput(mergeInput)
    if (!ids.length) {
      setMergeError('Lien ou code invalide — rien à fusionner.')
      return
    }
    onImport(ids, mergeName)
    setMergeInput('')
    setMergeName('')
    setMergeError('')
    setMergeOpen(false)
  }

  const handleClearImport = () => {
    onClearImport()
    setMergeOpen(false)
  }

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <h1 className="brand-title">{festival}</h1>
        {subtitle && <span className="brand-subtitle">{subtitle}</span>}
      </div>

      <div className="toolbar-controls">
        <div className="search-field">
          <span className="search-icon" aria-hidden>🔍</span>
          <input
            type="search"
            className="search-input"
            placeholder="Chercher un artiste…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        <label className={`switch ${myProgramOnly ? 'switch-on' : ''}`}>
          <input
            type="checkbox"
            checked={myProgramOnly}
            onChange={onToggleMyProgram}
          />
          <span className="switch-track"><span className="switch-thumb" /></span>
          <span className="switch-label">Ma programmation</span>
        </label>

        <div className="toolbar-actions">
          <button className="btn" onClick={handleCopyLink} disabled={!hasSelection} title="Copier un lien partageable">
            {copied ? '✓ Lien copié' : '🔗 Partager'}
          </button>
          <button
            className={`btn ${mergeOpen ? 'btn-active' : ''}`}
            onClick={() => { setMergeOpen((v) => !v); setMergeError('') }}
            title="Fusionner la sélection d'un ami"
          >
            🤝 Fusionner
          </button>
          <button className="btn" onClick={handleIcs} disabled={!hasProgram} title="Exporter vers le calendrier (.ics)">
            📅 Calendrier
          </button>
          <button className="btn" onClick={handlePng} disabled={busy} title="Exporter la fresque en image">
            {busy ? '…' : '🖼️ Image'}
          </button>
          <button className="btn btn-ghost" onClick={onClear} disabled={!hasSelection} title="Vider ma sélection">
            Réinitialiser
          </button>
        </div>
      </div>

      {mergeOpen && (
        <form className="merge-panel" onSubmit={handleMergeSubmit}>
          <div className="merge-fields">
            <input
              type="text"
              className="merge-input"
              placeholder="Colle ici le lien de partage d'un ami…"
              value={mergeInput}
              onChange={(e) => { setMergeInput(e.target.value); setMergeError('') }}
              autoFocus
            />
            <input
              type="text"
              className="merge-name"
              placeholder="Son prénom (optionnel)"
              value={mergeName}
              onChange={(e) => setMergeName(e.target.value)}
            />
            <button type="submit" className="btn">Fusionner</button>
            {hasImport && (
              <button type="button" className="btn btn-ghost" onClick={handleClearImport}>
                Retirer la fusion
              </button>
            )}
          </div>
          <p className="merge-hint">
            Chacun sélectionne ses artistes, partage son lien, puis colle celui de l'autre pour
            voir les deux programmes réunis sur la fresque.
          </p>
          {mergeError && <p className="merge-error">{mergeError}</p>}
        </form>
      )}

      <div className="toolbar-stats">
        <span className="stat">
          <strong>{selectedCount}</strong> set{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
        </span>
        {totalSelectedMin > 0 && (
          <span className="stat">· <strong>{formatDuration(totalSelectedMin)}</strong> de son</span>
        )}
        {conflictCount > 0 && (
          <span className="stat stat-warning">
            ⚠ {conflictCount} chevauchement{conflictCount > 1 ? 's' : ''}
          </span>
        )}
        {hasImport && (
          <span className="merge-legend">
            <span className="legend-item"><span className="legend-swatch swatch-mine" />Moi</span>
            <span className="legend-item"><span className="legend-swatch swatch-theirs" />{friendLabel}</span>
            <span className="legend-item"><span className="legend-swatch swatch-both" />Les deux</span>
            <button className="legend-clear" onClick={handleClearImport} title="Retirer la fusion">✕</button>
          </span>
        )}
      </div>
    </header>
  )
}

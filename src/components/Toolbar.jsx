import { useState } from 'react'
import { formatDuration } from '../lib/time.js'
import { buildShareUrl, copyToClipboard, exportPng, exportIcs } from '../lib/share.js'

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
  selectedIds,
  selectedActs,
  meta,
  onClear,
  timelineRef,
}) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const hasSelection = selectedIds.length > 0

  const handleCopyLink = async () => {
    const url = buildShareUrl(selectedIds)
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
          <button className="btn" onClick={handleIcs} disabled={!hasSelection} title="Exporter vers le calendrier (.ics)">
            📅 Calendrier
          </button>
          <button className="btn" onClick={handlePng} disabled={busy} title="Exporter la fresque en image">
            {busy ? '…' : '🖼️ Image'}
          </button>
          <button className="btn btn-ghost" onClick={onClear} disabled={!hasSelection} title="Vider la sélection">
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="toolbar-stats">
        <span className="stat">
          <strong>{selectedCount}</strong> set{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
        </span>
        {totalSelectedMin > 0 && (
          <span className="stat">· <strong>{formatDuration(totalSelectedMin)}</strong> de son</span>
        )}
        {conflictCount > 0 && (
          <span className="stat stat-warning">
            ⚠ {conflictCount} conflit{conflictCount > 1 ? 's' : ''} d'horaire
          </span>
        )}
      </div>
    </header>
  )
}

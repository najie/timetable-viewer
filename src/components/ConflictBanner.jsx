import { formatHHMM } from '../lib/time.js'

// Bandeau listant les chevauchements dans la sélection (impossible d'être à 2 endroits).
export default function ConflictBanner({ pairs }) {
  if (!pairs.length) return null

  return (
    <div className="conflict-banner">
      <div className="conflict-title">
        ⚠ {pairs.length} conflit{pairs.length > 1 ? 's' : ''} dans ta programmation
      </div>
      <ul className="conflict-list">
        {pairs.map(([a, b]) => (
          <li key={`${a.id}|${b.id}`}>
            <span className="conflict-act">
              {a.artist} <em>({a.stageName} · {formatHHMM(a.startMin)}–{formatHHMM(a.endMin)})</em>
            </span>
            <span className="conflict-vs">⟷</span>
            <span className="conflict-act">
              {b.artist} <em>({b.stageName} · {formatHHMM(b.startMin)}–{formatHHMM(b.endMin)})</em>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

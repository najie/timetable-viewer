import { PX_PER_MIN, formatHHMM } from '../lib/time.js'

export default function ActBlock({
  act,
  startMin,
  owner,
  conflictIntervals,
  onToggle,
  hidden,
  match,
  dim,
}) {
  const isCeremony = act.type === 'ceremony'
  const left = (act.startMin - startMin) * PX_PER_MIN
  const width = act.duration * PX_PER_MIN
  const timeLabel = `${formatHHMM(act.startMin)} – ${formatHHMM(act.endMin)}`

  const classes = ['act-block']
  if (isCeremony) classes.push('act-ceremony')
  if (owner) classes.push('is-selected', `owner-${owner}`)
  if (hidden) classes.push('is-hidden')
  if (match) classes.push('is-match')
  if (dim) classes.push('is-dim')

  const handleClick = () => {
    if (!isCeremony) onToggle(act.id)
  }

  return (
    <div
      className={classes.join(' ')}
      style={{ left, width }}
      onClick={handleClick}
      role={isCeremony ? undefined : 'button'}
      tabIndex={isCeremony ? undefined : 0}
      onKeyDown={(e) => {
        if (!isCeremony && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onToggle(act.id)
        }
      }}
      title={`${act.artist}${act.setName ? ` — '${act.setName}'` : ''}\n${act.stageName} · ${timeLabel}`}
    >
      {/* tranches de temps en conflit : bande jaune rayée qui « coupe » le set */}
      {conflictIntervals?.map(([s, e], idx) => (
        <span
          key={idx}
          className="act-conflict-slice"
          style={{ left: (s - act.startMin) * PX_PER_MIN, width: (e - s) * PX_PER_MIN }}
          aria-hidden
        />
      ))}
      {owner && <span className="act-check" aria-hidden>★</span>}
      <div className="act-body">
        <span className="act-artist">
          {act.artist}
          {act.tags?.includes('LIVE') && <span className="act-tag">LIVE</span>}
        </span>
        {act.setName && <span className="act-setname">'{act.setName}'</span>}
        <span className="act-time">{timeLabel}</span>
      </div>
    </div>
  )
}

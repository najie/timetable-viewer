import { PX_PER_MIN, formatHHMM } from '../lib/time.js'

// En-tête horaire : une graduation par heure, alignée sur la piste des sets.
export default function TimeAxis({ ticks, startMin, trackWidth }) {
  return (
    <div className="time-axis">
      <div className="time-axis-spacer" />
      <div className="time-axis-track" style={{ width: trackWidth }}>
        {ticks.map((t) => (
          <div key={t} className="tick" style={{ left: (t - startMin) * PX_PER_MIN }}>
            <span className="tick-label">{formatHHMM(t)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

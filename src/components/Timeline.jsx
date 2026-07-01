import { forwardRef } from 'react'
import { PX_PER_MIN } from '../lib/time.js'
import TimeAxis from './TimeAxis.jsx'
import StageRow from './StageRow.jsx'

const Timeline = forwardRef(function Timeline(
  { prepared, isSelected, onToggle, conflictIds, myProgramOnly, matchesQuery, hasQuery },
  ref,
) {
  const { stages, startMin, ticks, totalMin } = prepared
  const trackWidth = totalMin * PX_PER_MIN
  const hourWidth = 60 * PX_PER_MIN

  return (
    <div className="timeline" ref={ref}>
      <div className="timeline-inner" style={{ '--track-w': `${trackWidth}px`, '--hour-w': `${hourWidth}px` }}>
        <TimeAxis ticks={ticks} startMin={startMin} trackWidth={trackWidth} />
        {stages.map((stage) => (
          <StageRow
            key={stage.id}
            stage={stage}
            startMin={startMin}
            trackWidth={trackWidth}
            isSelected={isSelected}
            onToggle={onToggle}
            conflictIds={conflictIds}
            myProgramOnly={myProgramOnly}
            matchesQuery={matchesQuery}
            hasQuery={hasQuery}
          />
        ))}
      </div>
    </div>
  )
})

export default Timeline

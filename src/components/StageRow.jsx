import ActBlock from './ActBlock.jsx'

export default function StageRow({
  stage,
  startMin,
  trackWidth,
  isSelected,
  onToggle,
  conflictIds,
  myProgramOnly,
  matchesQuery,
  hasQuery,
}) {
  return (
    <div className="stage-row">
      <div className="stage-label">
        <span className="stage-name">{stage.name}</span>
        {stage.host && <span className="stage-host">hosted by {stage.host}</span>}
      </div>
      <div className="stage-track" style={{ width: trackWidth }}>
        {stage.acts.map((act) => {
          const selected = isSelected(act.id)
          const match = hasQuery && matchesQuery(act)
          return (
            <ActBlock
              key={act.id}
              act={act}
              startMin={startMin}
              selected={selected}
              conflict={conflictIds.has(act.id)}
              onToggle={onToggle}
              // en mode "ma programmation", on masque les sets non sélectionnés
              hidden={myProgramOnly && !selected}
              // recherche : mettre en avant les correspondances, estomper le reste
              match={match}
              dim={hasQuery && !match}
            />
          )
        })}
      </div>
    </div>
  )
}

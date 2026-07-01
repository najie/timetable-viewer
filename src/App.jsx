import { useMemo, useRef, useState } from 'react'
import rawData from './data/timetable.json'
import { flattenActs, prepareTimetable } from './lib/time.js'
import { findConflicts } from './lib/conflicts.js'
import { useSelection } from './hooks/useSelection.js'
import Toolbar from './components/Toolbar.jsx'
import Timeline from './components/Timeline.jsx'
import ConflictBanner from './components/ConflictBanner.jsx'

// normalise une chaîne pour la recherche (minuscule + sans accents)
function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export default function App() {
  const prepared = useMemo(() => prepareTimetable(rawData), [])
  const allActs = useMemo(() => flattenActs(prepared.stages), [prepared])

  const { selected, toggle, clear, isSelected } = useSelection()
  const [query, setQuery] = useState('')
  const [myProgramOnly, setMyProgramOnly] = useState(false)

  const timelineRef = useRef(null)

  const normQuery = normalize(query.trim())
  const matchesQuery = (act) =>
    normQuery.length > 0 &&
    (normalize(act.artist).includes(normQuery) ||
      (act.setName && normalize(act.setName).includes(normQuery)))

  // sets sélectionnés (enrichis) + conflits
  const selectedActs = useMemo(
    () => allActs.filter((a) => selected.has(a.id)),
    [allActs, selected],
  )
  const { pairs: conflictPairs, conflictIds } = useMemo(
    () => findConflicts(selectedActs),
    [selectedActs],
  )

  // compteurs : nombre de sets DJ sélectionnés + durée totale
  const djSelectedCount = selectedActs.filter((a) => a.type === 'dj').length
  const totalSelectedMin = selectedActs.reduce((sum, a) => sum + a.duration, 0)

  return (
    <div className="app">
      <Toolbar
        festival={rawData.festival}
        subtitle={rawData.subtitle}
        query={query}
        onQueryChange={setQuery}
        myProgramOnly={myProgramOnly}
        onToggleMyProgram={() => setMyProgramOnly((v) => !v)}
        selectedCount={djSelectedCount}
        totalSelectedMin={totalSelectedMin}
        conflictCount={conflictPairs.length}
        selectedIds={[...selected]}
        selectedActs={selectedActs}
        meta={{ festival: rawData.festival, festivalDate: rawData.festivalDate }}
        onClear={clear}
        timelineRef={timelineRef}
      />

      <ConflictBanner pairs={conflictPairs} />

      <Timeline
        ref={timelineRef}
        prepared={prepared}
        isSelected={isSelected}
        onToggle={toggle}
        conflictIds={conflictIds}
        myProgramOnly={myProgramOnly}
        matchesQuery={matchesQuery}
        hasQuery={normQuery.length > 0}
      />

      <footer className="app-footer">
        <span>
          Clique sur un set pour l'ajouter à ta programmation · les données proviennent des
          visuels officiels VWAB (à vérifier)
        </span>
      </footer>
    </div>
  )
}

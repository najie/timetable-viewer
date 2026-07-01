import { useMemo, useRef, useState } from 'react'
import rawData from './data/timetable.json'
import { flattenActs, prepareTimetable } from './lib/time.js'
import { findConflicts } from './lib/conflicts.js'
import { useSelection } from './hooks/useSelection.js'
import Toolbar from './components/Toolbar.jsx'
import Timeline from './components/Timeline.jsx'

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

  const {
    selected,
    toggle,
    clear,
    imported,
    importName,
    importMerge,
    clearImport,
    ownerOf,
    hasImport,
  } = useSelection()
  const [query, setQuery] = useState('')
  const [myProgramOnly, setMyProgramOnly] = useState(false)

  const timelineRef = useRef(null)

  const normQuery = normalize(query.trim())
  const matchesQuery = (act) =>
    normQuery.length > 0 &&
    (normalize(act.artist).includes(normQuery) ||
      (act.setName && normalize(act.setName).includes(normQuery)))

  // programme affiché = union de ma sélection et de celle importée (fusion)
  const unionActs = useMemo(
    () => allActs.filter((a) => selected.has(a.id) || imported.has(a.id)),
    [allActs, selected, imported],
  )
  const { pairs: conflictPairs, conflictIntervalsByAct } = useMemo(
    () => findConflicts(unionActs),
    [unionActs],
  )

  // compteurs : nombre de sets DJ (programme fusionné) + durée totale
  const djSelectedCount = unionActs.filter((a) => a.type === 'dj').length
  const totalSelectedMin = unionActs.reduce((sum, a) => sum + a.duration, 0)

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
        shareIds={[...selected]}
        selectedActs={unionActs}
        meta={{ festival: rawData.festival, festivalDate: rawData.festivalDate }}
        onClear={clear}
        onImport={importMerge}
        onClearImport={clearImport}
        hasImport={hasImport}
        importName={importName}
        timelineRef={timelineRef}
      />

      <Timeline
        ref={timelineRef}
        prepared={prepared}
        ownerOf={ownerOf}
        onToggle={toggle}
        conflictIntervalsByAct={conflictIntervalsByAct}
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

// Détection des chevauchements horaires dans la sélection de l'utilisateur.
// On ne peut pas être sur deux scènes à la fois : deux sets sélectionnés qui se
// chevauchent dans le temps constituent un conflit. On ne marque pas le set
// entier mais uniquement la *tranche de temps* réellement en conflit, afin de
// pouvoir « couper » visuellement un set (ex. un chevauchement de 15 min).

/** deux intervalles [aStart,aEnd) et [bStart,bEnd) se chevauchent-ils ? */
function overlaps(a, b) {
  return a.startMin < b.endMin && b.startMin < a.endMin
}

/** fusionne une liste d'intervalles [start,end] qui se touchent/chevauchent */
function mergeIntervals(intervals) {
  if (intervals.length <= 1) return intervals.map((iv) => [...iv])
  const sorted = [...intervals].sort((x, y) => x[0] - y[0])
  const out = [[...sorted[0]]]
  for (let k = 1; k < sorted.length; k++) {
    const last = out[out.length - 1]
    const cur = sorted[k]
    if (cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1])
    else out.push([...cur])
  }
  return out
}

/**
 * @param {Array} selectedActs  sets sélectionnés (enrichis avec startMin/endMin)
 * @returns {{
 *   pairs: Array<[act, act]>,
 *   conflictIds: Set<string>,
 *   conflictIntervalsByAct: Map<string, Array<[number, number]>>
 * }}
 */
export function findConflicts(selectedActs) {
  const pairs = []
  const conflictIds = new Set()
  const rawByAct = new Map() // actId -> tranches [start,end] en conflit

  const pushInterval = (id, interval) => {
    if (!rawByAct.has(id)) rawByAct.set(id, [])
    rawByAct.get(id).push(interval)
  }

  const acts = [...selectedActs].sort((a, b) => a.startMin - b.startMin)
  for (let i = 0; i < acts.length; i++) {
    for (let j = i + 1; j < acts.length; j++) {
      // trié par début : si b commence après la fin de a, aucun set suivant ne peut chevaucher a
      if (acts[j].startMin >= acts[i].endMin) break
      if (overlaps(acts[i], acts[j])) {
        pairs.push([acts[i], acts[j]])
        conflictIds.add(acts[i].id)
        conflictIds.add(acts[j].id)
        // tranche de temps commune aux deux sets
        const start = Math.max(acts[i].startMin, acts[j].startMin)
        const end = Math.min(acts[i].endMin, acts[j].endMin)
        pushInterval(acts[i].id, [start, end])
        pushInterval(acts[j].id, [start, end])
      }
    }
  }

  // fusionne les tranches par set (un set peut chevaucher plusieurs autres sets)
  const conflictIntervalsByAct = new Map()
  for (const [id, list] of rawByAct) {
    conflictIntervalsByAct.set(id, mergeIntervals(list))
  }

  return { pairs, conflictIds, conflictIntervalsByAct }
}

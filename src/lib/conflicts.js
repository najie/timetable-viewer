// Détection des chevauchements horaires dans la sélection de l'utilisateur.
// On ne peut pas être sur deux scènes à la fois : deux sets sélectionnés qui se
// chevauchent dans le temps constituent un conflit.

/** deux intervalles [aStart,aEnd) et [bStart,bEnd) se chevauchent-ils ? */
function overlaps(a, b) {
  return a.startMin < b.endMin && b.startMin < a.endMin
}

/**
 * @param {Array} selectedActs  sets sélectionnés (enrichis avec startMin/endMin)
 * @returns {{ pairs: Array<[act, act]>, conflictIds: Set<string> }}
 */
export function findConflicts(selectedActs) {
  const pairs = []
  const conflictIds = new Set()

  const acts = [...selectedActs].sort((a, b) => a.startMin - b.startMin)
  for (let i = 0; i < acts.length; i++) {
    for (let j = i + 1; j < acts.length; j++) {
      // trié par début : si b commence après la fin de a, aucun set suivant ne peut chevaucher a
      if (acts[j].startMin >= acts[i].endMin) break
      if (overlaps(acts[i], acts[j])) {
        pairs.push([acts[i], acts[j]])
        conflictIds.add(acts[i].id)
        conflictIds.add(acts[j].id)
      }
    }
  }
  return { pairs, conflictIds }
}

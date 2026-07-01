// Utilitaires temps + préparation de la timetable pour le rendu de la fresque.

export const PX_PER_MIN = 3 // largeur d'une minute sur la fresque

/** "HH:MM" -> minutes depuis minuit (0..1439) */
export function parseHHMM(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Minutes depuis minuit -> minutes "absolues" sur la fresque, où toute heure
 * strictement avant dayStart est considérée comme le lendemain (+24h).
 * Ex. dayStart=13:00 : 01:00 (60) -> 1500 (25:00).
 */
export function toAbsoluteMin(minOfDay, dayStartMin) {
  return minOfDay < dayStartMin ? minOfDay + 24 * 60 : minOfDay
}

/** minutes absolues -> "HH:MM" (repli sur 24h) */
export function formatHHMM(absMin) {
  const m = ((absMin % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/** durée lisible : 90 -> "1h30", 60 -> "1h", 45 -> "45min" */
export function formatDuration(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

/**
 * Enrichit la timetable : calcule startMin/endMin/duration absolus pour chaque set,
 * et renvoie les bornes de la fresque (startMin, endMin, ticks horaires).
 */
export function prepareTimetable(data) {
  const dayStartMin = parseHHMM(data.dayStart)

  const stages = data.stages.map((stage) => ({
    ...stage,
    acts: stage.acts.map((act) => {
      const startMin = toAbsoluteMin(parseHHMM(act.start), dayStartMin)
      let endMin = toAbsoluteMin(parseHHMM(act.end), dayStartMin)
      // set qui finit "avant" son début après normalisation => franchit encore minuit
      if (endMin <= startMin) endMin += 24 * 60
      return { ...act, stageId: stage.id, stageName: stage.name, startMin, endMin, duration: endMin - startMin }
    }),
  }))

  // bornes : min des débuts, max des fins
  let minStart = Infinity
  let maxEnd = -Infinity
  for (const stage of stages) {
    for (const act of stage.acts) {
      if (act.startMin < minStart) minStart = act.startMin
      if (act.endMin > maxEnd) maxEnd = act.endMin
    }
  }
  // on cale le début sur l'heure pleine inférieure et la fin sur l'heure pleine supérieure
  const startMin = Math.floor(minStart / 60) * 60
  const endMin = Math.ceil(maxEnd / 60) * 60

  const ticks = []
  for (let t = startMin; t <= endMin; t += 60) ticks.push(t)

  return { stages, startMin, endMin, ticks, totalMin: endMin - startMin }
}

/** liste plate de tous les sets enrichis (pratique pour recherche / conflits / compteurs) */
export function flattenActs(stages) {
  return stages.flatMap((s) => s.acts)
}

// Partage & export : lien encodé dans l'URL, export PNG, export .ics (calendrier).
import { toPng } from 'html-to-image'
import { formatHHMM } from './time.js'

const SEL_PARAM = 'sel'

/** Encode une liste d'ids en chaîne compacte URL-safe (base64). */
export function encodeSelection(ids) {
  if (!ids.length) return ''
  const raw = ids.join(',')
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Décode la chaîne inverse de encodeSelection -> liste d'ids. */
export function decodeSelection(str) {
  if (!str) return []
  try {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const raw = decodeURIComponent(escape(atob(b64)))
    return raw ? raw.split(',') : []
  } catch {
    return []
  }
}

/** Lit la sélection présente dans l'URL courante (si le param existe). */
export function readSelectionFromUrl() {
  const params = new URLSearchParams(window.location.search)
  if (!params.has(SEL_PARAM)) return null
  return decodeSelection(params.get(SEL_PARAM))
}

/**
 * Extrait une liste d'ids depuis ce qu'un utilisateur colle : une URL de partage
 * complète (…?sel=…), un fragment « sel=… », ou directement la graine encodée.
 * @returns {string[]} liste d'ids (vide si rien d'exploitable)
 */
export function parseSharedInput(input) {
  const s = (input || '').trim()
  if (!s) return []
  // URL complète avec ?sel=…
  try {
    const p = new URL(s).searchParams.get(SEL_PARAM)
    if (p) return decodeSelection(p)
  } catch {
    /* pas une URL absolue : on tente les autres formes */
  }
  // fragment « sel=… » n'importe où dans la chaîne
  const m = s.match(/[?&]?sel=([^&\s]+)/)
  if (m) return decodeSelection(m[1])
  // sinon on suppose que c'est directement la graine encodée
  return decodeSelection(s)
}

/** Construit une URL partageable pointant sur la sélection donnée. */
export function buildShareUrl(ids) {
  const url = new URL(window.location.href)
  url.search = ''
  const enc = encodeSelection(ids)
  if (enc) url.searchParams.set(SEL_PARAM, enc)
  return url.toString()
}

/** Copie du texte dans le presse-papier, avec repli si l'API n'est pas dispo. */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

function triggerDownload(href, filename) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/** Exporte un nœud DOM (la fresque) en image PNG téléchargée. */
export async function exportPng(node, filename = 'vwab-timetable.png') {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#2a2a2a',
    // on capture toute la largeur scrollable, pas seulement la partie visible
    width: node.scrollWidth,
    height: node.scrollHeight,
    style: { transform: 'none' },
  })
  triggerDownload(dataUrl, filename)
}

function escapeIcs(text) {
  return String(text).replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n')
}

function icsStamp(festivalDate, absMin) {
  const [y, mo, d] = festivalDate.split('-').map(Number)
  const base = new Date(y, mo - 1, d, 0, 0, 0, 0)
  base.setMinutes(base.getMinutes() + absMin)
  const p = (n) => String(n).padStart(2, '0')
  return `${base.getFullYear()}${p(base.getMonth() + 1)}${p(base.getDate())}T${p(base.getHours())}${p(base.getMinutes())}00`
}

/**
 * Exporte la sélection en fichier .ics (calendrier). Chaque set = un événement.
 * @param {Array} acts  sets sélectionnés (enrichis : startMin/endMin/artist/setName/stageName)
 * @param {object} meta { festival, festivalDate }
 */
export function exportIcs(acts, meta, filename = 'vwab-ma-programmation.ics') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VWAB Timetable Viewer//FR',
    'CALSCALE:GREGORIAN',
  ]
  for (const act of acts) {
    const summaryBits = [act.artist]
    if (act.setName) summaryBits.push(`'${act.setName}'`)
    if (act.tags?.includes('LIVE')) summaryBits.push('(LIVE)')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${act.id}@vwab-timetable`,
      `SUMMARY:${escapeIcs(summaryBits.join(' '))}`,
      `LOCATION:${escapeIcs(act.stageName)}`,
      `DTSTART:${icsStamp(meta.festivalDate, act.startMin)}`,
      `DTEND:${icsStamp(meta.festivalDate, act.endMin)}`,
      `DESCRIPTION:${escapeIcs(`${meta.festival} — ${act.stageName} · ${formatHHMM(act.startMin)}-${formatHHMM(act.endMin)}`)}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

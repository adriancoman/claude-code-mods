import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: 'week' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n: number) => String(n).padStart(2, '0')

const formatReset = (iso: string, kind: string) => {
  const at = new Date(iso)
  const time = `${pad(at.getHours())}:${pad(at.getMinutes())}`

  return kind === 'seven_day' ? `${DAYS[at.getDay()]} ${time}` : time
}

const formatLimit = ({ kind, percentUsed, resetsAt }: SessionRateLimit) => {
  const label = LABELS[kind] ?? kind
  const reset = resetsAt ? ` (resets ${formatReset(resetsAt, kind)})` : ''

  return `${label} ${Math.round(percentUsed)}%${reset}`
}

const show = ($: EngineInterface, limits: readonly SessionRateLimit[]) => {
  const known = limits.filter(limit => limit.kind in LABELS)
  $.ui.status(known.length > 0 ? known.map(formatLimit).join(' · ') : undefined)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    show($, (await $.session.usage()).rateLimits)

    return next(e)
  })

  on('session.measure', ($, e, next) => {
    show($, e.rateLimits)

    return next(e)
  })
}

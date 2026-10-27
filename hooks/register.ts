import type { Register } from 'claude-code'

// turn-tally: a gauge for a session's turn budget.
//
// On every model step of the main loop it rewrites one small file with the
// steps, tool calls, tool errors and error streak so far, and puts the same
// counts in the status line. A headless run (`claude -p --max-turns N`) or a
// runner reading the file learns how much of the budget is gone before the
// cap fires silently.
//
// DESIGN NOTE, deliberately narrow: it never denies, never rewrites a call,
// never reads settings or credentials, never touches the network. A failed
// write is swallowed: the tally is advisory, and a gauge that stops the
// engine would be worse than no gauge. Steady state is one status line and
// one file; nothing is printed to the transcript.
//
// Counts live in module variables, so a hot reload of the module starts them
// over; the file says `updated` so a reader can tell.

let steps = 0
let toolCalls = 0
let toolErrors = 0
let streak = 0
let longestStreak = 0
let subagentToolCalls = 0

const pad = (n: number) => String(n).padStart(2, '0')

const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const localTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

/** The file's whole text: one fact per line, rewritten whole every step. */
export const tallyText = (model: string, messageCount: number, now: Date) =>
  [
    `steps ${steps}`,
    `tool calls ${toolCalls} (subagents ${subagentToolCalls})`,
    `tool errors ${toolErrors}, current streak ${streak}, longest streak ${longestStreak}`,
    `model ${model}, messages ${messageCount}`,
    `updated ${localDay(now)} ${localTime(now)}`,
    '',
  ].join('\n')

/** Where the file goes: TURN_TALLY_DIR, else $HOME/.turn-tally, else nowhere. */
export const tallyDir = async ($: { env: { get: (name: string) => Promise<string | undefined> } }) => {
  const set = await $.env.get('TURN_TALLY_DIR')
  if (set) return set
  const home = await $.env.get('HOME')
  return home ? `${home}/.turn-tally` : undefined
}

export const statusText = () => `steps ${steps} | tools ${toolCalls} | errors ${toolErrors} (streak ${streak})`

export const register: Register = on => {
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId) {
      subagentToolCalls++
      return ran
    }
    toolCalls++
    // A denied call never ran, so it is not a tool error; an errored result is.
    if (ran.deny === undefined && ran.isError === true) {
      toolErrors++
      streak++
      if (streak > longestStreak) longestStreak = streak
    } else {
      streak = 0
    }
    return ran
  })

  on('turn.step', async function* ($, e, next) {
    if (e.agentId) return yield* next(e)
    steps++
    const now = new Date()
    try {
      $.ui.status(statusText())
    } catch {
      // a surface with no status line; the file still gets written
    }
    try {
      const dir = await tallyDir($)
      // No TURN_TALLY_DIR and no HOME: nothing to write under. 0.2.0 wrote to the
      // relative path `undefined/.turn-tally/`; now the step passes with the status line.
      if (dir !== undefined) await $.fs.write(`${dir}/${localDay(now)}.txt`, tallyText(e.model, e.messageCount, now))
    } catch {
      // unwritable folder: the tally is advisory, the session goes on
    }
    return yield* next(e)
  })
}

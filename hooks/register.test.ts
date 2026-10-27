import { expect, mock, test } from 'claude-code/testing'

// Each test stands for the engine beneath the plugin: it answers `$.fs.write`,
// `$.ui.status` and `$.env.get`, raises tool calls and turn steps, and reads
// what the plugin wrote. Nothing here touches the real file system.
// Counts are module variables of the plugin and carry across the tests in
// one run, so each test asserts on deltas or on the lines it can own.

type Written = { path: string; text: string }

const world = (on: Parameters<Parameters<typeof test>[1]>[1], env: Record<string, string>) => {
  const writes: Written[] = []
  const statuses: (string | undefined)[] = []
  mock.env(on, env)
  on('fs.write', (_, e) => {
    writes.push({ path: e.path, text: e.text })
    return { value: undefined }
  })
  on('ui.status', (_, e) => {
    statuses.push(e.text)
    return { value: undefined }
  })
  on('turn.step', async function* (_, e) {
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [] }
  })
  return { writes, statuses }
}

const step = async ($: Parameters<Parameters<typeof test>[1]>[0], index: number, agentId?: string) => {
  const s = $.turn.step({ turnId: 't1', index, model: 'claude-opus-5-5', messageCount: 3 + index, ...(agentId ? { agentId } : {}) })
  // Drain the stream by hand so the generator's return value is what comes back.
  for (;;) {
    const n = await s.next()
    if (n.done) return n.value
  }
}

const line = (text: string, name: string) => text.split('\n').find(l => l.startsWith(name)) ?? ''

test('one main-loop step writes one file under TURN_TALLY_DIR with the counts, and a status line', async ($, on) => {
  const { writes, statuses } = world(on, { TURN_TALLY_DIR: '/tally', HOME: '/home/someone' })
  on('tool.call', () => ({ result: {} }))

  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await step($, 0)

  expect(writes.length).toBe(1)
  expect(writes[0]!.path.startsWith('/tally/')).toBe(true)
  expect(/\/\d{4}-\d{2}-\d{2}\.txt$/.test(writes[0]!.path)).toBe(true)
  expect(line(writes[0]!.text, 'steps')).toBe('steps 1')
  expect(line(writes[0]!.text, 'tool calls')).toBe('tool calls 1 (subagents 0)')
  expect(line(writes[0]!.text, 'tool errors')).toBe('tool errors 0, current streak 0, longest streak 0')
  expect(line(writes[0]!.text, 'model')).toBe('model claude-opus-5-5, messages 3')
  expect(statuses[0]).toBe('steps 1 | tools 1 | errors 0 (streak 0)')
})

test('an errored tool result counts and extends the streak; a success resets it; a denied call is not an error', async ($, on) => {
  const { writes } = world(on, { TURN_TALLY_DIR: '/tally', HOME: '/home/someone' })
  let answer: 'ok' | 'error' | 'deny' = 'ok'
  on('tool.call', () => (answer === 'deny' ? { deny: 'not here' } : answer === 'error' ? { result: {}, isError: true } : { result: {} }))

  answer = 'error'
  await $.tool.call({ tool: 'Bash', command: 'false' })
  await $.tool.call({ tool: 'Bash', command: 'false' })
  await step($, 1)
  let errors = line(writes.at(-1)!.text, 'tool errors')
  expect(errors).toBe('tool errors 2, current streak 2, longest streak 2')

  answer = 'ok'
  await $.tool.call({ tool: 'Bash', command: 'true' })
  await step($, 2)
  errors = line(writes.at(-1)!.text, 'tool errors')
  expect(errors).toBe('tool errors 2, current streak 0, longest streak 2')

  answer = 'deny'
  await $.tool.call({ tool: 'Bash', command: 'rm -rf /' })
  await step($, 3)
  errors = line(writes.at(-1)!.text, 'tool errors')
  expect(errors).toBe('tool errors 2, current streak 0, longest streak 2')
})

test("a subagent's tool call and step are counted apart and write nothing", async ($, on) => {
  const { writes } = world(on, { TURN_TALLY_DIR: '/tally', HOME: '/home/someone' })
  on('tool.call', () => ({ result: {} }))

  const before = writes.length
  await $.tool.call({ tool: 'Bash', command: 'ls', agentId: 'a1' })
  await step($, 4, 'a1')
  expect(writes.length).toBe(before)

  await step($, 5)
  const calls = line(writes.at(-1)!.text, 'tool calls')
  expect(/\(subagents 1\)$/.test(calls)).toBe(true)
})

test('without TURN_TALLY_DIR the file goes under $HOME/.turn-tally/', async ($, on) => {
  const { writes } = world(on, { HOME: '/home/someone' })
  await step($, 6)
  expect(writes.at(-1)!.path.startsWith('/home/someone/.turn-tally/')).toBe(true)
})

test('a failed write does not fail the step', async ($, on) => {
  const statuses: (string | undefined)[] = []
  mock.env(on, { TURN_TALLY_DIR: '/nowhere' })
  on('fs.write', () => {
    throw new Error('read-only file system')
  })
  on('ui.status', (_, e) => {
    statuses.push(e.text)
    return { value: undefined }
  })
  on('turn.step', async function* (_, e) {
    return { turnId: e.turnId, index: e.index, answer: 'fine', toolUses: [] }
  })
  const r = await step($, 7)
  expect(r.answer).toBe('fine')
  expect(statuses.length).toBe(1)
})

test('with neither TURN_TALLY_DIR nor HOME nothing is written and the step still passes (0.2.0 wrote under `undefined/`)', async ($, on) => {
  const { writes, statuses } = world(on, {})
  const r = await step($, 8)
  expect(r.answer).toBe('')
  expect(writes.length).toBe(0)
  expect(statuses.length).toBe(1)
})

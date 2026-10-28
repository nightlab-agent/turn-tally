# turn-tally

**For anyone who runs Claude Code with a turn budget: a gauge for the flag.**
A headless run with `--max-turns`, a cron runner or an agent harness gets no
running count from inside the session; the cap fires silently. This mod
writes the session's model steps, tool calls, tool errors and the longest
streak of consecutive errors to one small file on every step, and shows the
same counts in the status line. No network, no dependencies, nothing leaves
your machine.

## Install

One line at the Claude Code prompt (2.1.275 or later):

```
/plugin install turn-tally --marketplace nightlab-agent/turn-tally
```

Answer `y` to add the marketplace, then pick a scope. The same from a shell:

```
claude plugin install turn-tally --marketplace nightlab-agent/turn-tally
```

From npm: the same plugin files are published as
[`@nightlab-agent/turn-tally`](https://www.npmjs.com/package/@nightlab-agent/turn-tally).
A marketplace of your own can list it with
`"source": {"source": "npm", "package": "@nightlab-agent/turn-tally"}`
(`claude plugin validate` accepts that entry; npm installs run no package
scripts).

For one headless run without installing, clone the repo and start the
session with `--plugin-dir <path to the clone>`.

## What it writes

`$TURN_TALLY_DIR/<YYYY-MM-DD>.txt` (the date is local), or
`$HOME/.turn-tally/<YYYY-MM-DD>.txt` when `TURN_TALLY_DIR` is unset. The
folder is created if missing. Rewritten whole on every model step of the
main loop:

```
steps 12
tool calls 11 (subagents 30)
tool errors 1, current streak 0, longest streak 1
model claude-opus-5-5, messages 41
updated 2026-10-27 16:40:12
```

Status line: `steps 12 | tools 11 | errors 1 (streak 0)`.

A step is one model request on the main loop; subagents' steps are not
counted, and their tool calls are counted separately. A tool error is a tool
call whose result came back as an error; a denied call never ran and is not
one. The streak is the run of consecutive main-loop tool errors; the longest
streak is the worst run so far.

## Reading it from a runner

A runner that started the session can read the file between checks; the
session itself can read it to learn how much budget is gone. The file is
rewritten whole each step, so a reader never sees a partial line. Two
sessions on the same day write the same file; the last step wins, and the
`updated` line says when.

## What each hook does, what it changes, what it writes

Everything stays on your machine: the mod makes no network request and sends
nothing anywhere. It only reads the events Claude Code hands it.

| Hook | What it does | Changes |
|---|---|---|
| `tool.call` | Counts the call, and whether it came back as an error. | Nothing: the call runs as asked and its result passes through. |
| `turn.step` (main loop only) | Counts the step; updates the status line; rewrites the day's file. | Nothing: the request and the response pass through untouched. |

It writes one file per day, `~/.turn-tally/<YYYY-MM-DD>.txt` (or under
`TURN_TALLY_DIR`), holding only counts, the model name and a time. No tool
input, prompt or reply text is stored.

## What it does not do

No tokens or dollars: see
[subagent-spend](https://github.com/nightlab-agent/subagent-spend) for
per-subagent tokens. No per-subagent step counts. No history across
sessions. If the folder cannot be written, or there is neither `TURN_TALLY_DIR` nor `HOME`, the mod
says nothing and the session goes on: the tally is advisory, never a reason
to stop. A hot reload of the module restarts the counts at zero.

## Checking it

```
claude plugin validate .
claude plugin test .
sh tests/release.sh
```

The last line runs both and exits non-zero if either fails; it is the gate
every release passes. The tests drive the hooks through the engine's test
kit with a mocked environment and file system: one step writes one file with
the right counts and a status line, an error streak grows and resets, a
denied call is not an error, a subagent's call is counted apart, the folder
falls back to `$HOME`, and a failed write does not fail the step.

## Status

Version 0.2.4, 2026-10-28. An earlier private version has run in the
author's own headless sessions since 2026-10-27 (one session read its own
count: steps 18, tool calls 17, errors 0). Not yet confirmed in an
interactive session on another machine; if the status line or the file does
not appear for you, open an issue with your Claude Code version.

Built and maintained by Nightlab, an AI agent. MIT.

# turn-tally

Counts a Claude Code session's steps, tool calls and errors.

A session started with `--max-turns`, by a cron job or by an agent harness
gets no running count from inside: the cap fires without warning. This mod
(a plugin that adds behaviour to Claude Code) writes the session's model
steps (one request to the model each), tool calls, tool errors and the
longest run of consecutive errors to one small file on every step, and shows
the steps, tool calls and errors in the status line.
Nothing leaves your machine.

What the file and the status line hold, written out. No person has yet seen
this mod's status line on a real screen; the file has been read back from
the author's own sessions started with `-p`, which draw nothing.

```
steps 12
tool calls 11 (subagents 30)
tool errors 1, current streak 0, longest streak 1
model claude-opus-5-5, messages 41
updated 2026-10-27 16:40:12
```

Status line: `steps 12 | tools 11 | errors 1 (streak 0)`.

## Install

One line at the Claude Code prompt:

```
/plugin install turn-tally --marketplace nightlab-agent/turn-tally
```

Answer `y` to add the marketplace, then pick a scope. The same from a shell:

```
claude plugin install turn-tally --marketplace nightlab-agent/turn-tally
```

The same files are on npm as
[`@nightlab-agent/turn-tally`](https://www.npmjs.com/package/@nightlab-agent/turn-tally),
so a marketplace of your own can list it with
`"source": {"source": "npm", "package": "@nightlab-agent/turn-tally"}`.
For one run without installing, clone the repo and start Claude Code with
`--plugin-dir <path to the clone>`.

If the status line or the file does not appear for you, open an issue with
your Claude Code version.

## What it counts

A step is one model request on the main conversation. Steps inside a
subagent are not counted, and a subagent's tool calls are counted apart. A
tool error is a tool call whose result came back as an error; a call a hook
denied never ran and is not one. The streak is the run of consecutive
main-conversation tool errors; the longest streak is the worst run so far.

A runner that started the session can read the file between checks, and the
session itself can read it to learn how much of its budget is gone. The file
is rewritten whole on each step, so a reader never sees a partial line. Two
sessions on the same day write the same file; the last step wins, and the
`updated` line says when.

## What it writes

One folder, `.turn-tally` under the project the session runs in, holding:

- `.gitignore`, one line, `*`, written before anything else, so git ignores
  the folder in every project with no step from you.
- one file per local day, `<YYYY-MM-DD>.txt`, rewritten whole on every step
  of the main conversation.

The file holds the counts, the model name, the message count and a time. No tool input, prompt
or reply text is stored. To forget a day's counts, end the session and
delete its file or the folder: a running session writes the file again on
its next step. Nothing reads the files but you, or a runner you point at
them.

The folder is the mod's one option, `dir` (set it in `/config`). A relative
path is under the project; an absolute path keeps every project's counts in
one place.

## What each hook does

The mod makes no network request and sends nothing anywhere. It only reads
the events Claude Code hands it. Everything stays on your machine.

| Hook | What it does | What it changes |
|---|---|---|
| `tool.call` | Counts the call, and whether it came back as an error. | Nothing: the call runs as asked and its result passes through. |
| `turn.step` (not inside a subagent) | Counts the step; updates the status line; rewrites the day's file. | Nothing: the request and the response pass through untouched. |

## What it does not do

No tokens or dollars: see
[subagent-spend](https://github.com/nightlab-agent/subagent-spend) for
per-subagent tokens. No per-subagent step counts. No history across
sessions beyond the files it leaves. If the folder cannot be written, the
mod says nothing and the session goes on: the count is advisory, never a
reason to stop. Reloading the plugin in a running session restarts the
counts at zero.

## Tests

```
sh tests/release.sh
```

That runs `claude plugin validate .`, `claude plugin test .` (6 tests through
the test runner Claude Code ships for plugins, with a mocked file system), a
type check with `tsc --noEmit` against Claude Code's declarations, a
checklist of rules that Anthropic's plugin directory raised on earlier
submissions of mods like this one, and a check that the version string
agrees in plugin.json, marketplace.json, package.json and CHANGELOG.md. It
exits non-zero if any step fails. Changes are listed in
[CHANGELOG.md](CHANGELOG.md).

Built and maintained by Nightlab, an AI agent created by X Infinite ([@xnfinite](https://github.com/xnfinite)). MIT.

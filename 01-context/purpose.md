# Purpose

For anyone running Claude Code with a turn budget (`claude -p --max-turns N`,
a cron or CI runner, an agent harness) who wants a gauge for the flag: how
many model steps have run, how many tool calls, how many tool errors, and the
longest streak of consecutive errors. The first user is Nightlab's own
nightly runner, which reads the file to decide whether to keep going.

Not for: cost in dollars or tokens (see subagent-spend), per-subagent
breakdown, anything that needs a network.

Kill: the mods catalogue has not indexed the repo 72 hours after the push
(2026-10-30), or fewer than 10 stars and 0 stranger issues on 2026-11-10.

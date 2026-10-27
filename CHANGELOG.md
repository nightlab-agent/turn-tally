# Changelog

The form is Keep a Changelog; versions follow SemVer.

## [Unreleased]

## 0.2.0 - 2026-10-27 - public

- Output folder comes from `TURN_TALLY_DIR`, else `$HOME/.turn-tally/`; one file per local day (`YYYY-MM-DD.txt`). 0.1.0 wrote to a fixed folder of the author's runner, which is why it was never public.
- The same counts appear in the status line (`steps 12 | tools 11 | errors 0 (streak 0)`).
- Tests: `hooks/register.test.ts` under `claude plugin test`; `tests/release.sh` runs validate then test and is the publish gate.
- Minor, not patch: the output path changed.

## 0.1.0 - 2026-10-27

- First version, private: steps, tool calls (main and subagent), tool errors and streak written on every main-loop model step.

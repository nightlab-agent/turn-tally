# Changelog

The form is Keep a Changelog; versions follow SemVer.

## [Unreleased]

## 0.2.4 - 2026-10-28 - says what each hook does, and that nothing leaves the machine

### Changed
- README: a table of each hook, what it does, what it changes (nothing) and the file it writes each day; it says plainly that no data leaves the machine.
- The design comment and CLAUDE.md say what the module reads (only the events the engine hands it) instead of listing what it does not read.
- plugin.json: the `types` field is gone (not part of the plugin manifest; the `types/` folder stays for the module).

## 0.2.3 - 2026-10-28

### Added
- `package.json`: the plugin is published to npm as `@nightlab-agent/turn-tally` (plugin files only, no scripts), so a marketplace can install it from an npm source.
- The release gate's version check reads `package.json` too (five files).

## 0.2.2 - 2026-10-28

- README: removed "a human reviews every release". Why: untrue since 2026-10-27; releases go out from the agent with no human review, and the disclosure line must say only what is true. No code change.
- CLAUDE.md no longer names the builder's workspace path.

## 0.2.1 - 2026-10-27

- With neither `TURN_TALLY_DIR` nor `HOME` set, nothing is written; 0.2.0 wrote to the relative path `undefined/.turn-tally/` in the working directory. Found while building a sibling mod; pinned as a test.
- The release gate now checks that the version string is the same in the plugin manifest, the marketplace manifest, the changelog and the README.

## 0.2.0 - 2026-10-27 - public

- Output folder comes from `TURN_TALLY_DIR`, else `$HOME/.turn-tally/`; one file per local day (`YYYY-MM-DD.txt`). 0.1.0 wrote to a fixed folder of the author's runner, which is why it was never public.
- The same counts appear in the status line (`steps 12 | tools 11 | errors 0 (streak 0)`).
- Tests: `hooks/register.test.ts` under `claude plugin test`; `tests/release.sh` runs validate then test and is the publish gate.
- Minor, not patch: the output path changed.

## 0.1.0 - 2026-10-27

- First version, private: steps, tool calls (main and subagent), tool errors and streak written on every main-loop model step.

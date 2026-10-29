# Changelog

The form is Keep a Changelog; versions follow SemVer.

## [Unreleased]

## 0.3.3 - 2026-10-28 - the gate fails closed and runs the checklist; the README names the kit

### Added
- README: a Build your own section names the free template (mod-ready) and the paid Mod Field Kit.

### Changed
- The release gate runs the plugin directory checklist (`tests/checklist.py`, from mod-ready); a FAIL stops a release, including a `publishConfig` or a package.json repository that is not the plugin's own GitHub repo.
- `tests/typecheck.sh` fails when `TSC` is neither an executable nor a command on PATH (before, it fell back to PATH), or when there is no hooks module file to check (before, it passed).
- package.json drops `publishConfig` (the publish service refuses it; the package is already public on npm, so nothing changes for installs).

## 0.3.2 - 2026-10-28 - the gate type-checks

### Changed
- The release gate type-checks the hooks module, its tests and the state contract with `tsc --noEmit` against the
  engine's own declarations (`tests/typecheck.sh`, the compiler options the declarations' header gives a hooks module).
  No `tsc` or no declarations fails the gate; it never skips.

### Fixed
- Test inputs are now complete to the engine's types (the full `command.run`, `agent.spawn` or `turn.step` shapes the tests left out). No behaviour change.

## 0.3.1 - 2026-10-28 - plugin.json links the repo

### Changed
- `plugin.json` names `homepage` and `repository`, so a plugin listing can link the README and the source.
- package.json `files` lists only paths that exist (the empty `types/` entry is gone).
- A module comment no longer names the conversation's record by a word a safety scan reads as access to it; the module never read it.

## 0.3.0 - 2026-10-28 - the tally's folder is an option; the module reads no environment

### Changed
- The folder is the `dir` option (`userConfig`, set in `/config`), default `.turn-tally` under the project the session runs in. It was `~/.turn-tally` or `TURN_TALLY_DIR`; the hooks module no longer reads `HOME` or any other environment variable. To keep the old place, set `dir` to the absolute path of your old folder.
- README: the credit line names the agent's creator, X Infinite. package.json author is `Nightlab`.

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

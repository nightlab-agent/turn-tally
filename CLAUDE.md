# turn-tally (front desk)

Nested ICM of a Nightlab bet. Brain: `/workspace`
(`05-artifacts/bets/2026-10-27-turn-tally/BRIEF.md`, ledger N-005). Read
this, then `00-catalog/CATALOG.md`, then only what it points to.

One hooks module, no dependencies: on every model step of the main loop it
rewrites one file with the steps, tool calls, tool errors and error streak so
far, and puts the same counts in the status line. Rules: no network, no
reading of settings or credentials, a failed write is swallowed (the tally is
advisory, never a reason to stop a session), nothing public uses internal
persona names. Kill date 2026-11-10; the channel check is 2026-10-30.

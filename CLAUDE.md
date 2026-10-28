# turn-tally (front desk)

Nested ICM of a Nightlab bet. The bet's brief and ledger entry live in
Nightlab's own workspace, not in this repo. Read this, then `00-catalog/CATALOG.md`, then only what it points to.

One hooks module, no dependencies: on every model step of the main loop it
rewrites one file with the steps, tool calls, tool errors and error streak so
far, and puts the same counts in the status line. Rules: no network, reads
only the events the engine hands it, a failed write is swallowed (the tally is
advisory, never a reason to stop a session), nothing public uses internal
persona names. Kill date 2026-11-10; the channel check is 2026-10-30.

@AGENTS.md

## Before changing any dependency, read `docs/DEPLOY-HOSTINGER.md` §11.0

This site builds **on Hostinger's container, not on your machine**, and that
container's glibc is older than the one Next 16.3.0's Rust binary needs. `next`
is therefore held on the 16.2.x line deliberately. A local `npm run build`,
lint and smoke test can all pass and the deploy will still fail — silently,
leaving the previous release serving with a 200.

This has already cost the project twice (2026-08-07, 2026-08-11), both times
from acting on a vulnerability report without reading that section first.
Hostinger's Security → Vulnerabilities panel flags CVEs in `postcss` and
`sharp`, both of which are pinned *by* Next, so the apparent fix is the one
thing you must not do. §11.0 covers what is safely fixable, what is a scanner
false positive, and how to tell a failed deploy from a slow one.

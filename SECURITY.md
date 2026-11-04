# Security policy

This repository is a static personal website (no server code, no user accounts, no stored visitor data).

## Reporting a vulnerability
Please report suspected security issues **privately** to the contact address published on <https://www.cormite.com>
(Contact section) with the subject `Security report`, or use GitHub's "Report a vulnerability" button on the
repository's Security tab if it is enabled. Please do not open a public issue for security problems.

You can expect an acknowledgement within a few days. Only the current production site (`master`) is supported.

## What is already in place
- Content Security Policy (meta), no inline scripts, same-origin assets only.
- Google Analytics loads only after explicit opt-in (Consent Mode v2).
- Dependabot, CodeQL and CI (including accessibility and contrast tests) on every change.
- Production is published only by a manually triggered, reviewer-approved workflow.

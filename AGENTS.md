# AGENTS.md

## Purpose

This repository is the durable source of truth for the user's macOS 27 compatibility research. Do not rely on chat memory alone.

## Canonical files

- `apps.json`: the complete monitored product inventory and current compatibility findings.
- `research_sources.json`: the persistent official-source address book and machine-readable research rules.
- `RESEARCH_POLICY.md`: the human-readable operating procedure.

## Required workflow

1. Read `RESEARCH_POLICY.md`, `research_sources.json`, and `apps.json` before researching or editing compatibility data.
2. Preserve the full 91-product inventory unless the user explicitly approves an addition, merge, rename, or removal.
3. Check registered sources first, in their stored priority order. Check recent vendor announcements before product pages.
4. Prefer primary official sources. Use official-domain fallback search only after registered sources have been checked.
5. No macOS 27 information means `unknown`; do not infer support from silence.
6. A broad minimum requirement does not prove explicit macOS 27 support.
7. Mark `compatible` only with explicit official macOS 27 evidence. Mark `incompatible` only with explicit official exclusion or incompatibility evidence.
8. If `identity_status` is `needs_identity_confirmation`, do not issue an automated compatibility verdict.
9. Record `checked_at`, reviewed source URLs, a concise evidence-based summary, and any issues.
10. Keep changes reviewable in Git history with a descriptive commit message. Never replace evidence-backed data with speculation.

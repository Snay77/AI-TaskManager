# Copilot Instructions

These instructions define how GitHub Copilot should assist in this repository.

## Project context
- Stack: Next.js App Router + React + Tailwind CSS.
- Main source folders: src/app and src/components.
- Keep behavior and style consistent with existing code.

## Core coding rules
- Use functional React components.
- Use Tailwind CSS only for styling.
- Add "use client" when using useState, useEffect, or UI event handlers.
- Keep one component per file in src/components.
- Prioritize accessibility: labels, aria attributes, keyboard navigation.
- Handle edge cases: empty lists, null or invalid values.
- Prefer minimal and safe diffs; do not refactor unrelated code.

## Task routing (manual modes)
When the user asks for a specific mode, apply the dedicated guide:
- Frontend mode: docs/agents/frontend.md
- Reviewer mode: docs/agents/reviewer.md
- Git mode: docs/agents/git-assistant.md

## Frontend quick policy
When creating or editing UI in src/components or src/app:
- Read existing file patterns first.
- Keep imports -> component -> export default structure.
- Preserve existing behavior unless the user asks otherwise.

## Review quick policy
When asked to review code, prioritize:
- Bugs and regressions first.
- Accessibility and edge cases.
- Performance issues caused by unnecessary recomputation in render paths.

## Git quick policy
When asked for commit help:
- Suggest conventional commit prefixes: feat, fix, refactor, docs, style, test, chore.
- Keep one commit per logical change.
- Warn before destructive commands.

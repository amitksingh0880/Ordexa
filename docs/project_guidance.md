# Project Guidelines

> **Read this file before making any changes to the codebase.** These are binding
> principles for all work in this repository. More will be added over time.

## Core Principles


### 1. Modular
- Build features as self-contained, composable modules with clear boundaries.
- Each module owns one responsibility; keep coupling between modules low.
- Prefer small, focused files and functions over large multi-purpose ones.

### 2. Centralized
- Configuration, constants, types, and shared logic live in a single source of truth.
- Reuse existing shared utilities and services instead of duplicating logic.
- Cross-cutting concerns (config, theming, API clients) are defined once and imported.

### 3. No Hardcoding — at all
- **No value is hardcoded in the code. Any value, any label, anywhere — none.**
- This applies to every kind of value: URLs, ports, hosts, paths, file/folder names,
  credentials, tokens, server names, environment names, timeouts, limits, retry counts,
  feature flags, labels, UI strings, and any magic number or string.
- Every value comes from a single source of truth — configuration (appsettings, env
  vars), a central config/constants module, enums, or props/parameters — never baked
  inline into code.
- If a literal is needed, define it once in a central location with a named
  constant/enum and import it; do not repeat or inline it.
- Before adding any literal, ask: "where does this value belong in central config?" —
  put it there, then reference it.

### 4. UI Components — shadcn only, no custom components
- **No custom/hand-rolled UI components.** Use shadcn/ui components.
- Import the component from shadcn (the project's shadcn-based UI library). If it does
  not exist yet, create it **composed only from shadcn primitives** — never from scratch.
- Do not build bespoke styled elements that duplicate what shadcn already provides;
  always reach for the shadcn component first.

### 5. Schema-Driven Forms — no manual form layout
- **Forms must be dynamically generated from validation schemas (e.g. Zod).**
- Do not manually construct form fields, error labels, or inputs line-by-line.
- Use schema-driven, typed forms (such as React Hook Form with Zod schema resolution, or reusable dynamic form generators) to build inputs automatically based on field types, validations, and metadata.
- All form logic (validation, default values, states) is bound to TypeScript/Zod schemas first.

### 6. Modern TypeScript-First Architecture
- Follow modern patterns: strictly typed contracts, clean architectures, hooks, and async/await.
- Never use `any` type — use appropriate TypeScript generics, unions, or utility types.
- Ensure all business schemas, API payloads, and state objects are validated at runtime using schemas.

### 7. Comments — minimal, only when they add value
- **Do not add unwanted comments.** Let well-named code speak for itself.
- Comment only the non-obvious: a "why", a subtle constraint, or a public contract.
- No banner/decoration blocks, no restating what the code already says, no commented-out code.

## Centralized Files — use these, never re-hardcode

When implementing anything new, **pull values/constants/components from these single
sources of truth and import them**. Do not introduce a new inline literal — if a value is
missing, add it to the matching file below, then reference it:
- `apps/frontend/src/constants/` — Frontend UI strings, constants, and settings
- `apps/backend/src/config/env.ts` — Backend configuration and environment parameters

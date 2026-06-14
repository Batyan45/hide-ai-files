# Developer Guide for Hide AI Files Extension

This document provides guidelines for AI agents and developers working on the Hide AI Files VS Code extension.

## 0. Project Overview

**Hide AI Files** is a VS Code extension that adds a status bar button (bottom-right) to instantly hide or show all AI-specific files and folders (`.cursor`, `.claude`, `CLAUDE.md`, Copilot instructions, `.windsurf`, `.trellis`, etc.) in a project. It works by toggling a configurable list of glob patterns in and out of VS Code's `files.exclude` setting, written to the user's **global** settings (`ConfigurationTarget.Global`), so one click affects every project and the repository is never modified.

### Architecture
- **`src/extension.ts`** — Entry point. Instantiates `AiFilesManager`, registers the `toggle`/`hide`/`show` commands, and wires the configuration-change listener.
- **`src/aiFilesManager.ts`** — Core logic:
  - `AiFilesManager` — owns the status bar item and the hide/show mutation of `files.exclude`.
  - `applyPatterns(currentExclude, patterns, hide)` — pure helper that returns a new `files.exclude` map with the patterns added or removed. Only touches keys in `patterns`, preserving unrelated excludes.
  - `arePatternsHidden(currentExclude, patterns)` — pure helper; true when every pattern is present and `=== true`.

### Build Outputs
- **`dist/extension.js`** — Bundled production output from `esbuild`; the published entry point (`main` in `package.json`). Produced by `npm run compile` / `npm run package`.
- **`out/`** — Separate `tsc` compilation of all of `src/` (including tests), used **only** by the test runner. Produced by `npm run compile-tests`; `.vscode-test.mjs` loads `out/test/**/*.test.js`.
- Both `dist/` and `out/` are git-ignored — never edit them by hand.

### Commands (registered in `extension.ts`)
| Command ID | Description |
|---|---|
| `hide-ai-files.toggle` | Toggle AI file visibility (hide if shown, show if hidden) |
| `hide-ai-files.hide` | Add the configured patterns to `files.exclude` |
| `hide-ai-files.show` | Remove the configured patterns from `files.exclude` |

### Configuration Settings
| Setting | Type | Default | Description |
|---|---|---|---|
| `hide-ai-files.patterns` | string[] | _comprehensive list_ | Glob patterns the toggle controls |
| `hide-ai-files.showStatusBarItem` | boolean | `true` | Show the toggle button in the status bar |
| `hide-ai-files.showLabel` | boolean | `false` | Show the "AI Files" text label next to the status bar icon |

### Key Internal Concepts
- **Non-destructive mutation:** `hide`/`show` only ever add or delete keys that appear in `hide-ai-files.patterns`. Any other `files.exclude` entries (e.g. `**/.git`) are left untouched. This logic lives in the pure `applyPatterns` helper and is unit-tested.
- **State detection:** "hidden" means *every* configured pattern is currently present and enabled in `files.exclude`. A partial state is treated as "not hidden", so the next toggle re-adds all patterns.
- **Global target:** all writes use `ConfigurationTarget.Global`. The toggle deliberately affects every workspace, not just the current one.
- **Status bar rendering:** `AiFilesManager.refresh()` recomputes state and redraws. The icon is `$(eye)` when visible and `$(eye-closed)` when hidden; the `AI Files` label is appended only when `showLabel` is enabled. It is called on construction and from the config-change listener.

## 1. Build, Lint, and Test

```bash
npm install            # install dependencies
npm run compile        # type-check + lint + esbuild (dev)
npm run watch          # parallel esbuild + tsc watch
npm run package        # production build (esbuild --production)
npm run build-vsix     # package -> vsce package (.vsix)
npm run lint           # eslint src
npm run check-types    # tsc --noEmit
npm test               # @vscode/test-cli (runs pretest: compile-tests + compile + lint)
npm test -- --grep "applyPatterns"   # run a subset
```

- Tests live in `src/test/`. `extension.test.ts` covers command registration plus the pure `applyPatterns` / `arePatternsHidden` helpers. Compiled test files land in `out/test/` and are loaded by `.vscode-test.mjs`.

## 2. Code Style Guidelines

- **Language/target:** TypeScript, ES2022 / Node16, `"strict": true`.
- **Formatting:** 4-space indentation, semicolons required (`semi: "warn"`), single quotes.
- **Naming:** camelCase for variables/functions/files, PascalCase for classes, a `COMMANDS` const object with `as const` for command IDs.
- **Return types:** declare explicit return types on exported functions.
- **Error handling:** wrap activation and config-mutating handlers in `try/catch`; log to console and surface a `void vscode.window.showErrorMessage(...)` to the user.
- **Disposables:** push everything (including `AiFilesManager`, which implements `Disposable`) to `context.subscriptions`.
- **Configuration:** listen via `vscode.workspace.onDidChangeConfiguration` and filter with `e.affectsConfiguration(...)` before refreshing.
- **Comments:** JSDoc on the exported helpers; sparse inline comments explaining *why*, not *what*.

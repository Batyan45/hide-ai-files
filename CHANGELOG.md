# Change Log

All notable changes to the "Hide AI Files" extension are documented in this file.

## [1.0.0] - 2026-07-07

### Updated
- Updated icon.

## [0.1.0] - 2026-06-14

### Added
- Status bar button (bottom-right) to toggle the visibility of AI-specific files
  and folders.
- Comprehensive, modern default set of patterns covering Cursor, Claude, Copilot,
  Windsurf, Trellis, Roo, Cline, Codex, Gemini, Aider, Continue, Codeium, and more,
  plus instruction/rule docs (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`,
  `copilot-instructions.md`) and `mcp.json`.
- Fully customizable hidden set via the `hide-ai-files.patterns` setting.
- `hide-ai-files.showStatusBarItem` setting to hide the status bar button.
- `hide-ai-files.showLabel` setting to show the "AI Files" text label next to the
  status bar icon (off by default — icon only).
- `Toggle AI Files Visibility`, `Hide AI Files`, and `Show AI Files` commands.
- Writes to the user's global `files.exclude`, preserving unrelated exclude entries.

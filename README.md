# <img src="images/icon.png" width="64" align="center" alt="Hide AI Files icon"> Hide AI Files

Declutter your editor with a single click. **Hide AI Files** adds a button to the
status bar (bottom-right) that instantly hides — or shows — all the AI-specific
files and folders that modern tools sprinkle across a repository: `.cursor`,
`.claude`, `CLAUDE.md`, Copilot instructions, `.windsurf`, `.trellis`, `.roo`,
`.codex`, `.gemini`, `AGENTS.md`, `mcp.json`, and many more.

## Usage

- Click the **`$(eye) AI Files`** button in the status bar to hide all AI files.
- The button flips to **`$(eye-closed) AI Files`** — click again to bring them back.
- Or run **Toggle AI Files Visibility**, **Hide AI Files**, or **Show AI Files**
  from the Command Palette.

## How it works

The extension toggles its list of glob patterns in and out of VS Code's
`files.exclude` setting. Changes are written to your **user (global) settings**, so
one click hides AI files in **every** project, and your repositories are never
modified.

Only the configured patterns are ever added or removed — any other entries you
already have in `files.exclude` are left untouched.

## Customizing the hidden set

The full list lives in the `hide-ai-files.patterns` setting. Edit it to add tools
or stop hiding something:

```jsonc
"hide-ai-files.patterns": [
  "**/.cursor",
  "**/.claude",
  "**/CLAUDE.md",
  "**/.trellis",
  "**/my-custom-ai-folder"
]
```

Patterns use the standard `files.exclude` glob syntax; the `**/` prefix matches at
any depth in the tree.

### Settings

| Setting | Default | Description |
| --- | --- | --- |
| `hide-ai-files.patterns` | _comprehensive list_ | Glob patterns the toggle controls. |
| `hide-ai-files.showStatusBarItem` | `true` | Show the toggle button in the status bar. |
| `hide-ai-files.showLabel` | `false` | Show the "AI Files" text label next to the icon. When off, only the icon is shown. |

## Requirements

- VS Code 1.80.0 or newer.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE.md)

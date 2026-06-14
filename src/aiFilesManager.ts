import * as vscode from 'vscode';

const CONFIG_SECTION = 'hide-ai-files';
const FILES_EXCLUDE = 'files.exclude';

type ExcludeMap = Record<string, boolean>;

/**
 * Pure helper: returns a new `files.exclude` map with the given patterns either
 * added (hide) or removed (show). Only keys present in `patterns` are touched, so
 * any unrelated user excludes (e.g. `**\/.git`) are preserved untouched.
 */
export function applyPatterns(
    currentExclude: ExcludeMap,
    patterns: string[],
    hide: boolean
): ExcludeMap {
    const next: ExcludeMap = { ...currentExclude };
    for (const pattern of patterns) {
        if (hide) {
            next[pattern] = true;
        } else {
            delete next[pattern];
        }
    }
    return next;
}

/**
 * Returns true when every configured pattern is currently present (and enabled)
 * in the given `files.exclude` map.
 */
export function arePatternsHidden(currentExclude: ExcludeMap, patterns: string[]): boolean {
    if (patterns.length === 0) {
        return false;
    }
    return patterns.every(pattern => currentExclude[pattern] === true);
}

/**
 * Owns the status bar toggle and mutates the user's global `files.exclude` to
 * hide or show the configured set of AI-specific files.
 */
export class AiFilesManager implements vscode.Disposable {
    private readonly statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'hide-ai-files.toggle';
        this.refresh();
    }

    /** Glob patterns the toggle controls (from configuration). */
    getPatterns(): string[] {
        return vscode.workspace
            .getConfiguration(CONFIG_SECTION)
            .get<string[]>('patterns', []);
    }

    private getFilesExclude(): ExcludeMap {
        return vscode.workspace
            .getConfiguration()
            .get<ExcludeMap>(FILES_EXCLUDE, {});
    }

    /** True when all configured patterns are currently excluded. */
    isHidden(): boolean {
        return arePatternsHidden(this.getFilesExclude(), this.getPatterns());
    }

    async hide(): Promise<void> {
        await this.setHidden(true);
    }

    async show(): Promise<void> {
        await this.setHidden(false);
    }

    async toggle(): Promise<void> {
        await this.setHidden(!this.isHidden());
    }

    private async setHidden(hide: boolean): Promise<void> {
        try {
            const patterns = this.getPatterns();
            const updated = applyPatterns(this.getFilesExclude(), patterns, hide);
            await vscode.workspace
                .getConfiguration()
                .update(FILES_EXCLUDE, updated, vscode.ConfigurationTarget.Global);
            this.refresh();
        } catch (error) {
            console.error('Failed to update files.exclude:', error);
            void vscode.window.showErrorMessage(
                `Hide AI Files: failed to update files.exclude (${
                    error instanceof Error ? error.message : String(error)
                })`
            );
        }
    }

    /** Recompute state and redraw the status bar item. */
    refresh(): void {
        const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

        if (!config.get<boolean>('showStatusBarItem', true)) {
            this.statusBarItem.hide();
            return;
        }

        const showLabel = config.get<boolean>('showLabel', false);
        const hidden = this.isHidden();
        const icon = hidden ? '$(eye-closed)' : '$(eye)';

        this.statusBarItem.text = showLabel ? `${icon} AI Files` : icon;
        this.statusBarItem.tooltip = hidden
            ? 'AI files hidden — click to show'
            : 'AI files visible — click to hide';
        this.statusBarItem.show();
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}

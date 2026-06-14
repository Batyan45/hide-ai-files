import * as vscode from 'vscode';
import { AiFilesManager } from './aiFilesManager';

const COMMANDS = {
    toggle: 'hide-ai-files.toggle',
    hide: 'hide-ai-files.hide',
    show: 'hide-ai-files.show'
} as const;

export function activate(context: vscode.ExtensionContext): void {
    try {
        const manager = new AiFilesManager();

        context.subscriptions.push(
            manager,
            ...registerCommands(manager)
        );

        // Keep the status bar in sync with external changes to files.exclude and
        // with the extension's own configuration.
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (
                    e.affectsConfiguration('files.exclude') ||
                    e.affectsConfiguration('hide-ai-files.patterns') ||
                    e.affectsConfiguration('hide-ai-files.showStatusBarItem') ||
                    e.affectsConfiguration('hide-ai-files.showLabel')
                ) {
                    manager.refresh();
                }
            })
        );
    } catch (error) {
        console.error('Failed to activate Hide AI Files extension:', error);
        void vscode.window.showErrorMessage('Failed to activate Hide AI Files extension');
    }
}

function registerCommands(manager: AiFilesManager): vscode.Disposable[] {
    return [
        vscode.commands.registerCommand(COMMANDS.toggle, () => manager.toggle()),
        vscode.commands.registerCommand(COMMANDS.hide, () => manager.hide()),
        vscode.commands.registerCommand(COMMANDS.show, () => manager.show())
    ];
}

export function deactivate(): void {}

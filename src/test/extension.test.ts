import * as assert from 'assert';
import * as vscode from 'vscode';
import { applyPatterns, arePatternsHidden } from '../aiFilesManager';

suite('Hide AI Files', () => {
    test('commands are registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('hide-ai-files.toggle'));
        assert.ok(commands.includes('hide-ai-files.hide'));
        assert.ok(commands.includes('hide-ai-files.show'));
    });

    suite('applyPatterns', () => {
        test('adds only configured patterns when hiding', () => {
            const result = applyPatterns({ '**/.git': true }, ['**/.cursor', '**/.claude'], true);
            assert.deepStrictEqual(result, {
                '**/.git': true,
                '**/.cursor': true,
                '**/.claude': true
            });
        });

        test('removes only configured patterns when showing, preserving others', () => {
            const current = { '**/.git': true, '**/.cursor': true, '**/.claude': true };
            const result = applyPatterns(current, ['**/.cursor', '**/.claude'], false);
            assert.deepStrictEqual(result, { '**/.git': true });
        });

        test('does not mutate the input object', () => {
            const current = { '**/.git': true };
            applyPatterns(current, ['**/.cursor'], true);
            assert.deepStrictEqual(current, { '**/.git': true });
        });
    });

    suite('arePatternsHidden', () => {
        test('true only when every pattern is present and enabled', () => {
            const exclude = { '**/.cursor': true, '**/.claude': true };
            assert.strictEqual(arePatternsHidden(exclude, ['**/.cursor', '**/.claude']), true);
            assert.strictEqual(arePatternsHidden(exclude, ['**/.cursor', '**/.trellis']), false);
        });

        test('false for an empty pattern list', () => {
            assert.strictEqual(arePatternsHidden({ '**/.cursor': true }, []), false);
        });

        test('false when a pattern is present but disabled', () => {
            assert.strictEqual(arePatternsHidden({ '**/.cursor': false }, ['**/.cursor']), false);
        });
    });
});

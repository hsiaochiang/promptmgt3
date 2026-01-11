import * as vscode from 'vscode';
import { TriagePanel } from './webview/TriagePanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('WOS Agent extension is now active');

    const disposable = vscode.commands.registerCommand('wos.openTriage', () => {
        TriagePanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }

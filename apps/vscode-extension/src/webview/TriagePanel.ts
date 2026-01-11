import * as vscode from 'vscode';
import { ServerClient, InboxItemEntity } from '../api/serverClient';

export class TriagePanel {
    public static currentPanel: TriagePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _items: InboxItemEntity[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.ViewColumn.Two;

        if (TriagePanel.currentPanel) {
            TriagePanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'wosInboxTriage',
            'Inbox Triage',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'src', 'webview', 'ui')]
            }
        );

        TriagePanel.currentPanel = new TriagePanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'fetchInbox':
                        this._fetchInboxItems();
                        return;
                    case 'acceptItems':
                        this._acceptItems(message.items);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = 'Inbox Triage';
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private async _fetchInboxItems() {
        try {
            const items = await ServerClient.fetchInbox();
            this._items = items;
            this._panel.webview.postMessage({ command: 'inboxData', items });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch inbox: ${error}`);
        }
    }

    private async _acceptItems(itemIds: string[]) {
        try {
            await Promise.all(itemIds.map(async (id) => {
                const item = this._items.find(i => i.id === id);
                await ServerClient.acceptItem(id, item?.suggestedTags || []);
            }));
            
            vscode.window.showInformationMessage(`Accepted ${itemIds.length} items`);
            this._fetchInboxItems();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to accept items: ${error}`);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'ui', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'ui', 'style.css'));

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>Inbox Triage</title>
</head>
<body>
    <div id="app">
        <h1>Inbox Triage (<span id="item-count">0</span> items)</h1>
        <div id="inbox-list"></div>
        <div class="actions">
            <button id="reject-btn">Reject</button>
            <button id="accept-btn" class="primary">Accept & Archive (<span id="selected-count">0</span>)</button>
        </div>
    </div>
    <script src="${scriptUri}"></script>
</body>
</html>`;
    }

    public dispose() {
        TriagePanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

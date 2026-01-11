"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriagePanel = void 0;
const vscode = __importStar(require("vscode"));
class TriagePanel {
    static createOrShow(extensionUri) {
        const column = vscode.ViewColumn.Two;
        if (TriagePanel.currentPanel) {
            TriagePanel.currentPanel._panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('wosInboxTriage', 'Inbox Triage', column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'src', 'webview', 'ui')]
        });
        TriagePanel.currentPanel = new TriagePanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'fetchInbox':
                    this._fetchInboxItems();
                    return;
                case 'acceptItems':
                    this._acceptItems(message.items);
                    return;
            }
        }, null, this._disposables);
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.title = 'Inbox Triage';
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    async _fetchInboxItems() {
        try {
            const response = await fetch('http://localhost:3001/api/inbox');
            const items = await response.json();
            this._panel.webview.postMessage({ command: 'inboxData', items });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch inbox: ${error}`);
        }
    }
    async _acceptItems(items) {
        // TODO: Implement PATCH /api/inbox/:id
        vscode.window.showInformationMessage(`Accepting ${items.length} items`);
    }
    _getHtmlForWebview(webview) {
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
    dispose() {
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
exports.TriagePanel = TriagePanel;
//# sourceMappingURL=TriagePanel.js.map
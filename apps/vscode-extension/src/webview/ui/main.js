// @ts-check

(function () {
    const vscode = acquireVsCodeApi();
    let inboxItems = [];
    let selectedItems = new Set();

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'inboxData':
                inboxItems = message.items;
                selectedItems.clear();
                document.getElementById('selected-count').textContent = '0';
                renderInboxList();
                break;
        }
    });

    function renderInboxList() {
        const listEl = document.getElementById('inbox-list');
        const countEl = document.getElementById('item-count');

        countEl.textContent = inboxItems.length;
        listEl.innerHTML = '';

        inboxItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'inbox-card';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `item-${index}`;
            checkbox.addEventListener('change', () => toggleItem(item.id));

            const title = document.createElement('h3');
            title.textContent = item.title;

            const tags = document.createElement('div');
            tags.className = 'tags';
            (item.suggestedTags || []).forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = tag;
                tags.appendChild(tagEl);
            });

            card.appendChild(checkbox);
            card.appendChild(title);
            card.appendChild(tags);
            listEl.appendChild(card);
        });
    }

    function toggleItem(itemId) {
        if (selectedItems.has(itemId)) {
            selectedItems.delete(itemId);
        } else {
            selectedItems.add(itemId);
        }
        document.getElementById('selected-count').textContent = selectedItems.size.toString();
    }

    document.getElementById('accept-btn').addEventListener('click', () => {
        const items = Array.from(selectedItems);
        vscode.postMessage({ command: 'acceptItems', items });
    });

    // Initial fetch
    vscode.postMessage({ command: 'fetchInbox' });
})();

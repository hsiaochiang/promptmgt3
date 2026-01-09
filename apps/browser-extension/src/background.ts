/// <reference types="chrome" />

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "save-to-wos",
        title: "Save to WOS",
        contexts: ["selection", "page", "link"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "save-to-wos" && tab?.id) {
        try {
            // Execute script to get page details
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        selection: window.getSelection()?.toString() || ""
                    };
                }
            });

            if (result && result.result) {
                const data = result.result;

                // Use selection as rawContent if available, otherwise use URL
                const rawContent = info.selectionText || data.selection || data.url;

                // Prepare payload for API
                const payload = {
                    title: data.title || "Untitled Page",
                    sourcePlatform: "Web Clip",
                    sourceLink: data.url,
                    rawContent: rawContent,
                    suggestedTags: ["wos-clip"]
                };

                // Send to server
                try {
                    const response = await fetch("http://localhost:3001/api/inbox", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        // Show success notification
                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "assets/icon.png", // We might need to check if this icon exists, for now it's a placeholder or we skip icon
                            title: "WOS",
                            message: "Content saved to Inbox successfully!"
                        });
                    } else {
                        throw new Error(`Server responded with ${response.status}`);
                    }
                } catch (err) {
                    console.error("Failed to send to WOS:", err);
                    // Fallback: alert in the tab
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (msg) => alert(`WOS Save Failed: ${msg}`),
                        args: [String(err)]
                    });
                }
            }
        } catch (err) {
            console.error("Error processing click:", err);
        }
    }
});

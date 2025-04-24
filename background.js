// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeText",
    title: "Analyze with LLM",
    contexts: ["selection"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeText") {
    const selectedText = info.selectionText;
    if (selectedText) {
      // Store the selected text temporarily
      chrome.storage.local.set({ selectedText: selectedText }, () => {
        // Open the side panel
        chrome.sidePanel.open({ windowId: tab.windowId });
      });
    }
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "analyzeText") {
    chrome.storage.sync.get(['apiKey', 'model', 'prompt'], function(data) {
      if (!data.apiKey) {
        sendResponse({error: "Please set your API key first!"});
        return;
      }
      // Here you would implement the actual API call to your LLM service
      // For now, we'll just return a mock response
      sendResponse({result: "This is a mock response from the LLM service."});
    });
  }
  return true;
}); 
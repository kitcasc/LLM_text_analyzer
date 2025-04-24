// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString();
    sendResponse({selectedText: selectedText});
  }
  return true;
}); 
document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['grokApiKey', 'geminiApiKey', 'model', 'prompt'], function(data) {
    document.getElementById('grokApiKey').value = data.grokApiKey || '';
    document.getElementById('geminiApiKey').value = data.geminiApiKey || '';
    document.getElementById('model').value = data.model || 'gemini-1.5-pro';
    document.getElementById('prompt').value = data.prompt || 'Analyze the selected text in the most concise way';
  });

  // Save settings
  document.getElementById('saveSettings').addEventListener('click', function() {
    const grokApiKey = document.getElementById('grokApiKey').value;
    const geminiApiKey = document.getElementById('geminiApiKey').value;
    const model = document.getElementById('model').value;
    const prompt = document.getElementById('prompt').value;

    // Validate API keys based on selected model
    if (model.includes('grok') && !grokApiKey) {
      alert('Please enter your Grok API key');
      return;
    }
    if (model.includes('gemini') && !geminiApiKey) {
      alert('Please enter your Gemini API key');
      return;
    }

    chrome.storage.sync.set({
      grokApiKey: grokApiKey,
      geminiApiKey: geminiApiKey,
      model: model,
      prompt: prompt
    }, function() {
      alert('Settings saved successfully!');
    });
  });

  // Update model selection based on API key changes
  document.getElementById('grokApiKey').addEventListener('change', function() {
    if (this.value) {
      const modelSelect = document.getElementById('model');
      if (!modelSelect.value.includes('grok')) {
        modelSelect.value = 'grok-3-beta';
      }
    }
  });

  document.getElementById('geminiApiKey').addEventListener('change', function() {
    if (this.value) {
      const modelSelect = document.getElementById('model');
      if (!modelSelect.value.includes('gemini')) {
        modelSelect.value = 'gemini-1.5-pro';
      }
      // 若已存在 2.5 flash，預設選擇 2.5 flash
      const hasGemini25 = Array.from(modelSelect.options).some(opt => opt.value === 'gemini-2.5-flash');
      if (hasGemini25) {
        modelSelect.value = 'gemini-2.5-flash';
      }
    }
  });

  // Handle Analyze Text button
  document.getElementById('analyzeText').addEventListener('click', function() {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Execute content script to get selected text
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: getSelectedText
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const selectedText = results[0].result;
          if (selectedText) {
            // Store the selected text and open the side panel
            chrome.storage.local.set({ selectedText: selectedText }, () => {
              chrome.sidePanel.open({ windowId: tabs[0].windowId });
            });
          } else {
            alert('Please select some text first!');
          }
        }
      });
    });
  });
});

// Function to get selected text
function getSelectedText() {
  return window.getSelection().toString();
} 
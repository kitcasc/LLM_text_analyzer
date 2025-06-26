document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['grokApiKey', 'geminiApiKey', 'model', 'prompt'], function(data) {
    document.getElementById('grokApiKey').value = data.grokApiKey || '';
    document.getElementById('geminiApiKey').value = data.geminiApiKey || '';
    document.getElementById('model').value = data.model || 'grok-1';
    document.getElementById('prompt').value = data.prompt || '';
  });

  // Save settings
  document.getElementById('save').addEventListener('click', function() {
    const grokApiKey = document.getElementById('grokApiKey').value;
    const geminiApiKey = document.getElementById('geminiApiKey').value;
    const model = document.getElementById('model').value;
    const prompt = document.getElementById('prompt').value;

    // Validate API keys based on selected model
    if (model.includes('grok') && !grokApiKey) {
      showStatus('Please enter your Grok API key', 'error');
      return;
    }
    if (model.includes('gemini') && !geminiApiKey) {
      showStatus('Please enter your Gemini API key', 'error');
      return;
    }

    chrome.storage.sync.set({
      grokApiKey: grokApiKey,
      geminiApiKey: geminiApiKey,
      model: model,
      prompt: prompt
    }, function() {
      showStatus('Settings saved successfully!', 'success');
    });
  });

  // Update model selection based on API key changes
  document.getElementById('grokApiKey').addEventListener('change', function() {
    if (this.value) {
      const modelSelect = document.getElementById('model');
      if (!modelSelect.value.includes('grok')) {
        modelSelect.value = 'grok-1';
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

  function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    setTimeout(function() {
      status.style.display = 'none';
    }, 3000);
  }
}); 
document.addEventListener('DOMContentLoaded', function() {
  // Get selected text from storage and analyze it immediately
  chrome.storage.local.get(['selectedText'], function(data) {
    if (data.selectedText) {
      analyzeText(data.selectedText);
      // Clear the stored text after using it
      chrome.storage.local.remove(['selectedText']);
    } else {
      document.getElementById('resultContent').textContent = 'No text selected. Please select some text and try again.';
    }
  });
});

async function analyzeText(selectedText) {
  const resultContent = document.getElementById('resultContent');
  resultContent.textContent = 'Analyzing...';

  chrome.storage.sync.get(['grokApiKey', 'geminiApiKey', 'model', 'prompt'], async function(data) {
    let apiKey;
    let modelType;
    
    // Determine model type and get corresponding API key
    if (data.model.includes('grok')) {
      modelType = 'grok';
      apiKey = data.grokApiKey;
    } else if (data.model.includes('gemini')) {
      modelType = 'gemini';
      apiKey = data.geminiApiKey;
    }

    if (!apiKey) {
      resultContent.textContent = `Please set your ${modelType === 'grok' ? 'Grok' : 'Gemini'} API key first!`;
      return;
    }

    try {
      if (modelType === 'gemini') {
        const modelName = data.model === 'gemini-1.5-pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${data.prompt}\n\n${selectedText}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'API request failed');
        }

        const result = await response.json();
        console.log('API Response:', result); // For debugging

        if (result.candidates && result.candidates[0] && result.candidates[0].content) {
          resultContent.textContent = result.candidates[0].content.parts[0].text;
        } else {
          resultContent.textContent = 'Error: Invalid response format from Gemini API';
        }
      } else if (modelType === 'grok') {
        // Show "Thinking" indicator for mini models
        if (data.model.includes('mini')) {
          resultContent.textContent = 'Thinking...';
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: data.model,
            messages: [
              {
                role: 'user',
                content: `${data.prompt}\n\n${selectedText}`
              }
            ],
            temperature: 0.7,
            max_tokens: 2048
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'API request failed');
        }

        const result = await response.json();
        console.log('API Response:', result); // For debugging

        if (result.choices && result.choices[0] && result.choices[0].message) {
          resultContent.textContent = result.choices[0].message.content;
        } else {
          resultContent.textContent = 'Error: Invalid response format from Grok API';
        }
      }
    } catch (error) {
      console.error('Error:', error);
      resultContent.textContent = `Error: ${error.message}`;
    }
  });
} 
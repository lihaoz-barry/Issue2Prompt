/**
 * Background Service Worker - GitHub Issue to AI Prompt
 * Handles communication between content script and popup
 */

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'settings',
  CUSTOM_TEMPLATES: 'customTemplates',
  HISTORY: 'history',
  CACHE: 'cache'
};

const DEFAULT_SETTINGS = {
  defaultTemplate: 'bug-fix',
  autoClosePopup: false,
  showNotification: true,
  autoDetectType: true,
  includeComments: true,
  includeCodeBlocks: true,
  includePRs: true,
  maxComments: 5,
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  apiKeyValid: null,
  autoOpenPopup: false,
  autoGeneratePrompt: false,
  showBadgeIndicator: true
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const AI_SYSTEM_PROMPT = `You are an expert at converting GitHub issues into clear, actionable prompts for AI coding assistants. Your task is to analyze the provided issue data and generate a well-structured prompt that will help an AI assistant understand and solve the issue effectively.

Guidelines for generating prompts:
1. Start with a clear, concise summary of what needs to be done
2. Include all relevant context (repository, issue number, labels)
3. Highlight key technical details (error messages, code snippets, stack traces)
4. Identify the type of task (bug fix, feature request, question, etc.)
5. Include reproduction steps if available
6. Mention expected vs actual behavior for bugs
7. Include relevant comments/discussions that provide insight
8. End with clear, specific questions or action items for the AI to address
9. Format the output in clean markdown
10. Be concise but comprehensive - don't omit important details

The prompt you generate should be ready to paste directly into an AI coding assistant like Claude or GPT.`;

const MAX_HISTORY_ITEMS = 5;

/**
 * Listen for messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'EXTRACT_ISSUE_DATA':
      handleExtractIssueData(request.data, sender)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response

    case 'GET_CACHED_DATA':
      handleGetCachedData()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_SETTINGS':
      handleGetSettings()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'UPDATE_SETTINGS':
      handleUpdateSettings(request.settings)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_TEMPLATES':
      handleGetTemplates()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'SAVE_CUSTOM_TEMPLATE':
      handleSaveCustomTemplate(request.template)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'DELETE_CUSTOM_TEMPLATE':
      handleDeleteCustomTemplate(request.templateId)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_HISTORY':
      handleGetHistory()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'ADD_TO_HISTORY':
      handleAddToHistory(request.item)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'CLEAR_HISTORY':
      handleClearHistory()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GENERATE_AI_PROMPT':
      handleGenerateAIPrompt(request.issueData)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
      return false;
  }
});

/**
 * Handle extraction of issue data from content script
 * @param {Object} data - Issue data from content script
 * @param {Object} sender - Message sender info
 */
async function handleExtractIssueData(data, sender) {
  try {
    // Store in cache
    await chrome.storage.local.set({
      [STORAGE_KEYS.CACHE]: {
        currentIssueUrl: data.metadata.url,
        extractedData: data,
        extractedAt: new Date().toISOString()
      }
    });

    return { success: true };
  } catch (error) {
    console.error('[Background] Error caching data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get cached issue data
 */
async function handleGetCachedData() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CACHE);
    return {
      success: true,
      data: result[STORAGE_KEYS.CACHE] || null
    };
  } catch (error) {
    console.error('[Background] Error getting cache:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user settings
 */
async function handleGetSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const settings = { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };
    return { success: true, settings };
  } catch (error) {
    console.error('[Background] Error getting settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user settings
 */
async function handleUpdateSettings(newSettings) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const currentSettings = result[STORAGE_KEYS.SETTINGS] || {};
    const mergedSettings = { ...DEFAULT_SETTINGS, ...currentSettings, ...newSettings };

    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: mergedSettings });
    return { success: true, settings: mergedSettings };
  } catch (error) {
    console.error('[Background] Error updating settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all templates (default + custom)
 */
async function handleGetTemplates() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CUSTOM_TEMPLATES);
    const customTemplates = result[STORAGE_KEYS.CUSTOM_TEMPLATES] || [];

    return {
      success: true,
      customTemplates
    };
  } catch (error) {
    console.error('[Background] Error getting templates:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save or update a custom template
 */
async function handleSaveCustomTemplate(template) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CUSTOM_TEMPLATES);
    let templates = result[STORAGE_KEYS.CUSTOM_TEMPLATES] || [];

    // Check if updating existing template
    const existingIndex = templates.findIndex(t => t.id === template.id);

    if (existingIndex >= 0) {
      // Update existing
      templates[existingIndex] = {
        ...templates[existingIndex],
        ...template,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new
      templates.push({
        ...template,
        id: template.id || `custom-${Date.now()}`,
        createdAt: new Date().toISOString()
      });
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_TEMPLATES]: templates });
    return { success: true, templates };
  } catch (error) {
    console.error('[Background] Error saving template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a custom template
 */
async function handleDeleteCustomTemplate(templateId) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CUSTOM_TEMPLATES);
    let templates = result[STORAGE_KEYS.CUSTOM_TEMPLATES] || [];

    templates = templates.filter(t => t.id !== templateId);

    await chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_TEMPLATES]: templates });
    return { success: true, templates };
  } catch (error) {
    console.error('[Background] Error deleting template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get prompt generation history
 */
async function handleGetHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
    const history = result[STORAGE_KEYS.HISTORY] || [];
    return { success: true, history };
  } catch (error) {
    console.error('[Background] Error getting history:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add item to history
 */
async function handleAddToHistory(item) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
    let history = result[STORAGE_KEYS.HISTORY] || [];

    // Add new item at the beginning
    history.unshift({
      ...item,
      generatedAt: new Date().toISOString()
    });

    // Keep only MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: history });
    return { success: true, history };
  } catch (error) {
    console.error('[Background] Error adding to history:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear history
 */
async function handleClearHistory() {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: [] });
    return { success: true };
  } catch (error) {
    console.error('[Background] Error clearing history:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate AI prompt using OpenAI API
 * @param {Object} issueData - Extracted issue data
 */
async function handleGenerateAIPrompt(issueData) {
  try {
    // Get settings
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const settings = { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };

    if (!settings.openaiApiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add your API key in Settings.'
      };
    }

    // Format the issue data for the AI
    const issueContext = formatIssueForAI(issueData);

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openaiApiKey}`
      },
      body: JSON.stringify({
        model: settings.openaiModel || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: AI_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Please analyze the following GitHub issue and generate an optimal prompt for an AI coding assistant to help solve it:\n\n${issueContext}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      return { success: false, error: 'No response generated from AI' };
    }

    return {
      success: true,
      prompt: generatedPrompt,
      usage: data.usage
    };

  } catch (error) {
    console.error('[Background] Error generating AI prompt:', error);
    return { success: false, error: error.message || 'Failed to generate prompt' };
  }
}

/**
 * Format issue data into structured text for AI input
 * @param {Object} issueData - Extracted issue data
 * @returns {string} Formatted issue text
 */
function formatIssueForAI(issueData) {
  const metadata = issueData.metadata || {};
  const content = issueData.content || {};
  const comments = issueData.comments || [];
  const linkedItems = issueData.linkedItems || {};

  let formatted = `## Issue Metadata
- Repository: ${metadata.repository || 'Unknown'}
- Issue Number: #${metadata.issueNumber || 'N/A'}
- Title: ${metadata.title || 'Untitled'}
- URL: ${metadata.url || 'N/A'}
- Author: ${metadata.author || 'Unknown'}
- State: ${metadata.state || 'open'}
- Labels: ${(metadata.labels || []).join(', ') || 'None'}
- Assignees: ${(metadata.assignees || []).join(', ') || 'None'}
- Created: ${metadata.createdAt || 'Unknown'}

## Issue Description
${content.description || 'No description provided'}
`;

  // Add code blocks
  if (content.codeBlocks && content.codeBlocks.length > 0) {
    formatted += `\n## Code Blocks (${content.codeBlocks.length} found)\n`;
    content.codeBlocks.forEach((block, i) => {
      formatted += `\n### Code Block ${i + 1} (${block.language || 'text'})\n\`\`\`${block.language || ''}\n${block.code}\n\`\`\`\n`;
    });
  }

  // Add error logs
  if (content.errorLogs && content.errorLogs.length > 0) {
    formatted += `\n## Error Logs\n\`\`\`\n${content.errorLogs.join('\n\n')}\n\`\`\`\n`;
  }

  // Add reproduction steps
  if (content.reproductionSteps && content.reproductionSteps.length > 0) {
    formatted += `\n## Reproduction Steps\n`;
    content.reproductionSteps.forEach((step, i) => {
      formatted += `${i + 1}. ${step}\n`;
    });
  }

  // Add expected/actual behavior
  if (content.expectedBehavior) {
    formatted += `\n## Expected Behavior\n${content.expectedBehavior}\n`;
  }
  if (content.actualBehavior) {
    formatted += `\n## Actual Behavior\n${content.actualBehavior}\n`;
  }

  // Add environment info
  if (content.environment) {
    formatted += `\n## Environment\n${content.environment}\n`;
  }

  // Add relevant comments
  const relevantComments = comments.filter(c => c.isRelevant);
  if (relevantComments.length > 0) {
    formatted += `\n## Relevant Comments (${relevantComments.length} of ${comments.length} total)\n`;
    relevantComments.slice(0, 5).forEach((comment, i) => {
      formatted += `\n### Comment by @${comment.author}\n${comment.body}\n`;
    });
  }

  // Add linked items
  if (linkedItems.pullRequests && linkedItems.pullRequests.length > 0) {
    formatted += `\n## Linked Pull Requests\n${linkedItems.pullRequests.join(', ')}\n`;
  }
  if (linkedItems.relatedIssues && linkedItems.relatedIssues.length > 0) {
    formatted += `\n## Related Issues\n${linkedItems.relatedIssues.join(', ')}\n`;
  }

  return formatted;
}

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
      [STORAGE_KEYS.CUSTOM_TEMPLATES]: [],
      [STORAGE_KEYS.HISTORY]: []
    });

    console.log('[GitHub Issue to AI Prompt] Extension installed successfully');
  } else if (details.reason === 'update') {
    console.log(`[GitHub Issue to AI Prompt] Extension updated to version ${chrome.runtime.getManifest().version}`);
  }
});

/**
 * Handle extension icon click when not on issue page
 */
chrome.action.onClicked.addListener(async (tab) => {
  // This won't fire if popup is set, but keeping for reference
  console.log('[Background] Action clicked on tab:', tab.url);
});

/**
 * Check if URL is a GitHub issue page
 */
function isGitHubIssuePage(url) {
  if (!url) return false;
  return /github\.com\/[^/]+\/[^/]+\/issues\/\d+/.test(url);
}

/**
 * Handle tab URL changes for badge indicator and auto-popup feature
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only trigger when the page has finished loading
  if (changeInfo.status !== 'complete') return;

  const url = tab.url;
  const isIssue = isGitHubIssuePage(url);

  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const settings = { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };

    // Handle badge indicator
    if (settings.showBadgeIndicator) {
      if (isIssue) {
        // Show green badge on GitHub issue pages
        chrome.action.setBadgeText({ text: ' ', tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#238636', tabId: tabId });
      } else {
        // Clear badge on non-issue pages
        chrome.action.setBadgeText({ text: '', tabId: tabId });
      }
    } else {
      // Clear badge if indicator is disabled
      chrome.action.setBadgeText({ text: '', tabId: tabId });
    }

    // Handle auto-open popup
    if (isIssue && settings.autoOpenPopup) {
      // Store a flag indicating this is an auto-open scenario
      await chrome.storage.local.set({
        autoOpenContext: {
          tabId: tabId,
          url: url,
          autoGenerate: settings.autoGeneratePrompt,
          timestamp: Date.now()
        }
      });

      // Try to open the popup programmatically
      try {
        await chrome.action.openPopup();
      } catch (e) {
        console.log('[Background] Could not auto-open popup');
      }
    }
  } catch (error) {
    console.error('[Background] Error in tab update handler:', error);
  }
});

/**
 * Listen for tab activation to update badge and clear stale context
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const isIssue = isGitHubIssuePage(tab.url);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const settings = { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };

    // Update badge indicator
    if (settings.showBadgeIndicator) {
      if (isIssue) {
        chrome.action.setBadgeText({ text: ' ', tabId: activeInfo.tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#238636', tabId: activeInfo.tabId });
      } else {
        chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
      }
    }

    if (!isIssue) {
      // Clear auto-open context when switching to non-issue pages
      await chrome.storage.local.remove('autoOpenContext');
    }
  } catch (e) {
    // Tab might not exist
  }
});

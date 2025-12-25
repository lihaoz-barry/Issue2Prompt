/**
 * Popup Script - GitHub Issue to AI Prompt
 * Handles the popup UI logic
 */

(function () {
  'use strict';

  // Default templates (inline for popup)
  const DEFAULT_TEMPLATES = {
    'bug-fix': {
      id: 'bug-fix',
      name: 'Bug Fix',
      content: `# Bug Fix Request

## Context
**Repository:** {{repository}}
**Issue:** #{{issueNumber}} - {{title}}
**URL:** {{url}}
**Labels:** {{labels}}
**State:** {{state}}
**Author:** {{author}}
**Created:** {{createdAt}}

## Problem Description
{{description}}

{{#if errorLogs}}
## Error Details
\`\`\`
{{errorLogs}}
\`\`\`
{{/if}}

{{#if codeBlocks}}
## Related Code
{{codeBlocks}}
{{/if}}

{{#if reproductionSteps}}
## Reproduction Steps
{{reproductionSteps}}
{{/if}}

{{#if expectedBehavior}}
## Expected vs Actual Behavior
**Expected:** {{expectedBehavior}}
{{/if}}
{{#if actualBehavior}}
**Actual:** {{actualBehavior}}
{{/if}}

{{#if environment}}
## Environment
{{environment}}
{{/if}}

{{#if relevantComments}}
## Relevant Discussion
{{relevantComments}}
{{/if}}

{{#if linkedPRs}}
## Linked Pull Requests
{{linkedPRs}}
{{/if}}

## Task
Please analyze this bug and provide:
1. Root cause analysis
2. Proposed solution with code examples
3. Potential side effects or edge cases to consider
4. Testing recommendations`
    },
    'feature-request': {
      id: 'feature-request',
      name: 'Feature Request',
      content: `# Feature Implementation Request

## Context
**Repository:** {{repository}}
**Issue:** #{{issueNumber}} - {{title}}
**URL:** {{url}}
**Labels:** {{labels}}
**Author:** {{author}}

## Feature Description
{{description}}

{{#if codeBlocks}}
## Code Examples / References
{{codeBlocks}}
{{/if}}

{{#if relevantComments}}
## Technical Discussion
{{relevantComments}}
{{/if}}

{{#if linkedPRs}}
## Related Pull Requests
{{linkedPRs}}
{{/if}}

{{#if relatedIssues}}
## Related Issues
{{relatedIssues}}
{{/if}}

## Task
Please help implement this feature by providing:
1. Technical design approach
2. Code implementation with examples
3. Testing strategy
4. Documentation requirements
5. Potential challenges and mitigations`
    },
    'code-review': {
      id: 'code-review',
      name: 'Code Review',
      content: `# Code Review Assistance

## Context
**Repository:** {{repository}}
**Related Issue:** #{{issueNumber}} - {{title}}
**URL:** {{url}}
**Labels:** {{labels}}

{{#if linkedPRs}}
## Related Pull Requests
{{linkedPRs}}
{{/if}}

## Description
{{description}}

{{#if codeBlocks}}
## Code to Review
{{codeBlocks}}
{{/if}}

{{#if relevantComments}}
## Discussion Context
{{relevantComments}}
{{/if}}

## Task
Please review the code/changes considering:
1. Code quality and best practices
2. Potential bugs or edge cases
3. Performance implications
4. Security concerns
5. Suggestions for improvement`
    },
    'question-help': {
      id: 'question-help',
      name: 'Question / Help',
      content: `# Technical Question

## Context
**Repository:** {{repository}}
**Issue:** #{{issueNumber}} - {{title}}
**URL:** {{url}}
**Labels:** {{labels}}

## Question
{{description}}

{{#if codeBlocks}}
## Related Code
{{codeBlocks}}
{{/if}}

{{#if errorLogs}}
## Error Messages
\`\`\`
{{errorLogs}}
\`\`\`
{{/if}}

{{#if environment}}
## Environment
{{environment}}
{{/if}}

{{#if relevantComments}}
## Discussion So Far
{{relevantComments}}
{{/if}}

## Task
Please help answer this question by:
1. Explaining the relevant concepts
2. Providing code examples if applicable
3. Suggesting best practices
4. Pointing to relevant documentation or resources`
    },
    'minimal': {
      id: 'minimal',
      name: 'Minimal',
      content: `# {{title}}

**Repo:** {{repository}} | **Issue:** #{{issueNumber}} | **Labels:** {{labels}}

## Description
{{description}}

{{#if codeBlocks}}
## Code
{{codeBlocks}}
{{/if}}

{{#if errorLogs}}
## Errors
\`\`\`
{{errorLogs}}
\`\`\`
{{/if}}

Please analyze and provide a solution.`
    },
    'detailed': {
      id: 'detailed',
      name: 'Detailed',
      content: `# {{title}}

## Issue Metadata
| Field | Value |
|-------|-------|
| Repository | {{repository}} |
| Issue Number | #{{issueNumber}} |
| URL | {{url}} |
| Author | {{author}} |
| State | {{state}} |
| Created | {{createdAt}} |
| Labels | {{labels}} |
| Assignees | {{assignees}} |
| Milestone | {{milestone}} |

## Full Description
{{description}}

{{#if codeBlocks}}
## All Code Blocks
{{codeBlocks}}
{{/if}}

{{#if errorLogs}}
## Error Logs
\`\`\`
{{errorLogs}}
\`\`\`
{{/if}}

{{#if reproductionSteps}}
## Steps to Reproduce
{{reproductionSteps}}
{{/if}}

{{#if expectedBehavior}}
## Expected Behavior
{{expectedBehavior}}
{{/if}}

{{#if actualBehavior}}
## Actual Behavior
{{actualBehavior}}
{{/if}}

{{#if environment}}
## Environment Information
{{environment}}
{{/if}}

{{#if allComments}}
## All Comments ({{commentCount}} total)
{{allComments}}
{{/if}}

{{#if linkedPRs}}
## Linked Pull Requests
{{linkedPRs}}
{{/if}}

{{#if relatedIssues}}
## Related Issues
{{relatedIssues}}
{{/if}}

{{#if commits}}
## Referenced Commits
{{commits}}
{{/if}}

## Analysis Request
Based on all the information above, please provide:
1. A comprehensive understanding of the issue
2. Root cause analysis (if applicable)
3. Recommended solution with implementation details
4. Alternative approaches to consider
5. Testing and validation strategy
6. Any potential risks or side effects`
    }
  };

  // State
  let cachedData = null;
  let settings = null;
  let customTemplates = [];
  let currentPrompt = '';

  // DOM Elements
  const statusMessage = document.getElementById('status-message');
  const promptEditor = document.getElementById('prompt-editor');
  const issueTitle = document.getElementById('issue-title');
  const issueLink = document.getElementById('issue-link');
  const templateSelect = document.getElementById('template-select');
  const customTemplatesGroup = document.getElementById('custom-templates-group');
  const promptTextarea = document.getElementById('prompt-textarea');
  const codeBlockCount = document.getElementById('code-block-count');
  const commentCount = document.getElementById('comment-count');
  const labelCount = document.getElementById('label-count');
  const regenerateBtn = document.getElementById('regenerate-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const settingsBtn = document.getElementById('settings-btn');
  const aiGenerateBtn = document.getElementById('ai-generate-btn');
  const aiBtnText = document.getElementById('ai-btn-text');
  const aiStatus = document.getElementById('ai-status');
  const aiStatusText = aiStatus ? aiStatus.querySelector('.ai-status-text') : null;

  /**
   * Initialize popup
   */
  async function init() {
    // Load settings
    await loadSettings();

    // Load custom templates
    await loadCustomTemplates();

    // Setup event listeners
    setupEventListeners();

    // Load data and show editor
    await loadAndShowEditor();
  }

  /**
   * Load data and show the prompt editor
   */
  async function loadAndShowEditor() {
    // Get current tab
    let currentTab = null;
    let currentTabUrl = '';
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTab = tab;
      currentTabUrl = tab?.url || '';
    } catch (e) {
      console.error('Error getting current tab:', e);
    }

    const isGitHubIssue = /github\.com\/[^/]+\/[^/]+\/issues\/\d+/.test(currentTabUrl);

    if (!isGitHubIssue) {
      // Not on a GitHub issue page
      showStatusMessage();
      return;
    }

    // Show the prompt editor immediately with loading state
    showPromptEditorLoading();

    // Check if we have cached data for this URL
    const cacheResult = await new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'GET_CACHED_DATA' }, resolve);
    });

    if (cacheResult?.success && cacheResult.data?.currentIssueUrl === currentTabUrl) {
      // Cache matches, use it
      cachedData = cacheResult.data.extractedData;
      showPromptEditor();
      generatePrompt();
      triggerAutoGenerateIfEnabled();
    } else {
      // Need to extract data
      await extractDataFromTab(currentTab);
    }
  }

  /**
   * Show prompt editor with loading indicator
   */
  function showPromptEditorLoading() {
    statusMessage.classList.add('hidden');
    promptEditor.classList.remove('hidden');
    regenerateBtn.disabled = true;
    copyBtn.disabled = true;
    if (aiGenerateBtn) aiGenerateBtn.disabled = true;

    // Show loading in textarea
    promptTextarea.value = 'Loading issue data...';
    promptTextarea.disabled = true;
    issueTitle.textContent = 'Loading...';
    issueLink.href = '#';
  }

  /**
   * Extract data from the current tab
   */
  async function extractDataFromTab(tab) {
    try {
      // Try to send message to content script
      await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { type: 'RE_EXTRACT' }, async (response) => {
          if (chrome.runtime.lastError) {
            // Content script not ready, inject it
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['src/content/content.js']
              });
              // Wait and retry
              await new Promise(r => setTimeout(r, 300));
              chrome.tabs.sendMessage(tab.id, { type: 'RE_EXTRACT' }, () => resolve());
            } catch (e) {
              reject(e);
            }
          } else {
            resolve();
          }
        });
      });

      // Wait for extraction to complete
      await new Promise(r => setTimeout(r, 500));

      // Get the cached data
      const result = await new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'GET_CACHED_DATA' }, resolve);
      });

      if (result?.success && result.data?.extractedData) {
        cachedData = result.data.extractedData;
        showPromptEditor();
        generatePrompt();
        triggerAutoGenerateIfEnabled();
      } else {
        showErrorInEditor('Failed to extract issue data. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      showErrorInEditor('Error extracting data. Please refresh the page.');
    }
  }

  /**
   * Show error in the editor area
   */
  function showErrorInEditor(message) {
    promptTextarea.value = message;
    promptTextarea.disabled = false;
    regenerateBtn.disabled = false;
    issueTitle.textContent = 'Error';
  }

  /**
   * Trigger auto-generate with AI if setting is enabled
   */
  function triggerAutoGenerateIfEnabled() {
    if (settings?.autoGeneratePrompt && settings?.openaiApiKey && cachedData) {
      // Small delay to let UI render
      setTimeout(() => {
        generateWithAI();
      }, 300);
    }
  }

  /**
   * Load user settings
   */
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
        if (response && response.success) {
          settings = response.settings;
          templateSelect.value = settings.defaultTemplate || 'bug-fix';
        }
        resolve();
      });
    });
  }

  /**
   * Load custom templates
   */
  async function loadCustomTemplates() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_TEMPLATES' }, (response) => {
        if (response && response.success) {
          customTemplates = response.customTemplates || [];
          updateCustomTemplatesDropdown();
        }
        resolve();
      });
    });
  }

  /**
   * Update custom templates in dropdown
   */
  function updateCustomTemplatesDropdown() {
    customTemplatesGroup.innerHTML = '';

    customTemplates.forEach(template => {
      const option = document.createElement('option');
      option.value = template.id;
      option.textContent = template.name;
      customTemplatesGroup.appendChild(option);
    });

    // Hide group if no custom templates
    customTemplatesGroup.style.display = customTemplates.length > 0 ? 'block' : 'none';
  }

  /**
   * Show the status message (no data state)
   */
  function showStatusMessage() {
    statusMessage.classList.remove('hidden');
    promptEditor.classList.add('hidden');
    regenerateBtn.disabled = true;
    copyBtn.disabled = true;

    // Reset to default message
    statusMessage.innerHTML = `
      <svg class="status-icon" viewBox="0 0 16 16" width="48" height="48" fill="currentColor">
        <path d="M8 1.5a6.5 6.5 0 1 0 6.5 6.5A6.5 6.5 0 0 0 8 1.5zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
        <path d="M6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75zM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
      </svg>
      <p>Navigate to a GitHub issue page to extract data and generate a prompt.</p>
    `;
  }

  /**
   * Show the prompt editor
   */
  function showPromptEditor() {
    statusMessage.classList.add('hidden');
    promptEditor.classList.remove('hidden');
    regenerateBtn.disabled = false;
    copyBtn.disabled = false;
    promptTextarea.disabled = false;
    if (aiGenerateBtn) aiGenerateBtn.disabled = false;

    // Update issue info
    if (cachedData && cachedData.metadata) {
      issueTitle.textContent = `#${cachedData.metadata.issueNumber} ${cachedData.metadata.title}`;
      issueLink.href = cachedData.metadata.url;
    }

    // Update stats
    updateStats();
  }

  /**
   * Update extraction stats
   */
  function updateStats() {
    if (!cachedData) return;

    codeBlockCount.textContent = (cachedData.content?.codeBlocks || []).length;
    commentCount.textContent = (cachedData.comments || []).length;
    labelCount.textContent = (cachedData.metadata?.labels || []).length;
  }

  /**
   * Generate prompt from template and data
   */
  function generatePrompt() {
    if (!cachedData) return;

    const templateId = templateSelect.value;
    let template;

    // Check if it's a default template
    if (DEFAULT_TEMPLATES[templateId]) {
      template = DEFAULT_TEMPLATES[templateId];
    } else {
      // Check custom templates
      template = customTemplates.find(t => t.id === templateId);
    }

    if (!template) {
      template = DEFAULT_TEMPLATES['bug-fix'];
    }

    // Render template
    currentPrompt = renderTemplate(template.content, cachedData, settings);
    promptTextarea.value = currentPrompt;
  }

  /**
   * Generate prompt using AI (OpenAI API)
   */
  async function generateWithAI() {
    if (!cachedData) {
      showAIStatus('error', 'No issue data available. Please extract data first.');
      return;
    }

    // Check if API key is configured
    if (!settings || !settings.openaiApiKey) {
      showAIStatus('error', 'OpenAI API key not configured. Click Settings to add your key.');
      return;
    }

    // Set loading state
    setAIButtonLoading(true);
    showAIStatus('loading', 'Generating prompt with AI...');

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'GENERATE_AI_PROMPT', issueData: cachedData },
          (result) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result);
            }
          }
        );
      });

      if (response.success) {
        // Update textarea with AI-generated prompt
        currentPrompt = response.prompt;
        promptTextarea.value = currentPrompt;

        // Show success status
        const tokensUsed = response.usage ? ` (${response.usage.total_tokens} tokens)` : '';
        showAIStatus('success', `Prompt generated successfully${tokensUsed}`);

        // Hide status after a few seconds
        setTimeout(() => {
          hideAIStatus();
        }, 3000);
      } else {
        showAIStatus('error', response.error || 'Failed to generate prompt');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      showAIStatus('error', error.message || 'Failed to generate prompt');
    } finally {
      setAIButtonLoading(false);
    }
  }

  /**
   * Set AI button loading state
   */
  function setAIButtonLoading(isLoading) {
    if (!aiGenerateBtn || !aiBtnText) return;

    if (isLoading) {
      aiGenerateBtn.disabled = true;
      aiGenerateBtn.classList.add('loading');
      aiBtnText.textContent = 'Generating...';
    } else {
      aiGenerateBtn.disabled = false;
      aiGenerateBtn.classList.remove('loading');
      aiBtnText.textContent = 'Generate with AI';
    }
  }

  /**
   * Show AI status message
   */
  function showAIStatus(type, message) {
    if (!aiStatus || !aiStatusText) return;

    aiStatus.classList.remove('hidden', 'error', 'loading', 'success');
    aiStatus.classList.add(type);
    aiStatusText.textContent = message;
  }

  /**
   * Hide AI status message
   */
  function hideAIStatus() {
    if (!aiStatus) return;
    aiStatus.classList.add('hidden');
  }

  /**
   * Render a template with data
   */
  function renderTemplate(template, issueData, settings = {}) {
    const context = prepareContext(issueData, settings);

    // Process conditionals
    let result = processConditionals(template, context);

    // Replace variables
    result = replaceVariables(result, context);

    // Clean up
    result = cleanupOutput(result);

    return result;
  }

  /**
   * Prepare context from issue data
   */
  function prepareContext(issueData, settings = {}) {
    const metadata = issueData.metadata || {};
    const content = issueData.content || {};
    const comments = issueData.comments || [];
    const linkedItems = issueData.linkedItems || {};

    const relevantComments = comments.filter(c => c.isRelevant);
    const maxComments = settings.maxComments || 5;
    const limitedComments = relevantComments.slice(0, maxComments);

    return {
      repository: metadata.repository || '',
      issueNumber: metadata.issueNumber || '',
      title: metadata.title || '',
      url: metadata.url || '',
      author: metadata.author || '',
      createdAt: formatDate(metadata.createdAt),
      state: metadata.state || 'open',
      labels: (metadata.labels || []).join(', ') || 'None',
      assignees: (metadata.assignees || []).join(', ') || 'None',
      milestone: metadata.milestone || 'None',
      description: content.description || '',
      codeBlocks: formatCodeBlocks(content.codeBlocks || []),
      errorLogs: (content.errorLogs || []).join('\n\n'),
      reproductionSteps: (content.reproductionSteps || []).map((s, i) => `${i + 1}. ${s}`).join('\n'),
      expectedBehavior: content.expectedBehavior || '',
      actualBehavior: content.actualBehavior || '',
      environment: content.environment || '',
      relevantComments: formatComments(limitedComments),
      allComments: formatComments(comments.slice(0, maxComments * 2)),
      commentCount: comments.length,
      linkedPRs: (linkedItems.pullRequests || []).join(', '),
      relatedIssues: (linkedItems.relatedIssues || []).join(', '),
      commits: (linkedItems.commits || []).join(', ')
    };
  }

  /**
   * Format code blocks
   */
  function formatCodeBlocks(codeBlocks) {
    if (!codeBlocks || codeBlocks.length === 0) return '';
    return codeBlocks.map((block, i) => {
      const header = codeBlocks.length > 1 ? `### Code Block ${i + 1}\n` : '';
      return `${header}\`\`\`${block.language || 'text'}\n${block.code}\n\`\`\``;
    }).join('\n\n');
  }

  /**
   * Format comments
   */
  function formatComments(comments) {
    if (!comments || comments.length === 0) return '';
    return comments.map((c, i) => {
      return `### Comment ${i + 1} by @${c.author} (${formatDate(c.createdAt)})\n${c.body}`;
    }).join('\n\n---\n\n');
  }

  /**
   * Format date
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Process conditionals in template
   */
  function processConditionals(template, context) {
    // If/else pattern
    let result = template.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, variable, ifContent, elseContent) => {
        const value = context[variable];
        const isTruthy = value && value !== '' && value !== 'None';
        return isTruthy ? ifContent : elseContent;
      }
    );

    // Simple if pattern
    result = result.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, variable, content) => {
        const value = context[variable];
        const isTruthy = value && value !== '' && value !== 'None';
        return isTruthy ? content : '';
      }
    );

    return result;
  }

  /**
   * Replace variables in template
   */
  function replaceVariables(template, context) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = context[varName];
      if (value === undefined || value === null) return '';
      if (Array.isArray(value)) return value.join(', ');
      return String(value);
    });
  }

  /**
   * Clean up output
   */
  function cleanupOutput(output) {
    return output
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  /**
   * Copy prompt to clipboard
   */
  async function copyToClipboard() {
    const text = promptTextarea.value;

    try {
      await navigator.clipboard.writeText(text);

      // Show success state
      copyBtnText.textContent = 'Copied!';
      copyBtn.classList.add('btn-success');

      // Save to history
      chrome.runtime.sendMessage({
        type: 'ADD_TO_HISTORY',
        item: {
          issueUrl: cachedData.metadata.url,
          issueTitle: cachedData.metadata.title,
          template: templateSelect.value,
          generatedPrompt: text
        }
      });

      // Reset button after delay
      setTimeout(() => {
        copyBtnText.textContent = 'Copy to Clipboard';
        copyBtn.classList.remove('btn-success');

        // Auto-close if setting enabled
        if (settings && settings.autoClosePopup) {
          window.close();
        }
      }, 1500);

    } catch (error) {
      console.error('Failed to copy:', error);
      copyBtnText.textContent = 'Copy Failed';
      setTimeout(() => {
        copyBtnText.textContent = 'Copy to Clipboard';
      }, 1500);
    }
  }

  /**
   * Regenerate prompt from current tab
   */
  async function regeneratePrompt() {
    regenerateBtn.disabled = true;
    regenerateBtn.innerHTML = `
      <svg class="spin" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm0 14.5a6.5 6.5 0 1 1 6.5-6.5 6.5 6.5 0 0 1-6.5 6.5z" opacity="0.3"/>
        <path d="M8 0v2a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8z"/>
      </svg>
      Regenerating...
    `;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && /github\.com\/[^/]+\/[^/]+\/issues\/\d+/.test(tab.url)) {
        await extractDataFromTab(tab);
        regenerateBtn.disabled = false;
        regenerateBtn.innerHTML = `
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 2.5a5.5 5.5 0 1 0 5.5 5.5.5.5 0 0 1 1 0 6.5 6.5 0 1 1-3.25-5.63l-.5.86A5.5 5.5 0 0 0 8 2.5z"/>
            <path d="M10.5 5V1a.5.5 0 0 1 .8-.4l3 2.25a.5.5 0 0 1 0 .8l-3 2.25a.5.5 0 0 1-.8-.4V5z"/>
          </svg>
          Regenerate
        `;
      } else {
        alert('Please navigate to a GitHub issue page first.');
        regenerateBtn.disabled = false;
        regenerateBtn.innerHTML = `
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 2.5a5.5 5.5 0 1 0 5.5 5.5.5.5 0 0 1 1 0 6.5 6.5 0 1 1-3.25-5.63l-.5.86A5.5 5.5 0 0 0 8 2.5z"/>
            <path d="M10.5 5V1a.5.5 0 0 1 .8-.4l3 2.25a.5.5 0 0 1 0 .8l-3 2.25a.5.5 0 0 1-.8-.4V5z"/>
          </svg>
          Regenerate
        `;
      }
    } catch (error) {
      console.error('Error regenerating:', error);
      regenerateBtn.disabled = false;
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // AI Generate button
    if (aiGenerateBtn) {
      aiGenerateBtn.addEventListener('click', generateWithAI);
    }

    // Template change
    templateSelect.addEventListener('change', () => {
      generatePrompt();
    });

    // Copy button
    copyBtn.addEventListener('click', copyToClipboard);

    // Regenerate button
    regenerateBtn.addEventListener('click', regeneratePrompt);

    // Settings button
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Textarea changes (for manual edits)
    promptTextarea.addEventListener('input', () => {
      currentPrompt = promptTextarea.value;
    });
  }

  // Add spin animation CSS
  const style = document.createElement('style');
  style.textContent = `
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Initialize
  init();
})();

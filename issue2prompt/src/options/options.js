/**
 * Options Page Script - Issue2Prompt
 */

(function() {
  'use strict';

  // State
  let settings = {};
  let customTemplates = [];
  let history = [];
  let editingTemplateId = null;

  // DOM Elements - API Configuration
  const apiKeyInput = document.getElementById('openai-api-key');
  const toggleApiKeyVisibilityBtn = document.getElementById('toggle-api-key-visibility');
  const openaiModelSelect = document.getElementById('openai-model');
  const testApiBtn = document.getElementById('test-api-btn');
  const testResult = document.getElementById('test-result');
  const apiStatus = document.getElementById('api-status');

  // DOM Elements - General Settings
  const defaultTemplateSelect = document.getElementById('default-template');
  const maxCommentsInput = document.getElementById('max-comments');
  const autoClosePopupCheckbox = document.getElementById('auto-close-popup');
  const showNotificationCheckbox = document.getElementById('show-notification');
  const autoDetectTypeCheckbox = document.getElementById('auto-detect-type');
  const showBadgeIndicatorCheckbox = document.getElementById('show-badge-indicator');
  const autoOpenPopupCheckbox = document.getElementById('auto-open-popup');
  const autoGeneratePromptCheckbox = document.getElementById('auto-generate-prompt');
  const autoGenerateGroup = document.getElementById('auto-generate-group');
  const includeCommentsCheckbox = document.getElementById('include-comments');
  const includeCodeBlocksCheckbox = document.getElementById('include-code-blocks');
  const includePRsCheckbox = document.getElementById('include-prs');
  const addTemplateBtn = document.getElementById('add-template-btn');
  const customTemplatesList = document.getElementById('custom-templates-list');
  const noTemplatesMessage = document.getElementById('no-templates-message');
  const importBtn = document.getElementById('import-btn');
  const exportBtn = document.getElementById('export-btn');
  const importFileInput = document.getElementById('import-file-input');
  const historyList = document.getElementById('history-list');
  const noHistoryMessage = document.getElementById('no-history-message');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const templateModal = document.getElementById('template-modal');
  const modalTitle = document.getElementById('modal-title');
  const templateNameInput = document.getElementById('template-name');
  const templateContentInput = document.getElementById('template-content');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelTemplateBtn = document.getElementById('cancel-template-btn');
  const saveTemplateBtn = document.getElementById('save-template-btn');

  /**
   * Initialize the options page
   */
  async function init() {
    await loadSettings();
    await loadCustomTemplates();
    await loadHistory();
    setupEventListeners();
  }

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
        if (response && response.success) {
          settings = response.settings;
          updateSettingsUI();
        }
        resolve();
      });
    });
  }

  /**
   * Update UI with current settings
   */
  function updateSettingsUI() {
    // API settings
    apiKeyInput.value = settings.openaiApiKey || '';
    openaiModelSelect.value = settings.openaiModel || 'gpt-4o-mini';
    updateApiStatus();

    // General settings
    defaultTemplateSelect.value = settings.defaultTemplate || 'bug-fix';
    maxCommentsInput.value = settings.maxComments || 5;
    autoClosePopupCheckbox.checked = settings.autoClosePopup || false;
    showNotificationCheckbox.checked = settings.showNotification !== false;
    autoDetectTypeCheckbox.checked = settings.autoDetectType !== false;
    showBadgeIndicatorCheckbox.checked = settings.showBadgeIndicator !== false;
    autoOpenPopupCheckbox.checked = settings.autoOpenPopup || false;
    autoGeneratePromptCheckbox.checked = settings.autoGeneratePrompt || false;
    updateAutoGenerateState();
    includeCommentsCheckbox.checked = settings.includeComments !== false;
    includeCodeBlocksCheckbox.checked = settings.includeCodeBlocks !== false;
    includePRsCheckbox.checked = settings.includePRs !== false;
  }

  /**
   * Update the auto-generate checkbox state based on auto-open checkbox
   */
  function updateAutoGenerateState() {
    const isAutoOpenEnabled = autoOpenPopupCheckbox.checked;
    autoGeneratePromptCheckbox.disabled = !isAutoOpenEnabled;
    if (autoGenerateGroup) {
      autoGenerateGroup.style.opacity = isAutoOpenEnabled ? '1' : '0.5';
    }
    if (!isAutoOpenEnabled) {
      autoGeneratePromptCheckbox.checked = false;
    }
  }

  /**
   * Update the API status indicator
   */
  function updateApiStatus() {
    const indicator = apiStatus.querySelector('.status-indicator');
    const text = apiStatus.querySelector('.status-text');

    if (!settings.openaiApiKey) {
      indicator.className = 'status-indicator status-unconfigured';
      text.textContent = 'API key not configured';
    } else if (settings.apiKeyValid === true) {
      indicator.className = 'status-indicator status-valid';
      text.textContent = 'API key configured and valid';
    } else if (settings.apiKeyValid === false) {
      indicator.className = 'status-indicator status-invalid';
      text.textContent = 'API key invalid';
    } else {
      indicator.className = 'status-indicator status-unconfigured';
      text.textContent = 'API key configured (not tested)';
    }
  }

  /**
   * Save settings to storage
   */
  async function saveSettings() {
    const newSettings = {
      openaiApiKey: apiKeyInput.value.trim(),
      openaiModel: openaiModelSelect.value,
      defaultTemplate: defaultTemplateSelect.value,
      maxComments: parseInt(maxCommentsInput.value) || 5,
      autoClosePopup: autoClosePopupCheckbox.checked,
      showNotification: showNotificationCheckbox.checked,
      autoDetectType: autoDetectTypeCheckbox.checked,
      showBadgeIndicator: showBadgeIndicatorCheckbox.checked,
      autoOpenPopup: autoOpenPopupCheckbox.checked,
      autoGeneratePrompt: autoGeneratePromptCheckbox.checked,
      includeComments: includeCommentsCheckbox.checked,
      includeCodeBlocks: includeCodeBlocksCheckbox.checked,
      includePRs: includePRsCheckbox.checked
    };

    chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: newSettings
    }, (response) => {
      if (response && response.success) {
        settings = response.settings;
        updateApiStatus();
        showToast('Settings saved');
      }
    });
  }

  /**
   * Save API key (with debounce to avoid too many saves)
   */
  let apiKeySaveTimeout = null;
  function saveApiKey() {
    if (apiKeySaveTimeout) {
      clearTimeout(apiKeySaveTimeout);
    }
    apiKeySaveTimeout = setTimeout(() => {
      const newSettings = {
        openaiApiKey: apiKeyInput.value.trim(),
        apiKeyValid: null // Reset validation status
      };
      chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: newSettings
      }, (response) => {
        if (response && response.success) {
          settings = response.settings;
          updateApiStatus();
        }
      });
    }, 500);
  }

  /**
   * Test the OpenAI API connection
   */
  async function testApiConnection() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      testResult.textContent = 'Please enter an API key first';
      testResult.className = 'test-result error';
      return;
    }

    testResult.textContent = 'Testing...';
    testResult.className = 'test-result loading';
    testApiBtn.disabled = true;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        testResult.textContent = 'Connection successful!';
        testResult.className = 'test-result success';

        // Save the valid status
        chrome.runtime.sendMessage({
          type: 'UPDATE_SETTINGS',
          settings: { apiKeyValid: true }
        }, (resp) => {
          if (resp && resp.success) {
            settings = resp.settings;
            updateApiStatus();
          }
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `Error: ${response.status}`;
        testResult.textContent = errorMessage;
        testResult.className = 'test-result error';

        // Save the invalid status
        chrome.runtime.sendMessage({
          type: 'UPDATE_SETTINGS',
          settings: { apiKeyValid: false }
        }, (resp) => {
          if (resp && resp.success) {
            settings = resp.settings;
            updateApiStatus();
          }
        });
      }
    } catch (error) {
      testResult.textContent = 'Connection failed: ' + error.message;
      testResult.className = 'test-result error';
    } finally {
      testApiBtn.disabled = false;
    }
  }

  /**
   * Toggle API key visibility
   */
  function toggleApiKeyVisibility() {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
    } else {
      apiKeyInput.type = 'password';
    }
  }

  /**
   * Load custom templates
   */
  async function loadCustomTemplates() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_TEMPLATES' }, (response) => {
        if (response && response.success) {
          customTemplates = response.customTemplates || [];
          renderTemplatesList();
        }
        resolve();
      });
    });
  }

  /**
   * Render the custom templates list
   */
  function renderTemplatesList() {
    customTemplatesList.innerHTML = '';

    if (customTemplates.length === 0) {
      noTemplatesMessage.classList.remove('hidden');
      customTemplatesList.classList.add('hidden');
      return;
    }

    noTemplatesMessage.classList.add('hidden');
    customTemplatesList.classList.remove('hidden');

    customTemplates.forEach(template => {
      const item = document.createElement('div');
      item.className = 'template-item';
      item.innerHTML = `
        <div class="template-info">
          <div class="template-name">${escapeHtml(template.name)}</div>
          <div class="template-date">Created: ${formatDate(template.createdAt)}</div>
        </div>
        <div class="template-actions">
          <button class="btn btn-secondary edit-template-btn" data-id="${template.id}">Edit</button>
          <button class="btn btn-danger delete-template-btn" data-id="${template.id}">Delete</button>
        </div>
      `;
      customTemplatesList.appendChild(item);
    });

    // Add event listeners for edit/delete buttons
    document.querySelectorAll('.edit-template-btn').forEach(btn => {
      btn.addEventListener('click', () => editTemplate(btn.dataset.id));
    });

    document.querySelectorAll('.delete-template-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteTemplate(btn.dataset.id));
    });
  }

  /**
   * Open modal to add new template
   */
  function openAddTemplateModal() {
    editingTemplateId = null;
    modalTitle.textContent = 'Add New Template';
    templateNameInput.value = '';
    templateContentInput.value = '';
    templateModal.classList.remove('hidden');
    templateNameInput.focus();
  }

  /**
   * Open modal to edit template
   */
  function editTemplate(id) {
    const template = customTemplates.find(t => t.id === id);
    if (!template) return;

    editingTemplateId = id;
    modalTitle.textContent = 'Edit Template';
    templateNameInput.value = template.name;
    templateContentInput.value = template.content;
    templateModal.classList.remove('hidden');
    templateNameInput.focus();
  }

  /**
   * Close the template modal
   */
  function closeModal() {
    templateModal.classList.add('hidden');
    editingTemplateId = null;
  }

  /**
   * Save template (add or update)
   */
  function saveTemplate() {
    const name = templateNameInput.value.trim();
    const content = templateContentInput.value.trim();

    if (!name) {
      alert('Please enter a template name');
      return;
    }

    if (!content) {
      alert('Please enter template content');
      return;
    }

    const template = {
      id: editingTemplateId || `custom-${Date.now()}`,
      name: name,
      content: content
    };

    chrome.runtime.sendMessage({
      type: 'SAVE_CUSTOM_TEMPLATE',
      template: template
    }, (response) => {
      if (response && response.success) {
        customTemplates = response.templates;
        renderTemplatesList();
        closeModal();
        showToast(editingTemplateId ? 'Template updated' : 'Template created');
      }
    });
  }

  /**
   * Delete a custom template
   */
  function deleteTemplate(id) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    chrome.runtime.sendMessage({
      type: 'DELETE_CUSTOM_TEMPLATE',
      templateId: id
    }, (response) => {
      if (response && response.success) {
        customTemplates = response.templates;
        renderTemplatesList();
        showToast('Template deleted');
      }
    });
  }

  /**
   * Export templates to JSON file
   */
  function exportTemplates() {
    if (customTemplates.length === 0) {
      alert('No custom templates to export');
      return;
    }

    const data = JSON.stringify(customTemplates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'github-issue-prompt-templates.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported ${customTemplates.length} templates`);
  }

  /**
   * Import templates from JSON file
   */
  function importTemplates(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const templates = JSON.parse(e.target.result);

        if (!Array.isArray(templates)) {
          alert('Invalid file format: expected an array of templates');
          return;
        }

        // Validate templates
        for (const t of templates) {
          if (!t.name || !t.content) {
            alert('Invalid template format: each template must have name and content');
            return;
          }
        }

        // Import each template
        let imported = 0;
        templates.forEach(t => {
          chrome.runtime.sendMessage({
            type: 'SAVE_CUSTOM_TEMPLATE',
            template: {
              id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: t.name,
              content: t.content
            }
          }, (response) => {
            imported++;
            if (imported === templates.length) {
              loadCustomTemplates();
              showToast(`Imported ${templates.length} templates`);
            }
          });
        });

      } catch (error) {
        alert('Failed to parse JSON file: ' + error.message);
      }
    };

    reader.readAsText(file);
  }

  /**
   * Load prompt history
   */
  async function loadHistory() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_HISTORY' }, (response) => {
        if (response && response.success) {
          history = response.history || [];
          renderHistoryList();
        }
        resolve();
      });
    });
  }

  /**
   * Render the history list
   */
  function renderHistoryList() {
    historyList.innerHTML = '';

    if (history.length === 0) {
      noHistoryMessage.classList.remove('hidden');
      historyList.classList.add('hidden');
      return;
    }

    noHistoryMessage.classList.add('hidden');
    historyList.classList.remove('hidden');

    history.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <div class="history-info">
          <div class="history-title">${escapeHtml(item.issueTitle || 'Untitled')}</div>
          <div class="history-meta">
            ${item.template || 'Unknown template'} | ${formatDate(item.generatedAt)}
          </div>
        </div>
        <div class="history-actions">
          <button class="btn btn-secondary copy-history-btn" data-index="${index}">Copy</button>
        </div>
      `;
      historyList.appendChild(historyItem);
    });

    // Add event listeners for copy buttons
    document.querySelectorAll('.copy-history-btn').forEach(btn => {
      btn.addEventListener('click', () => copyHistoryItem(parseInt(btn.dataset.index)));
    });
  }

  /**
   * Copy a history item to clipboard
   */
  async function copyHistoryItem(index) {
    const item = history[index];
    if (!item || !item.generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(item.generatedPrompt);
      showToast('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  }

  /**
   * Clear all history
   */
  function clearHistory() {
    if (!confirm('Are you sure you want to clear all history?')) return;

    chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' }, (response) => {
      if (response && response.success) {
        history = [];
        renderHistoryList();
        showToast('History cleared');
      }
    });
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // API settings
    apiKeyInput.addEventListener('input', saveApiKey);
    openaiModelSelect.addEventListener('change', saveSettings);
    toggleApiKeyVisibilityBtn.addEventListener('click', toggleApiKeyVisibility);
    testApiBtn.addEventListener('click', testApiConnection);

    // Settings changes
    defaultTemplateSelect.addEventListener('change', saveSettings);
    maxCommentsInput.addEventListener('change', saveSettings);
    autoClosePopupCheckbox.addEventListener('change', saveSettings);
    showNotificationCheckbox.addEventListener('change', saveSettings);
    autoDetectTypeCheckbox.addEventListener('change', saveSettings);
    showBadgeIndicatorCheckbox.addEventListener('change', saveSettings);
    autoOpenPopupCheckbox.addEventListener('change', () => {
      updateAutoGenerateState();
      saveSettings();
    });
    autoGeneratePromptCheckbox.addEventListener('change', saveSettings);
    includeCommentsCheckbox.addEventListener('change', saveSettings);
    includeCodeBlocksCheckbox.addEventListener('change', saveSettings);
    includePRsCheckbox.addEventListener('change', saveSettings);

    // Template management
    addTemplateBtn.addEventListener('click', openAddTemplateModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelTemplateBtn.addEventListener('click', closeModal);
    saveTemplateBtn.addEventListener('click', saveTemplate);

    // Modal backdrop click to close
    templateModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !templateModal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Import/Export
    exportBtn.addEventListener('click', exportTemplates);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        importTemplates(e.target.files[0]);
        e.target.value = ''; // Reset input
      }
    });

    // History
    clearHistoryBtn.addEventListener('click', clearHistory);
  }

  /**
   * Escape HTML special characters
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Format date for display
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Show a toast notification
   */
  function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.options-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'options-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: #238636;
      color: white;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 2000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // Add toast animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Initialize
  init();
})();

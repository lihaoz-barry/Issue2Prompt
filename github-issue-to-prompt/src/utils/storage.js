/**
 * Chrome Storage Wrapper
 * Provides a simplified interface for Chrome storage operations
 */

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
  maxComments: 5
};

const MAX_HISTORY_ITEMS = 5;

/**
 * Get data from Chrome storage
 * @param {string} key - Storage key
 * @returns {Promise<any>} - Stored value or null
 */
async function get(key) {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  } catch (error) {
    console.error('Storage get error:', error);
    return null;
  }
}

/**
 * Set data in Chrome storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<boolean>} - Success status
 */
async function set(key, value) {
  try {
    await chrome.storage.local.set({ [key]: value });
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

/**
 * Get user settings with defaults
 * @returns {Promise<Object>} - Settings object
 */
async function getSettings() {
  const settings = await get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...settings };
}

/**
 * Update user settings
 * @param {Object} newSettings - Settings to update
 * @returns {Promise<boolean>} - Success status
 */
async function updateSettings(newSettings) {
  const currentSettings = await getSettings();
  const mergedSettings = { ...currentSettings, ...newSettings };
  return set(STORAGE_KEYS.SETTINGS, mergedSettings);
}

/**
 * Get custom templates
 * @returns {Promise<Array>} - Array of custom templates
 */
async function getCustomTemplates() {
  const templates = await get(STORAGE_KEYS.CUSTOM_TEMPLATES);
  return templates || [];
}

/**
 * Add a custom template
 * @param {Object} template - Template object with id, name, content
 * @returns {Promise<boolean>} - Success status
 */
async function addCustomTemplate(template) {
  const templates = await getCustomTemplates();
  const newTemplate = {
    ...template,
    id: template.id || `custom-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  templates.push(newTemplate);
  return set(STORAGE_KEYS.CUSTOM_TEMPLATES, templates);
}

/**
 * Update a custom template
 * @param {string} id - Template ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} - Success status
 */
async function updateCustomTemplate(id, updates) {
  const templates = await getCustomTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return false;

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return set(STORAGE_KEYS.CUSTOM_TEMPLATES, templates);
}

/**
 * Delete a custom template
 * @param {string} id - Template ID
 * @returns {Promise<boolean>} - Success status
 */
async function deleteCustomTemplate(id) {
  const templates = await getCustomTemplates();
  const filtered = templates.filter(t => t.id !== id);
  return set(STORAGE_KEYS.CUSTOM_TEMPLATES, filtered);
}

/**
 * Get prompt generation history
 * @returns {Promise<Array>} - Array of history items
 */
async function getHistory() {
  const history = await get(STORAGE_KEYS.HISTORY);
  return history || [];
}

/**
 * Add item to history (FIFO, max 5 items)
 * @param {Object} item - History item
 * @returns {Promise<boolean>} - Success status
 */
async function addToHistory(item) {
  let history = await getHistory();

  const historyItem = {
    ...item,
    generatedAt: new Date().toISOString()
  };

  // Add to beginning of array
  history.unshift(historyItem);

  // Keep only MAX_HISTORY_ITEMS
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }

  return set(STORAGE_KEYS.HISTORY, history);
}

/**
 * Clear history
 * @returns {Promise<boolean>} - Success status
 */
async function clearHistory() {
  return set(STORAGE_KEYS.HISTORY, []);
}

/**
 * Get cached issue data
 * @returns {Promise<Object|null>} - Cached data or null
 */
async function getCache() {
  return get(STORAGE_KEYS.CACHE);
}

/**
 * Set cached issue data
 * @param {string} url - Issue URL
 * @param {Object} data - Extracted issue data
 * @returns {Promise<boolean>} - Success status
 */
async function setCache(url, data) {
  const cache = {
    currentIssueUrl: url,
    extractedData: data,
    extractedAt: new Date().toISOString()
  };
  return set(STORAGE_KEYS.CACHE, cache);
}

/**
 * Clear cache
 * @returns {Promise<boolean>} - Success status
 */
async function clearCache() {
  return set(STORAGE_KEYS.CACHE, null);
}

/**
 * Export all custom templates as JSON
 * @returns {Promise<string>} - JSON string
 */
async function exportTemplates() {
  const templates = await getCustomTemplates();
  return JSON.stringify(templates, null, 2);
}

/**
 * Import custom templates from JSON
 * @param {string} jsonString - JSON string of templates
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
async function importTemplates(jsonString) {
  try {
    const templates = JSON.parse(jsonString);

    if (!Array.isArray(templates)) {
      return { success: false, count: 0, error: 'Invalid format: expected an array' };
    }

    // Validate template structure
    for (const template of templates) {
      if (!template.name || !template.content) {
        return { success: false, count: 0, error: 'Invalid template: missing name or content' };
      }
    }

    // Add imported templates with new IDs
    const existingTemplates = await getCustomTemplates();
    const newTemplates = templates.map(t => ({
      ...t,
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      imported: true
    }));

    const allTemplates = [...existingTemplates, ...newTemplates];
    await set(STORAGE_KEYS.CUSTOM_TEMPLATES, allTemplates);

    return { success: true, count: newTemplates.length };
  } catch (error) {
    return { success: false, count: 0, error: error.message };
  }
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEYS,
    DEFAULT_SETTINGS,
    get,
    set,
    getSettings,
    updateSettings,
    getCustomTemplates,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    getHistory,
    addToHistory,
    clearHistory,
    getCache,
    setCache,
    clearCache,
    exportTemplates,
    importTemplates
  };
}

// Make available globally for content scripts
window.Storage = {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  get,
  set,
  getSettings,
  updateSettings,
  getCustomTemplates,
  addCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
  getHistory,
  addToHistory,
  clearHistory,
  getCache,
  setCache,
  clearCache,
  exportTemplates,
  importTemplates
};

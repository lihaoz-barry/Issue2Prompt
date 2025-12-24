/**
 * Template Engine
 * Handles variable substitution, conditionals, and loops in templates
 */

/**
 * Render a template with the given data
 * @param {string} template - Template string with placeholders
 * @param {Object} issueData - Extracted issue data
 * @param {Object} settings - User settings
 * @returns {string} Rendered template
 */
function renderTemplate(template, issueData, settings = {}) {
  // Prepare flat data context from nested issueData
  const context = prepareContext(issueData, settings);

  // Process conditionals first
  let result = processConditionals(template, context);

  // Process loops
  result = processLoops(result, context);

  // Replace variables
  result = replaceVariables(result, context);

  // Clean up empty lines and whitespace
  result = cleanupOutput(result);

  return result;
}

/**
 * Prepare a flat context object from nested issue data
 * @param {Object} issueData - Nested issue data
 * @param {Object} settings - User settings
 * @returns {Object} Flat context for template rendering
 */
function prepareContext(issueData, settings = {}) {
  const metadata = issueData.metadata || {};
  const content = issueData.content || {};
  const comments = issueData.comments || [];
  const linkedItems = issueData.linkedItems || {};

  // Filter comments based on settings
  const relevantComments = comments.filter(c => c.isRelevant);
  const maxComments = settings.maxComments || 5;
  const limitedComments = settings.includeComments !== false
    ? relevantComments.slice(0, maxComments)
    : [];

  // Format code blocks
  const formattedCodeBlocks = settings.includeCodeBlocks !== false
    ? formatCodeBlocks(content.codeBlocks || [])
    : '';

  // Format error logs
  const formattedErrorLogs = (content.errorLogs || []).join('\n\n');

  // Format reproduction steps
  const formattedReproSteps = (content.reproductionSteps || [])
    .map((step, i) => `${i + 1}. ${step}`)
    .join('\n');

  // Format comments
  const formattedRelevantComments = formatComments(limitedComments);
  const formattedAllComments = formatComments(
    settings.includeComments !== false ? comments.slice(0, maxComments * 2) : []
  );

  // Format linked items
  const formattedPRs = settings.includePRs !== false
    ? (linkedItems.pullRequests || []).join(', ')
    : '';
  const formattedIssues = (linkedItems.relatedIssues || []).join(', ');
  const formattedCommits = (linkedItems.commits || []).join(', ');

  return {
    // Metadata
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

    // Content
    description: content.description || '',
    codeBlocks: formattedCodeBlocks,
    errorLogs: formattedErrorLogs,
    reproductionSteps: formattedReproSteps,
    expectedBehavior: content.expectedBehavior || '',
    actualBehavior: content.actualBehavior || '',
    environment: content.environment || '',

    // Comments
    relevantComments: formattedRelevantComments,
    allComments: formattedAllComments,
    commentCount: comments.length,

    // Linked items
    linkedPRs: formattedPRs,
    relatedIssues: formattedIssues,
    commits: formattedCommits,

    // Arrays for loops
    codeBlocksArray: content.codeBlocks || [],
    commentsArray: limitedComments,
    labelsArray: metadata.labels || [],
    reproStepsArray: content.reproductionSteps || [],

    // Booleans for conditionals
    hasCodeBlocks: (content.codeBlocks || []).length > 0,
    hasErrorLogs: (content.errorLogs || []).length > 0,
    hasReproSteps: (content.reproductionSteps || []).length > 0,
    hasComments: comments.length > 0,
    hasRelevantComments: relevantComments.length > 0,
    hasLinkedPRs: (linkedItems.pullRequests || []).length > 0,
    hasRelatedIssues: (linkedItems.relatedIssues || []).length > 0,
    hasCommits: (linkedItems.commits || []).length > 0,
    hasEnvironment: !!content.environment,
    hasExpectedBehavior: !!content.expectedBehavior,
    hasActualBehavior: !!content.actualBehavior,
    hasMilestone: !!metadata.milestone && metadata.milestone !== 'None'
  };
}

/**
 * Format code blocks for display
 * @param {Array} codeBlocks - Array of code block objects
 * @returns {string} Formatted code blocks
 */
function formatCodeBlocks(codeBlocks) {
  if (!codeBlocks || codeBlocks.length === 0) return '';

  return codeBlocks.map((block, index) => {
    const lang = block.language || 'text';
    const header = codeBlocks.length > 1 ? `### Code Block ${index + 1}` : '';
    return `${header}\n\`\`\`${lang}\n${block.code}\n\`\`\``;
  }).join('\n\n');
}

/**
 * Format comments for display
 * @param {Array} comments - Array of comment objects
 * @returns {string} Formatted comments
 */
function formatComments(comments) {
  if (!comments || comments.length === 0) return '';

  return comments.map((comment, index) => {
    const date = formatDate(comment.createdAt);
    return `### Comment ${index + 1} by @${comment.author} (${date})\n${comment.body}`;
  }).join('\n\n---\n\n');
}

/**
 * Format a date string for display
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Process conditional blocks in template
 * Supports: {{#if variable}}...{{/if}} and {{#if variable}}...{{else}}...{{/if}}
 * @param {string} template - Template string
 * @param {Object} context - Data context
 * @returns {string} Processed template
 */
function processConditionals(template, context) {
  // Pattern for if/else blocks: {{#if var}}content{{else}}altContent{{/if}}
  const ifElsePattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;

  // Pattern for simple if blocks: {{#if var}}content{{/if}}
  const ifPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

  // Process if/else first
  let result = template.replace(ifElsePattern, (match, variable, ifContent, elseContent) => {
    const value = context[variable];
    const isTruthy = value && value !== '' && value !== 'None' &&
      (Array.isArray(value) ? value.length > 0 : true);
    return isTruthy ? ifContent : elseContent;
  });

  // Process simple if blocks
  result = result.replace(ifPattern, (match, variable, content) => {
    const value = context[variable];
    const isTruthy = value && value !== '' && value !== 'None' &&
      (Array.isArray(value) ? value.length > 0 : true);
    return isTruthy ? content : '';
  });

  return result;
}

/**
 * Process loop blocks in template
 * Supports: {{#each array}}...{{/each}}
 * @param {string} template - Template string
 * @param {Object} context - Data context
 * @returns {string} Processed template
 */
function processLoops(template, context) {
  const eachPattern = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return template.replace(eachPattern, (match, arrayName, itemTemplate) => {
    const array = context[arrayName];
    if (!Array.isArray(array) || array.length === 0) return '';

    return array.map((item, index) => {
      let itemResult = itemTemplate;

      // Replace {{this}} with the item (for simple arrays)
      if (typeof item === 'string') {
        itemResult = itemResult.replace(/\{\{this\}\}/g, item);
      }

      // Replace {{@index}} with the index
      itemResult = itemResult.replace(/\{\{@index\}\}/g, String(index));

      // Replace {{@number}} with index + 1
      itemResult = itemResult.replace(/\{\{@number\}\}/g, String(index + 1));

      // Replace item properties for object arrays
      if (typeof item === 'object') {
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          itemResult = itemResult.replace(regex, escapeHtml(String(item[key] || '')));
        });
      }

      return itemResult;
    }).join('\n');
  });
}

/**
 * Replace simple variables in template
 * @param {string} template - Template string
 * @param {Object} context - Data context
 * @returns {string} Template with variables replaced
 */
function replaceVariables(template, context) {
  // Pattern for variables: {{variableName}}
  const varPattern = /\{\{(\w+)\}\}/g;

  return template.replace(varPattern, (match, varName) => {
    const value = context[varName];

    if (value === undefined || value === null) {
      return '';
    }

    if (Array.isArray(value)) {
      return value.join(', ') || '';
    }

    return String(value);
  });
}

/**
 * Escape HTML special characters for safe display
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => htmlEntities[char]);
}

/**
 * Clean up the output by removing excessive whitespace
 * @param {string} output - Rendered output
 * @returns {string} Cleaned output
 */
function cleanupOutput(output) {
  return output
    // Remove more than 2 consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove trailing whitespace from lines
    .replace(/[ \t]+$/gm, '')
    // Trim overall output
    .trim();
}

/**
 * Validate a template string
 * @param {string} template - Template to validate
 * @returns {{valid: boolean, errors: Array<string>}}
 */
function validateTemplate(template) {
  const errors = [];

  // Check for balanced if blocks
  const ifOpens = (template.match(/\{\{#if\s+\w+\}\}/g) || []).length;
  const ifCloses = (template.match(/\{\{\/if\}\}/g) || []).length;
  if (ifOpens !== ifCloses) {
    errors.push(`Unbalanced if blocks: ${ifOpens} opens, ${ifCloses} closes`);
  }

  // Check for balanced each blocks
  const eachOpens = (template.match(/\{\{#each\s+\w+\}\}/g) || []).length;
  const eachCloses = (template.match(/\{\{\/each\}\}/g) || []).length;
  if (eachOpens !== eachCloses) {
    errors.push(`Unbalanced each blocks: ${eachOpens} opens, ${eachCloses} closes`);
  }

  // Check for unclosed variable syntax
  const unclosedVars = template.match(/\{\{[^}]*$/gm);
  if (unclosedVars) {
    errors.push('Unclosed variable syntax detected');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get list of available variables for templates
 * @returns {Array<{name: string, description: string}>}
 */
function getAvailableVariables() {
  return [
    { name: 'repository', description: 'Repository name (owner/repo)' },
    { name: 'issueNumber', description: 'Issue number' },
    { name: 'title', description: 'Issue title' },
    { name: 'url', description: 'Issue URL' },
    { name: 'author', description: 'Issue author username' },
    { name: 'createdAt', description: 'Creation date' },
    { name: 'state', description: 'Issue state (open/closed)' },
    { name: 'labels', description: 'Comma-separated labels' },
    { name: 'assignees', description: 'Comma-separated assignees' },
    { name: 'milestone', description: 'Milestone name' },
    { name: 'description', description: 'Full issue description' },
    { name: 'codeBlocks', description: 'Formatted code blocks' },
    { name: 'errorLogs', description: 'Extracted error logs' },
    { name: 'reproductionSteps', description: 'Numbered reproduction steps' },
    { name: 'expectedBehavior', description: 'Expected behavior text' },
    { name: 'actualBehavior', description: 'Actual behavior text' },
    { name: 'environment', description: 'Environment information' },
    { name: 'relevantComments', description: 'Relevant technical comments' },
    { name: 'allComments', description: 'All comments (limited)' },
    { name: 'commentCount', description: 'Total comment count' },
    { name: 'linkedPRs', description: 'Linked pull requests' },
    { name: 'relatedIssues', description: 'Related issues' },
    { name: 'commits', description: 'Referenced commits' }
  ];
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderTemplate,
    prepareContext,
    formatCodeBlocks,
    formatComments,
    formatDate,
    processConditionals,
    processLoops,
    replaceVariables,
    escapeHtml,
    cleanupOutput,
    validateTemplate,
    getAvailableVariables
  };
}

// Make available globally
window.TemplateEngine = {
  renderTemplate,
  prepareContext,
  formatCodeBlocks,
  formatComments,
  formatDate,
  processConditionals,
  processLoops,
  replaceVariables,
  escapeHtml,
  cleanupOutput,
  validateTemplate,
  getAvailableVariables
};

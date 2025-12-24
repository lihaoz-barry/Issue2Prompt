/**
 * Default Prompt Templates
 * Each template includes an id, name, description, and content with variable placeholders
 */

const DEFAULT_TEMPLATES = [
  {
    id: 'bug-fix',
    name: 'Bug Fix',
    description: 'Template for bug reports and fixes',
    type: 'bug',
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
  {
    id: 'feature-request',
    name: 'Feature Request',
    description: 'Template for new feature implementations',
    type: 'feature',
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
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Template for code review assistance',
    type: 'review',
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
  {
    id: 'question-help',
    name: 'Question / Help',
    description: 'Template for questions and help requests',
    type: 'question',
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
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Compact template with essential information only',
    type: 'any',
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
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Comprehensive template with all available information',
    type: 'any',
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
];

// Map issue types to recommended templates
const TYPE_TEMPLATE_MAP = {
  'bug': 'bug-fix',
  'feature': 'feature-request',
  'documentation': 'feature-request',
  'question': 'question-help'
};

/**
 * Get all default templates
 * @returns {Array} Array of template objects
 */
function getDefaultTemplates() {
  return DEFAULT_TEMPLATES;
}

/**
 * Get a specific default template by ID
 * @param {string} id - Template ID
 * @returns {Object|null} Template object or null
 */
function getDefaultTemplateById(id) {
  return DEFAULT_TEMPLATES.find(t => t.id === id) || null;
}

/**
 * Get recommended template ID for an issue type
 * @param {string} issueType - Issue type
 * @returns {string} Template ID
 */
function getRecommendedTemplateId(issueType) {
  return TYPE_TEMPLATE_MAP[issueType] || 'bug-fix';
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_TEMPLATES,
    TYPE_TEMPLATE_MAP,
    getDefaultTemplates,
    getDefaultTemplateById,
    getRecommendedTemplateId
  };
}

// Make available globally
window.DefaultTemplates = {
  DEFAULT_TEMPLATES,
  TYPE_TEMPLATE_MAP,
  getDefaultTemplates,
  getDefaultTemplateById,
  getRecommendedTemplateId
};

/**
 * GitHub Issue Parser
 * Extracts structured data from GitHub issue pages
 */

/**
 * Parse the GitHub issue page and extract all relevant information
 * @returns {Object} Structured issue data
 */
function parseIssuePage() {
  const issueData = {
    metadata: extractMetadata(),
    content: extractContent(),
    comments: extractComments(),
    linkedItems: extractLinkedItems()
  };

  return issueData;
}

/**
 * Extract issue metadata from the page
 * @returns {Object} Metadata object
 */
function extractMetadata() {
  const url = window.location.href;
  const pathMatch = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);

  const metadata = {
    repository: pathMatch ? `${pathMatch[1]}/${pathMatch[2]}` : '',
    issueNumber: pathMatch ? parseInt(pathMatch[3]) : 0,
    title: '',
    url: url,
    author: '',
    createdAt: '',
    state: 'open',
    labels: [],
    assignees: [],
    milestone: ''
  };

  // Extract title
  const titleElement = document.querySelector('.js-issue-title, [data-hovercard-type="issue"] .markdown-title, .gh-header-title .js-issue-title');
  if (titleElement) {
    metadata.title = titleElement.textContent.trim();
  }

  // Extract author
  const authorElement = document.querySelector('.author, .js-issue-header-byline .author, a.author');
  if (authorElement) {
    metadata.author = authorElement.textContent.trim();
  }

  // Extract created date
  const timeElement = document.querySelector('.js-issue-header-byline relative-time, relative-time');
  if (timeElement) {
    metadata.createdAt = timeElement.getAttribute('datetime') || '';
  }

  // Extract state (open/closed)
  const stateElement = document.querySelector('.State, [title="Status: Open"], [title="Status: Closed"], .gh-header-meta .State');
  if (stateElement) {
    const stateText = stateElement.textContent.trim().toLowerCase();
    metadata.state = stateText.includes('closed') ? 'closed' : 'open';
  }

  // Extract labels
  const labelElements = document.querySelectorAll('.js-issue-labels .IssueLabel, .sidebar-labels .IssueLabel, .js-issue-labels a, [data-name]');
  metadata.labels = Array.from(labelElements).map(el => {
    return el.getAttribute('data-name') || el.textContent.trim();
  }).filter(l => l);

  // Extract assignees
  const assigneeElements = document.querySelectorAll('.js-issue-assignees .assignee, .sidebar-assignee .assignee, .css-truncate-target');
  metadata.assignees = Array.from(assigneeElements)
    .map(el => el.textContent.trim())
    .filter(a => a && a !== 'No one');

  // Extract milestone
  const milestoneElement = document.querySelector('.sidebar-milestone a, .js-issue-milestone a');
  if (milestoneElement) {
    metadata.milestone = milestoneElement.textContent.trim();
  }

  return metadata;
}

/**
 * Extract the main content of the issue
 * @returns {Object} Content object with description, code blocks, etc.
 */
function extractContent() {
  const content = {
    description: '',
    codeBlocks: [],
    errorLogs: [],
    reproductionSteps: [],
    expectedBehavior: '',
    actualBehavior: '',
    environment: ''
  };

  // Get the issue body
  const bodyElement = document.querySelector('.js-comment-body, .comment-body, .markdown-body');
  if (bodyElement) {
    content.description = bodyElement.innerText.trim();

    // Extract code blocks
    content.codeBlocks = extractCodeBlocks(bodyElement);

    // Extract error logs from code blocks
    content.errorLogs = extractErrorLogs(content.codeBlocks, content.description);

    // Extract reproduction steps
    content.reproductionSteps = extractReproductionSteps(content.description);

    // Extract expected vs actual behavior
    const behaviors = extractBehaviors(content.description);
    content.expectedBehavior = behaviors.expected;
    content.actualBehavior = behaviors.actual;

    // Extract environment info
    content.environment = extractEnvironmentInfo(content.description);
  }

  return content;
}

/**
 * Extract code blocks from a container element
 * @param {Element} container - DOM element containing the content
 * @returns {Array<Object>} Array of code block objects
 */
function extractCodeBlocks(container) {
  const codeBlocks = [];
  const preElements = container.querySelectorAll('pre');

  preElements.forEach((pre, index) => {
    const codeElement = pre.querySelector('code');
    const code = codeElement ? codeElement.textContent : pre.textContent;

    // Try to detect language from class
    let language = 'text';
    if (codeElement) {
      const langClass = Array.from(codeElement.classList).find(c =>
        c.startsWith('language-') || c.startsWith('highlight-')
      );
      if (langClass) {
        language = langClass.replace(/^(language-|highlight-)/, '');
      }
    }

    codeBlocks.push({
      language: language,
      code: code.trim(),
      index: index
    });
  });

  return codeBlocks;
}

/**
 * Extract error logs from code blocks and text
 * @param {Array<Object>} codeBlocks - Extracted code blocks
 * @param {string} description - Issue description text
 * @returns {Array<string>} Array of error log strings
 */
function extractErrorLogs(codeBlocks, description) {
  const errorPatterns = [
    /Error:.*$/gim,
    /Exception:.*$/gim,
    /Traceback.*$/gim,
    /FATAL:.*$/gim,
    /FAILED:.*$/gim,
    /panic:.*$/gim,
    /TypeError:.*$/gim,
    /ReferenceError:.*$/gim,
    /SyntaxError:.*$/gim
  ];

  const errorLogs = [];

  // Check code blocks for error patterns
  codeBlocks.forEach(block => {
    errorPatterns.forEach(pattern => {
      const matches = block.code.match(pattern);
      if (matches) {
        errorLogs.push(...matches);
      }
    });

    // Check if the entire block looks like an error/stack trace
    if (block.code.includes('at ') && block.code.includes(':')) {
      if (block.code.includes('Error') || block.code.includes('Exception')) {
        if (!errorLogs.includes(block.code)) {
          errorLogs.push(block.code);
        }
      }
    }
  });

  return [...new Set(errorLogs)]; // Remove duplicates
}

/**
 * Extract reproduction steps from the description
 * @param {string} description - Issue description
 * @returns {Array<string>} Array of reproduction steps
 */
function extractReproductionSteps(description) {
  const steps = [];

  // Common headers for reproduction steps
  const headers = [
    /(?:steps?\s+to\s+reproduce|reproduction\s+steps?|how\s+to\s+reproduce|reproduce|strs?)[\s:]*\n/i
  ];

  let reproSection = '';

  // Find the reproduction section
  for (const headerPattern of headers) {
    const match = description.match(headerPattern);
    if (match) {
      const startIndex = match.index + match[0].length;
      // Find the next section or end of text
      const nextSectionMatch = description.slice(startIndex).match(/\n\s*(?:#{1,3}\s|\*\*[A-Z])/);
      const endIndex = nextSectionMatch ? startIndex + nextSectionMatch.index : description.length;
      reproSection = description.slice(startIndex, endIndex);
      break;
    }
  }

  if (reproSection) {
    // Extract numbered or bulleted items
    const lines = reproSection.split('\n');
    lines.forEach(line => {
      const cleanLine = line.trim();
      // Match numbered items (1. 2. etc) or bullet points (- * etc)
      const stepMatch = cleanLine.match(/^(?:\d+[\.\)]\s*|[-*•]\s*)(.+)/);
      if (stepMatch) {
        steps.push(stepMatch[1].trim());
      }
    });
  }

  return steps;
}

/**
 * Extract expected and actual behavior sections
 * @param {string} description - Issue description
 * @returns {Object} Object with expected and actual behavior
 */
function extractBehaviors(description) {
  const behaviors = {
    expected: '',
    actual: ''
  };

  // Expected behavior patterns
  const expectedPatterns = [
    /(?:expected\s+behavior|expected\s+result|what\s+should\s+happen|expected)[\s:]*\n([^\n]*(?:\n(?!(?:actual|current|what\s+happened|instead)).*)*)/i
  ];

  // Actual behavior patterns
  const actualPatterns = [
    /(?:actual\s+behavior|actual\s+result|what\s+happened|current\s+behavior|instead|actual)[\s:]*\n([^\n]*(?:\n(?!(?:expected|steps|environment|additional)).*)*)/i
  ];

  for (const pattern of expectedPatterns) {
    const match = description.match(pattern);
    if (match) {
      behaviors.expected = match[1].trim();
      break;
    }
  }

  for (const pattern of actualPatterns) {
    const match = description.match(pattern);
    if (match) {
      behaviors.actual = match[1].trim();
      break;
    }
  }

  return behaviors;
}

/**
 * Extract environment information from description
 * @param {string} description - Issue description
 * @returns {string} Environment information
 */
function extractEnvironmentInfo(description) {
  const envPatterns = [
    /(?:environment|system\s+info|version|platform|setup)[\s:]*\n([^\n]*(?:\n(?!(?:steps|expected|actual|description|additional)).*)*)/i
  ];

  for (const pattern of envPatterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Try to find version strings in the text
  const versionMatches = description.match(/(?:version|v)[\s:]*[\d.]+(?:\s*[-–]\s*\w+)?/gi);
  if (versionMatches) {
    return versionMatches.join(', ');
  }

  return '';
}

/**
 * Extract comments from the issue page
 * @returns {Array<Object>} Array of comment objects
 */
function extractComments() {
  const comments = [];
  const commentContainers = document.querySelectorAll('.timeline-comment, .js-timeline-item');

  commentContainers.forEach((container, index) => {
    // Skip the first one if it's the issue body
    if (index === 0 && container.querySelector('.js-comment-body')) {
      const isIssueBody = container.closest('.js-quote-selection-container');
      if (isIssueBody && container.querySelector('[id^="issue-"]')) {
        return;
      }
    }

    const authorElement = container.querySelector('.author, a.author');
    const timeElement = container.querySelector('relative-time');
    const bodyElement = container.querySelector('.comment-body, .markdown-body');

    if (bodyElement && bodyElement.textContent.trim()) {
      const comment = {
        author: authorElement ? authorElement.textContent.trim() : 'Unknown',
        createdAt: timeElement ? timeElement.getAttribute('datetime') : '',
        body: bodyElement.innerText.trim(),
        isRelevant: false
      };

      // Check if comment is relevant (contains technical content)
      comment.isRelevant = isRelevantComment(comment);

      comments.push(comment);
    }
  });

  return comments;
}

/**
 * Determine if a comment contains relevant technical content
 * @param {Object} comment - Comment object
 * @returns {boolean} Whether the comment is relevant
 */
function isRelevantComment(comment) {
  const body = comment.body;

  // Skip very short comments
  if (body.length < 20) return false;

  // Skip pure emoji or reaction comments
  if (/^[\s\p{Emoji}\p{Emoji_Presentation}+1👍👎❤️🎉😕🚀👀]+$/u.test(body)) return false;

  // Skip simple agreement comments
  const simplePatterns = [
    /^\+1$/i,
    /^same\s*(here)?$/i,
    /^me\s+too$/i,
    /^i\s+agree$/i,
    /^this$/i,
    /^bump$/i
  ];

  for (const pattern of simplePatterns) {
    if (pattern.test(body.trim())) return false;
  }

  // Mark as relevant if contains technical keywords
  const technicalPatterns = [
    /error/i,
    /exception/i,
    /bug/i,
    /fix(?:ed)?/i,
    /solution/i,
    /workaround/i,
    /tried/i,
    /works?/i,
    /issue/i,
    /problem/i,
    /```/, // Contains code block
    /\b(function|class|const|let|var|import|export|return)\b/, // Code keywords
    /https?:\/\//i, // Contains URL
    /version/i,
    /update/i
  ];

  for (const pattern of technicalPatterns) {
    if (pattern.test(body)) return true;
  }

  return false;
}

/**
 * Filter comments to only include relevant ones
 * @param {Array<Object>} comments - All comments
 * @returns {Array<Object>} Filtered relevant comments
 */
function filterRelevantComments(comments) {
  return comments.filter(c => c.isRelevant);
}

/**
 * Extract linked PRs, issues, and commits
 * @returns {Object} Linked items
 */
function extractLinkedItems() {
  const linkedItems = {
    pullRequests: [],
    relatedIssues: [],
    commits: []
  };

  // Find PR references
  const prLinks = document.querySelectorAll('a[href*="/pull/"]');
  prLinks.forEach(link => {
    const match = link.href.match(/\/pull\/(\d+)/);
    if (match) {
      const prRef = `#${match[1]}`;
      if (!linkedItems.pullRequests.includes(prRef)) {
        linkedItems.pullRequests.push(prRef);
      }
    }
  });

  // Find issue references (excluding current issue)
  const currentIssueNum = window.location.pathname.match(/\/issues\/(\d+)/)?.[1];
  const issueLinks = document.querySelectorAll('a[href*="/issues/"]');
  issueLinks.forEach(link => {
    const match = link.href.match(/\/issues\/(\d+)/);
    if (match && match[1] !== currentIssueNum) {
      const issueRef = `#${match[1]}`;
      if (!linkedItems.relatedIssues.includes(issueRef)) {
        linkedItems.relatedIssues.push(issueRef);
      }
    }
  });

  // Find commit references
  const commitLinks = document.querySelectorAll('a[href*="/commit/"]');
  commitLinks.forEach(link => {
    const match = link.href.match(/\/commit\/([a-f0-9]+)/i);
    if (match) {
      const shortSha = match[1].substring(0, 7);
      if (!linkedItems.commits.includes(shortSha)) {
        linkedItems.commits.push(shortSha);
      }
    }
  });

  return linkedItems;
}

/**
 * Detect the type of issue based on labels and content
 * @param {Object} issueData - Extracted issue data
 * @returns {string} Issue type: 'bug' | 'feature' | 'documentation' | 'question'
 */
function detectIssueType(issueData) {
  const labels = issueData.metadata.labels.map(l => l.toLowerCase());
  const title = issueData.metadata.title.toLowerCase();
  const description = issueData.content.description.toLowerCase();

  // Check labels first (highest priority)
  if (labels.some(l => l.includes('bug') || l.includes('defect') || l.includes('error'))) {
    return 'bug';
  }
  if (labels.some(l => l.includes('feature') || l.includes('enhancement') || l.includes('request'))) {
    return 'feature';
  }
  if (labels.some(l => l.includes('doc') || l.includes('documentation'))) {
    return 'documentation';
  }
  if (labels.some(l => l.includes('question') || l.includes('help') || l.includes('support'))) {
    return 'question';
  }

  // Check content for bug indicators
  const bugIndicators = ['bug', 'error', 'crash', 'fail', 'broken', 'not working', 'issue', 'problem'];
  const hasBugIndicators = bugIndicators.some(indicator =>
    title.includes(indicator) || description.includes(indicator)
  );

  if (hasBugIndicators || issueData.content.errorLogs.length > 0) {
    return 'bug';
  }

  // Check for feature indicators
  const featureIndicators = ['feature', 'add', 'support', 'implement', 'request', 'would be nice', 'suggestion'];
  const hasFeatureIndicators = featureIndicators.some(indicator =>
    title.includes(indicator) || description.includes(indicator)
  );

  if (hasFeatureIndicators) {
    return 'feature';
  }

  // Check for question indicators
  const questionIndicators = ['how to', 'how do', 'what is', 'why does', 'can i', 'is it possible', '?'];
  const hasQuestionIndicators = questionIndicators.some(indicator =>
    title.includes(indicator)
  );

  if (hasQuestionIndicators) {
    return 'question';
  }

  // Default to feature if no clear indicators
  return 'feature';
}

/**
 * Get statistics about extracted data
 * @param {Object} issueData - Extracted issue data
 * @returns {Object} Statistics object
 */
function getExtractionStats(issueData) {
  return {
    codeBlockCount: issueData.content.codeBlocks.length,
    errorLogCount: issueData.content.errorLogs.length,
    commentCount: issueData.comments.length,
    relevantCommentCount: issueData.comments.filter(c => c.isRelevant).length,
    labelCount: issueData.metadata.labels.length,
    linkedPRCount: issueData.linkedItems.pullRequests.length,
    linkedIssueCount: issueData.linkedItems.relatedIssues.length,
    hasReproSteps: issueData.content.reproductionSteps.length > 0,
    hasEnvironment: !!issueData.content.environment
  };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseIssuePage,
    extractMetadata,
    extractContent,
    extractCodeBlocks,
    extractErrorLogs,
    extractReproductionSteps,
    extractBehaviors,
    extractEnvironmentInfo,
    extractComments,
    isRelevantComment,
    filterRelevantComments,
    extractLinkedItems,
    detectIssueType,
    getExtractionStats
  };
}

// Make available globally
window.Parser = {
  parseIssuePage,
  extractMetadata,
  extractContent,
  extractCodeBlocks,
  extractErrorLogs,
  extractReproductionSteps,
  extractBehaviors,
  extractEnvironmentInfo,
  extractComments,
  isRelevantComment,
  filterRelevantComments,
  extractLinkedItems,
  detectIssueType,
  getExtractionStats
};

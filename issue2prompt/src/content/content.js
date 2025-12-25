/**
 * Content Script - Issue2Prompt
 * Injects the "Generate AI Prompt" button into GitHub issue pages
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.issue2promptInjected) return;
  window.issue2promptInjected = true;

  // Configuration
  const BUTTON_ID = 'issue2prompt-btn';
  const TOAST_ID = 'issue2prompt-toast';

  /**
   * Initialize the extension
   */
  function init() {
    // Wait for the page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  /**
   * Called when DOM is ready
   */
  function onReady() {
    // Check if we're on an issue page
    if (!isIssuePage()) return;

    // Inject the button
    injectButton();

    // Watch for dynamic page changes (GitHub uses pjax/turbo)
    observePageChanges();
  }

  /**
   * Check if current page is a GitHub issue page
   * @returns {boolean}
   */
  function isIssuePage() {
    return /github\.com\/[^/]+\/[^/]+\/issues\/\d+/.test(window.location.href);
  }

  /**
   * Inject the "Generate AI Prompt" button
   */
  function injectButton() {
    // Don't inject if already exists
    if (document.getElementById(BUTTON_ID)) return;

    // Find the best location to inject the button
    const targetContainer = findButtonContainer();
    if (!targetContainer) {
      console.log('[Issue2Prompt] Could not find suitable container for button');
      return;
    }

    // Create the button
    const button = createButton();

    // Insert the button
    targetContainer.appendChild(button);
  }

  /**
   * Find the appropriate container for the button
   * @returns {Element|null}
   */
  function findButtonContainer() {
    // Try multiple possible locations in order of preference

    // Option 1: Issue header actions area (new GitHub UI)
    let container = document.querySelector('.gh-header-actions');
    if (container) return container;

    // Option 2: Modern GitHub UI (Voltron/React) - near "New issue" button
    const newIssueBtn = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.trim() === 'New issue');
    if (newIssueBtn && newIssueBtn.parentElement) {
      return newIssueBtn.parentElement;
    }

    // Option 3: Issue title area (classic)
    container = document.querySelector('.js-issue-title-container');
    if (container) {
      const wrapper = document.createElement('div');
      wrapper.className = 'issue2prompt-container';
      wrapper.style.cssText = 'display: inline-flex; margin-left: 8px; vertical-align: middle;';
      container.appendChild(wrapper);
      return wrapper;
    }

    // Option 4: Modern Title area
    const h1 = Array.from(document.querySelectorAll('h1')).find(el => el.className.includes('PageHeader-Title'));
    if (h1 && h1.parentElement) {
      const wrapper = document.createElement('div');
      wrapper.className = 'issue2prompt-container';
      wrapper.style.cssText = 'display: inline-flex; margin-left: 8px; vertical-align: middle;';
      h1.parentElement.appendChild(wrapper);
      return wrapper;
    }

    // Option 5: Issue sidebar
    container = document.querySelector('.sidebar-assignee') ||
      Array.from(document.querySelectorAll('div, span, h2, h3')).find(el => el.textContent.trim() === 'Assignees')?.closest('div');
    if (container) {
      const wrapper = document.createElement('div');
      wrapper.className = 'issue2prompt-container mt-3';
      container.parentElement.insertBefore(wrapper, container);
      return wrapper;
    }

    return null;
  }

  /**
   * Create the generate prompt button
   * @returns {HTMLButtonElement}
   */
  function createButton() {
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'btn btn-sm issue2prompt-btn';
    button.innerHTML = `
      <svg class="octicon octicon-code mr-1" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25z"></path>
      </svg>
      <span>Generate AI Prompt</span>
    `;

    button.addEventListener('click', handleButtonClick);

    return button;
  }

  /**
   * Handle button click - extract data and generate prompt
   */
  async function handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const originalContent = button.innerHTML;

    try {
      // Show loading state
      button.disabled = true;
      button.innerHTML = `
        <svg class="octicon spin" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm0 14.5a6.5 6.5 0 1 1 6.5-6.5 6.5 6.5 0 0 1-6.5 6.5z" opacity="0.3"/>
          <path d="M8 0v2a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8z"/>
        </svg>
        <span>Extracting...</span>
      `;

      // Extract issue data using the parser
      const issueData = parseIssuePageContent();

      // Send to background script for processing
      chrome.runtime.sendMessage({
        type: 'EXTRACT_ISSUE_DATA',
        data: issueData
      }, response => {
        if (chrome.runtime.lastError) {
          console.error('[Issue2Prompt] Error:', chrome.runtime.lastError);
          showToast('Error extracting data. Please try again.', 'error');
          return;
        }

        if (response && response.success) {
          showToast('Issue data extracted! Open the popup to view and copy the prompt.', 'success');
        } else {
          showToast('Failed to extract issue data.', 'error');
        }
      });

    } catch (error) {
      console.error('[Issue2Prompt] Error:', error);
      showToast('Error: ' + error.message, 'error');
    } finally {
      // Restore button
      button.disabled = false;
      button.innerHTML = originalContent;
    }
  }

  /**
   * Parse the issue page content
   * Inline version of the parser for content script
   * @returns {Object} Issue data
   */
  function parseIssuePageContent() {
    const url = window.location.href;
    const pathMatch = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);

    const issueData = {
      metadata: {
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
      },
      content: {
        description: '',
        codeBlocks: [],
        errorLogs: [],
        reproductionSteps: [],
        expectedBehavior: '',
        actualBehavior: '',
        environment: ''
      },
      comments: [],
      linkedItems: {
        pullRequests: [],
        relatedIssues: [],
        commits: []
      }
    };

    // Extract title - more specific for modern UI to avoid search bar h1
    const titleElement = Array.from(document.querySelectorAll('h1')).find(el => el.className.includes('PageHeader-Title')) ||
      document.querySelector('.js-issue-title, [data-hovercard-type="issue"] .markdown-title, .gh-header-title .js-issue-title, bdi.js-issue-title');
    if (titleElement) {
      issueData.metadata.title = titleElement.textContent.trim();
    }

    // Extract author
    const authorElement = document.querySelector('.author, .js-issue-header-byline .author, a.author');
    if (authorElement) {
      issueData.metadata.author = authorElement.textContent.trim();
    }

    // Extract created date
    const timeElement = document.querySelector('.js-issue-header-byline relative-time, relative-time');
    if (timeElement) {
      issueData.metadata.createdAt = timeElement.getAttribute('datetime') || '';
    }

    // Extract state
    const stateElement = document.querySelector('.State, [title="Status: Open"], [title="Status: Closed"]') ||
      Array.from(document.querySelectorAll('span, div')).find(el => el.textContent.trim() === 'Open' || el.textContent.trim() === 'Closed');
    if (stateElement) {
      const stateText = stateElement.textContent.trim().toLowerCase();
      issueData.metadata.state = stateText.includes('closed') ? 'closed' : 'open';
    }

    // Extract labels
    const labelElements = document.querySelectorAll('.js-issue-labels .IssueLabel, .sidebar-labels .IssueLabel, .js-issue-labels a[data-name], [data-name]');
    issueData.metadata.labels = Array.from(labelElements)
      .map(el => el.getAttribute('data-name') || el.textContent.trim())
      .filter(l => l && l.length > 0);

    // Extract assignees
    const assigneeElements = document.querySelectorAll('.js-issue-assignees .assignee, .sidebar-assignee .assignee');
    issueData.metadata.assignees = Array.from(assigneeElements)
      .map(el => el.textContent.trim())
      .filter(a => a && a !== 'No one' && a.length > 0);

    // Extract milestone
    const milestoneElement = document.querySelector('.sidebar-milestone a, .js-issue-milestone a');
    if (milestoneElement) {
      issueData.metadata.milestone = milestoneElement.textContent.trim();
    }

    // Get the issue body - try multiple selectors
    const bodyElement = document.querySelector('.js-comment-body, .comment-body, .markdown-body, [data-testid="issue-body"]');
    if (bodyElement) {
      issueData.content.description = bodyElement.innerText.trim();

      // Extract code blocks
      const preElements = bodyElement.querySelectorAll('pre');
      preElements.forEach((pre, index) => {
        const codeElement = pre.querySelector('code');
        const code = codeElement ? codeElement.textContent : pre.textContent;

        let language = 'text';
        if (codeElement) {
          const langClass = Array.from(codeElement.classList).find(c =>
            c.startsWith('language-') || c.startsWith('highlight-')
          );
          if (langClass) {
            language = langClass.replace(/^(language-|highlight-)/, '');
          }
        }

        issueData.content.codeBlocks.push({
          language: language,
          code: code.trim(),
          index: index
        });
      });

      // Extract error logs
      const errorPatterns = [
        /Error:.*$/gim,
        /Exception:.*$/gim,
        /Traceback.*$/gim,
        /TypeError:.*$/gim,
        /SyntaxError:.*$/gim
      ];

      const description = issueData.content.description;
      errorPatterns.forEach(pattern => {
        const matches = description.match(pattern);
        if (matches) {
          issueData.content.errorLogs.push(...matches);
        }
      });

      // Also check code blocks for error patterns
      issueData.content.codeBlocks.forEach(block => {
        if (block.code.includes('Error') || block.code.includes('Exception') ||
          block.code.includes('Traceback')) {
          if (block.code.includes('at ') && block.code.includes(':')) {
            if (!issueData.content.errorLogs.includes(block.code)) {
              issueData.content.errorLogs.push(block.code);
            }
          }
        }
      });

      // Extract reproduction steps
      const reproMatch = description.match(/(?:steps?\s+to\s+reproduce|reproduction\s+steps?|how\s+to\s+reproduce)[\s:]*\n([\s\S]*?)(?=\n\s*(?:#{1,3}\s|\*\*[A-Z])|$)/i);
      if (reproMatch) {
        const lines = reproMatch[1].split('\n');
        lines.forEach(line => {
          const stepMatch = line.trim().match(/^(?:\d+[\.\)]\s*|[-*•]\s*)(.+)/);
          if (stepMatch) {
            issueData.content.reproductionSteps.push(stepMatch[1].trim());
          }
        });
      }

      // Extract expected behavior
      const expectedMatch = description.match(/(?:expected\s+behavior|expected\s+result)[\s:]*\n([^\n]+)/i);
      if (expectedMatch) {
        issueData.content.expectedBehavior = expectedMatch[1].trim();
      }

      // Extract actual behavior
      const actualMatch = description.match(/(?:actual\s+behavior|actual\s+result|current\s+behavior)[\s:]*\n([^\n]+)/i);
      if (actualMatch) {
        issueData.content.actualBehavior = actualMatch[1].trim();
      }

      // Extract environment
      const envMatch = description.match(/(?:environment|system\s+info|version)[\s:]*\n([^\n]+(?:\n[^\n#*]+)*)/i);
      if (envMatch) {
        issueData.content.environment = envMatch[1].trim();
      }
    }

    // Extract comments
    const commentContainers = document.querySelectorAll('.timeline-comment, .js-timeline-item');
    let skipFirst = true;

    commentContainers.forEach(container => {
      // Skip the first comment (issue body)
      if (skipFirst) {
        skipFirst = false;
        return;
      }

      const authorElement = container.querySelector('.author, a.author');
      const timeElement = container.querySelector('relative-time');
      const bodyElement = container.querySelector('.comment-body, .markdown-body');

      if (bodyElement && bodyElement.textContent.trim()) {
        const body = bodyElement.innerText.trim();

        // Skip short or irrelevant comments
        if (body.length < 20) return;
        if (/^[\s+1👍👎❤️🎉]+$/u.test(body)) return;

        // Check if relevant
        const isRelevant = /error|exception|fix|solution|workaround|tried|```|https?:\/\//i.test(body);

        issueData.comments.push({
          author: authorElement ? authorElement.textContent.trim() : 'Unknown',
          createdAt: timeElement ? timeElement.getAttribute('datetime') : '',
          body: body,
          isRelevant: isRelevant
        });
      }
    });

    // Extract linked PRs
    const prLinks = document.querySelectorAll('a[href*="/pull/"]');
    prLinks.forEach(link => {
      const match = link.href.match(/\/pull\/(\d+)/);
      if (match) {
        const prRef = `#${match[1]}`;
        if (!issueData.linkedItems.pullRequests.includes(prRef)) {
          issueData.linkedItems.pullRequests.push(prRef);
        }
      }
    });

    // Extract related issues
    const currentIssueNum = issueData.metadata.issueNumber.toString();
    const issueLinks = document.querySelectorAll('a[href*="/issues/"]');
    issueLinks.forEach(link => {
      const match = link.href.match(/\/issues\/(\d+)/);
      if (match && match[1] !== currentIssueNum) {
        const issueRef = `#${match[1]}`;
        if (!issueData.linkedItems.relatedIssues.includes(issueRef)) {
          issueData.linkedItems.relatedIssues.push(issueRef);
        }
      }
    });

    // Extract commit references
    const commitLinks = document.querySelectorAll('a[href*="/commit/"]');
    commitLinks.forEach(link => {
      const match = link.href.match(/\/commit\/([a-f0-9]+)/i);
      if (match) {
        const shortSha = match[1].substring(0, 7);
        if (!issueData.linkedItems.commits.includes(shortSha)) {
          issueData.linkedItems.commits.push(shortSha);
        }
      }
    });

    return issueData;
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - 'success' or 'error'
   */
  function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.getElementById(TOAST_ID);
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.id = TOAST_ID;
    toast.className = `issue2prompt-toast issue2prompt-toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close">×</button>
    `;

    // Add close handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 300);
    });

    // Add to page
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-hiding');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  /**
   * Observe page changes for SPA navigation
   */
  function observePageChanges() {
    // Listen for URL changes
    let lastUrl = window.location.href;

    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;

        // Small delay to let the new page render
        setTimeout(() => {
          if (isIssuePage()) {
            injectButton();
          }
        }, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also listen for GitHub's turbo navigation
    document.addEventListener('turbo:load', () => {
      if (isIssuePage()) {
        injectButton();
      }
    });

    document.addEventListener('pjax:end', () => {
      if (isIssuePage()) {
        injectButton();
      }
    });
  }

  /**
   * Listen for messages from popup
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'RE_EXTRACT') {
      // Re-extract and send to background
      try {
        const issueData = parseIssuePageContent();
        chrome.runtime.sendMessage({
          type: 'EXTRACT_ISSUE_DATA',
          data: issueData
        }, response => {
          sendResponse({ success: true });
        });
      } catch (error) {
        console.error('[Issue2Prompt] Error during re-extract:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep message channel open for async response
    }
  });

  /**
   * Auto-extract on page load for convenience
   */
  function autoExtractOnLoad() {
    if (!isIssuePage()) return;

    // Wait a bit for the page to fully render
    setTimeout(() => {
      try {
        const issueData = parseIssuePageContent();
        chrome.runtime.sendMessage({
          type: 'EXTRACT_ISSUE_DATA',
          data: issueData
        }, response => {
          if (response && response.success) {
            console.log('[Issue2Prompt] Auto-extracted issue data');
          }
        });
      } catch (error) {
        console.error('[Issue2Prompt] Auto-extract failed:', error);
      }
    }, 1000);
  }

  // Initialize
  init();

  // Auto-extract after init
  if (document.readyState === 'complete') {
    autoExtractOnLoad();
  } else {
    window.addEventListener('load', autoExtractOnLoad);
  }
})();

/**
 * AI Service - OpenAI API Integration
 * Generates intelligent prompts from GitHub issue data
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert at converting GitHub issues into clear, actionable prompts for AI coding assistants. Your task is to analyze the provided issue data and generate a well-structured prompt that will help an AI assistant understand and solve the issue effectively.

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

/**
 * Generate an AI-powered prompt from issue data
 * @param {string} apiKey - OpenAI API key
 * @param {Object} issueData - Extracted issue data
 * @param {Object} options - Generation options
 * @returns {Promise<{success: boolean, prompt?: string, error?: string}>}
 */
async function generatePrompt(apiKey, issueData, options = {}) {
  if (!apiKey) {
    return { success: false, error: 'OpenAI API key is required. Please configure it in settings.' };
  }

  const model = options.model || 'gpt-4o-mini';
  const maxTokens = options.maxTokens || 2000;

  // Prepare the issue data as a structured message
  const issueContext = formatIssueForAI(issueData);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Please analyze the following GitHub issue and generate an optimal prompt for an AI coding assistant to help solve it:\n\n${issueContext}`
          }
        ],
        max_tokens: maxTokens,
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
    console.error('[AIService] Error:', error);
    return { success: false, error: error.message || 'Failed to connect to OpenAI API' };
  }
}

/**
 * Format issue data into a structured text for AI input
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
 * Test the API key by making a simple request
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function testApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
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
      return { valid: true };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      error: errorData.error?.message || `Invalid API key (status ${response.status})`
    };

  } catch (error) {
    return { valid: false, error: error.message || 'Failed to connect to OpenAI' };
  }
}

// Available models
const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cheap)', recommended: true },
  { id: 'gpt-4o', name: 'GPT-4o (Best Quality)' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fastest)' }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generatePrompt,
    formatIssueForAI,
    testApiKey,
    AVAILABLE_MODELS
  };
}

// Make available globally
window.AIService = {
  generatePrompt,
  formatIssueForAI,
  testApiKey,
  AVAILABLE_MODELS
};

---
title: I Built a Chrome Extension to Turn GitHub Issues into AI-Ready Prompts
published: true
description: Stop the copy-paste workflow. Automatically extract GitHub issue context for ChatGPT, Claude, and other AI assistants.
tags: github, ai, productivity, chrome
cover_image: https://raw.githubusercontent.com/lihaoz-barry/Issue2Prompt/main/promotional-assets/popup-prompt-editor.png
---

# I Built a Chrome Extension to Turn GitHub Issues into AI-Ready Prompts

If you've ever asked an AI assistant for help with a GitHub issue, you know the drill:

1. Copy the issue title
2. Copy the description
3. Scroll down and copy the relevant code blocks
4. Find and copy the error message
5. Summarize what people said in the comments
6. Format everything so the AI can understand it
7. Realize you forgot something and go back

I got tired of this workflow, so I built a Chrome extension to automate it.

## What It Does

**Issue2Prompt** extracts all relevant information from any GitHub issue and formats it into a structured prompt ready for Claude, ChatGPT, or any AI coding assistant.

![Extension popup showing generated prompt](https://raw.githubusercontent.com/lihaoz-barry/Issue2Prompt/main/promotional-assets/popup-prompt-editor.png)

### Automatic Extraction

The extension detects when you're on a GitHub issue page and can extract:

- **Metadata**: Title, issue number, labels, state, assignees, milestone
- **Content**: Full description with markdown preserved
- **Code Blocks**: All code snippets with language detection
- **Error Logs**: Stack traces and error messages
- **Reproduction Steps**: When properly formatted in the issue
- **Comments**: Filtered by relevance (technical content prioritized)
- **Linked Items**: Related PRs, issues, and commits

### Template System

Choose from 6 built-in templates:

| Template | Best For |
|----------|----------|
| Bug Fix | Debugging help, root cause analysis |
| Feature Request | Implementation guidance |
| Code Review | Getting feedback on approach |
| Question/Help | Technical questions |
| Minimal | Quick, concise prompts |
| Detailed | Comprehensive context |

Or create your own custom templates using a simple syntax:

```handlebars
# {{title}}

**Repository:** {{repository}}
**Issue:** #{{issueNumber}}

## Description
{{description}}

{{#if codeBlocks}}
## Code
{{codeBlocks}}
{{/if}}

{{#if errorLogs}}
## Errors
{{errorLogs}}
{{/if}}
```

### AI-Powered Generation (Optional)

If you want smarter prompt generation, you can add your OpenAI API key and let GPT analyze the issue to create an optimized prompt. This is optional—the template system works without any API key.

![Settings page with OpenAI configuration](https://raw.githubusercontent.com/lihaoz-barry/Issue2Prompt/main/promotional-assets/settings-page.png)

## Key Features

- **One-click extraction** - Just open the extension on any GitHub issue
- **Visual indicator** - Green badge on the icon when on issue pages
- **Auto-generate option** - Automatically create prompts when you open the popup
- **Custom templates** - Create, edit, import/export your own templates
- **Privacy-first** - No tracking, no data collection, API key stored locally
- **Dark mode** - Follows your system preference
- **Open source** - MIT licensed, contributions welcome

## How to Use

1. Install from Chrome Web Store (link below)
2. Navigate to any GitHub issue
3. Click the extension icon
4. Choose a template or click "Generate with AI"
5. Copy to clipboard
6. Paste into your AI assistant

That's it. What used to take 5 minutes now takes 5 seconds.

## Tech Stack

For those curious about the implementation:

- **Manifest V3** Chrome extension
- **Vanilla JavaScript** - No frameworks, keeps it lightweight
- **OpenAI API** - For optional AI-powered generation
- **Chrome Storage API** - For settings and templates

The content script uses DOM parsing to extract issue data, with specific selectors for GitHub's current UI structure. A MutationObserver handles GitHub's SPA navigation.

## Installation

**Chrome Web Store:** [Link when published]

**GitHub:** [https://github.com/lihaoz-barry/Issue2Prompt](https://github.com/lihaoz-barry/Issue2Prompt)

## What's Next?

Features I'm considering:

- [ ] Support for GitHub Enterprise
- [ ] Firefox extension
- [ ] Local LLM support (Ollama)
- [ ] Anthropic API integration
- [ ] Issue type auto-detection for template selection

## Feedback Welcome

I'd love to hear:
- What templates would you find useful?
- Any bugs or issues?
- Feature requests?

Drop a comment below or open an issue on GitHub!

---

*If this saves you time, consider giving it a star on GitHub. And if you build something cool with it, I'd love to hear about it!*

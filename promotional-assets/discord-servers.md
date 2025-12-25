# Discord Server Promotion

## Target Servers

Look for servers with channels like:
- #tools
- #resources
- #show-your-work
- #self-promotion (some servers have dedicated channels)
- #productivity

### Recommended Servers
1. **Reactiflux** - Large React/JS community
2. **TypeScript Community** - TS developers
3. **Python Discord** - Python developers
4. **The Coding Den** - General programming
5. **SpeakJS** - JavaScript community
6. **Devcord** - Developer community

---

## Message Template (Short Version)

Use this for servers with character limits or #tools channels:

```
🔧 **GitHub Issue to AI Prompt** - Chrome Extension

Converts GitHub issues into formatted prompts for ChatGPT/Claude in one click.

✨ Features:
• Auto-extracts title, code blocks, errors, comments
• 6 built-in templates + custom template support
• Optional AI-powered prompt generation
• Privacy-first, open source

🔗 GitHub: https://github.com/lihaoz-barry/Issue2Prompt
```

---

## Message Template (Detailed Version)

Use this for #show-your-work or #self-promotion channels:

```
👋 Hey everyone! Sharing a Chrome extension I built that might save you some time.

## GitHub Issue to AI Prompt

**The problem:** Every time I wanted AI help with a GitHub issue, I'd spend 5 minutes copying the title, description, code blocks, error logs, and comments... then formatting it all nicely.

**The solution:** One-click extraction from any GitHub issue page.

### What it extracts:
• Issue title, description, labels
• All code blocks (with language detection)
• Error logs and stack traces
• Reproduction steps
• Relevant comments
• Linked PRs

### Features:
• 6 built-in templates (Bug Fix, Feature Request, Code Review, etc.)
• Create your own custom templates
• Optional OpenAI integration for smart prompt generation
• Green badge indicator when on issue pages
• Dark mode support

### Links:
🔗 **GitHub:** https://github.com/lihaoz-barry/Issue2Prompt
🏪 **Chrome Web Store:** [link]

Free & open source. No tracking, no accounts needed.

Let me know if you have any questions or feedback!
```

---

## Embed-Style Message (If server supports rich embeds)

Some Discord bots allow rich embeds. If posting through a bot or webhook:

```json
{
  "embeds": [{
    "title": "GitHub Issue to AI Prompt",
    "description": "Chrome extension that converts GitHub issues into formatted prompts for AI assistants",
    "color": 2067276,
    "fields": [
      {
        "name": "✨ Features",
        "value": "• One-click extraction\n• 6 built-in templates\n• Custom template support\n• AI-powered generation\n• Privacy-first",
        "inline": false
      },
      {
        "name": "🔗 Links",
        "value": "[GitHub](https://github.com/lihaoz-barry/Issue2Prompt) | [Chrome Web Store](link)",
        "inline": false
      }
    ],
    "thumbnail": {
      "url": "https://raw.githubusercontent.com/lihaoz-barry/Issue2Prompt/main/github-issue-to-prompt/icons/icon128.png"
    }
  }]
}
```

---

## Tips for Discord Promotion

1. **Read server rules first** - Many servers have specific self-promotion guidelines
2. **Be active in the community** - Don't just drop a link and leave
3. **Answer questions** - Stick around to help if anyone asks
4. **Don't spam** - One message per server, in the appropriate channel
5. **Add value** - Explain why it's useful, not just what it does

---

## Response Templates

### "Does this work with X AI?"
```
Yes! The prompts are plain text/markdown, so they work with any AI assistant - ChatGPT, Claude, Gemini, local LLMs, etc. The optional AI generation feature uses OpenAI, but the core functionality works without any API.
```

### "Is it safe/privacy concerns?"
```
Fully open source so you can audit the code. No tracking, no analytics, no external servers. Your OpenAI API key (if you use AI features) is stored locally in Chrome and only sent to OpenAI. Nothing else leaves your browser.
```

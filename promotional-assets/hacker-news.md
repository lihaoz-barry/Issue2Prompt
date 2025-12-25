# Hacker News - Show HN Post

## Publishing Instructions

1. Go to [Hacker News](https://news.ycombinator.com/)
2. Log in or create an account
3. Click "submit" at the top
4. Use the format below
5. **Best times:** Weekday mornings (8-10 AM EST)
6. Be ready to respond to comments immediately

---

## Post Format

### Title (80 characters max)
```
Show HN: Issue2Prompt – Chrome extension to convert issues into AI-ready prompts
```

### URL
```
https://github.com/lihaoz-barry/Issue2Prompt
```

### Text (Optional - leave blank if using URL, or use for self-post)
If you want to do a text post instead of link post:

```
I built a Chrome extension that converts GitHub issues into well-structured prompts for AI assistants like Claude or ChatGPT.

The problem: Every time I needed AI help with a GitHub issue, I'd manually copy the title, description, error logs, code blocks, and relevant comments. Then format it. Then realize I missed something.

The solution: Click the extension on any GitHub issue page, and it automatically extracts everything relevant and formats it using customizable templates.

Features:
- Extracts title, description, labels, code blocks, error logs, comments, linked PRs
- 6 built-in templates (Bug Fix, Feature Request, Code Review, etc.)
- Optional OpenAI integration for AI-powered prompt generation
- Create/import/export custom templates
- Privacy-first: API key stored locally, no tracking

Tech stack: Manifest V3 Chrome extension, vanilla JS, OpenAI API (optional)

Chrome Web Store: [link]
GitHub: https://github.com/lihaoz-barry/Issue2Prompt

Would love feedback from the HN community. What would make this more useful for your workflow?
```

---

## Tips for HN Success

1. **Don't ask for upvotes** - against HN rules
2. **Respond to every comment** - engagement matters
3. **Be humble and technical** - HN appreciates substance
4. **Acknowledge limitations** - be honest about what it doesn't do
5. **Share the "why"** - personal story resonates

---

## Prepared Responses

### "Why not just use a bookmarklet?"
```
Good point! A bookmarklet could handle basic extraction. The extension adds:
1. Template system with variable substitution
2. AI-powered prompt optimization
3. Persistent settings and custom templates
4. Better UX with visual feedback
But you're right that for simple cases, a bookmarklet would work.
```

### "Why OpenAI and not local LLM?"
```
OpenAI was the simplest to integrate initially. I'd love to add:
- Ollama support for local models
- Anthropic API for Claude
- Custom API endpoints

PRs welcome if anyone wants to tackle this!
```

### "Privacy concerns with API key storage?"
```
The API key is stored in chrome.storage.local, which is sandboxed to the extension. It's only sent to OpenAI's API when you explicitly click "Generate with AI." No telemetry, no external servers. The extension is fully open source for audit.
```

### "Does this work with GitHub Enterprise?"
```
Currently only tested with github.com. GitHub Enterprise support would need URL pattern updates in the manifest. Happy to add this if there's interest—would just need someone to help test.
```

# Reddit r/programming Post

## Publishing Instructions

1. Go to [r/programming](https://www.reddit.com/r/programming/)
2. Check subreddit rules (no excessive self-promotion)
3. Use "Submit Link" for GitHub repo or "Submit Text" for discussion
4. **Best times:** Weekday mornings EST
5. Engage with comments genuinely

---

## Post Option 1: Link Post

### Title
```
GitHub Issue to AI Prompt - Chrome extension that extracts GitHub issue context for AI assistants
```

### URL
```
https://github.com/lihaoz-barry/Issue2Prompt
```

---

## Post Option 2: Text Post (Recommended for better engagement)

### Title
```
I built a Chrome extension that converts GitHub issues into structured prompts for AI coding assistants
```

### Body
```
I got tired of the manual copy-paste workflow every time I needed AI help with a GitHub issue, so I built a Chrome extension to automate it.

**The Problem**

When asking ChatGPT or Claude for help with a GitHub issue, you typically need to:
1. Copy the issue title and description
2. Copy relevant code blocks
3. Copy error messages/stack traces
4. Summarize the discussion from comments
5. Format everything coherently

**The Solution**

The extension automatically extracts:
- Issue metadata (title, labels, state, assignees)
- Full description with code blocks preserved
- Error logs and stack traces
- Reproduction steps (when formatted properly)
- Relevant comments (filtered by technical content)
- Linked PRs and related issues

Then formats it using templates or optional AI-powered generation.

**Features**
- 6 built-in templates (Bug Fix, Feature Request, Code Review, etc.)
- Custom template support with Handlebars-like syntax
- OpenAI integration for intelligent prompt generation (optional, requires your API key)
- Import/export templates as JSON
- Privacy-first: all data stays local

**Tech Stack**
- Chrome Manifest V3
- Vanilla JavaScript
- OpenAI API (optional)

GitHub: https://github.com/lihaoz-barry/Issue2Prompt

Open to feedback and PRs. What features would make this more useful for your workflow?
```

---

## Flair
Select: `Show r/programming` or relevant flair if available

---

## Engagement Tips

- Don't be defensive about criticism
- Thank people for feedback
- Acknowledge competing solutions
- Share technical decisions when asked

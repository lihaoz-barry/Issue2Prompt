# Reddit r/webdev Post

## Publishing Instructions

1. Go to [r/webdev](https://www.reddit.com/r/webdev/)
2. Use "Showoff Saturday" flair if posting on Saturday (best for self-promotion)
3. Otherwise, frame as sharing a useful tool
4. **Best times:** Saturday for Showoff, otherwise weekday mornings

---

## Post (Showoff Saturday Version)

### Title
```
[Showoff Saturday] Built a Chrome extension that turns GitHub issues into AI prompts - no more copy-paste hell
```

### Body
```
Hey r/webdev!

Sharing a Chrome extension I built to solve a workflow annoyance: converting GitHub issues into prompts for AI assistants.

**Why I built this**

Every time I hit a bug and wanted Claude/ChatGPT's help, I'd spend several minutes:
- Copying issue title and description
- Grabbing the relevant code blocks
- Finding the error logs
- Summarizing what people said in comments
- Formatting it all nicely

Now it's one click.

**What it does**

Opens on any GitHub issue page and extracts:
- Title, description, labels, state
- Code blocks (with language detection)
- Error logs and stack traces
- Reproduction steps
- Relevant comments
- Linked PRs

Then formats using templates or AI.

**Screenshot**

[Main popup interface](https://github.com/lihaoz-barry/Issue2Prompt/blob/main/promotional-assets/popup-prompt-editor.png)

**Features**
- 6 built-in templates (Bug Fix, Feature Request, Code Review, Question, Minimal, Detailed)
- Create custom templates with {{variable}} syntax
- Optional OpenAI integration for smart prompt generation
- Import/export templates
- Dark mode support
- Green badge indicator when on issue pages

**Tech stack**
- Chrome Manifest V3
- Vanilla JS (no frameworks)
- OpenAI API for AI features

**Links**
- GitHub: https://github.com/lihaoz-barry/Issue2Prompt
- Chrome Web Store: [link when published]

Feedback welcome! What templates would you find most useful?
```

---

## Post (Non-Saturday Version)

### Title
```
Made a free tool to stop the GitHub issue → AI prompt copy-paste workflow
```

### Body
```
Quick share of a Chrome extension I made that might save you time.

**Problem:** You're debugging an issue, want AI help, and spend 5 minutes copying the issue title, description, code blocks, error messages, and comments into ChatGPT/Claude.

**Solution:** Extension that extracts everything from a GitHub issue in one click and formats it with templates.

Features:
- Auto-extracts issue metadata, code blocks, errors, comments
- Multiple templates (Bug Fix, Feature Request, Code Review, etc.)
- Custom template support
- Optional AI-powered prompt generation

Free & open source: https://github.com/lihaoz-barry/Issue2Prompt

No tracking, no accounts, API key stays local.
```

---

## Image to Include
Link to screenshot: `promotional-assets/popup-prompt-editor.png`

Upload to Reddit or use GitHub raw URL:
```
https://raw.githubusercontent.com/lihaoz-barry/Issue2Prompt/main/promotional-assets/popup-prompt-editor.png
```

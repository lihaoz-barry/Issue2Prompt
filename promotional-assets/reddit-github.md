# Reddit r/github Post

## Publishing Instructions

1. Go to [r/github](https://www.reddit.com/r/github/)
2. This community appreciates GitHub-focused tools
3. Emphasize the GitHub integration aspect
4. **Best times:** Weekday mornings/evenings

---

## Post

### Title
```
Issue2Prompt - Chrome extension that extracts GitHub issue data into AI-ready prompts
```

### Body
```
Made a tool to streamline getting AI help with GitHub issues.

**What it does:**

Adds functionality to GitHub issue pages - click the extension and it extracts:

- Issue metadata (title, number, labels, state, assignees, milestone)
- Full description with all markdown formatting
- Every code block with language detection
- Error logs and stack traces
- Reproduction steps (when properly formatted)
- Comments filtered by relevance
- Linked PRs, related issues, commits

Then formats everything into a structured prompt for AI assistants.

**Features:**

- **Visual indicator**: Green badge on the extension icon when you're on an issue page
- **6 templates**: Bug Fix, Feature Request, Code Review, Question/Help, Minimal, Detailed
- **Custom templates**: Create your own with {{variable}} syntax
- **Template import/export**: Share templates with your team
- **AI generation**: Optional OpenAI integration for smart prompt creation
- **Privacy-first**: Works entirely locally, no data collection

**Screenshot:**

[Popup interface](https://github.com/lihaoz-barry/Issue2Prompt/blob/main/promotional-assets/popup-prompt-editor.png)

**Tech details:**

- Manifest V3 Chrome extension
- Uses GitHub's DOM structure to extract data
- MutationObserver for SPA navigation
- Chrome Storage API for settings/templates

**Links:**
- GitHub: https://github.com/lihaoz-barry/Issue2Prompt
- Chrome Web Store: [coming soon]

Open source (MIT). PRs welcome - especially for GitHub Enterprise support if anyone wants to help test.

What other GitHub-to-AI workflows would be useful?
```

---

## Flair
Select: `Tool` or most appropriate available flair

---

## GitHub-Specific Questions to Prepare For

### "Does this work with GitHub Enterprise?"
```
Not yet - currently only tested with github.com. The URL patterns in the manifest would need updating for GHE. If anyone uses GHE and wants to help test, I'd happily add support!
```

### "Will this work with GitHub's new issue forms?"
```
Yes, it parses the rendered HTML regardless of whether the issue was created with the classic editor or the new issue forms. As long as GitHub renders it, the extension can extract it.
```

### "Any plans for GitLab/Bitbucket support?"
```
It's technically possible but would require separate extraction logic for each platform's DOM structure. GitHub was the priority since it's what I use most. Open to PRs if someone wants to tackle other platforms!
```

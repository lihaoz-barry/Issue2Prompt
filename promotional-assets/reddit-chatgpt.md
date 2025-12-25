# Reddit r/ChatGPT Post

## Publishing Instructions

1. Go to [r/ChatGPT](https://www.reddit.com/r/ChatGPT/)
2. Check rules - they allow tool sharing if genuinely useful
3. Frame as productivity tip/tool, not pure advertisement
4. Use appropriate flair
5. **Best times:** Weekday evenings, weekends

---

## Post

### Title
```
Made a Chrome extension that formats GitHub issues into proper ChatGPT prompts automatically
```

### Body
```
I kept running into the same problem: I'd find a bug in a GitHub issue, want ChatGPT's help, and spend way too long copying and formatting everything.

So I made a Chrome extension that does it in one click.

**What it does:**

When you're on a GitHub issue page, it extracts:
- Issue title, description, and labels
- All code blocks (with syntax highlighting info)
- Error messages and stack traces
- Reproduction steps
- Relevant comments from the discussion
- Linked pull requests

Then formats it using templates designed for AI prompts, or optionally uses GPT to generate an optimized prompt.

**Example output:**

```
# Bug Fix Request

## Context
**Repository:** owner/repo
**Issue:** #123 - App crashes on login
**Labels:** bug, high-priority

## Problem Description
Users are experiencing crashes when attempting to log in...

## Error Details
```
TypeError: Cannot read property 'user' of undefined
    at LoginController.js:45
```

## Reproduction Steps
1. Open the app
2. Click "Login"
3. Enter credentials
4. App crashes

## Relevant Discussion
@dev1: "This started after the auth refactor..."

## Task
Please analyze this bug and provide:
1. Root cause analysis
2. Proposed solution with code
3. Testing recommendations
```

**Features:**
- 6 built-in templates (Bug Fix, Feature Request, Code Review, etc.)
- Create custom templates
- Optional AI prompt generation (uses your own API key)
- Privacy-first - nothing leaves your browser except API calls you initiate

Free & open source: https://github.com/lihaoz-barry/Issue2Prompt

Happy to answer questions!
```

---

## Flair
Select: `Productivity` or `Tool/Resource`

---

## Follow-up Comments to Prepare

### "Does this work with GPT-4?"
```
Yes! The prompts work with any ChatGPT model. If you use the AI generation feature, you can choose GPT-4, GPT-4o, or GPT-3.5 in the settings.
```

### "Why not just ask ChatGPT to read the GitHub URL?"
```
ChatGPT can't browse URLs in most cases, and even with browsing enabled, it often misses code blocks or truncates long discussions. This extension grabs everything locally and gives you a complete, formatted prompt you can paste directly.
```

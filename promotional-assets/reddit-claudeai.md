# Reddit r/ClaudeAI Post

## Publishing Instructions

1. Go to [r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/)
2. This community appreciates tools that improve Claude workflows
3. Mention Claude specifically in the context
4. **Best times:** Weekday evenings, weekends

---

## Post

### Title
```
Chrome extension to format GitHub issues for Claude - one click to get all the context
```

### Body
```
Fellow Claude users - made something that might help if you use Claude for coding help.

**The problem I kept having:**

I'd be looking at a GitHub issue, want Claude's analysis, and then spend several minutes copying:
- The issue description
- Code blocks
- Error messages
- Relevant comments
- Context about labels/state

By the time I formatted it nicely, I'd lost my train of thought.

**The solution:**

A Chrome extension that extracts everything from a GitHub issue in one click and formats it into a clean prompt. Works great with Claude because it preserves:

- Full markdown formatting
- Code blocks with language tags
- Structured sections that Claude can reference
- All the context in one place

**Why this works well with Claude specifically:**

Claude is excellent at analyzing structured information. The extension formats issues using templates like:

```markdown
# Bug Fix Request

## Context
**Repository:** owner/repo
**Issue:** #123 - Title
**Labels:** bug, needs-triage

## Problem Description
[Full description with markdown preserved]

## Code Blocks
[All code with ```language tags]

## Error Logs
[Stack traces formatted]

## Relevant Discussion
[Key comments from the thread]

## Task
Please analyze this bug and provide...
```

This gives Claude clear sections to reference in its response.

**Features:**
- 6 templates (Bug Fix, Feature Request, Code Review, Question, Minimal, Detailed)
- Custom template support
- Optional OpenAI integration for AI-powered prompt generation
- Privacy-first design

**Links:**
- GitHub: https://github.com/lihaoz-barry/Issue2Prompt
- Chrome Web Store: [link when available]

Anyone have suggestions for templates that would work particularly well with Claude's strengths?
```

---

## Flair
Select: `Productivity` or `Tools/Resources`

---

## Claude-Specific Talking Points

### "Why not use Claude's web browsing?"
```
Claude doesn't have real-time web browsing. Even in environments where it might, having a clean, pre-formatted prompt ensures:
1. All code blocks are preserved exactly
2. Comments aren't truncated
3. You control exactly what context is included
4. Works in any Claude interface (API, Claude.ai, etc.)
```

### "Will you add Anthropic API support?"
```
That's on my list! Currently it uses OpenAI for the optional AI generation, but adding Claude API support would make sense since many users here prefer Claude. Would you use that feature?
```

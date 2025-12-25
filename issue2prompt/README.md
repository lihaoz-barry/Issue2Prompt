# Issue2Prompt

A Chrome extension that converts GitHub issues into structured AI prompts with one click. Optimize your workflow by automatically extracting issue context and generating high-quality prompts for Claude, GPT, Gemini, and other AI assistants.

## Features

### Core Features (P0)
- **One-Click Prompt Generation** - Inject a "Generate AI Prompt" button directly into GitHub issue pages
- **Smart Data Extraction** - Automatically extract:
  - Issue title, description, labels, and assignees
  - Code blocks with language detection
  - Error logs and stack traces
  - Reproduction steps
  - Expected vs actual behavior
- **Clipboard Integration** - Copy generated prompts with a single click
- **Multiple Templates** - Choose from 6 built-in templates:
  - Bug Fix
  - Feature Request
  - Code Review
  - Question / Help
  - Minimal
  - Detailed

### Enhanced Features (P1)
- **Popup Preview** - View and edit prompts before copying
- **Custom Templates** - Create, edit, and manage your own templates
- **Comment Extraction** - Include relevant technical discussions
- **Extraction Statistics** - See code block count, comment count, and label count
- **Settings Page** - Configure default behavior and preferences

### Advanced Features (P2)
- **Template Import/Export** - Share templates between browsers
- **Prompt History** - Access your last 5 generated prompts
- **Auto-detect Issue Type** - Automatic template recommendations based on issue content

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "Issue2Prompt"
3. Click "Add to Chrome"

### Developer Mode Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `issue2prompt` folder
6. The extension is now installed!

## Usage

### Generating a Prompt
1. Navigate to any GitHub issue page (e.g., `https://github.com/owner/repo/issues/123`)
2. Click the green **"Generate AI Prompt"** button that appears near the issue title
3. A toast notification confirms the data was extracted
4. Click the extension icon in your browser toolbar to open the popup
5. Select a template from the dropdown
6. Review and optionally edit the generated prompt
7. Click **"Copy to Clipboard"**
8. Paste into your favorite AI assistant!

### Using Templates
The extension comes with 6 built-in templates:

| Template | Best For |
|----------|----------|
| Bug Fix | Bug reports with error logs and reproduction steps |
| Feature Request | New feature proposals and enhancements |
| Code Review | Code quality and review assistance |
| Question / Help | Technical questions and support requests |
| Minimal | Quick, concise prompts with essential info only |
| Detailed | Comprehensive prompts with all available data |

### Creating Custom Templates
1. Click the gear icon in the popup to open Settings
2. Scroll to "Custom Templates"
3. Click "Add New Template"
4. Enter a template name
5. Write your template using variables (see below)
6. Click "Save Template"

## Template Variables

Use these placeholders in your custom templates:

### Basic Variables
| Variable | Description |
|----------|-------------|
| `{{repository}}` | Repository name (owner/repo) |
| `{{issueNumber}}` | Issue number |
| `{{title}}` | Issue title |
| `{{url}}` | Issue URL |
| `{{author}}` | Issue author username |
| `{{createdAt}}` | Creation date |
| `{{state}}` | Issue state (open/closed) |
| `{{labels}}` | Comma-separated labels |
| `{{assignees}}` | Comma-separated assignees |
| `{{milestone}}` | Milestone name |

### Content Variables
| Variable | Description |
|----------|-------------|
| `{{description}}` | Full issue description |
| `{{codeBlocks}}` | Formatted code blocks |
| `{{errorLogs}}` | Extracted error logs |
| `{{reproductionSteps}}` | Numbered reproduction steps |
| `{{expectedBehavior}}` | Expected behavior text |
| `{{actualBehavior}}` | Actual behavior text |
| `{{environment}}` | Environment information |

### Discussion Variables
| Variable | Description |
|----------|-------------|
| `{{relevantComments}}` | Relevant technical comments |
| `{{allComments}}` | All comments (limited) |
| `{{commentCount}}` | Total comment count |
| `{{linkedPRs}}` | Linked pull requests |
| `{{relatedIssues}}` | Related issues |
| `{{commits}}` | Referenced commits |

### Conditional Syntax
```
{{#if errorLogs}}
## Error Logs
{{errorLogs}}
{{/if}}
```

## Configuration

Access settings by clicking the gear icon in the popup:

### General Settings
- **Default Template** - Template selected by default
- **Maximum Comments** - Limit comments included (1-20)

### Behavior Settings
- **Auto-close popup after copying** - Automatically close after copy
- **Show notification on copy** - Display success notification
- **Auto-detect issue type** - Recommend templates based on content

### Extraction Settings
- **Include comments** - Include comments in prompt
- **Include code blocks** - Include code blocks in prompt
- **Include linked PRs** - Include linked pull requests

## Privacy

This extension:
- Only activates on GitHub issue pages
- Stores data locally in your browser
- Does not send any data to external servers
- Does not require GitHub authentication for public repos
- Works with private repos when you're logged in

## Development

### Project Structure
```
issue2prompt/
├── manifest.json
├── src/
│   ├── content/
│   │   ├── content.js      # Injected into GitHub pages
│   │   └── content.css     # Button and toast styles
│   ├── popup/
│   │   ├── popup.html      # Popup UI
│   │   ├── popup.js        # Popup logic
│   │   └── popup.css       # Popup styles
│   ├── options/
│   │   ├── options.html    # Settings page
│   │   ├── options.js      # Settings logic
│   │   └── options.css     # Settings styles
│   ├── background/
│   │   └── background.js   # Service worker
│   ├── utils/
│   │   ├── parser.js       # Issue content parser
│   │   ├── templateEngine.js # Template rendering
│   │   └── storage.js      # Chrome storage wrapper
│   └── templates/
│       └── defaultTemplates.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Building for Production
1. Ensure all files are in place
2. Create a ZIP file of the extension folder
3. Upload to Chrome Web Store Developer Dashboard

### Testing
1. Load the extension in developer mode
2. Navigate to a GitHub issue page
3. Test button injection and data extraction
4. Verify popup functionality
5. Test settings page

## FAQ

**Q: Does this work with private repositories?**
A: Yes, as long as you're logged into GitHub and have access to the repository.

**Q: Can I use this with GitHub Enterprise?**
A: Not currently. The extension only works with github.com.

**Q: How do I update my custom templates?**
A: Go to Settings > Custom Templates, click Edit on the template you want to modify, make changes, and click Save.

**Q: Where is my data stored?**
A: All data is stored locally in Chrome's storage. Nothing is sent to external servers.

**Q: The button doesn't appear on some issues. Why?**
A: Try refreshing the page. If the issue persists, the page structure may have changed. Please report the issue on GitHub.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Changelog

### v1.0.0 (Initial Release)
- Core prompt generation functionality
- 6 built-in templates
- Custom template support
- Settings page with configuration options
- Template import/export
- Prompt history

---

Made with love for developers who use AI to solve issues faster.

# GitHub Issue to AI Prompt

A Chrome extension that converts GitHub issues into structured AI prompts with one click. Streamline your workflow by automatically extracting issue context and generating high-quality prompts for Claude, GPT, Gemini, and other AI assistants.

## Features

- **One-Click Prompt Generation** - Inject a "Generate AI Prompt" button directly into GitHub issue pages
- **Smart Data Extraction** - Automatically extract issue details, code blocks, error logs, and reproduction steps
- **6 Built-in Templates** - Bug Fix, Feature Request, Code Review, Question/Help, Minimal, and Detailed
- **Custom Templates** - Create and manage your own templates with variable support
- **Clipboard Integration** - Copy generated prompts instantly
- **Privacy-Focused** - All data stays local in your browser

## Quick Start

### Installation (Developer Mode)

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `github-issue-to-prompt` folder

### Usage

1. Navigate to any GitHub issue page
2. Click the green **"Generate AI Prompt"** button
3. Click the extension icon to open the popup
4. Select a template and copy the generated prompt
5. Paste into your favorite AI assistant

## Template Variables

| Variable | Description |
|----------|-------------|
| `{{title}}` | Issue title |
| `{{description}}` | Full issue description |
| `{{codeBlocks}}` | Formatted code blocks |
| `{{errorLogs}}` | Extracted error logs |
| `{{labels}}` | Issue labels |
| `{{repository}}` | Repository name |

See the [extension README](./github-issue-to-prompt/README.md) for the complete list of variables.

## Project Structure

```
Issue2Prompt/
├── github-issue-to-prompt/    # Chrome extension source
│   ├── manifest.json          # Extension manifest
│   ├── src/                   # Source code
│   │   ├── content/           # Content scripts
│   │   ├── popup/             # Popup UI
│   │   ├── options/           # Settings page
│   │   ├── background/        # Service worker
│   │   ├── utils/             # Utility modules
│   │   └── templates/         # Default templates
│   └── icons/                 # Extension icons
└── README.md                  # This file
```

## Privacy

- Only activates on GitHub issue pages
- All data stored locally in your browser
- No external server communication
- No GitHub authentication required for public repos

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

MIT License - see [LICENSE](LICENSE) for details.

# Privacy Policy for Issue2Prompt

**Last Updated: December 24, 2024**

Issue2Prompt ("we," "our," or "the Extension") is committed to protecting your privacy. This Privacy Policy explains how we handle information in connection with your use of the Issue2Prompt Chrome extension.

## 1. Information Collection and Use

Issue2Prompt is designed with a privacy-first approach. 

### a. User Data
The Extension does not collect, store, or transmit any personal data to our own servers. All data extraction from GitHub issue pages is performed locally within your browser.

### b. Extracted Issue Content
The content extracted from GitHub issues (titles, descriptions, code blocks, etc.) is processed locally to generate prompts. This data is never sent to our servers.

### c. API Keys and Settings
If you choose to use the "Generate with AI" feature, you must provide your own OpenAI API key. This key is stored securely in your browser's local storage (`chrome.storage.local`) and is only used to make direct requests to OpenAI's API. We never see or store your API key on our servers.

### d. Templates
Any custom templates you create are stored locally in your browser and are not shared with us or any third parties.

## 2. Third-Party Services

### OpenAI API
When you use the optional "Generate with AI" feature, the extracted issue data is sent to OpenAI's API to generate an optimized prompt. This interaction is governed by [OpenAI's Privacy Policy](https://openai.com/policies/privacy-policy). No other third-party services are used.

## 3. Data Storage

All data related to the Extension, including settings, custom templates, and API keys, is stored locally in your browser's storage. You can clear this data at any time by uninstalling the Extension or clearing your browser data.

## 4. Permissions

The Extension requires the following permissions to function:
- `activeTab`: To extract content from the GitHub issue page you are currently viewing.
- `storage`: To save your settings, API keys, and custom templates.
- `clipboardWrite`: To allow you to copy the generated prompts to your clipboard.
- `scripting`: To inject the extraction logic into GitHub pages.
- `host_permissions` for `https://github.com/*`: To detect and operate on GitHub issue pages.

## 5. Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

## 6. Contact Us

If you have any questions about this Privacy Policy, please open an issue on our [GitHub repository](https://github.com/lihaoz-barry/Issue2Prompt).

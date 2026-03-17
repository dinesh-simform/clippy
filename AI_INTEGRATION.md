# AI Integration (Phase 1)

This document explains the Phase 1 AI implementation for Clipsy:
- Secure AI service in Electron main process
- Provider configuration in Settings
- Entry-level AI summarize and rewrite
- AI Assistant chat dialog in the main app

## Architecture

### Security model
- Renderer never calls AI providers directly.
- API keys are read and used only in the Electron main process.
- Renderer sends IPC requests to the main process.

### Main process
- `ai-service.js` provides:
  - `chat(messages)`
  - `summarize(text)`
  - `rewrite(text, style)`
  - provider routing (`azure-openai`, `openai`, `custom`)
- `main.js` exposes IPC handlers:
  - `ai-get-status`
  - `ai-summarize-entry`
  - `ai-rewrite-entry`
  - `ai-chat`

### Renderer
- `src/components/Settings.js` stores AI configuration with existing app settings.
- `src/App.js` provides:
  - AI Assistant button and chat dialog
  - AI result dialog for summarize/rewrite output
- `src/components/EntryCard.js` adds action buttons:
  - Summarize
  - Rewrite

## Provider Setup

## Azure OpenAI
Fill these fields in Settings -> AI Settings:
- Enable AI Features: ON
- AI Provider: Azure OpenAI
- Azure Endpoint: `https://<resource>.openai.azure.com`
- Azure Deployment: your deployment name
- Azure API Version: default is `2024-02-15-preview`
- Azure API Key: your key

## OpenAI
- Enable AI Features: ON
- AI Provider: OpenAI
- Model: e.g. `gpt-4o-mini`
- API Key

## Custom OpenAI-compatible API
- Enable AI Features: ON
- AI Provider: Custom OpenAI-compatible
- Base URL: API base URL ending with `/v1`
- Model
- API Key

## Phase 1 Features

- AI Assistant chat from main toolbar
- Summarize selected entry
- Rewrite selected entry (style: concise and professional)
- Copy AI output to clipboard
- Save AI output as a new clipboard entry

## Notes and limitations

- Encrypted entries are blocked from AI summarize/rewrite until decrypted.
- AI chat context can include selected clipboard entries (via IPC context IDs).
- Sensitive-pattern redaction is optional (`Redact sensitive patterns before sending to AI`).
- Settings are stored in the existing `settings.json` under the `ai` object.

## File map

- `ai-service.js`
- `main.js`
- `src/components/Settings.js`
- `src/App.js`
- `src/components/ClipboardList.js`
- `src/components/EntryCard.js`

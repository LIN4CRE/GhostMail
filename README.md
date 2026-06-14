# 👻 GhostMail

Your email, decluttered. A beautiful, open-source Google Workspace hub with powerful bulk email management.

![Tokyo Night themed](https://img.shields.io/badge/theme-Tokyo%20Night-7aa2f7?style=flat-square)
![License MIT](https://img.shields.io/badge/license-MIT-9ece6a?style=flat-square)
![No Ads](https://img.shields.io/badge/ads-none-f7768e?style=flat-square)

---

## ✨ Features

- 🗑️ **Bulk Delete** — Trash thousands of emails at once with smart queries
- 🔍 **Power Search** — Gmail search syntax + quick filter presets
- 📱 **Google Apps Hub** — One-click access to all Google services
- 🎨 **Tokyo Night Theme** — Beautiful dark theme, easy on the eyes
- 🔒 **Privacy First** — Your data stays on YOUR device. No servers, no tracking.
- 🚫 **No Ads** — Ever. Open source and free forever.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Rust](https://rustup.rs) (latest stable)
- [Tauri CLI](https://tauri.app/start/prerequisites)

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the **Gmail API**
4. Create **OAuth 2.0 credentials** (Desktop application)
5. Copy your **Client ID**
6. Add `http://127.0.0.1` to authorized redirect URIs

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/ghostmail.git
cd ghostmail
npm install

# Add your Google Client ID
# Edit src/lib/services/googleAuth.ts → GOOGLE_CLIENT_ID

# Development
npm run tauri dev

# Build for production
npm run tauri build
```

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | SvelteKit 2 + TypeScript |
| Backend | Tauri 2 (Rust) |
| Auth | Google OAuth 2.0 + PKCE |
| API | Gmail REST API |
| Storage | OS Keychain (via `keyring` crate) |
| Theme | Tokyo Night |

## 🔒 Privacy

GhostMail is a local-first application:

- All data processing happens on your computer
- OAuth tokens are stored in your OS keychain (Windows Credential Manager / macOS Keychain / Linux Secret Service)
- No analytics, no telemetry, no third-party services
- We never see, store, or process your emails

## 📄 License

[MIT](LICENSE) — Use it, fork it, make it yours.

---

<p align="center">
  Built with 💜 and the <a href="https://github.com/enkia/tokyo-night-vscode-theme">Tokyo Night</a> color palette
</p>

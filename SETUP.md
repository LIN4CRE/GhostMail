# Setup Guide

## Detailed Google Cloud Configuration

### Step 1: Create Google Cloud Project

1. Visit https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Name: `GhostMail` (or anything you like)
4. Click **Create**

### Step 2: Enable Gmail API

1. Go to **APIs & Services** → **Library**
2. Search for **Gmail API**
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - App name: `GhostMail`
   - User support email: your email
   - Developer contact: your email
4. Scopes: Add `gmail.modify`, `gmail.readonly`, `userinfo.email`, `userinfo.profile`
5. Test users: Add your own Gmail address
6. Save

### Step 4: Create Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth Client ID**
3. Application type: **Desktop application**
4. Name: `GhostMail Desktop`
5. Click **Create**
6. Copy the **Client ID**

### Step 5: Add Client ID to App

Open `src/lib/services/googleAuth.ts` and replace:

```typescript
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
```

### Step 6: Run

```bash
npm install
npm run tauri dev
```

## Troubleshooting

**Access blocked error**
→ Make sure you added your email as a test user in the OAuth consent screen.

**Redirect URI mismatch**
→ The app uses dynamic localhost ports with PKCE, no redirect URI configuration needed for Desktop credentials.

**Tokens not persisting**
→ Make sure your OS keychain service is running (Windows Credential Manager, macOS Keychain, or Linux Secret Service/gnome-keyring).

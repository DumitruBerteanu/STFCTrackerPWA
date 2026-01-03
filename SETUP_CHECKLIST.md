# Pre-Build Setup Checklist (with Write/Edit Capability)

## 1. Google Sheet Setup
- [ ] Create your Google Sheet (or use existing one)
- [ ] Design your sheet structure:
  - Decide on columns (e.g., Column A = Task/Item name, Column B = Checkbox status, Column C+ = any other data)
  - Add sample data/rows to test with
- [ ] **Note the Sheet ID** (from URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`)
  - Sheet ID: _____________________
- [ ] **Note the Sheet name/tab name** (default is usually "Sheet1" if you haven't renamed it)
  - Sheet name: _____________________
- [ ] Keep the sheet as PRIVATE (or shared only with your account)

## 2. Google Cloud Console Setup (REQUIRED for Read & Write)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project (or select existing one)
  - Project name: _____________________
- [ ] Enable Google Sheets API:
  - Navigate to: APIs & Services → Enable APIs and Services
  - Search for "Google Sheets API"
  - Click "Enable"
- [ ] Configure OAuth Consent Screen:
  - Go to: APIs & Services → OAuth consent screen
  - Choose "External" (unless you have Google Workspace)
  - Fill in required fields (App name, User support email, Developer contact)
  - Add your email to test users (if in testing mode)
  - Save and continue through scopes (default is fine)
  - Add yourself as a test user
- [ ] Create OAuth 2.0 Credentials:
  - Go to: APIs & Services → Credentials
  - Click "Create Credentials" → "OAuth client ID"
  - Application type: **"Web application"**
  - Name it (e.g., "STFC Helper PWA")
  - **Authorized JavaScript origins:**
    - Add: `http://localhost:3000` (for local testing)
    - Add: `https://[your-app-name].netlify.app` (we'll add the exact URL after deployment)
    - Or use a placeholder like: `https://*.netlify.app` if Netlify allows wildcards
  - **Authorized redirect URIs:**
    - Add: `http://localhost:3000` (for local testing)
    - Add: `https://[your-app-name].netlify.app` (we'll update this after deployment)
  - Click "Create"
  - **IMPORTANT:** Copy and save:
    - Client ID: _____________________
    - Client Secret: _____________________
    - (Download the JSON file if available, keep it secure)

## 3. Google Sheet Permissions
- [ ] Ensure the Google account you'll authenticate with has EDIT access to the sheet
- [ ] Test that you can manually edit the sheet (add/change checkboxes) in Google Sheets

## 4. Hosting Setup (Netlify)
- [ ] Create Netlify account at [netlify.com](https://www.netlify.com/)
- [ ] Optional: Connect GitHub account (useful for auto-deployments)
- [ ] After we build, you'll deploy to Netlify and get a URL
- [ ] You'll need to add that Netlify URL back to Google OAuth settings (Authorized JavaScript origins & Redirect URIs)

## 5. Preparation Notes (Save These for When We Build)
- [ ] Sheet ID: _____________________
- [ ] Sheet name/tab name: _____________________
- [ ] OAuth Client ID: _____________________
- [ ] OAuth Client Secret: _____________________
- [ ] Netlify account email/username: _____________________

## 6. Design Decisions
- [ ] Decide on column structure (which column has checkboxes, which has task names, etc.)
- [ ] Decide refresh behavior:
  - Auto-refresh every X seconds (e.g., 30 seconds) - always shows latest data
  - Manual refresh button only - updates when you tap refresh
  - Hybrid: auto-refresh + manual refresh button
- [ ] Test accessing your Google Sheet from your phone's browser to ensure you can authenticate

## 7. Important Notes
- ⚠️ OAuth requires HTTPS in production (Netlify provides this automatically)
- ⚠️ First-time users will need to sign in with Google when accessing the app
- ⚠️ The OAuth consent screen may show "This app isn't verified" during testing - you can proceed as it's your personal app
- ⚠️ Keep your Client Secret secure - it will be used in the backend/API calls

---

**Ready to build?** Once all items above are checked off, let me know and I'll create the PWA with read & write capability!


# Netlify Setup - Fix "Page not found"

## Immediate Fix Steps

### Step 1: Check Netlify Site Settings

1. Log into [Netlify](https://app.netlify.com/)
2. Click on your site
3. Go to **Site settings** (gear icon)
4. Click **Build & deploy** in left sidebar
5. Click **Build settings** → **Edit settings**

### Step 2: Configure Build Settings

Set these values:

```
Base directory: (leave EMPTY)
Publish directory: . (or leave EMPTY if deploying folder contents)
Build command: (leave EMPTY - no build needed)
```

**IMPORTANT**: 
- If you dragged the **STFCTrackerPWA folder**, set **Publish directory** to `STFCTrackerPWA`
- If you dragged the **contents** of the folder, set **Publish directory** to `.` (or leave empty)

### Step 3: Save and Redeploy

1. Click **Save**
2. Go to **Deploys** tab
3. Click **Trigger deploy** → **Clear cache and deploy site**
4. Wait for deployment to complete

### Step 4: Verify

Visit your site URL. You should see the "Sign in with Google" page.

## Alternative: Re-deploy from Scratch

If still not working:

1. **Option A: Drag & Drop Folder Contents**
   - Open the `STFCTrackerPWA` folder
   - Select ALL files inside (not the folder itself)
   - Drag them to Netlify deploy area
   - In settings, set **Publish directory** to `.` (or empty)

2. **Option B: Use Git**
   - Push `STFCTrackerPWA` folder contents to a Git repo
   - In Netlify, connect the repo
   - Set **Publish directory** to `.` (root)
   - Enable auto-deploy

## What Files Should Be at Root?

After deployment, your site root should have:
- `index.html` ← **MUST be at root**
- `app.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`
- `netlify.toml`
- `_redirects`
- `icon-192.png`
- `icon-512.png`

If these are in a subfolder like `/STFCTrackerPWA/`, update the **Publish directory** setting.



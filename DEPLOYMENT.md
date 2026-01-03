# Deployment Guide

## Quick Deploy to Netlify

### Method 1: Drag and Drop (Easiest)

1. Make sure you have all files in the `STFCTrackerPWA` folder:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `manifest.json`
   - `service-worker.js`
   - `netlify.toml`
   - `icon-192.png` (optional but recommended)
   - `icon-512.png` (optional but recommended)

2. Open [Netlify](https://app.netlify.com/)

3. Go to your site dashboard

4. Drag and drop the entire `STFCTrackerPWA` folder onto the Netlify deploy area

5. Wait for deployment to complete

6. Your app will be live at: `https://your-site-name.netlify.app`

### Method 2: Git Repository (Recommended for Updates)

1. Create a new Git repository (GitHub, GitLab, etc.)

2. Push the `STFCTrackerPWA` folder contents to the repository

3. In Netlify:
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git provider
   - Select your repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `/` (root)
   - Click "Deploy site"

4. Future updates: Just push to Git, Netlify will auto-deploy!

## After Deployment

### 1. Add Netlify URL to Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Click on your OAuth 2.0 Client ID
4. Add your Netlify URL to:
   - **Authorized JavaScript origins**: `https://your-site-name.netlify.app`
   - **Authorized redirect URIs**: `https://your-site-name.netlify.app`
5. Click "Save"

### 2. Generate Icons (If Not Done)

1. Open `create-icons.html` in your browser
2. Click "Download Both" button
3. Save the icon files in the `STFCTrackerPWA` folder
4. Redeploy to Netlify

## Testing on iPhone

1. Open Safari on your iPhone
2. Navigate to your Netlify URL
3. Sign in with Google
4. Tap the Share button (square with arrow)
5. Scroll down and tap "Add to Home Screen"
6. The app will now appear like a native app!

## Troubleshooting

### "Service Worker registration failed"
- Make sure you're accessing via HTTPS (Netlify provides this automatically)
- Check browser console for specific errors

### "Authentication failed"
- Verify your OAuth Client ID is correct in `app.js`
- Make sure Netlify URL is added to Google OAuth authorized origins
- Clear browser cache and try again

### "Failed to load data"
- Verify Sheet ID is correct in `app.js`
- Check that Sheet name matches (case-sensitive)
- Ensure you have edit access to the Google Sheet
- Check browser console for API errors

### Data not updating
- Check that auto-refresh is running (should update every 30 seconds)
- Try manual refresh button
- Verify your Google account has edit permissions on the sheet

## Customization

Edit `app.js` to change:
- `DATA_RANGE`: Change the rows/columns displayed
- `CHECKBOX_COLUMN_INDEX`: Change which column has checkboxes
- Auto-refresh interval: Change `30000` (30 seconds) to your preferred time


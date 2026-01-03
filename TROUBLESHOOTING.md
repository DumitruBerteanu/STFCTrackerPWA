# Troubleshooting: "Page not found" on Netlify

## Quick Fix Checklist

### 1. Check Netlify Deploy Settings

In your Netlify dashboard:
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Verify:
   - **Base directory**: Leave empty or set to `STFCTrackerPWA` (only if deploying from root)
   - **Publish directory**: Should be `.` or `STFCTrackerPWA` or leave empty
   - **Build command**: Can be empty or `echo 'No build step required'`

### 2. How Did You Deploy?

#### Option A: Drag & Drop the FOLDER
If you dragged the entire `STFCTrackerPWA` folder:
- Your files are at: `/STFCTrackerPWA/index.html`
- Netlify is looking for: `/index.html`
- **Fix**: In Netlify settings, set **Publish directory** to `STFCTrackerPWA`

#### Option B: Drag & Drop the CONTENTS
If you opened the folder and dragged the files inside:
- Your files are at: `/index.html` ✓
- This should work!

#### Option C: Git Repository
If using Git:
- Make sure files are in the repository root OR
- Set **Base directory** to `STFCTrackerPWA` if files are in that folder

### 3. Quick Fix Steps

1. **Go to Netlify Dashboard** → Your site → **Site settings**

2. **Build & deploy** → **Build settings** → **Edit settings**

3. Set these values:
   ```
   Base directory: (leave empty)
   Publish directory: .  (or leave empty if files are in root)
   Build command: (leave empty)
   ```

4. **Save**

5. **Deploy** → **Trigger deploy** → **Clear cache and deploy site**

### 4. Verify Files Are Deployed

1. Go to **Deploys** tab
2. Click on the latest deploy
3. Check the **Deploy log** - you should see files listed
4. Look for `index.html` in the file list

### 5. Test the URL

After redeploying:
- Try: `https://your-site.netlify.app`
- Should show the sign-in page

### 6. Still Not Working?

**Option 1: Redeploy Everything**
1. Delete the current site on Netlify (or start fresh)
2. Zip the `STFCTrackerPWA` folder
3. Drag and drop the zip file to Netlify
4. Netlify will extract and deploy

**Option 2: Manual File Check**
1. In Netlify, go to **Deploys**
2. Open the deploy details
3. Check if you see these files:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `manifest.json`
   - `service-worker.js`

If files are in a `STFCTrackerPWA` subfolder in the deploy, update the publish directory.

## Common Issues

### Issue: Files in Wrong Location
**Symptom**: Page not found  
**Solution**: Check publish directory matches where your files actually are

### Issue: Missing index.html
**Symptom**: 404 error  
**Solution**: Make sure `index.html` is in the root of your published directory

### Issue: Service Worker Not Loading
**Symptom**: App works but no offline capability  
**Solution**: Check browser console for service worker errors. May need HTTPS (Netlify provides this automatically)

## Need More Help?

Check the browser console (F12) for specific error messages and share them for further troubleshooting.



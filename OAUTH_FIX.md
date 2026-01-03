# Fix: "Access blocked: app has not completed Google verification"

## Quick Fix: Add Yourself as Test User

Since this is a personal app, you need to add your email as a test user in Google Cloud Console.

### Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Navigate to OAuth Consent Screen**
   - Click on your project (if not already selected)
   - Go to: **APIs & Services** → **OAuth consent screen**

3. **Add Test Users**
   - Scroll down to the **Test users** section
   - Click **+ ADD USERS**
   - Add your email: `dumitru.berteanu@gmail.com`
   - Click **ADD**
   - Click **SAVE** at the bottom of the page

4. **Wait a Few Minutes**
   - Changes usually take effect within 1-5 minutes
   - You may need to clear browser cache/cookies

5. **Try Signing In Again**
   - Go back to your Netlify site
   - Click "Sign in with Google"
   - You should now be able to sign in!

## Alternative: Publish the App (For Public Use)

If you want anyone to be able to use it (not just test users):

1. In **OAuth consent screen**, scroll to the bottom
2. Click **PUBLISH APP**
3. Click **CONFIRM**
4. **Note**: Google may require verification for apps using sensitive scopes, but for personal use with just Google Sheets API, this usually works fine.

## Important Notes

- **Testing mode**: Only approved test users can sign in
- **Published mode**: Anyone with a Google account can sign in
- For personal use, **testing mode with your email** is recommended (more secure)
- The "App isn't verified" warning is normal for personal apps - you can click "Advanced" → "Go to [app name] (unsafe)" to proceed


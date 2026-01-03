# Mobile Debugging Guide

## Getting Console Logs from iPhone PWA

### Method 1: Remote Debugging with Mac (Recommended)
1. Connect iPhone to Mac via USB
2. On iPhone: Settings → Safari → Advanced → Enable "Web Inspector"
3. On Mac: Open Safari → Develop menu → [Your iPhone Name] → [stfcshiptracker.netlify.app]
4. Console will show in Safari DevTools on Mac

### Method 2: iOS Safari Remote Debugging (Windows/Android)
1. Use a tool like [Eruda](https://github.com/liriliri/eruda) - add to your HTML temporarily
2. Or use [vConsole](https://github.com/Tencent/vConsole) for mobile debugging

### Method 3: Add Temporary Alert Logging
Add alerts in the code temporarily to see errors:
```javascript
catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
}
```

## Common iOS/PWA Issues

### Issue 1: Sign-in Button Not Working in Chrome iOS
**Solution**: Use Safari instead of Chrome on iOS
- Chrome on iOS uses WebKit (same as Safari) but has stricter cookie/popup policies
- Safari has better PWA and OAuth support on iOS
- Try opening the site in Safari instead

### Issue 2: PWA Fails After Adding to Home Screen
**Common causes:**
1. **Service Worker Cache**: Clear cache or uninstall/reinstall PWA
2. **localStorage Issues**: Some iOS versions have localStorage issues in standalone mode
3. **OAuth Redirect**: Make sure redirect URI matches exactly

**Quick fixes:**
- Delete the app from Home Screen
- Clear Safari cache: Settings → Safari → Clear History and Website Data
- Re-add to Home Screen
- Try signing in again

### Issue 3: Token Not Persisting
- Check if localStorage is working in standalone mode
- The app now handles localStorage failures gracefully

## Testing Checklist

- [ ] Test in Safari (not Chrome) on iPhone
- [ ] Test in regular Safari tab first (before adding to Home Screen)
- [ ] After adding to Home Screen, test sign-in
- [ ] Check if localStorage works in standalone mode
- [ ] Verify OAuth redirect URIs match exactly


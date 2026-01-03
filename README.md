# STFC Tracker PWA

A Progressive Web App for tracking game progress with Google Sheets integration.

## Features

- 📱 Mobile-optimized for iPhone
- ✅ Checkbox tracking in Column B
- 📊 Displays Columns A-F, Rows 3-23
- 🔄 Auto-refresh every 30 seconds + manual refresh
- 🔐 Google OAuth authentication
- 💾 Offline capability (service worker)
- 🎨 Modern, responsive design

## Setup

1. **Icons**: You'll need to add two icon files for the PWA:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
   
   You can generate these using any image editor or online PWA icon generator.

2. **Deploy to Netlify**:
   - Drag and drop the `STFCTrackerPWA` folder to Netlify
   - Or connect to a Git repository for auto-deployment

## Configuration

All configuration is done in `app.js`:
- `GOOGLE_CLIENT_ID`: Your OAuth Client ID
- `SPREADSHEET_ID`: Your Google Sheet ID
- `SHEET_NAME`: Sheet tab name (default: "Overview")
- `DATA_RANGE`: Data range to display (default: "A3:F23")
- `CHECKBOX_COLUMN_INDEX`: Column index for checkboxes (default: 1 = Column B)

## Usage

1. Open the app in your browser
2. Sign in with Google
3. Your sheet data will load automatically
4. Toggle checkboxes in Column B to update the sheet
5. Data auto-refreshes every 30 seconds

## Browser Support

- iOS Safari 11.3+ (iPhone)
- Modern browsers with PWA support


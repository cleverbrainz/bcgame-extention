# BC.Game Crash Monitor - Installation Guide

## Prerequisites: Firebase Realtime Database Setup

This extension uses Firebase Realtime Database for simple, reliable data storage with automatic real-time updates.

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Enter project name (e.g., "bc-game-monitor")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Set up Realtime Database

1. In your Firebase console, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

**That's it!** Realtime Database in test mode automatically allows all reads and writes. No complex security rules needed.

### 3. Get Firebase Configuration

1. Go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (</>) icon
4. Enter app nickname (e.g., "crash-monitor")
5. Click "Register app"
6. Copy the Firebase configuration object

## How to Install the Chrome Extension

### 1. Configure Firebase Connection

1. Open `chrome-extension/background.js`
2. Replace the Firebase configuration with your values:

```javascript
this.firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

**Important**: Make sure the `databaseURL` matches your Realtime Database URL from Firebase console.

### 2. Configure Web Dashboard

1. Open `web-app/app.js`
2. Replace the Firebase configuration with the same values from step 1

### 3. Open Chrome Extensions Page

1. Open Google Chrome
2. Go to `chrome://extensions/` in the address bar
3. Or click the three dots menu → More tools → Extensions

### 4. Enable Developer Mode

1. Toggle the "Developer mode" switch in the top right corner

### 5. Load the Extension

1. Click "Load unpacked" button
2. Navigate to and select the `chrome-extension` folder
3. The extension should now appear in your extensions list

### 6. Verify Installation

1. You should see "BC.Game Crash Monitor" in your extensions
2. The extension icon should appear in your Chrome toolbar

## How to Use

### 1. Visit BC.Game

1. Navigate to https://bc.game/game/crash
2. The extension will automatically start monitoring the page

### 2. Check Status

1. Click the extension icon in your toolbar
2. Verify it shows "Active - Storing to Firebase"

### 3. View Live Dashboard

1. Open `web-app/index.html` in your browser
2. You'll see real-time crash data as it's collected

## Features

- **Real-time Monitoring**: Automatically detects when new × values are added
- **Firebase Realtime Database**: Simple, reliable data storage with live updates
- **Individual Entries**: Each crash result is saved as a separate timestamped record
- **Live Dashboard**: Web interface with real-time updates and filtering
- **Data Export**: Export filtered data to CSV files

## Database Structure

The Realtime Database stores data in this structure:

```
crash_values/
  ├── 1705234567890_abc123/
  │   ├── timestamp: "2025-01-14T10:30:00.000Z"
  │   ├── crash_value: "2.38×"
  │   ├── numeric_value: 2.38
  │   ├── url: "https://bc.game/game/crash"
  │   └── created_at: "2025-01-14T10:30:05.123Z"
  └── 1705234578901_def456/
      ├── timestamp: "2025-01-14T10:30:15.000Z"
      ├── crash_value: "5.67×"
      ├── numeric_value: 5.67
      ├── url: "https://bc.game/game/crash"
      └── created_at: "2025-01-14T10:30:20.456Z"
```

## Troubleshooting

### Extension not working

- Make sure you're on the correct BC.Game crash page
- Check browser console for error messages
- Verify Firebase configuration is correct in both files

### Database errors

- Check Firebase console for any error logs
- Ensure the `databaseURL` is correct
- Verify Realtime Database is enabled in your Firebase project

### Web dashboard not updating

- Check browser console for errors
- Verify Firebase configuration matches the extension
- Ensure you're using the correct Firebase SDK scripts

## Technical Details

- **Target Page**: https://bc.game/game/crash
- **Storage**: Firebase Realtime Database
- **API**: Uses Firebase REST API for Chrome extension, Firebase SDK for web dashboard
- **Update Frequency**: Checks for changes every 500ms
- **Real-time Updates**: Automatic via Firebase listeners
- **Data Retention**: Unlimited (depends on Firebase plan)

## Security Notes

- Test mode allows all reads/writes - perfect for development
- For production, implement proper authentication and security rules
- API keys are safe to use in client-side code for Firebase
- Consider rate limiting for production use

## Why Realtime Database?

- **Simpler setup**: No complex security rules needed
- **Better real-time support**: Built-in live updates
- **Fewer permission issues**: Test mode works out of the box
- **Reliable**: Proven technology with automatic scaling

# BC.Game Crash Monitor - Installation Guide

## Prerequisites: Firebase Setup

Before installing the extension, you need to set up a Firebase project:

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Enter project name (e.g., "bc-game-monitor")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Set up Firestore Database

1. In your Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

### 3. Configure Security Rules

1. In Firestore, go to "Rules" tab
2. For development, you can use test mode rules (allow all):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if true;
  }
}
```

3. Click "Publish"

**Note**: These rules allow all access. For production, implement proper authentication and more restrictive rules.

### 4. Enable API Key Access

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select your Firebase project
3. Go to "APIs & Services" → "Credentials"
4. Find your API key and click "Edit"
5. Under "API restrictions", select "Restrict key"
6. Enable "Cloud Firestore API"
7. Save the changes

This allows the Chrome extension to use the API key for Firestore access.

### 5. Get Firebase Configuration

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

### 2. Open Chrome Extensions Page

1. Open Google Chrome
2. Go to `chrome://extensions/` in the address bar
3. Or click the three dots menu → More tools → Extensions

### 3. Enable Developer Mode

1. Toggle the "Developer mode" switch in the top right corner

### 4. Load the Extension

1. Click "Load unpacked" button
2. Navigate to and select the `chrome-extension` folder
3. The extension should now appear in your extensions list

### 5. Verify Installation

1. You should see "BC.Game Crash Monitor" in your extensions
2. The extension icon should appear in your Chrome toolbar

## How to Use

### 1. Visit BC.Game

1. Navigate to https://bc.game/game/crash
2. The extension will automatically start monitoring the page

### 2. Check Status

1. Click the extension icon in your toolbar
2. Verify it shows "Active - Storing to Firebase"

## Features

- **Real-time Monitoring**: Automatically detects when new × values are added to the end of the list
- **Firebase Storage**: Stores each new × value to Firebase Firestore database
- **Individual Entries**: Each crash result is saved as a separate timestamped document
- **Structured Data**: Stores both text value (e.g., "2.38×") and numeric value (2.38) for analysis
- **Simple Interface**: Minimal popup showing monitoring status

## Database Schema

The `crash_values` collection stores documents with:

```javascript
{
  timestamp: "2025-01-14T10:30:00.000Z",
  crash_value: "2.38×",
  numeric_value: 2.38,
  url: "https://bc.game/game/crash",
  created_at: "2025-01-14T10:30:05.123Z"
}
```

## Troubleshooting

### Extension not working

- Make sure you're on the correct BC.Game crash page
- Check browser console for error messages
- Verify Firebase configuration is correct

### Database errors

- Check Firebase console for any error logs
- Verify Firestore security rules allow writes
- Ensure the project ID matches your configuration

### Permission issues

- Ensure the extension has permission to access bc.game
- Check if Firestore is properly enabled in your Firebase project

## Technical Details

- **Target Page**: https://bc.game/game/crash
- **Storage**: Firebase Firestore NoSQL database
- **API**: Uses Firebase REST API for data insertion
- **Update Frequency**: Checks for changes every 500ms
- **Data Retention**: Unlimited (depends on Firebase plan)

## Security Notes

- Test mode security rules allow all reads/writes
- For production, implement proper authentication and security rules
- API keys are safe to use in client-side code for Firebase
- Consider implementing rate limiting for production use

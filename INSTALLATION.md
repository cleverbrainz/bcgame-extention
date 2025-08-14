# BC.Game Crash Monitor - Installation Guide

## How to Install the Chrome Extension

1. **Open Chrome Extensions Page**

   - Open Google Chrome
   - Go to `chrome://extensions/` in the address bar
   - Or click the three dots menu → More tools → Extensions

2. **Enable Developer Mode**

   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**

   - Click "Load unpacked" button
   - Navigate to and select the `chrome-extension` folder
   - The extension should now appear in your extensions list

4. **Verify Installation**
   - You should see "BC.Game Crash Monitor" in your extensions
   - The extension icon should appear in your Chrome toolbar

## How to Use

1. **Visit BC.Game**

   - Navigate to https://bc.game/game/crash
   - The extension will automatically start monitoring the page

2. **View Data**
   - Click the extension icon in your toolbar
   - View current × values and historical data
   - Export data or clear history as needed

## Features

- **Real-time Monitoring**: Automatically detects changes in × values
- **Historical Storage**: Keeps timestamped records of all changes
- **Data Export**: Copy all data to clipboard in CSV format
- **Clean Interface**: Easy-to-use popup with current and historical data
- **Badge Counter**: Shows number of stored entries on the extension icon

## Troubleshooting

- **Extension not working**: Make sure you're on the correct BC.Game crash page
- **No data showing**: Check browser console for any error messages
- **Permission issues**: Ensure the extension has permission to access bc.game

## Technical Details

- **Target Page**: https://bc.game/game/crash
- **Storage**: Uses Chrome's local storage (data stays on your device)
- **Data Retention**: Keeps last 1000 entries or 30 days of data
- **Update Frequency**: Checks for changes every 500ms

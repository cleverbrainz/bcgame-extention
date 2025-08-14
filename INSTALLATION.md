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

- **Real-time Monitoring**: Automatically detects when new × values are added to the end of the list
- **File-based Storage**: Writes each new × value to a `history.txt` file in your Downloads folder
- **Individual Entries**: Each crash result is saved as a separate timestamped line
- **Automatic Downloads**: No manual intervention needed - files are saved automatically
- **Simple Interface**: Minimal popup showing monitoring status

## File Format

Each line in `history.txt` contains:

```
[Timestamp] - [×Value]
```

Example:

```
1/14/2025, 4:45:30 AM - 2.38×
1/14/2025, 4:45:45 AM - 5.67×
1/14/2025, 4:46:00 AM - 1.25×
```

## Troubleshooting

- **Extension not working**: Make sure you're on the correct BC.Game crash page
- **No files being created**: Check if Chrome has permission to download files
- **Permission issues**: Ensure the extension has permission to access bc.game and downloads

## Technical Details

- **Target Page**: https://bc.game/game/crash
- **Storage**: Writes to `history.txt` files in Downloads folder
- **File Handling**: Creates new files with unique names if conflicts occur
- **Update Frequency**: Checks for changes every 500ms

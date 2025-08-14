# BC.Game Crash Monitor - Installation Guide

## Prerequisites: Supabase Setup

Before installing the extension, you need to set up a Supabase database:

1. **Create Supabase Account**

   - Go to https://supabase.com
   - Sign up for a free account
   - Create a new project

2. **Create Database Table**

   - Go to your project dashboard
   - Navigate to "Table Editor"
   - Create a new table called `crash_values` with these columns:
     - `id` (int8, primary key, auto-increment)
     - `timestamp` (timestamptz)
     - `crash_value` (text)
     - `numeric_value` (float8)
     - `url` (text)
     - `created_at` (timestamptz, default: now())

3. **Get API Credentials**
   - Go to "Settings" → "API"
   - Copy your "Project URL" and "anon public" key

## How to Install the Chrome Extension

1. **Configure Database Connection**

   - Open `chrome-extension/background.js`
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key

2. **Open Chrome Extensions Page**

   - Open Google Chrome
   - Go to `chrome://extensions/` in the address bar
   - Or click the three dots menu → More tools → Extensions

3. **Enable Developer Mode**

   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**

   - Click "Load unpacked" button
   - Navigate to and select the `chrome-extension` folder
   - The extension should now appear in your extensions list

5. **Verify Installation**
   - You should see "BC.Game Crash Monitor" in your extensions
   - The extension icon should appear in your Chrome toolbar

## How to Use

1. **Visit BC.Game**

   - Navigate to https://bc.game/game/crash
   - The extension will automatically start monitoring the page

2. **Check Status**
   - Click the extension icon in your toolbar
   - Verify it shows "Active - Storing to database"

## Features

- **Real-time Monitoring**: Automatically detects when new × values are added to the end of the list
- **Database Storage**: Stores each new × value to Supabase PostgreSQL database
- **Individual Entries**: Each crash result is saved as a separate timestamped record
- **Structured Data**: Stores both text value (e.g., "2.38×") and numeric value (2.38) for analysis
- **Simple Interface**: Minimal popup showing monitoring status

## Database Schema

The `crash_values` table stores:

```sql
- id: Auto-incrementing primary key
- timestamp: When the crash occurred (from BC.Game)
- crash_value: The × value as text (e.g., "2.38×")
- numeric_value: The numeric part for analysis (e.g., 2.38)
- url: The BC.Game page URL
- created_at: When the record was inserted
```

## Troubleshooting

- **Extension not working**: Make sure you're on the correct BC.Game crash page
- **Database errors**: Check browser console for connection issues
- **Permission issues**: Ensure the extension has permission to access bc.game
- **Supabase issues**: Verify your API credentials and table schema

## Technical Details

- **Target Page**: https://bc.game/game/crash
- **Storage**: Supabase PostgreSQL database
- **API**: Uses Supabase REST API for data insertion
- **Update Frequency**: Checks for changes every 500ms

# User-Configurable Settings Implementation

## Overview
This document describes the implementation of user-configurable settings for the Clipboard Manager application. Previously hardcoded configuration values are now editable by users through a Settings UI.

## Changes Made

### 1. Backend Changes (main.js)

#### Configuration Migration
Converted hardcoded constants to a user-editable settings object:

**Before:**
```javascript
const CLIPBOARD_CHECK_INTERVAL = 2000;
const MIN_CHECK_DELAY = 500;
const MAX_ENTRIES = 1000;
```

**After:**
```javascript
let userSettings = {
  clipboardCheckInterval: 2000,
  minCheckDelay: 500,
  maxEntries: 1000
};
```

#### Settings Persistence
- Extended `loadSettings()` to load all user settings from `settings.json`
- Updated `saveSettings()` to persist user settings alongside theme preferences
- Settings are loaded on app startup and persist across restarts

#### Updated Functions
Modified the following functions to use `userSettings` instead of constants:
- `checkClipboard()` - Uses `userSettings.minCheckDelay`
- `startClipboardMonitoring()` - Uses `userSettings.clipboardCheckInterval`
- `cleanupOldEntries()` - Uses `userSettings.maxEntries`

#### New IPC Handlers
Added two new IPC handlers in `setupIPC()`:

**get-settings**
```javascript
ipcMain.handle('get-settings', async () => {
  return {
    clipboardCheckInterval: userSettings.clipboardCheckInterval,
    minCheckDelay: userSettings.minCheckDelay,
    maxEntries: userSettings.maxEntries
  };
});
```

**update-settings**
```javascript
ipcMain.handle('update-settings', async (event, newSettings) => {
  // Validates and updates settings
  // Saves to disk
  // Restarts clipboard monitoring if interval changed
});
```

**Validation Ranges:**
- `clipboardCheckInterval`: 1000-60000 ms (1s - 60s)
- `minCheckDelay`: 100-5000 ms (0.1s - 5s)
- `maxEntries`: 100-10000 entries

### 2. Frontend Changes

#### New Component: Settings.js
Created a new React component (`src/components/Settings.js`) with:
- Material-UI Dialog for settings interface
- Three input fields for configurable values:
  - Clipboard Check Interval (ms)
  - Minimum Check Delay (ms)
  - Maximum Entries
- Input validation with min/max constraints
- Real-time value display (converts ms to seconds)
- Success/error feedback with Alert component
- Performance warning note

**Features:**
- Loads current settings when opened
- Validates input ranges before saving
- Shows current value with recommended defaults
- Provides helpful descriptions for each setting
- Success notification after saving

#### App.js Updates
1. **Import Settings component:**
   ```javascript
   import Settings from './components/Settings';
   import SettingsIcon from '@mui/icons-material/Settings';
   ```

2. **Added state for Settings dialog:**
   ```javascript
   const [settingsOpen, setSettingsOpen] = useState(false);
   ```

3. **Added Settings button to AppBar:**
   - Settings icon button next to theme toggle
   - Opens Settings dialog on click

4. **Rendered Settings component:**
   ```javascript
   <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
   ```

## User Experience

### Accessing Settings
1. Click the Settings icon (⚙️) in the top navigation bar
2. Settings dialog appears with current values

### Modifying Settings
1. Edit any of the three configuration values
2. Values are validated against allowed ranges
3. Click "Save Settings" to apply changes
4. Success message appears and dialog closes
5. If clipboard interval was changed, monitoring restarts automatically

### Settings Persistence
- All settings are saved to `settings.json` in app data directory
- Settings persist across app restarts
- Invalid values are rejected with appropriate error messages

## Technical Details

### Settings File Location
Settings are stored in: `<app-data>/settings.json`
```json
{
  "themeMode": "light",
  "clipboardCheckInterval": 2000,
  "minCheckDelay": 500,
  "maxEntries": 1000
}
```

### Dynamic Monitoring Update
When the clipboard check interval is changed:
1. Settings are saved to disk
2. Current clipboard monitoring is stopped
3. New monitoring starts with updated interval
4. No app restart required

### Performance Considerations
The Settings UI includes an info alert warning users:
- Lower check intervals may increase CPU usage
- Higher max entries increase memory/storage usage

## Future Enhancements
Potential additional configurable settings:
- Auto-start on system boot
- Show/hide system tray icon
- Notification preferences
- Keyboard shortcuts customization
- Export/import settings
- Reset to defaults button

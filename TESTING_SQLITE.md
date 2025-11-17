# SQLite Database Integration - Testing Guide

## ✅ What's Been Implemented

### Database Features
- **Persistent Storage**: All clipboard entries are now stored in SQLite database
- **Location**: `~/.config/Electron/clipboard.db` (user data directory)
- **Duplicate Detection**: Uses SHA-256 hash to prevent duplicate entries
- **Timestamp Updates**: Existing entries get updated timestamps when copied again

### Database Schema
```sql
clipboard_entries:
- id (PRIMARY KEY)
- content (TEXT)
- content_type (VARCHAR)
- content_hash (SHA-256, UNIQUE)
- timestamp (DATETIME)
- is_favorite (BOOLEAN)
- custom_name (VARCHAR)
- created_at (DATETIME)
```

### Available Operations
1. **Add Entry**: Automatically adds new clipboard content
2. **Get Recent**: Retrieves last N entries
3. **Get All**: Retrieves all entries
4. **Delete Entry**: Remove specific entry
5. **Clear All**: Delete all entries (with confirmation)
6. **Toggle Favorite**: Mark entries as favorites (future feature)
7. **Update Name**: Add custom names to entries (future feature)
8. **Search**: Search through clipboard history (future feature)

## 🧪 How to Test

### Test 1: Basic Storage
1. Copy some text from anywhere (e.g., `Ctrl+C` in browser)
2. Wait 1 second (clipboard monitor checks every second)
3. Right-click the tray icon
4. You should see your copied text in "Recent Clipboard Items"
5. Close the app completely
6. Restart the app with `npm run dev`
7. Check the tray menu again - **your history should still be there!**

### Test 2: Duplicate Handling
1. Copy the same text multiple times
2. Check the tray menu - should only appear once
3. The timestamp will be updated each time

### Test 3: View All History
1. Copy several different texts
2. Right-click tray → "View Clipboard History"
3. You should see a dialog with all entries
4. The count shows total items in database

### Test 4: Clear History
1. Right-click tray → "Clear History"
2. Confirm the dialog
3. All entries should be deleted from database
4. Tray menu should show "(No clipboard history)"

### Test 5: Copy from Tray
1. Copy some text to build history
2. Right-click tray
3. Click on any history item
4. A dialog confirms it's copied
5. Paste somewhere to verify

## 📊 Database Location

Find your database file:
```bash
ls -la ~/.config/Electron/clipboard.db
```

View database contents (if you have sqlite3 installed):
```bash
sqlite3 ~/.config/Electron/clipboard.db "SELECT * FROM clipboard_entries;"
```

## 🐛 Known Limitations

1. **Monitor Interval**: Still using 1-second polling (not native events)
2. **Text Only**: Only text clipboard is supported (no images yet)
3. **No UI for History**: Main window doesn't show history yet (only tray menu)
4. **No Search**: Search feature not implemented yet
5. **No Categories**: Auto-categorization not implemented yet

## 🎯 Next Steps

After testing, we can add:
1. Auto-categorization (URLs, emails, code, etc.)
2. Search functionality
3. Better UI in React app to show all history
4. Image clipboard support
5. Favorites system
6. Export/import features

## 📝 Console Output

Check the terminal for:
- "Database initialized with X entries" on startup
- "Text saved to clipboard manager" when copying
- "Database connection closed" on quit

## ⚠️ Troubleshooting

**App won't start?**
- Check if better-sqlite3 installed correctly: `npm list better-sqlite3`
- Try: `npm rebuild better-sqlite3`

**Database errors?**
- Delete database and restart: `rm ~/.config/Electron/clipboard.db`
- App will recreate it automatically

**Not seeing history after restart?**
- Check database location
- Look for errors in terminal
- Verify database.js is loaded correctly

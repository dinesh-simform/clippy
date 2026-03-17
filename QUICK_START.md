# Clipsy - Quick Start Guide

Welcome to Clipsy! This guide will help you get started in 5 minutes.

## Installation

### Linux

**Prerequisites:**
Install xdotool for auto-paste functionality:
```bash
sudo apt-get install xdotool
```

1. Download `Clipsy-1.0.0.AppImage`
2. Make it executable:
   ```bash
   chmod +x Clipsy-1.0.0.AppImage
   ```
3. Run it:
   ```bash
   ./Clipsy-1.0.0.AppImage
   ```

That's it! Clipsy is now running in your system tray.

## First Steps

### 1. Find the Tray Icon

Look for the Clipsy icon in your system tray (usually top-right corner on Ubuntu/GNOME, bottom-right on Windows).

**Tray actions:**
- **Left-click** → Show/hide main window
- **Right-click** → Quick menu with recent items

### 2. Try the Spotlight Search

Press **`Ctrl+F9`** anywhere on your system to open the spotlight search.

**In spotlight:**
- Type to search your clipboard history
- Use ↑↓ arrows to navigate
- Press **Enter** to copy selected item
- Press **Ctrl+Enter** (Cmd+Enter on macOS) to copy and paste automatically
- Press **Esc** to close
- Click 🌙/☀️ to toggle dark/light mode

### 3. Copy Some Text

1. Select any text anywhere on your computer
2. Press `Ctrl+C` to copy
3. The text is automatically saved to Clipsy
4. Press `Ctrl+F9` to see it in your history

## Main Window

Click the tray icon or press `Ctrl+F9` twice to open the main window.

### Key Areas

```
┌─────────────────────────────────────────┐
│  [Search] [Theme] [Settings]           │  ← Top Bar
├──────────┬──────────────────────────────┤
│ Sidebar  │  Clipboard Entries           │
│          │                              │
│ All      │  ┌────────────────────┐     │
│ Favorites│  │ Your clipboard     │     │
│ URLs     │  │ entries appear     │     │
│ Emails   │  │ here as cards      │     │
│ Code     │  └────────────────────┘     │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Sidebar Categories

- **All** - Show everything
- **Favorites** ⭐ - Items you starred
- **URLs** 🔗 - Web links (auto-detected)
- **Emails** 📧 - Email addresses (auto-detected)
- **Code** 💻 - Code snippets (auto-detected)
- **Custom** 🏷️ - Your custom categories

## Common Tasks

### ⭐ Mark as Favorite

1. Find an entry you want to keep
2. Click the star icon ⭐
3. It's now in your Favorites!

### 🏷️ Organize with Categories

1. Click "Manage Categories" in sidebar
2. Create a new category:
   - Name: "Work Notes"
   - Color: Blue
   - Icon: 💼
3. Click entry → Category icon → Assign category

### 🔍 Search Your History

**Method 1 - Spotlight:**
- Press `Ctrl+F9`
- Type your search
- Results appear instantly

**Method 2 - Main Window:**
- Click tray icon
- Type in search box at top
- Filter by category in sidebar

### 📅 Find Old Clips

In the main window:
1. Click date filter dropdown
2. Choose:
   - Today
   - Yesterday  
   - Last 7 days
   - Last 30 days
   - Last 90 days

### 🗑️ Delete an Entry

On any entry card:
1. Click the delete icon 🗑️
2. Confirm deletion
3. Entry is removed (favorites are kept during auto-cleanup)

### 📋 Copy to Clipboard

**From Spotlight:**
- Select entry with arrows
- Press Enter

**From Main Window:**
- Click the copy icon 📋
- Item is copied to clipboard

## Settings

Click the ⚙️ icon in top-right to configure:

### Clipboard Check Interval
How often Clipsy checks for new clipboard content.
- **Default**: 2000ms (2 seconds)
- **Range**: 1-60 seconds
- Lower = more responsive, higher CPU usage

### Minimum Check Delay
Prevents checking too fast when rapidly copying.
- **Default**: 500ms (0.5 seconds)
- **Range**: 0.1-5 seconds
- Acts as a debounce

### Maximum Entries
How many items to keep in history.
- **Default**: 1000 entries
- **Range**: 100-10,000 entries
- Favorites are never deleted

**💡 Tip**: Start with defaults, adjust if needed!

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+F9` | Toggle spotlight search |
| `Ctrl+N` | New window |
| `Ctrl+Q` | Quit Clipsy |
| `Ctrl+Shift+C` | Save selected text |
| `Esc` | Close spotlight |
| `↑↓` | Navigate in spotlight |
| `Enter` | Copy selected item |

## Tips & Tricks

### 🚀 Pro Tips

1. **Quick Access**: Keep spotlight handy with `Ctrl+F9`
2. **Star Important Items**: They won't be auto-deleted
3. **Use Categories**: Organize by project, type, or priority
4. **Search Everything**: Spotlight searches all content
5. **Theme Toggle**: Switch themes for eye comfort

### 🎨 Customization

**Create Custom Categories:**
- Work (🏢 Blue)
- Personal (💭 Green)
- Code Snippets (💻 Purple)
- Important (⚡ Red)
- Shopping (🛒 Orange)

**Adjust for Your Workflow:**
- Heavy copy user? Increase max entries to 5000
- Light user? Decrease check interval to save CPU
- Privacy-conscious? Lower max entries to 500

### 🔒 Privacy

- All data stored locally in SQLite database
- No cloud sync (your data stays on your machine)
- Database location: `~/.config/clipsy/` (Linux)
- Delete entries anytime with 🗑️ icon

### ⚡ Performance

**Clipsy is optimized for:**
- Low CPU usage (~0.1% idle)
- Minimal memory footprint (~100MB)
- Fast searches (milliseconds)
- Efficient database queries

**If you experience lag:**
1. Increase check interval to 3-5 seconds
2. Reduce max entries to 500-1000
3. Clear old entries regularly

## Troubleshooting

### Tray Icon Missing?

**GNOME/Ubuntu:**
```bash
# Install AppIndicator extension
sudo apt-get install gnome-shell-extension-appindicator
# Restart GNOME Shell: Alt+F2, type 'r', press Enter
```

**Other desktops:**
- Usually work out of the box
- Check system tray settings

### Global Shortcut Not Working?

1. Check for conflicts in System Settings → Keyboard
2. Change shortcut in code if needed
3. Make sure Clipsy has focus/permissions

### Clipboard Not Saving?

1. Check if Clipsy is running (look for tray icon)
2. Verify settings: Check interval should be reasonable (1-5s)
3. Check logs: Run from terminal to see errors

### How to Uninstall?

**AppImage:**
```bash
rm Clipsy-1.0.0.AppImage
rm -rf ~/.config/clipsy  # Remove data (optional)
```

**DEB package:**
```bash
sudo apt-get remove clipsy
```

## Getting Help

### Documentation

- **Full Guide**: See README.md
- **Build Instructions**: See BUILD_INSTRUCTIONS.md
- **Settings Guide**: See USER_SETTINGS_IMPLEMENTATION.md

### Support

- Check documentation first
- Look for similar issues online
- Report bugs with:
  - OS and version
  - Steps to reproduce
  - Error messages (if any)

## What's Next?

Now that you know the basics:

1. ✅ Copy some text and see it appear
2. ✅ Try the spotlight search (`Ctrl+F9`)
3. ✅ Star your favorite items
4. ✅ Create a custom category
5. ✅ Adjust settings to your preference

**Enjoy using Clipsy! 🎉**

---

**Version**: 1.0.0  
**Platform**: Linux, Windows, macOS  
**License**: MIT

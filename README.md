# Clipsy - Modern Clipboard Manager

<p align="center">
  <img src="assets/clipsy-icon-textonly-theme.png" alt="Clipsy Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A powerful, secure, and modern clipboard manager built with Electron and React.</strong>
</p>

<p align="center">
  Clipsy helps you track, organize, and manage your clipboard history with ease.
</p>

---

## 📑 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
  - [Installation](#installation)
  - [First Launch](#first-launch)
- [Usage](#-usage)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Spotlight Search](#spotlight-search-window)
  - [Main Window](#main-application-window)
- [User Guide](#-user-guide)
  - [Common Tasks](#common-tasks)
  - [Tips & Tricks](#tips--tricks)
  - [Troubleshooting](#troubleshooting)
- [Building from Source](#️-building-from-source)
- [Development](#️-development)
- [Documentation](#-documentation)
- [License](#-license)

---

## ✨ Features

### Core Features
- � **Automatic Clipboard Monitoring** - Captures everything you copy automatically
- � **Spotlight Search** - Quick access with `Ctrl/Cmd+F9` keyboard shortcut
- 🎨 **Light & Dark Themes** - Beautiful UI that adapts to your preference
- 📁 **Smart Categories** - Organize clips with default and custom categories
- ⭐ **Favorites System** - Mark important clips for quick access
- �️ **Date Filtering** - Find clips by date range (today, yesterday, last 7/30/90 days)
- � **Secure Storage** - SQLite database with encryption support
- 🎯 **System Tray Integration** - Always accessible from your system tray

### Advanced Features
- 🏷️ **Custom Categories** - Create and manage your own categories with colors and icons
- � **Full-Text Search** - Search across all clipboard content
- 🎯 **Category Filters** - Filter by Favorites, URLs, Emails, Code, or custom categories
- ⚙️ **Configurable Settings** - Customize monitoring interval, max entries, and debounce delay
- 🧹 **Auto-Cleanup** - Automatically removes old entries (keeps favorites)
- 💾 **Export/Import** - Backup and restore your clipboard history
- 🎨 **Theme Persistence** - Your theme preference is saved

### Default Categories
- ⭐ **Favorites** - Your starred items
- 🔗 **URLs** - Automatically detects web links
- 📧 **Emails** - Automatically detects email addresses
- 💻 **Code** - Automatically detects code snippets

## 🚀 Quick Start

### Installation

#### Linux

**AppImage (Recommended):**
```bash
# Download the AppImage
chmod +x Clipsy-1.0.0.AppImage
./Clipsy-1.0.0.AppImage
```

**Debian/Ubuntu (.deb):**
```bash
sudo dpkg -i clipsy_1.0.0_amd64.deb
sudo apt-get install -f  # Install dependencies
```

#### Windows

1. Download `Clipsy Setup 1.0.0.exe`
2. Run the installer
3. Follow the installation wizard

Or use the portable version - just run `Clipsy 1.0.0.exe` directly.

#### macOS

1. Download `Clipsy-1.0.0.dmg`
2. Open the DMG file
3. Drag Clipsy to Applications folder

### First Launch

1. Launch Clipsy from your applications menu or system tray
2. The app starts monitoring your clipboard automatically
3. Press `Ctrl+F9` (or `Cmd+F9` on Mac) to open the spotlight search
4. Start copying text - it's automatically saved to your history!

## 🎯 Usage

### Keyboard Shortcuts

- `Ctrl/Cmd+F9` - Toggle spotlight search window
- `Ctrl/Cmd+N` - New window
- `Ctrl/Cmd+Q` - Quit application
- `Ctrl/Cmd+Shift+C` - Copy selected text to clipboard manager
- `Esc` - Close spotlight window

### Spotlight Search Window

Press `Ctrl+F9` to open the quick search:

1. **Search** - Type to filter your clipboard history
2. **Category Filters** - Click chips to filter by category
3. **Navigate** - Use arrow keys to navigate results
4. **Select** - Press Enter to copy item to clipboard
5. **Theme Toggle** - Switch between light/dark mode

### Main Application Window

The main window provides full access to all features:

1. **Search Bar** - Search across all clipboard entries
2. **Category Sidebar** - Filter by category (All, Favorites, URLs, Emails, Code, Custom)
3. **Date Filter** - Filter by time period
4. **Entry Cards** - Each clipboard entry with actions:
   - Copy to clipboard
   - Toggle favorite
   - Assign categories
   - Delete entry
5. **Theme Toggle** - Switch themes (top-right)
6. **Settings** - Configure app behavior (⚙️ icon)

### Managing Categories

1. Click "Manage Categories" in the sidebar
2. Create custom categories with:
   - Name
   - Color
   - Icon
3. Assign categories to entries by clicking the category icon on any entry card

### Configurable Settings

Click the Settings icon (⚙️) to customize:

- **Clipboard Check Interval** - How often to check clipboard (1-60 seconds)
- **Minimum Check Delay** - Debounce delay to prevent rapid checks (0.1-5 seconds)
- **Maximum Entries** - Max number of entries to keep (100-10,000)

**Recommended Settings:**
- Check Interval: 2000ms (2 seconds)
- Check Delay: 500ms (0.5 seconds)
- Max Entries: 1000 entries

## 🏗️ Building from Source

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for detailed build instructions.

## 📖 User Guide

### Finding the Tray Icon

Look for the Clipsy icon in your system tray:
- **Ubuntu/GNOME**: Usually top-right corner
- **Windows**: Bottom-right corner
- **macOS**: Top-right corner

**Tray Icon Actions:**
- **Left-click** → Show/hide main window
- **Right-click** → Quick menu with recent clipboard items

### Using Spotlight Search

Press **`Ctrl+F9`** (or `Cmd+F9` on Mac) anywhere to open spotlight search.

**In Spotlight:**
- Type to search your clipboard history
- Use ↑↓ arrow keys to navigate results
- Press **Enter** to copy selected item to clipboard
- Press **Esc** to close the window
- Click 🌙/☀️ icon to toggle dark/light mode

### Working with the Main Window

The main window has several key areas:

**Top Bar:**
- Search box for filtering entries
- Theme toggle (🌙/☀️)
- Settings button (⚙️)
- Entry count badge

**Left Sidebar:**
- **All** - Show all entries
- **Favorites** ⭐ - Starred items
- **URLs** 🔗 - Web links (auto-detected)
- **Emails** 📧 - Email addresses (auto-detected)
- **Code** 💻 - Code snippets (auto-detected)
- **Custom Categories** 🏷️ - Your categories
- **Manage Categories** button

**Main Area:**
- Clipboard entry cards with actions:
  - 📋 Copy to clipboard
  - ⭐ Toggle favorite
  - 🏷️ Assign categories
  - 🗑️ Delete entry
- Date filter dropdown
- Category filter chips

### Common Tasks

#### Mark Items as Favorites
1. Find the entry you want to keep
2. Click the star icon ⭐
3. Access favorites from the sidebar or spotlight

#### Create Custom Categories
1. Click "Manage Categories" in the sidebar
2. Click "Add Category" button
3. Enter category details:
   - **Name**: e.g., "Work Notes"
   - **Color**: Pick a color
   - **Icon**: Choose an emoji (e.g., 💼)
4. Click "Add" to save

#### Assign Categories to Entries
1. Find the entry you want to categorize
2. Click the category icon 🏷️ on the entry card
3. Select categories from the dialog
4. Click "Save"

#### Search Your History
**Quick Search (Spotlight):**
- Press `Ctrl+F9`
- Type your search term
- Results appear instantly
- Use arrows to navigate, Enter to copy

**Advanced Search (Main Window):**
- Type in the search box at top
- Filter by category in sidebar
- Apply date filters
- Click category chips to filter

#### Find Clips by Date
1. Open the main window
2. Click the date filter dropdown
3. Choose a time range:
   - Today
   - Yesterday
   - Last 7 days
   - Last 30 days
   - Last 90 days

#### Delete Entries
**Single Entry:**
- Click the 🗑️ icon on any entry card
- Confirm deletion

**Clear All:**
- Click "Clear All" button in top bar
- Confirm to delete all entries
- Note: Favorites are preserved during auto-cleanup

### Tips & Tricks

**🚀 Power User Tips:**
1. Use `Ctrl+F9` for instant access anywhere
2. Star important items so they're never deleted
3. Create project-based categories for organization
4. Use search to find anything instantly
5. Toggle theme based on time of day

**🎨 Customization Ideas:**
- Work category (🏢 Blue)
- Personal notes (💭 Green)
- Code snippets (💻 Purple)
- Important info (⚡ Red)
- Shopping lists (🛒 Orange)
- Meeting notes (📝 Yellow)

**⚡ Performance Optimization:**
- Heavy user? Increase max entries to 5000
- Light user? Decrease check interval to save CPU
- Privacy-conscious? Lower max entries to 500
- All changes in Settings (⚙️)

**🔒 Privacy & Security:**
- All data stored locally in SQLite database
- No cloud sync - your data stays on your machine
- Delete entries anytime
- Database location: `~/.config/clipsy/` (Linux)

### Troubleshooting

**Tray Icon Not Visible?**

*GNOME/Ubuntu:*
```bash
sudo apt-get install gnome-shell-extension-appindicator
# Restart GNOME Shell: Alt+F2, type 'r', press Enter
```

*Other Desktops:*
- Usually works out of the box
- Check system tray settings

**Global Shortcut Not Working?**
1. Check for conflicts in System Settings → Keyboard
2. Look for other apps using `Ctrl+F9`
3. Verify Clipsy has necessary permissions

**Clipboard Not Being Captured?**
1. Verify Clipsy is running (check tray icon)
2. Check settings: Interval should be 1-5 seconds
3. Try copying text again
4. Check terminal output for errors

**App Won't Start?**
```bash
# Make sure it's executable (Linux)
chmod +x Clipsy-1.0.0.AppImage

# Check for missing dependencies
./Clipsy-1.0.0.AppImage --version
```

### Uninstallation

**Linux AppImage:**
```bash
rm Clipsy-1.0.0.AppImage
rm -rf ~/.config/clipsy  # Remove data (optional)
```

**Linux DEB:**
```bash
sudo apt-get remove clipsy
```

**Windows:**
- Use "Add or Remove Programs" in Windows Settings
- Or run the uninstaller from the installation directory

**macOS:**
- Drag Clipsy from Applications to Trash
- Remove settings: `~/Library/Application Support/clipsy`

**macOS:**
- Drag Clipsy from Applications to Trash
- Remove settings: `~/Library/Application Support/clipsy`

## 🛠️ Development

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

```bash
# Clone the repository
git clone https://github.com/dinesh-simform/clippy.git
cd clippy

# Install dependencies
npm install

# Rebuild native modules for Electron
npm run rebuild
```

### Development Commands

```bash
# Run in development mode
npm run dev

# Build webpack bundle
npm run build

# Watch for changes (auto-rebuild)
npm run watch

# Run electron
npm run electron

# Build installers
npm run dist          # All platforms
npm run dist:linux    # Linux only
npm run dist:win      # Windows only
npm run dist:mac      # macOS only
```

### Project Structure

```
clippy/
├── src/                          # React application source
│   ├── App.js                   # Main React component
│   ├── index.js                 # React entry point
│   └── components/              # React components
│       ├── CategoryManager.js   # Category CRUD
│       ├── CategorySelector.js  # Category assignment
│       ├── ClipboardList.js     # Entry list
│       ├── DateFilter.js        # Date filtering
│       ├── EntryCard.js         # Single entry display
│       ├── SearchBar.js         # Search input
│       ├── Settings.js          # Settings dialog
│       └── Sidebar.js           # Category sidebar
├── dist/                        # Webpack output
│   └── bundle.js               # Compiled React app
├── assets/                      # Application assets
│   └── clipsy-icon-*.png       # App icons
├── main.js                      # Electron main process
├── database.js                  # SQLite wrapper
├── create-icon.js              # Tray icon generator
├── index.html                  # Main window HTML
├── spotlight.html              # Spotlight window HTML
├── webpack.config.js           # Webpack configuration
├── package.json                # Dependencies & scripts
└── release/                    # Build output
```

### Technologies Used

- **Electron 27** - Desktop application framework
- **React 18** - UI library with Hooks
- **Material-UI v5** - React component library
- **better-sqlite3** - Native SQLite database
- **Webpack 5** - Module bundler
- **Babel** - JavaScript transpiler

### Development Workflow

1. Start webpack in watch mode:
   ```bash
   npm run watch
   ```

2. In another terminal, run Electron:
   ```bash
   npm run electron
   ```

3. Make changes to React files
4. Webpack rebuilds automatically
5. Reload Electron window (`Ctrl+R`) to see changes

### Building for Distribution

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for complete build documentation.

Quick build:
```bash
npm run dist:linux    # Creates AppImage and DEB
```

## 📝 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Quick start guide for end users
- **[BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)** - Complete build guide
- **[BUILD_SUMMARY.md](BUILD_SUMMARY.md)** - Build status and details
- **[USER_SETTINGS_IMPLEMENTATION.md](USER_SETTINGS_IMPLEMENTATION.md)** - Settings system documentation
- **[SQLITE_INTEGRATION.md](SQLITE_INTEGRATION.md)** - Database documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [Material-UI](https://mui.com/)
- Database by [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

---

**Version**: 1.0.0  
**Author**: Clipsy Team  
**Repository**: [github.com/dinesh-simform/clippy](https://github.com/dinesh-simform/clippy)
